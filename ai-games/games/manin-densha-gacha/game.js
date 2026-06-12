// ===== 満員電車おじさんガチャ =====

const SEAT_COUNT = 7;
const TOTAL_STATIONS = 20;
const RUN_TIME = 8000;       // 走行8秒
const STOP_TIME = 3500;      // 停車3.5秒（席移動チャンス）
const MAX_DISCOMFORT = 100;
const MAX_MANNER = 100;
const STANDUP_PENALTY = 10;

const STATIONS = [
  '新宿', '代々木', '原宿', '渋谷', '恵比寿',
  '目黒', '五反田', '大崎', '品川', '田町',
  '浜松町', '新橋', '有楽町', '東京', '神田',
  '秋葉原', '御徒町', '上野', '鶯谷', '日暮里'
];

// 乗客タイプ定義
const PASSENGER_TYPES = [
  {
    id: 'sweat',
    name: '汗だくおじさん',
    shortName: '汗おじ',
    emoji: '😅',
    img: 'sweat.png',
    color: '#88aa44',
    aura: 2,        // 強度
    range: 1,       // 隣接±1
    desc: '真夏でもないのに大粒の汗。シャツが背中に貼り付いてる。',
    tags: ['不快強', '隣接'],
    quote: 'ハァ…',
  },
  {
    id: 'drunk',
    name: '酒くさおじさん',
    shortName: '酒おじ',
    emoji: '🥴',
    img: 'drunk.png',
    color: '#cc4488',
    aura: 1,
    range: 1,
    desc: '安い焼酎の匂い。寝落ちで肩に頭が乗ってくる。',
    tags: ['中', '隣接'],
    quote: 'ぐぅぅ',
  },
  {
    id: 'cough',
    name: '咳しまくりおじさん',
    shortName: '咳おじ',
    emoji: '🤧',
    img: 'cough.png',
    color: '#ddaa44',
    aura: 2,
    range: 2,
    desc: 'ノーマスクで「ゴホッ、ゴホッ」。飛沫が広範囲。',
    tags: ['不快強', '広範囲'],
    quote: 'ゴホッ',
  },
  {
    id: 'tiktok',
    name: 'スマホ爆音おじさん',
    shortName: '爆音おじ',
    emoji: '📱',
    img: 'tiktok.png',
    color: '#3388cc',
    aura: 1,
    range: 99,      // 全範囲
    desc: 'TikTokをイヤホンなしで再生。シャカシャカ音漏れにすら遠い。',
    tags: ['全範囲'],
    quote: '♪♪',
  },
  {
    id: 'perfume',
    name: '香水きついおばさま',
    shortName: '香水おば',
    emoji: '💐',
    img: 'perfume.png',
    color: '#cc66dd',
    aura: 1,
    range: 2,
    desc: '香水ドバドバ。息ができない。',
    tags: ['中', '広範囲'],
    quote: 'ぷーん',
  },
  {
    id: 'spread',
    name: '足広げおじさん',
    shortName: '足広げ',
    emoji: '🦵',
    img: 'spread.png',
    color: '#aa6644',
    aura: 2,
    range: 1,
    desc: '股を全開に広げて、物理的に隣を圧迫。',
    tags: ['不快強', '隣接'],
    quote: 'ふんっ',
  },
  {
    id: 'sleep',
    name: '寝落ち倒れおじさん',
    shortName: '寝落ち',
    emoji: '😴',
    img: 'sleep.png',
    color: '#779988',
    aura: 1,
    range: 1,
    desc: '完全に意識を失って隣に倒れてくる。',
    tags: ['弱', '隣接'],
    quote: 'すぅー',
  },
  {
    id: 'highschool',
    name: '高校生（無害）',
    shortName: 'JK/JD',
    emoji: '🎒',
    img: 'highschool.png',
    color: '#66cc99',
    aura: 0,
    range: 0,
    desc: 'ハズレ枠と見せかけて当たり。スマホでマンガ読んでるだけ。',
    tags: ['安全'],
    quote: '',
  },
];

