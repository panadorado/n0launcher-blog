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

// 2. Ứng với mỗi OS, ưu tiên đuôi file nào trong assets của release
const EXT_BY_OS = {
  windows: ['.exe', '.msi'],
  macos: ['.dmg', '.pkg'],
  linux: ['.appimage', '.deb', '.rpm'],
};

function pickAssetForOS(assets, os) {
  const exts = EXT_BY_OS[os];
  if (!exts) return null;
  for (const ext of exts) {
    const found = assets.find((a) => a.name.toLowerCase().endsWith(ext));
    if (found) return found;
  }
  return null;
}

// 3. Tải file về dạng blob, rồi mở hộp thoại chọn nơi lưu nếu trình duyệt hỗ trợ
async function saveWithPicker(blob, suggestedName) {
  if (window.showSaveFilePicker) {
    // Chrome / Edge — mở hộp thoại thật, người dùng tự chọn thư mục + tên file
    const handle = await window.showSaveFilePicker({ suggestedName });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return;
  }
  // Firefox / Safari — không có quyền mở hộp thoại chọn thư mục (giới hạn của chính trình duyệt)
  // -> rơi về cách cũ: tự lưu vào thư mục Downloads mặc định
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = suggestedName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}

// 4. Gắn vào nút bấm
document.getElementById('installLauncher').addEventListener('click', async (e) => {
  e.preventDefault();
  const btn = e.currentTarget;

  try {
    const os = await detectOS();

    const res = await fetch('https://api.github.com/repos/panadorado/N0Launcher/releases/latest', {
      headers: { 'User-Agent': 'Minecraft-Launcher' },
      signal: AbortSignal.timeout(15_000), // 15 giây — tránh treo vô hạn nếu mạng lỗi
    });

    if (!res.ok) throw new Error('Không lấy được release mới nhất');
    const release = await res.json();

    const asset = pickAssetForOS(release.assets, os);
    if (!asset) throw new Error('Không có bản cài phù hợp cho hệ điều hành này');

    // Phải tải hẳn về bộ nhớ (blob) trước — showSaveFilePicker cần dữ liệu thật để ghi ra file,
    // không thể chỉ đưa link như cách <a download> làm
    const fileRes = await fetch(asset.browser_download_url, {
      signal: AbortSignal.timeout(15_000),
    });
    const blob = await fileRes.blob();

    await saveWithPicker(blob, asset.name);
  } catch (err) {
    if (err.name === 'AbortError') return; // người dùng tự bấm Huỷ ở hộp thoại -> không phải lỗi, im lặng
    console.error(err);
    window.open('https://github.com/panadorado/N0Launcher/releases/latest', '_blank');
  }
});
