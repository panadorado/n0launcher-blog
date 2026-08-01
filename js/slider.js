let currentSlide = 0;
const slides = document.getElementById('slides');
const totalSlides = 5;
const dotsContainer = document.getElementById('dots');

// Tạo dots
for (let i = 0; i < totalSlides; i++) {
  const dot = document.createElement('div');
  dot.classList.add('dot');
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(dot);
}

function updateSlider() {
  slides.style.transform = `translateX(-${currentSlide * 100}%)`;
  document.querySelectorAll('.dot').forEach((dot, index) => {
    dot.classList.toggle('active', index === currentSlide);
  });
}

function changeSlide(direction) {
  currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
  updateSlider();
}

function goToSlide(index) {
  currentSlide = index;
  updateSlider();
}

// Auto play mỗi 5 giây
setInterval(() => {
  changeSlide(1);
}, 5000);

// Hỗ trợ phím mũi tên
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') changeSlide(-1);
  if (e.key === 'ArrowRight') changeSlide(1);
});