const PTYPE_BY_ID = Object.fromEntries(PASSENGER_TYPES.map(t => [t.id, t]));

// ===== 状態 =====
const state = {
  seats: [],          // [{occupant: passengerType|null}]
  playerSeat: -1,
  discomfort: 0,
  manner: MAX_MANNER,
  score: 0,
  stationIndex: 0,
  phase: 'idle',      // 'boarding' | 'running' | 'gameover'
  phaseTimer: 0,
  phaseDuration: 0,
  standupCount: 0,
  selecting: false,   // 席選択モード（初回 or 立ち上がり後）
  lastTick: 0,
  rafId: null,
};

// ===== DOM =====
const $ = (id) => document.getElementById(id);
const seatsEl = $('seats');
const stationNameEl = $('station-name');
const progressNumEl = $('progress-num');
const gaugeFillEl = $('gauge-fill');
const gaugeNumEl = $('gauge-num');
const mannerNumEl = $('manner-num');
const scoreNumEl = $('score-num');
const timerLabelEl = $('timer-label');
const timerFillEl = $('timer-fill');
const announceEl = $('announce');
const standupBtn = $('standup-btn');
const doorL = $('door-left');
const doorR = $('door-right');

// ===== サウンド (WebAudio) =====
let audioCtx = null;
function getAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { return null; }
  }
  return audioCtx;
}
function beep(freq, dur = 0.1, type = 'square', gain = 0.05) {
  const ctx = getAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g).connect(ctx.destination);
  osc.start();
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.stop(ctx.currentTime + dur);
}
function sfxSit()    { beep(440, 0.08, 'triangle'); }
function sfxStand()  { beep(660, 0.06, 'sine');     setTimeout(() => beep(440, 0.06, 'sine'), 60); }
function sfxBoard()  { beep(220, 0.12, 'sawtooth'); }
function sfxDanger() { beep(160, 0.15, 'sawtooth', 0.07); }
function sfxStation(){ beep(880, 0.1, 'sine'); setTimeout(() => beep(660, 0.15, 'sine'), 100); }
function sfxGameOver(){ beep(200, 0.3, 'sawtooth', 0.08); setTimeout(() => beep(150, 0.5, 'sawtooth', 0.08), 300); }
function sfxWin()   { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.15, 'triangle'), i * 100)); }

// ===== 画面遷移 =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
}

// ===== 初期化 =====
function initSeats() {
  seatsEl.innerHTML = '';
  state.seats = [];
  for (let i = 0; i < SEAT_COUNT; i++) {
    state.seats.push({ occupant: null });
    const el = document.createElement('div');
    el.className = 'seat';
    el.dataset.idx = i;
    el.innerHTML = `<span class="seat-num">${i + 1}</span>`;
    el.addEventListener('click', () => onSeatClick(i));
    seatsEl.appendChild(el);
  }
}

function startGame() {
  state.seats = [];
  state.playerSeat = -1;
  state.discomfort = 0;
  state.manner = MAX_MANNER;
  state.score = 0;
  state.stationIndex = 0;
  state.standupCount = 0;
  state.phase = 'initial';   // 初回席選択は時間無制限
  state.selecting = true;
  state.lastTick = performance.now();

  initSeats();
  initialBoarding(); // 最初に2〜3人乗っているところから始まる
  updateHUD();
  updateSeats();
  showScreen('game-screen');
  announceEl.textContent = '【駅構内】お好きな席をどうぞ…さあどこに座る？';
  timerLabelEl.textContent = '席を選んでください（時間制限なし）';
  timerFillEl.style.width = '100%';
  timerFillEl.classList.add('boarding');
  doorL.classList.add('active');
  doorR.classList.add('active');
  standupBtn.disabled = true;
  cancelAnimationFrame(state.rafId);
  state.rafId = requestAnimationFrame(tick);
}

