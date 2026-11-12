// ヘッダーロゴの回転（2026-11-12）：.wordmarkの位置・大きさはそのまま、中のロゴを厚みのある札にしてY軸で回す。
// 立体（11/12 2版目）＝表のsvgの後ろに側面4枚・裏1枚を足した箱（厚み THICK px）。回る角度に合わせて表の面を暗くする。
// 表と裏は同じ面なので、角度を-90°〜+90°に折り返して描く＝文字が鏡像になる角度を通らない（真横では側面＝厚みが見える）。
// 切替＝URLに ?logo=scroll（スクロールに連動・既定）／?logo=spin（回り続ける）／?logo=off（止める）。
// prefers-reduced-motion では回さない。見た目のCSSはこのファイルの中だけ（styles.css・単独ページには置かない）。
(() => {
  const DEFAULT_MODE = 'scroll';
  const THICK = 8;          // 厚み（px）＝ロゴ幅128pxの約6%
  const q = new URLSearchParams(location.search).get('logo');
  const mode = ['scroll', 'spin', 'off'].includes(q) ? q : DEFAULT_MODE;
  document.documentElement.classList.add('logo-' + mode);
  if (mode === 'off') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const logo = document.querySelector('.wordmark');
  const svg = logo && logo.querySelector('svg');
  if (!svg) return;

  const h = THICK / 2;
  const css = `
.wordmark{perspective:320px}
.wm3d{position:relative;display:block;width:100%;height:100%;transform-style:preserve-3d}
.wm3d>svg{transform:translateZ(${h}px);filter:brightness(var(--logo-shade,1))}
.wm3d>i{position:absolute;display:block;background:#1c1c1c}
.wm3d>.l,.wm3d>.r{top:0;width:${THICK}px;height:100%}
.wm3d>.l{left:-${h}px;transform:rotateY(-90deg);background:linear-gradient(90deg,#111,#3a3a3a)}
.wm3d>.r{left:calc(100% - ${h}px);transform:rotateY(90deg);background:linear-gradient(90deg,#3a3a3a,#111)}
.wm3d>.t,.wm3d>.b{left:0;width:100%;height:${THICK}px}
.wm3d>.t{top:-${h}px;transform:rotateX(90deg);background:#555}
.wm3d>.b{top:calc(100% - ${h}px);transform:rotateX(-90deg);background:#0e0e0e}
.wm3d>.k{inset:0;transform:translateZ(-${h}px) rotateY(180deg)}
.logo-spin .wm3d{animation:wm-spin 3s linear -1.5s infinite}
.logo-spin .wm3d>svg{animation:wm-shade 3s linear -1.5s infinite}
@keyframes wm-spin{from{transform:rotateY(-90deg)}to{transform:rotateY(90deg)}}
@keyframes wm-shade{0%,100%{filter:brightness(.62)}50%{filter:brightness(1)}}
.logo-scroll .wm3d{transform:rotateY(var(--logo-rot,0deg))}
.logo-scroll .wordmark.is-settling .wm3d{transition:transform .8s cubic-bezier(.22,1,.36,1)}
.logo-scroll .wordmark.is-settling .wm3d>svg{transition:filter .8s cubic-bezier(.22,1,.36,1)}`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const box = document.createElement('span');
  box.className = 'wm3d';
  box.setAttribute('aria-hidden', 'true');
  svg.replaceWith(box);
  box.appendChild(svg);
  ['l', 'r', 't', 'b', 'k'].forEach((c) => { const f = document.createElement('i'); f.className = c; box.appendChild(f); });

  if (mode !== 'scroll') return;
  const DEG_PER_PX = 0.5;   // 360pxのスクロールで半回転（＝表の面が1回通り過ぎる）
  const SETTLE_MS = 180;    // スクロールが止まってから正面へ戻り始めるまで
  const fold = (a) => ((((a + 90) % 180) + 180) % 180) - 90;
  const set = (deg) => {
    logo.style.setProperty('--logo-rot', deg + 'deg');
    logo.style.setProperty('--logo-shade', (1 - 0.38 * Math.abs(deg) / 90).toFixed(3));
  };
  let base = window.scrollY;
  let timer = 0;
  window.addEventListener('scroll', () => {
    logo.classList.remove('is-settling');
    set(fold((window.scrollY - base) * DEG_PER_PX));
    clearTimeout(timer);
    timer = setTimeout(() => {
      logo.classList.add('is-settling');
      set(0);
      base = window.scrollY;
    }, SETTLE_MS);
  }, { passive: true });
})();
