/*!
 * AI GAMES ─ カートリッジ・カルーセル
 * ゲームカセットが本体（コンソール）の周りを回転し、
 * 選んだカセットが本体に挿さってゲームページへ遷移する。
 * JSが動かない環境では従来のグリッド表示のまま（プログレッシブエンハンスメント）。
 */
(() => {
  'use strict';

  const section = document.getElementById('games');
  if (!section) return;
  const grid = section.querySelector('.game-grid');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.game-card'));
  if (cards.length < 3) return;

  const N = cards.length;
  const STEP = 360 / N;
  /* リングの傾き。カセット自体は起こしたまま楕円軌道に並べる
     （CSS の cart-insert キーフレームの 0% と同じ値にすること） */
  const TILT = 0.53;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- カセット化 ---------------- */
  const items = cards.map((card, i) => {
    const thumb = card.querySelector('.game-thumb');
    const art = thumb ? getComputedStyle(thumb).backgroundImage : 'none';
    const no = card.querySelector('.game-no');
    const badge = card.querySelector('.badge');
    const title = card.querySelector('.game-title');
    const body = card.querySelector('.game-body');
    const cta = card.querySelector('.game-cta');
    const tags = Array.from(card.querySelectorAll('.game-tag'))
      .map(t => t.textContent.replace(/^[^\p{L}\p{N}]+/u, '').trim())
      .filter(Boolean);
    const noText = no ? no.textContent.trim() : '#' + String(i + 1).padStart(2, '0');
    const badgeText = badge ? badge.textContent.trim() : '';
    const badgeNew = !!(badge && badge.classList.contains('new'));
    if (cta) cta.remove();

    card.textContent = '';
    card.classList.add('cart');
    /* リンクのネイティブドラッグでスワイプが邪魔されるのを防ぐ */
    card.draggable = false;
    card.addEventListener('dragstart', e => e.preventDefault());
    card.style.setProperty('--hue', String((i * 53 + 318) % 360));

    const shell = document.createElement('div');
    shell.className = 'cart-shell';
    shell.innerHTML =
      '<span class="cart-grip"></span>' +
      '<span class="cart-label"><span class="cart-art"></span></span>' +
      '<span class="cart-name"></span>' +
      '<span class="cart-pins"></span>';
    shell.querySelector('.cart-art').style.backgroundImage = art;
    if (title) shell.querySelector('.cart-name').appendChild(title);
    if (no) shell.appendChild(no);
    if (badge) shell.appendChild(badge);

    const back = document.createElement('div');
    back.className = 'cart-back';
    back.innerHTML = '<span class="cart-back-plate">AI GAME</span>';

    card.append(shell, back);
    return {
      card: card,
      art: art,
      url: card.getAttribute('href'),
      body: body,
      tags: tags,
      no: noText,
      badge: badgeText,
      badgeNew: badgeNew,
      name: title ? title.textContent.trim() : 'GAME ' + (i + 1)
    };
  });

  /* ---------------- ステージ組み立て ---------------- */
  const stage = document.createElement('div');
  stage.className = 'cart-stage';
  stage.innerHTML =
    '<div class="cart-world">' +
      '<div class="cart-floor" aria-hidden="true"></div>' +
      '<div class="cs-holo" aria-hidden="true">' +
        '<span class="cs-slot"></span>' +
        '<div class="cs-frame">' +
          '<div class="cs-art"></div>' +
          '<div class="cs-scan"></div>' +
          '<div class="cs-msg">LOADING</div>' +
          '<div class="cs-hud"><span>SYS // YAMAMU</span><b>STANDBY</b></div>' +
          '<div class="cs-info">' +
            '<span class="cs-info-line"><i class="cs-info-no"></i><b class="cs-info-title"></b></span>' +
            '<span class="cs-info-tags"></span>' +
          '</div>' +
        '</div>' +
        '<div class="cs-base"><span class="cs-led"></span>YAMAMU // PLAY-' + N + '</div>' +
        '<span class="cs-corner tl"></span><span class="cs-corner tr"></span>' +
        '<span class="cs-corner bl"></span><span class="cs-corner br"></span>' +
      '</div>' +
      '<div class="cs-beam" aria-hidden="true"></div>' +
      '<div class="cs-dock-glow" aria-hidden="true"></div>' +
      '<div class="cart-ring"></div>' +
    '</div>';

  const pos_ = document.createElement('div');
  pos_.className = 'cart-pos';
  pos_.setAttribute('aria-hidden', 'true');
  pos_.innerHTML =
    '<span class="cart-pos-num"></span>' +
    '<span class="cart-pos-track"><i class="cart-pos-thumb"></i></span>';
  pos_.style.setProperty('--n', N);
  stage.appendChild(pos_);
  const posThumb = pos_.querySelector('.cart-pos-thumb');
  const posNum = pos_.querySelector('.cart-pos-num');

  const world = stage.querySelector('.cart-world');
  const ring = stage.querySelector('.cart-ring');
  const machineEl = stage.querySelector('.cs-holo');
  const csArt = stage.querySelector('.cs-art');
  const csMsg = stage.querySelector('.cs-msg');
  const csHud = stage.querySelector('.cs-hud b');
  const csNo = stage.querySelector('.cs-info-no');
  const csTitle = stage.querySelector('.cs-info-title');
  const csTags = stage.querySelector('.cs-info-tags');
  items.forEach(it => ring.appendChild(it.card));

  const info = document.createElement('div');
  info.className = 'cart-info';
  const shot = document.createElement('a');
  shot.className = 'cart-shot';
  shot.href = items[0].url;
  shot.innerHTML =
    '<span class="cart-shot-img"></span>' +
    '<span class="cart-shot-no"></span>' +
    '<span class="cart-shot-badge"></span>' +
    '<span class="cart-shot-play">▶ PLAY</span>';
  const shotImg = shot.querySelector('.cart-shot-img');
  const shotNo = shot.querySelector('.cart-shot-no');
  const shotBadge = shot.querySelector('.cart-shot-badge');

  const detail = document.createElement('div');
  detail.className = 'cart-detail';
  const panelTitle = document.createElement('p');
  panelTitle.className = 'cart-info-title';
  const bodies = document.createElement('div');
  bodies.className = 'cart-bodies';
  items.forEach(it => { if (it.body) bodies.appendChild(it.body); });
  const playBtn = document.createElement('a');
  playBtn.className = 'cart-play';
  playBtn.href = items[0].url;
  playBtn.innerHTML = '<span>▶ いますぐ遊ぶ</span>';
  const spec = document.createElement('p');
  spec.className = 'cart-spec';
  spec.innerHTML = '<span>無料</span><span>インストール不要</span><span>スマホ・PC対応</span><span>1回5〜15分</span>';
  detail.append(panelTitle, bodies, playBtn, spec);
  info.append(shot, detail);

  grid.insertAdjacentElement('beforebegin', stage);
  stage.insertAdjacentElement('afterend', info);
  section.classList.add('cart-mode');

  /* ---------------- 回転ロジック ---------------- */
  let pos = 0, target = 0, raf = 0, active = -1, playing = false;
  let R = 400;

  const wrap = d => ((d + N / 2) % N + N) % N - N / 2;

  function readVars() {
    const v = parseFloat(getComputedStyle(stage).getPropertyValue('--ring-r'));
    if (!isNaN(v)) R = v;
  }

  function layout() {
    for (let i = 0; i < N; i++) {
      const el = items[i].card;
      const d = wrap(i - pos);
      const a = d * STEP;
      const f = Math.cos(a * Math.PI / 180);       /* 1=手前 / -1=奥 */
      const t = (f + 1) / 2;
      el.style.transform =
        'translateY(' + (TILT * R * f).toFixed(1) + 'px) ' +
        'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + R + 'px)';
      el.style.setProperty('--b', (0.32 + 0.68 * t * t).toFixed(3));
      el.style.setProperty('--s', (0.45 + 0.55 * t).toFixed(3));
      el.style.setProperty('--o', (0.22 + 0.78 * Math.pow(t, 1.4)).toFixed(3));
      el.style.pointerEvents = f > 0.12 ? 'auto' : 'none';
    }
    const p = ((pos % N) + N) % N;
    posThumb.style.left = (p / N * 100).toFixed(3) + '%';
    const idx = ((Math.round(pos) % N) + N) % N;
    if (idx !== active) setActive(idx);
  }

  function setActive(idx) {
    active = idx;
    items.forEach((it, i) => {
      const on = i === idx;
      it.card.classList.toggle('is-active', on);
      it.card.tabIndex = on ? 0 : -1;
      if (it.body) it.body.classList.toggle('is-shown', on);
    });
    const it = items[idx];
    posNum.textContent = String(idx + 1).padStart(2, '0') + ' / ' + N;
    playBtn.href = it.url;
    csArt.style.backgroundImage = it.art;
    if (csNo) csNo.textContent = it.no;
    if (csTitle) csTitle.textContent = it.name;
    if (csTags) csTags.textContent = it.tags.join('  /  ');
    panelTitle.textContent = it.name;
    shot.href = it.url;
    shotImg.style.backgroundImage = it.art;
    shotNo.textContent = it.no;
    shotBadge.textContent = it.badge;
    shotBadge.classList.toggle('is-new', it.badgeNew);
    shotBadge.hidden = !it.badge;
    info.classList.remove('is-pop');
    void info.offsetWidth;
    info.classList.add('is-pop');
  }

  function tick() {
    const diff = target - pos;
    if (Math.abs(diff) < 0.0008) { pos = target; layout(); raf = 0; return; }
    pos += diff * 0.17;
    layout();
    raf = requestAnimationFrame(tick);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }

  function goTo(i) { target = pos + wrap(i - pos); kick(); }
  function move(dir) { target = Math.round(target) + dir; kick(); }

  /* ---------------- ドラッグ / スワイプ ---------------- */
  let dragging = false, startX = 0, startPos = 0, lastX = 0, vel = 0, moved = 0, dragId = null;
  const pxPerItem = () => Math.max(64, Math.min(150, stage.clientWidth / 6));

  /* setPointerCapture は click の再ターゲットを招くので使わず、
     ドラッグ中だけ window にリスナーを張る */
  function onMove(e) {
    if (!dragging || e.pointerId !== dragId) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    vel = e.clientX - lastX; lastX = e.clientX;
    pos = startPos - dx / pxPerItem();
    layout();
  }

  function endDrag(e) {
    if (!dragging || (e && e.pointerId !== dragId)) return;
    dragging = false;
    stage.classList.remove('is-grab');
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
    const fling = Math.max(-3, Math.min(3, -vel * 0.09));
    target = Math.round(pos + fling);
    kick();
  }

  stage.addEventListener('pointerdown', e => {
    if (playing || (e.pointerType === 'mouse' && e.button !== 0)) return;
    dragging = true; moved = 0; vel = 0;
    startX = lastX = e.clientX; startPos = pos; dragId = e.pointerId;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    stage.classList.add('is-grab');
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  });

  stage.addEventListener('wheel', e => {
    if (playing || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    target = Math.round(target) + (e.deltaX > 0 ? 1 : -1);
    kick();
  }, { passive: false });

  section.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { move(-1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { move(1); e.preventDefault(); }
  });

  /* ---------------- カセット挿入 → ゲームへ遷移 ---------------- */
  const flash = document.createElement('div');
  flash.className = 'cart-flash';
  flash.setAttribute('aria-hidden', 'true');

  function insert(e, i) {
    if (playing) { e.preventDefault(); return; }
    if (reduceMotion) return;                 /* 通常のリンク遷移にまかせる */
    e.preventDefault();
    playing = true;
    stage.classList.add('is-playing');

    const src = items[i].card;
    const fly = src.cloneNode(true);
    fly.removeAttribute('href');
    fly.removeAttribute('tabindex');
    fly.classList.add('cart-fly');
    fly.classList.remove('is-active');
    fly.style.setProperty('--b', '1');
    fly.style.setProperty('--s', '1');
    fly.style.setProperty('--o', '1');
    fly.style.transform = '';
    world.appendChild(fly);
    src.style.visibility = 'hidden';

    setTimeout(() => {
      machineEl.classList.add('is-clunk');
      stage.classList.add('is-on');
      csMsg.innerHTML = 'LOADING';
      if (csHud) csHud.textContent = 'RUNNING';
    }, 1170);
    setTimeout(() => {
      document.body.appendChild(flash);
      requestAnimationFrame(() => flash.classList.add('on'));
    }, 1580);
    setTimeout(() => { window.location.href = items[i].url; }, 1990);
  }

  items.forEach((it, i) => {
    it.card.addEventListener('click', e => {
      if (moved > 8) { e.preventDefault(); moved = 0; return; }
      if (i !== active) { e.preventDefault(); goTo(i); return; }
      insert(e, i);
    });
  });
  playBtn.addEventListener('click', e => insert(e, active));
  shot.addEventListener('click', e => insert(e, active));

  /* ---------------- 初期化 ---------------- */
  let rt = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { readVars(); layout(); }, 150);
  });

  readVars();
  setActive(0);
  layout();
})();