function initialBoarding() {
  // ランダムに2-3人を乗せる（プレイヤー席はまだ未定なので全席空席状態に乗せる）
  const n = 2 + Math.floor(Math.random() * 2);
  const slots = [...Array(SEAT_COUNT).keys()];
  shuffle(slots);
  for (let i = 0; i < n; i++) {
    const t = randomPassenger();
    state.seats[slots[i]].occupant = t;
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomPassenger() {
  // 重み付け（高校生は確率低め）
  const weights = [
    { t: 'sweat',      w: 12 },
    { t: 'drunk',      w: 10 },
    { t: 'cough',      w: 10 },
    { t: 'tiktok',     w:  8 },
    { t: 'perfume',    w:  9 },
    { t: 'spread',     w: 12 },
    { t: 'sleep',      w:  8 },
    { t: 'highschool', w:  6 },
  ];
  const total = weights.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * total;
  for (const wt of weights) {
    if (r < wt.w) return PTYPE_BY_ID[wt.t];
    r -= wt.w;
  }
  return PTYPE_BY_ID['sweat'];
}

// ===== 座席クリック =====
function onSeatClick(i) {
  if (state.phase === 'gameover') return;
  if (!state.selecting) return;
  if (state.seats[i].occupant) return; // 占有中

  if (state.playerSeat === i) return;
  state.playerSeat = i;
  state.selecting = false;
  sfxSit();
  updateSeats();
  if (state.phase === 'initial') {
    // 初回席選択完了 → 出発（走行フェーズへ）
    startRunning();
  }
  // boarding中なら、そのままタイマーが切れるまで待つ
}

// ===== 立ち上がる =====
standupBtn.addEventListener('click', () => {
  if (state.phase === 'gameover') return;
  if (state.playerSeat < 0) return;
  if (state.selecting) return;
  // 空席があるか確認
  const hasEmpty = state.seats.some((s, i) => i !== state.playerSeat && !s.occupant);
  if (!hasEmpty) {
    showToast('空席なし！座ったまま耐えろ！');
    return;
  }
  state.standupCount++;
  state.manner = Math.max(0, state.manner - STANDUP_PENALTY);
  showToast(`席を立った！マナー -${STANDUP_PENALTY}`);
  state.seats[state.playerSeat] = { occupant: null };
  state.playerSeat = -1;
  state.selecting = true;
  sfxStand();
  updateHUD();
  updateSeats();
  if (state.manner <= 0) {
    loseGame('不審な動きを繰り返したため、駅員に通報され連行された…。');
  }
});

// ===== HUD =====
function updateHUD() {
  stationNameEl.textContent = STATIONS[state.stationIndex] || '???';
  progressNumEl.textContent = Math.max(0, TOTAL_STATIONS - state.stationIndex);
  gaugeFillEl.style.width = `${Math.min(100, state.discomfort)}%`;
  gaugeNumEl.textContent = Math.floor(state.discomfort);
  mannerNumEl.textContent = state.manner;
  scoreNumEl.textContent = state.score;
  standupBtn.disabled = (state.playerSeat < 0 || state.phase === 'gameover');
}

function updateSeats() {
  for (let i = 0; i < SEAT_COUNT; i++) {
    const el = seatsEl.children[i];
    if (!el) continue;
    el.classList.remove('player-seat', 'selectable');
    // 占有人物の表示
    let occEl = el.querySelector('.occupant');
    if (occEl) occEl.remove();
    let auraText = el.querySelector('.aura-text');
    if (auraText) auraText.remove();

    if (state.playerSeat === i) {
      el.classList.add('player-seat');
      const occ = document.createElement('div');
      occ.className = 'occupant';
      occ.style.background = '#446699';
      // プレイヤー画像があれば使う
      if (window.PLAYER_IMG_OK) {
        occ.innerHTML = `<img src="assets/player.png" alt="player" />`;
      } else {
        occ.textContent = '🧑‍💼';
      }
      el.appendChild(occ);
    } else if (state.seats[i].occupant) {
      const p = state.seats[i].occupant;
      const occ = document.createElement('div');
      occ.className = 'occupant';
      if (p.aura >= 2) occ.classList.add('aura-3');
      else if (p.aura >= 1) occ.classList.add('aura-2');
      occ.style.background = p.color;
      if (window.IMG_OK && window.IMG_OK[p.id]) {
        occ.innerHTML = `<img src="assets/${p.img}" alt="${p.name}" />`;
      } else {
        occ.textContent = p.emoji;
      }
      el.appendChild(occ);

      // キャラ名（短縮）
      const name = document.createElement('div');
      name.className = 'occupant-name';
      name.textContent = p.shortName || p.name;
      el.appendChild(name);

      // 不快オーラのアニメテキスト
      if (p.aura > 0) {
        const t = document.createElement('div');
        t.className = 'aura-text';
        t.textContent = p.quote;
        el.appendChild(t);
      }
    } else {
      // 空席
      if (state.selecting) el.classList.add('selectable');
    }
  }
}

// ===== 不快度計算 =====
function computeDiscomfortRate() {
  if (state.playerSeat < 0) return 0;
  let rate = 0;
  for (let i = 0; i < SEAT_COUNT; i++) {
    if (i === state.playerSeat) continue;
    const occ = state.seats[i].occupant;
    if (!occ) continue;
    const dist = Math.abs(i - state.playerSeat);
    if (dist <= occ.range) {
      // 隣接ほどダメージ大
      const falloff = occ.range === 99 ? 0.5 : (1 - (dist - 1) * 0.3);
      rate += occ.aura * Math.max(0.4, falloff);
    }
  }
  // 端席（0番 or 6番）ボーナス：壁側からは攻められない
  if (state.playerSeat === 0 || state.playerSeat === SEAT_COUNT - 1) {
    rate *= 0.55;
  }
  return rate; // 1秒あたりの不快度上昇量（単位: ポイント/秒）
}

// ===== 停車・走行 =====
function startStopping() {
  // 停車開始：乗降処理
  state.phase = 'boarding';
  state.phaseTimer = 0;
  state.phaseDuration = STOP_TIME;
  state.selecting = (state.playerSeat >= 0); // プレイヤーは座ったまま、ボタンで立てる
  // 立たない場合は selectable は出ないように
  doorL.classList.add('active');
  doorR.classList.add('active');
  sfxStation();
  announceEl.textContent = `【まもなく ${STATIONS[state.stationIndex]} 】扉が開きます`;
  timerLabelEl.textContent = `停車中（${STATIONS[state.stationIndex]}）`;
  timerFillEl.classList.add('boarding');

  // 降車処理
  setTimeout(() => doBoardingExchange(), 400);
}

function doBoardingExchange() {
  // ランダムに何人か降りる（プレイヤーは降りない）
  let descended = 0;
  for (let i = 0; i < SEAT_COUNT; i++) {
    if (i === state.playerSeat) continue;
    if (!state.seats[i].occupant) continue;
    if (Math.random() < 0.55) { // 降りる確率を上げる
      state.seats[i].occupant = null;
      descended++;
    }
  }
  // 駅クリア時に不快度を-18回復（息抜きボーナス）
  if (state.discomfort > 0) {
    state.discomfort = Math.max(0, state.discomfort - 18);
  }
  // 乗ってくる（駅進度に応じて多めに）
  const ratio = state.stationIndex / TOTAL_STATIONS;
  const baseCount = 1 + Math.floor(Math.random() * 2);
  const bonus = Math.floor(ratio * 2); // 終盤も控えめに（3→2）
  let boardCount = baseCount + bonus;
  const empties = [];
  for (let i = 0; i < SEAT_COUNT; i++) {
    if (i === state.playerSeat) continue;
    if (!state.seats[i].occupant) empties.push(i);
  }
  shuffle(empties);
  let boarded = 0;
  for (let i = 0; i < boardCount && i < empties.length; i++) {
    const t = randomPassenger();
    // 「プレイヤー隣を狙う」フラグ（15%）
    if (Math.random() < 0.15 && state.playerSeat >= 0) {
      const adj = [state.playerSeat - 1, state.playerSeat + 1].filter(x => empties.includes(x));
      if (adj.length > 0) {
        const target = adj[Math.floor(Math.random() * adj.length)];
        state.seats[target].occupant = t;
        empties.splice(empties.indexOf(target), 1);
        boarded++;
        sfxBoard();
        continue;
      }
    }
    state.seats[empties[i]].occupant = t;
    boarded++;
    sfxBoard();
  }
  updateSeats();
  announceEl.textContent = `${descended}人降車・${boarded}人乗車。お気をつけて。`;
}

function startRunning() {
  state.phase = 'running';
  state.phaseTimer = 0;
  state.phaseDuration = RUN_TIME;
  state.selecting = false;
  doorL.classList.remove('active');
  doorR.classList.remove('active');
  const nextStation = STATIONS[state.stationIndex + 1] || '終点・日暮里';
  announceEl.textContent = `【発車】次は${nextStation}…`;
  timerLabelEl.textContent = '走行中…';
  timerFillEl.classList.remove('boarding');
  updateSeats();
  // 駅クリア時のスコア（初回 stationIndex=0 では駅をまだクリアしてないので加点しない）
  if (state.stationIndex > 0 || state.score > 0) {
    state.score += 100;
    showToast(`${STATIONS[state.stationIndex] || ''} クリア！+100`);
  } else {
    showToast(`出発！次は ${nextStation}`);
  }
  updateHUD();
}

function advanceStation() {
  state.stationIndex++;
  if (state.stationIndex >= TOTAL_STATIONS) {
    winGame();
    return;
  }
  startStopping();
}

// ===== ゲームオーバー =====
function loseGame(reason) {
  state.phase = 'gameover';
  sfxGameOver();
  cancelAnimationFrame(state.rafId);
  $('result-title').textContent = '遅刻';
  $('result-title').classList.remove('win');
  $('result-sub').innerHTML = reason;
  $('result-score-num').textContent = state.score;
  $('result-detail').innerHTML = `
    通過駅: ${state.stationIndex} / ${TOTAL_STATIONS}駅<br />
    席を立った回数: ${state.standupCount}回<br />
    残マナー: ${state.manner} / ${MAX_MANNER}
  `;
  setTimeout(() => showScreen('result-screen'), 800);
}

function winGame() {
  state.phase = 'gameover';
  sfxWin();
  cancelAnimationFrame(state.rafId);
  // 駅数100 + ボーナス
  const mannerBonus = state.manner * 10;
  const finishBonus = 1000;
  state.score += mannerBonus + finishBonus;
  $('result-title').textContent = '定時退社';
  $('result-title').classList.add('win');
  $('result-sub').innerHTML = `終点・日暮里に到着。<br />よく耐えた…！`;
  $('result-score-num').textContent = state.score;
  $('result-detail').innerHTML = `
    通過駅: ${TOTAL_STATIONS} / ${TOTAL_STATIONS}駅<br />
    席を立った回数: ${state.standupCount}回<br />
    残マナー: ${state.manner} / ${MAX_MANNER}（+${mannerBonus}点）<br />
    完走ボーナス: +${finishBonus}点
  `;
  setTimeout(() => showScreen('result-screen'), 800);
}

// ===== 演出 =====
let toastTimer = null;
function showToast(text) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    $('game-screen').appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1400);
}

