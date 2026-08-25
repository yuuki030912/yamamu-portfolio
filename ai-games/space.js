/*!
 * AI GAMES ─ SPACE
 * ページ全体を3D空間として見せるための補助スクリプト。
 * ・ポインタ位置に応じた視差（--px / --py）
 * ・スクロールで奥から手前に浮き上がる演出
 */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 視差 ---------- */
  if (!reduce) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;

    const loop = () => {
      cx += (tx - cx) * 0.075;
      cy += (ty - cy) * 0.075;
      root.style.setProperty('--px', cx.toFixed(4));
      root.style.setProperty('--py', cy.toFixed(4));
      raf = (Math.abs(tx - cx) > 0.0015 || Math.abs(ty - cy) > 0.0015)
        ? requestAnimationFrame(loop) : 0;
    };

    const aim = (x, y) => {
      tx = Math.max(-1, Math.min(1, (x / window.innerWidth - 0.5) * 2));
      ty = Math.max(-1, Math.min(1, (y / window.innerHeight - 0.5) * 2));
      if (!raf) raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      aim(e.clientX, e.clientY);
    }, { passive: true });

    /* タッチ環境ではスクロール量をゆるやかな視差にする */
    let sy = window.scrollY;
    window.addEventListener('scroll', () => {
      if (!window.matchMedia('(hover: none)').matches) return;
      const d = window.scrollY - sy;
      sy = window.scrollY;
      ty = Math.max(-1, Math.min(1, ty + d * 0.0016));
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
  }

  /* ---------- スクロールで浮き上がる ---------- */
  const targets = document.querySelectorAll(
    '.section-head, .why-card, .devlog-card, .about-text, .youtube-card, .hero-stats'
  );
  if (!targets.length) return;

  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-in'));
    return;
  }

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (Math.min(i % 3, 2) * 90) + 'ms';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  targets.forEach(el => io.observe(el));

  /* 保険: 何らかの理由で IntersectionObserver が発火しなくても
     画面内の要素は必ず表示する */
  setTimeout(() => {
    targets.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in');
    });
  }, 3000);
})();
