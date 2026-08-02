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
    const setupName = `N0Launcher-Setup-${version}.exe`;
    const setup = assets.find((a) => a.name === setupName);
    if (setup) return setup;

    const anySetup = assets.find(
      (a) => a.name.toLowerCase().includes('setup') && a.name.toLowerCase().endsWith('.exe')
    );
    if (anySetup) return anySetup;

    return assets.find((a) => a.name.toLowerCase().endsWith('.exe'));
  }

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

const btn = document.getElementById('installLauncher');

// 3. Hàm chính: tải bản mới nhất
async function downloadLatestLauncher() {
  const originalHTML = btn?.innerHTML; // lưu lại HTML gốc

  try {
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Đang kiểm tra phiên bản...';
    }

    const res = await fetch('https://api.github.com/repos/panadorado/N0Launcher/releases/latest', {
      headers: {
        'User-Agent': 'Minecraft-Launcher',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error('Không lấy được thông tin release mới nhất');

    const release = await res.json();
    const version = release.tag_name.replace(/^v/, '');
    const os = await detectOS();

    const asset = pickAssetForOS(release.assets, os, version);
    if (!asset) {
      throw new Error('Không tìm thấy file cài đặt phù hợp với hệ điều hành của bạn');
    }

    if (btn) btn.textContent = `Đang tải ${asset.name}...`;

    // Cách tải ổn định: tạo thẻ <a> và click
    const a = document.createElement('a');
    a.href = asset.browser_download_url; // dùng URL chính thức từ GitHub
    a.download = asset.name;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    document.body.appendChild(a);
    a.click();
    a.remove();

    if (btn) btn.textContent = 'Đã bắt đầu tải!';
  } catch (err) {
    console.error('[N0Launcher] Tải bản mới nhất thất bại:', err);

    if (err.name === 'AbortError') return;

    // Fallback
    window.open('https://github.com/panadorado/N0Launcher/releases/latest', '_blank');
  } finally {
    if (btn) {
      btn.disabled = false;
      setTimeout(() => {
        // Khôi phục lại HTML gốc của nút
        btn.innerHTML = originalHTML || 'Tải bản mới nhất';
      }, 2000);
    }
  }
}

// 4. Gắn sự kiện vào nút
btn?.addEventListener('click', async (e) => {
  e.preventDefault();
  await downloadLatestLauncher();
});
