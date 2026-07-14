// Whitestone HP 共通スクリプト（ヘッダー・モバイルメニュー・リビール）

// ヘッダー：スクロールで背景を付与
const header = document.getElementById('siteHeader');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// モバイルメニュー
const toggle = document.getElementById('menuToggle');
const menu = document.getElementById('mobileMenu');
const closeBtn = document.getElementById('menuClose');
const setMenu = (open) => {
  menu.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  if (open) closeBtn.focus(); else toggle.focus();
};
toggle.addEventListener('click', () => setMenu(true));
closeBtn.addEventListener('click', () => setMenu(false));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('is-open')));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false);
});

// スクロールリビール（reduced-motion時はCSSで無効化済み）
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
