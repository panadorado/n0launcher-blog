var reduceMotion =
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Menu mobile: JS thuần, không phụ thuộc CDN — luôn chạy được kể cả khi offline
var navToggle = document.getElementById('navToggle');
var mobileNavEl = document.getElementById('mobileNav');
if (navToggle && mobileNavEl) {
  var closeMenu = function () {
    mobileNavEl.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  };
  navToggle.addEventListener('click', function () {
    var isOpen = mobileNavEl.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  mobileNavEl.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });
  // Đóng menu nếu người dùng phóng to cửa sổ qua khỏi breakpoint mobile
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 992) closeMenu();
  });
}

// Toast thành tựu kiểu Minecraft — hiện một lần khi vào trang, tự ẩn sau vài giây
var ach = document.getElementById('ach');
if (ach && !reduceMotion) {
  setTimeout(function () {
    ach.classList.add('show');
  }, 1000);
  setTimeout(function () {
    ach.classList.remove('show');
  }, 5200);
}

// Hotbar: tự chuyển ô đang chọn, dừng lại khi người dùng rê chuột vào
var slots = document.querySelectorAll('#hotbar .slot');
if (slots.length && !reduceMotion) {
  var idx = 3,
    hover = false;
  slots.forEach(function (s) {
    s.addEventListener('mouseenter', function () {
      hover = true;
    });
    s.addEventListener('mouseleave', function () {
      hover = false;
    });
  });
  setInterval(function () {
    if (hover) return;
    slots[idx].classList.remove('active');
    idx = (idx + 1) % slots.length;
    slots[idx].classList.add('active');
  }, 1600);
}
