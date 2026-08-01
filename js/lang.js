// ============================================================
// Hệ thống đa ngôn ngữ (VI / EN) cho trang giới thiệu N0Launcher
// Cách hoạt động: mọi phần tử có thuộc tính data-i18n="key" sẽ được
// thay textContent theo từ điển bên dưới khi người dùng đổi ngôn ngữ.
// ============================================================

var translations = {
  vi: {
    'cta.download': 'Tải xuống',
    'cta.downloadLatest': 'Tải bản mới nhất',
    'hero.eyebrow': 'Những khối vuông kì diệu =^-^=',
    'hero.lede':
      'N0Launcher là trình cài đặt tối giản, giao diện tiếng Việt hoàn toàn — hỗ trợ Vanilla, Forge, NeoForge và Fabric, đăng nhập Microsoft, Ely.by hoặc Offline, kèm quản lý mod và resource pack ngay trong app.',
    'tech.eyebrow': 'Sử dụng NodeJS - Electron với các packages!',
    'tech.desc': 'Được tổng hợp và xây dựng trên các gói được cộng đồng tin cậy.',
    'slide1.title': 'Đăng nhập',
    'slide1.desc':
      'Cho phép bạn đăng nhập bằng tài khoản Microsoft, Ely.by hoặc Offline. Hỗ trợ cả Mojang & Microsoft.',
    'slide2.title': 'Giao diện',
    'slide2.desc':
      'Được lây cảm hứng từ Prism Launcher, N0Launcher có giao diện tối giản, dễ sử dụng, và hoàn toàn bằng tiếng Việt.',
    'slide3.title': 'Cấu hình phiên bản',
    'slide3.desc':
      'Vì được lấy ý tưởng từ Minecraft Launcher, N0Launcher cho phép bạn chọn và quản lý phiên bản Minecraft, cài đặt mod, resource pack, và các thiết lập khác ngay trong app.',
    'slide4.title': 'Cài đặt phiên bản modloader',
    'slide4.desc':
      'Hỗ trợ cài đặt Forge, NeoForge và Fabric, với các phiên bản modloader mới nhất. Bạn có thể cài đặt modloader ngay trong app mà không cần mở trình cài đặt riêng.',
    'slide5.title': 'Cài đặt',
    'slide5.desc':
      'Cho phép bạn chọn thư mục để cài đặt Minecraft, cập nhật phiên bản launcher, set RAM tự động hoặc tự chọn, tự động đổi nguồn mirror tải game (ưu tiên nguồn chính thức), và nhiều tính năng khác.',
    'footer.copyright': 'Copyright © 2026 N0Launcher — Panadorado.',
    'footer.reportBug': 'Báo lỗi',
    'ach.title': 'ĐÃ MỞ KHÓA',
    'ach.sub': 'Đang khám phá N0Launcher',
    'download.checking': 'Đang kiểm tra bản mới...',
    'download.downloading': 'Đang tải {version}...',
    'download.done': 'Đã tải xong!',
    'download.error': 'Lỗi, mở trang Releases',
  },
  en: {
    'cta.download': 'Download',
    'cta.downloadLatest': 'Download Latest',
    'hero.eyebrow': 'Magical little cubes =^-^=',
    'hero.lede':
      'N0Launcher is a minimal installer, fully translated to Vietnamese — supporting Vanilla, Forge, NeoForge and Fabric, with Microsoft, Ely.by or Offline login, plus built-in mod and resource pack management.',
    'tech.eyebrow': 'Built with Node.js & Electron and these packages!',
    'tech.desc': 'Assembled and built on packages trusted by the community.',
    'slide1.title': 'Sign in',
    'slide1.desc':
      'Sign in with a Microsoft account, Ely.by, or play Offline. Supports both Mojang & Microsoft.',
    'slide2.title': 'Interface',
    'slide2.desc':
      'Inspired by Prism Launcher, N0Launcher has a minimal, easy-to-use interface, fully in Vietnamese.',
    'slide3.title': 'Version configuration',
    'slide3.desc':
      'Inspired by the Minecraft Launcher, N0Launcher lets you pick and manage Minecraft versions, install mods, resource packs, and other settings right inside the app.',
    'slide4.title': 'Install a mod loader',
    'slide4.desc':
      'Supports installing Forge, NeoForge and Fabric with the latest loader versions — no need to run a separate installer.',
    'slide5.title': 'Setup',
    'slide5.desc':
      'Choose where to install Minecraft, update the launcher itself, set RAM automatically or manually, auto-switch download mirrors (official source first), and more.',
    'footer.copyright': 'Copyright © 2026 N0Launcher — Panadorado.',
    'footer.reportBug': 'Report a bug',
    'ach.title': 'ACHIEVEMENT UNLOCKED',
    'ach.sub': 'Exploring N0Launcher',
    'download.checking': 'Checking for the latest release...',
    'download.downloading': 'Downloading {version}...',
    'download.done': 'Download complete!',
    'download.error': 'Something went wrong, opening Releases page',
  },
};

// Cho download.js dùng chung từ điển (tránh lặp chuỗi ở 2 nơi)
window.n0Translations = translations;

function applyLanguage(lang) {
  if (!translations[lang]) lang = 'vi';

  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var key = el.getAttribute('data-i18n');
    var text = translations[lang][key];
    if (text !== undefined) el.textContent = text;
  });

  document.documentElement.setAttribute('lang', lang);

  var currentLabel = document.getElementById('langCurrent');
  if (currentLabel) currentLabel.textContent = lang.toUpperCase();

  document.querySelectorAll('.lang-option').forEach(function (opt) {
    opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
  });

  window.n0CurrentLang = lang;
  try {
    localStorage.setItem('n0launcher-lang', lang);
  } catch (e) {
    /* localStorage có thể bị chặn (chế độ ẩn danh khắt khe) — bỏ qua, không chặn trải nghiệm */
  }
}
window.applyLanguage = applyLanguage;

(function initLangSwitcher() {
  var toggle = document.getElementById('langToggle');
  var menu = document.getElementById('langMenu');
  var wrap = document.getElementById('langSwitch');
  if (!toggle || !menu || !wrap) return;

  var closeMenu = function () {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    var isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  menu.querySelectorAll('.lang-option').forEach(function (opt) {
    opt.addEventListener('click', function () {
      applyLanguage(opt.getAttribute('data-lang'));
      closeMenu();
    });
  });

  // Đóng menu khi bấm ra ngoài, hoặc nhấn Esc
  document.addEventListener('click', function (e) {
    if (!wrap.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  // Khôi phục ngôn ngữ đã lưu, mặc định theo ngôn ngữ trình duyệt nếu chưa từng chọn
  var saved = null;
  try {
    saved = localStorage.getItem('n0launcher-lang');
  } catch (e) {
    /* bỏ qua */
  }
  if (!saved) {
    saved = (navigator.language || 'vi').toLowerCase().indexOf('en') === 0 ? 'en' : 'vi';
  }
  applyLanguage(saved);
})();
