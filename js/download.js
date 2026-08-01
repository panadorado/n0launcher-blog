// ============================================================
// Nút "Tải bản mới nhất": gọi GitHub Releases API để lấy đúng bản
// mới nhất, sau đó tải file cài đặt về — có hỏi nơi lưu nếu trình
// duyệt hỗ trợ (Chrome/Edge). Chạy hoàn toàn phía client, không cần
// Node.js hay backend nào khác.
// ============================================================

(function () {
  var REPO = 'panadorado/N0Launcher';
  var btn = document.getElementById('installLauncher');
  if (!btn) return;

  var textEl = btn.querySelector('[data-i18n="cta.downloadLatest"]');
  var originalKey = 'cta.downloadLatest';

  function t(key, vars) {
    var lang = window.n0CurrentLang || 'vi';
    var dict = (window.n0Translations && window.n0Translations[lang]) || {};
    var str = dict[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        str = str.replace('{' + k + '}', vars[k]);
      });
    }
    return str;
  }

  function setLabel(text) {
    if (textEl) textEl.textContent = text;
  }

  function resetLabel() {
    setLabel(t(originalKey));
  }

  // Lấy thông tin bản phát hành mới nhất qua GitHub REST API
  // (KHÔNG dùng URL trang /releases/latest — đó là HTML, không phải JSON)
  async function getLatestRelease() {
    var res = await fetch('https://api.github.com/repos/' + REPO + '/releases/latest', {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(15000), // 15s — tránh treo vô hạn nếu mạng lỗi
    });
    if (!res.ok) throw new Error('Không lấy được thông tin bản phát hành mới nhất (' + res.status + ')');
    return res.json();
  }

  // Chọn asset phù hợp nhất trong danh sách file đính kèm của release
  // (ưu tiên các định dạng cài đặt Windows phổ biến, xây bằng electron-builder)
  function pickBestAsset(assets) {
    if (!assets || !assets.length) return null;
    var priority = ['.exe', '.msi', '.zip', '.dmg', '.appimage'];
    for (var i = 0; i < priority.length; i++) {
      var found = assets.find(function (a) {
        return a.name.toLowerCase().endsWith(priority[i]);
      });
      if (found) return found;
    }
    return assets[0];
  }

  // Tải file nhị phân về máy. Nếu trình duyệt hỗ trợ File System Access API
  // (Chrome/Edge, cần HTTPS) sẽ hiện hộp thoại cho người dùng chọn thư mục +
  // tên file để lưu. Các trình duyệt khác (Firefox/Safari) không cho website
  // mở hộp thoại chọn thư mục vì lý do bảo mật của chính trình duyệt — trường
  // hợp đó sẽ tự lưu vào thư mục Downloads mặc định, đây là giới hạn nền tảng
  // chứ không phải lỗi của trang.
  async function saveBlob(blob, suggestedName) {
    if (window.showSaveFilePicker) {
      var handle = await window.showSaveFilePicker({ suggestedName: suggestedName });
      var writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    }
    var blobUrl = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = blobUrl;
    a.download = suggestedName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  }

  btn.addEventListener('click', async function (event) {
    event.preventDefault(); // chặn điều hướng mặc định tới href dự phòng, tự xử lý bằng JS

    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.75';
    setLabel(t('download.checking'));

    try {
      var release = await getLatestRelease();
      var asset = pickBestAsset(release.assets);
      if (!asset) throw new Error('Bản phát hành mới nhất không có file cài đặt đính kèm');

      setLabel(t('download.downloading', { version: release.tag_name }));

      var res = await fetch(asset.browser_download_url, {
        signal: AbortSignal.timeout(180000), // 3 phút — file cài đặt có thể khá nặng
      });
      if (!res.ok) throw new Error('Tải thất bại: ' + res.status);
      var blob = await res.blob();

      // Người dùng bấm Huỷ ở hộp thoại chọn nơi lưu -> AbortError, coi như huỷ tải, không phải lỗi
      try {
        await saveBlob(blob, asset.name);
        setLabel(t('download.done'));
      } catch (saveErr) {
        if (saveErr.name === 'AbortError') {
          resetLabel();
        } else {
          throw saveErr;
        }
      }
    } catch (err) {
      console.error('[N0Launcher] Tải bản mới nhất thất bại:', err);
      setLabel(t('download.error'));
      // Không lấy/tải được (mạng lỗi, CORS bị chặn bởi phía GitHub, v.v.)
      // -> mở thẳng trang Releases để người dùng tự tải, không để họ mắc kẹt
      window.open('https://github.com/' + REPO + '/releases/latest', '_blank', 'noopener');
    } finally {
      setTimeout(function () {
        resetLabel();
        btn.style.pointerEvents = '';
        btn.style.opacity = '';
      }, 3000);
    }
  });
})();
