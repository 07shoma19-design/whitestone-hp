// Whitestone HP 共通スクリプト（ヘッダー・モバイルメニュー・リビール・コピー）

// JSが動作した場合のみリビール演出を有効化する（読込失敗時は全文表示のまま）
document.documentElement.classList.add('js');

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
  document.body.classList.toggle('menu-open', open);
  if (open) closeBtn.focus(); else toggle.focus();
};
toggle.addEventListener('click', () => setMenu(true));
closeBtn.addEventListener('click', () => setMenu(false));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => {
  if (!menu.classList.contains('is-open')) return;
  if (e.key === 'Escape') { setMenu(false); return; }
  // メニュー展開中はフォーカスをメニュー内に閉じ込める
  if (e.key === 'Tab') {
    const items = menu.querySelectorAll('button, a');
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
// PC幅に戻ったらメニュー状態をリセット（タブレット回転等）
window.matchMedia('(min-width: 961px)').addEventListener('change', (mq) => {
  if (mq.matches && menu.classList.contains('is-open')) setMenu(false);
});

// スクロールリビール（reduced-motion時はCSSで無効化済み）
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
}

// メールアドレスのコピー（PCでメーラー未設定でも連絡先を取得できるように）
document.querySelectorAll('.copy-email').forEach(btn => {
  btn.addEventListener('click', () => {
    const email = btn.dataset.email;
    const feedback = btn.parentElement.querySelector('.copy-feedback');
    const done = (ok) => { if (feedback) feedback.textContent = ok ? 'コピーしました：' + email : 'コピーできませんでした。お手数ですが手入力でお願いします：' + email; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(() => done(true), () => done(false));
    } else { done(false); }
  });
});
