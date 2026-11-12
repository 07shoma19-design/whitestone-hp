// ヘッダーロゴの回転（2026-11-12）：.wordmarkの位置・大きさはそのまま、中のsvgだけY軸で回す。
// 表と裏は同じ面なので、角度を-90°〜+90°に折り返して描く＝文字が鏡像になる角度を通らない
// （真横＝厚み0で見えない瞬間に切り替わるので、見た目は1枚の札が回り続けるのと同じ）。
// 切替＝URLに ?logo=scroll（スクロールに連動・既定）／?logo=spin（回り続ける）／?logo=off（止める）。
// prefers-reduced-motion では回さない（CSS側でも止めてある）。
(() => {
  const DEFAULT_MODE = 'scroll';
  const q = new URLSearchParams(location.search).get('logo');
  const mode = ['scroll', 'spin', 'off'].includes(q) ? q : DEFAULT_MODE;
  document.documentElement.classList.add('logo-' + mode);
  if (mode !== 'scroll') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const logo = document.querySelector('.wordmark');
  if (!logo) return;

  const DEG_PER_PX = 0.5;   // 360pxのスクロールで半回転（＝表の面が1回通り過ぎる）
  const SETTLE_MS = 180;    // スクロールが止まってから正面へ戻り始めるまで
  const fold = (a) => ((((a + 90) % 180) + 180) % 180) - 90;
  let base = window.scrollY;
  let timer = 0;

  window.addEventListener('scroll', () => {
    logo.classList.remove('is-settling');
    logo.style.setProperty('--logo-rot', fold((window.scrollY - base) * DEG_PER_PX) + 'deg');
    clearTimeout(timer);
    timer = setTimeout(() => {
      // 止まったら正面に戻す。次のスクロールはここを起点に回り始める（角度が飛ばない）
      logo.classList.add('is-settling');
      logo.style.setProperty('--logo-rot', '0deg');
      base = window.scrollY;
    }, SETTLE_MS);
  }, { passive: true });
})();
