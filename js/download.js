// 1. Đoán hệ điều hành của người dùng
async function detectOS() {
  if (navigator.userAgentData) {
    try {
      const { platform } = await navigator.userAgentData.getHighEntropyValues(['platform']);
      if (platform) return platform.toLowerCase();
    } catch (e) {
      /* rơi xuống fallback bên dưới */
    }
  }
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('win')) return 'windows';
  if (ua.includes('mac')) return 'macos';
  if (ua.includes('android')) return 'android';
  if (ua.includes('linux')) return 'linux';
  return 'unknown';
}

// 2. Chọn asset phù hợp theo OS (ưu tiên Setup trên Windows)
function pickAssetForOS(assets, os, version) {
  if (os === 'windows') {
    // Ưu tiên bản Setup theo version
    const setupName = `N0Launcher-Setup-${version}.exe`;
    const setup = assets.find((a) => a.name === setupName);
    if (setup) return setup;

    // Fallback: bất kỳ file .exe nào chứa Setup
    const anySetup = assets.find(
      (a) => a.name.toLowerCase().includes('setup') && a.name.toLowerCase().endsWith('.exe')
    );
    if (anySetup) return anySetup;

    // Fallback cuối: file .exe portable
    return assets.find((a) => a.name.toLowerCase().endsWith('.exe'));
  }

  // Các hệ khác (nếu sau này có)
  const EXT_BY_OS = {
    macos: ['.dmg', '.pkg'],
    linux: ['.appimage', '.deb', '.rpm'],
  };
  const exts = EXT_BY_OS[os];
  if (!exts) return null;

  for (const ext of exts) {
    const found = assets.find((a) => a.name.toLowerCase().endsWith(ext));
    if (found) return found;
  }
  return null;
}

// 3. Lưu file bằng File System Access API (nếu hỗ trợ) hoặc fallback download
async function saveWithPicker(blob, suggestedName) {
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: 'Executable',
            accept: { 'application/octet-stream': ['.exe'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err) {
      // Người dùng bấm Huỷ → không làm gì
      if (err.name === 'AbortError') return;
      throw err;
    }
  }

  // Fallback cho Firefox / Safari / trình duyệt cũ
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = suggestedName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}

// 4. Hàm chính: tải bản mới nhất
async function downloadLatestLauncher() {
  const btn = document.getElementById('installLauncher');
  const originalText = btn?.textContent;

  try {
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Đang kiểm tra phiên bản...';
    }

    // Lấy release mới nhất
    const res = await fetch('https://api.github.com/repos/panadorado/N0Launcher/releases/latest', {
      headers: { 'User-Agent': 'Minecraft-Launcher' },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error('Không lấy được thông tin release mới nhất');

    const release = await res.json();
    const version = release.tag_name.replace(/^v/, ''); // "1.0.5"
    const os = await detectOS();

    const asset = pickAssetForOS(release.assets, os, version);
    if (!asset) {
      throw new Error('Không tìm thấy file cài đặt phù hợp với hệ điều hành của bạn');
    }

    if (btn) btn.textContent = `Đang tải ${asset.name}...`;

    // Tải file về dạng blob
    const fileRes = await fetch(asset.browser_download_url, {
      signal: AbortSignal.timeout(120000), // 2 phút (file ~100MB)
    });

    if (!fileRes.ok) throw new Error('Tải file thất bại');

    const blob = await fileRes.blob();

    // Mở hộp thoại lưu file
    await saveWithPicker(blob, asset.name);

    if (btn) btn.textContent = 'Tải thành công!';
  } catch (err) {
    console.error(err);

    // Nếu người dùng huỷ hộp thoại thì im lặng
    if (err.name === 'AbortError') return;

    // Fallback: mở trang releases
    window.open('https://github.com/panadorado/N0Launcher/releases/latest', '_blank');
  } finally {
    if (btn) {
      btn.disabled = false;
      setTimeout(() => {
        btn.textContent = originalText || 'Tải Launcher';
      }, 2000);
    }
  }
}

// 5. Gắn sự kiện vào nút
document.getElementById('installLauncher')?.addEventListener('click', (e) => {
  e.preventDefault();
  downloadLatestLauncher();
});
