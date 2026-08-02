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

const btn = document.getElementById('installLauncher');

// 3. Hàm chính: tải bản mới nhất
async function downloadLatestLauncher() {
  const originalText = btn?.textContent;

  try {
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Đang kiểm tra phiên bản...';
    }

    // Lấy release mới nhất
    const res = await fetch('https://api.github.com/repos/panadorado/N0Launcher/releases/latest', {
      headers: {
        'User-Agent': 'Minecraft-Launcher',
      },
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

    // Cách tải ổn định: tạo thẻ <a> và click (không bị CORS)
    const a = document.createElement('a');
    a.href = `https://github.com/panadorado/N0Launcher/releases/download/${release.tag_name}/${asset.name}`;
    a.download = asset.name;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    document.body.appendChild(a);
    a.click();
    a.remove();

    if (btn) btn.textContent = 'Đã bắt đầu tải!';
  } catch (err) {
    console.error(err);

    // Nếu người dùng huỷ thì im lặng
    if (err.name === 'AbortError') return;

    // Fallback: mở trang releases
    window.open('https://github.com/panadorado/N0Launcher/releases/latest', '_blank');
  } finally {
    if (btn) {
      btn.disabled = false;
      setTimeout(() => {
        btn.innerHTML = `<span class="mc-block-icon"></span>
                  <span data-i18n="cta.downloadLatest">Tải bản mới nhất</span></a
                >`;
      }, 2000);
    }
  }
}

// 4. Gắn sự kiện vào nút
btn?.addEventListener('click', async (e) => {
  e.preventDefault();
  await downloadLatestLauncher();
});