let flashEl = null;
function damageFlash() {
  if (!flashEl) {
    flashEl = document.createElement('div');
    flashEl.className = 'damage-flash';
    $('game-screen').appendChild(flashEl);
  }
  flashEl.classList.remove('show');
  void flashEl.offsetWidth;
  flashEl.classList.add('show');
}

// ===== メインループ =====
function tick(now) {
  const dt = Math.min(100, now - state.lastTick) / 1000; // 秒
  state.lastTick = now;

  if (state.phase === 'gameover') {
    return;
  }

  // 初回席選択は時間無制限：タイマー停止＆フェーズ遷移しない
  if (state.phase === 'initial') {
    timerFillEl.style.width = '100%';
    updateHUD();
    updateSeats();
    state.rafId = requestAnimationFrame(tick);
    return;
  }

  state.phaseTimer += dt * 1000;
  const remain = state.phaseDuration - state.phaseTimer;
  timerFillEl.style.width = `${Math.max(0, Math.min(100, remain / state.phaseDuration * 100))}%`;

  // 不快度蓄積（走行中も停車中も）
  if (state.playerSeat >= 0) {
    const rate = computeDiscomfortRate();
    if (rate > 0) {
      state.discomfort += rate * dt * 2.5; // 緩和後の最終値
      // ダメージフラッシュ（ゲージが50超でビカビカ）
      if (state.discomfort > 50 && Math.random() < dt * 4) {
        damageFlash();
      }
      // 警告音（ゲージ高い時）
      if (state.discomfort > 70 && Math.random() < dt * 1.2) {
        sfxDanger();
      }
      if (state.discomfort >= MAX_DISCOMFORT) {
        loseGame('隣のおじさんの不快オーラに耐えられず、途中下車…。');
        return;
      }
    } else {
      // 隣に誰もいないとちょっとずつ回復（落ち着く）→ 倍化
      state.discomfort = Math.max(0, state.discomfort - dt * 12);
    }
  }

  // フェーズ遷移
  if (state.phaseTimer >= state.phaseDuration) {
    if (state.phase === 'boarding') {
      // プレイヤー未着席チェック
      if (state.playerSeat < 0) {
        loseGame('席を選べず、満員のまま乗り過ごし。');
        return;
      }
      startRunning();
    } else if (state.phase === 'running') {
      advanceStation();
    }
  }

  updateHUD();
  updateSeats();
  state.rafId = requestAnimationFrame(tick);
}

