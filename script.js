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
// .section-labelは罫線伸長、.fact-valueは数字カウントの発火にも使う
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 数字カウントアップ：fact-value内の数値テキストを0.9秒で数え上げる（1回のみ）。
// HTMLには最初から実値が書いてあるため、JS無効・クローラー・reduced-motionでは実値がそのまま見える
function countUp(el) {
  if (reducedMotion) return;
  const node = [...el.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.textContent));
  if (!node) return;
  const finalText = node.textContent;
  const num = parseInt(finalText.replace(/[^0-9]/g, ''), 10);
  if (!Number.isFinite(num) || num === 0) return;
  const dur = 1800;
  const start = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 3);
  const step = (now) => {
    const p = Math.min(1, (now - start) / dur);
    const v = Math.round(num * ease(p));
    node.textContent = finalText.replace(/[0-9,]+/, String(v));
    if (p < 1) requestAnimationFrame(step); else node.textContent = finalText;
  };
  requestAnimationFrame(step);
}

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    // 同時に画面へ入った要素は80msずつずらして出す＝「順に現れる」ので動きが認識できる（2026-08-22）
    let order = 0;
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const delay = Math.min(order++, 5) * 80;
      if (delay && !reducedMotion) {
        e.target.style.transitionDelay = delay + 'ms';
        setTimeout(() => { e.target.style.transitionDelay = ''; }, delay + 1200);
      }
      e.target.classList.add('is-visible');
      // 価格（.plan-price .num）はカウントしない＝最も早く知りたい情報を待たせないため（2026-08-22 壮真判断）
      if (e.target.classList.contains('fact-value')) {
        setTimeout(() => countUp(e.target), delay + 150);
      }
      io.unobserve(e.target);
    });
    // rootMarginで画面下端より内側に入ってから発火させる＝視線が届く前に終わるのを防ぐ
  }, { threshold: 0.12, rootMargin: '0px 0px -12% 0px' });
  const targets = ['.reveal', '.section-label', '.fact-value'];
  // web.html限定の演出対象（罫線の伸長・番号の立ち上がり・価格カウント）
  if (document.body.classList.contains('page-web')) {
    targets.push('.plan', '.detail-block', '.process-step', '.subsidy-body p');
  }
  document.querySelectorAll(targets.join(', ')).forEach(el => io.observe(el));
} else {
  document.querySelectorAll('.reveal, .section-label, .plan, .detail-block, .process-step, .subsidy-body p').forEach(el => el.classList.add('is-visible'));
}

// ヒーロー写真のスクロール連動（web.htmlのPC幅のみ。rAFで間引き・reduced-motion時は動かさない）
if (document.body.classList.contains('page-web') && !reducedMotion) {
  const heroMedia = document.querySelector('.page-hero-media');
  const pcWidth = window.matchMedia('(min-width: 961px)');
  if (heroMedia) {
    let ticking = false;
    const updateParallax = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (pcWidth.matches) {
          heroMedia.style.setProperty('--parallax', Math.min(window.scrollY, 900) * 0.12 + 'px');
        } else {
          heroMedia.style.removeProperty('--parallax');
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', updateParallax, { passive: true });
    pcWidth.addEventListener('change', updateParallax);
    updateParallax();
  }
}

// スクロール進捗バー（web.htmlのみ。要素が無いページでは何もしない）
const progress = document.getElementById('scrollProgress');
if (progress) {
  const updateProgress = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
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