// ===== 画像プリロード =====
window.IMG_OK = {};
window.PLAYER_IMG_OK = false;
function preloadImages() {
  PASSENGER_TYPES.forEach(p => {
    const img = new Image();
    img.onload = () => { window.IMG_OK[p.id] = true; };
    img.onerror = () => { window.IMG_OK[p.id] = false; };
    img.src = `assets/${p.img}`;
  });
  const pi = new Image();
  pi.onload = () => { window.PLAYER_IMG_OK = true; };
  pi.onerror = () => { window.PLAYER_IMG_OK = false; };
  pi.src = 'assets/player.png';
}

// ===== ヘルプ画面 =====
function buildEnemyList() {
  const list = $('enemy-list');
  list.innerHTML = '';
  PASSENGER_TYPES.forEach(p => {
    const card = document.createElement('div');
    card.className = 'enemy-card';
    const tagsHtml = p.tags.map(t => {
      const cls = (t.includes('強') || t.includes('広')) ? 'tag danger' : (t.includes('範囲') || t.includes('隣接') ? 'tag range' : 'tag');
      return `<span class="${cls}">${t}</span>`;
    }).join('');
    card.innerHTML = `
      <div class="enemy-card-icon" style="background:${p.color}">
        ${window.IMG_OK[p.id] ? `<img src="assets/${p.img}" />` : p.emoji}
      </div>
      <div class="enemy-card-body">
        <div class="enemy-card-name">${p.name}</div>
        <div class="enemy-card-desc">${p.desc}</div>
        <div class="enemy-card-tags">${tagsHtml}</div>
      </div>
    `;
    list.appendChild(card);
  });
}

// ===== イベント =====
$('start-btn').addEventListener('click', () => {
  getAudio(); // ユーザー操作時にAudioContext起動
  startGame();
});
$('help-btn').addEventListener('click', () => {
  buildEnemyList();
  showScreen('help-screen');
});
$('help-back').addEventListener('click', () => showScreen('title-screen'));
$('retry-btn').addEventListener('click', () => startGame());
$('title-btn').addEventListener('click', () => showScreen('title-screen'));

preloadImages();
