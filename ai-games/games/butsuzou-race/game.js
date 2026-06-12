// ====== 仏像レース ～悟りへの道～ ======

const CHARACTERS = [
  { id: 'amida',    name: '阿弥陀如来',  desc: '王道。バランス型。',           img: 'assets/char_amida.png',    speedBase: 1.00, luck: 1.00 },
  { id: 'shaka',    name: '釈迦如来',    desc: '初速◎。後半ガス欠注意。',     img: 'assets/char_shaka.png',    speedBase: 1.15, luck: 0.85 },
  { id: 'kannon',   name: '千手観音',    desc: '手が多い。連打強い。',         img: 'assets/char_kannon.png',   speedBase: 0.90, luck: 1.20 },
  { id: 'fudo',     name: '不動明王',    desc: '怒り。イベント耐性持ち。',     img: 'assets/char_fudo.png',     speedBase: 0.95, luck: 1.10 },
  { id: 'jizo',     name: 'お地蔵さん',  desc: '小さい。たまにバグる。',       img: 'assets/char_jizo.png',     speedBase: 1.05, luck: 0.95 },
];

const TRACK_LENGTH = 1000;     // ゴール位置（仮想単位）
const RACE_DURATION_TARGET = 60; // 想定秒数

const state = {
  selectedCharId: null,
  runners: [],         // {char, x, speed, isPlayer, finished, finishTime}
  raceStarted: false,
  raceEnded: false,
  startTime: 0,
  chantPower: 0,       // プレイヤーの溜まった念仏パワー
  eventTimer: 0,
};

// ===== 画面遷移 =====
function show(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

// ===== タイトル =====
document.getElementById('start-btn').onclick = () => {
  buildCharList();
  show('select-screen');
};

// ===== キャラ選択 =====
function buildCharList() {
  const list = document.getElementById('char-list');
  list.innerHTML = '';
  CHARACTERS.forEach(c => {
    const card = document.createElement('div');
    card.className = 'char-card';
    card.dataset.id = c.id;
    card.innerHTML = `
      <div class="char-portrait">
        <img src="${c.img}" alt="" onerror="this.parentElement.classList.add('no-img'); this.remove();">
      </div>
      <div class="char-name">${c.name}</div>
      <div class="char-desc">${c.desc}</div>
    `;
    card.onclick = () => {
      document.querySelectorAll('.char-card').forEach(x => x.classList.remove('selected'));
      card.classList.add('selected');
      state.selectedCharId = c.id;
      document.getElementById('select-confirm-btn').disabled = false;
    };
    list.appendChild(card);
  });
}

document.getElementById('select-confirm-btn').onclick = () => {
  if (!state.selectedCharId) return;
  startRace();
};

// ===== レース開始 =====
function startRace() {
  state.runners = CHARACTERS.map(c => ({
    char: c,
    x: 0,
    speed: 0,
    isPlayer: c.id === state.selectedCharId,
    finished: false,
    finishTime: 0,
  }));
  state.raceStarted = false;
  state.raceEnded = false;
  state.chantPower = 0;
  state.eventTimer = 0;
  state.kannonCombo = 0;
  state.fudoAnger = 0;
  state.startTime = performance.now();

  buildLanes();
  show('race-screen');
  setEventLog('構え…');
  setTimeout(() => { setEventLog('南無…'); }, 800);
  setTimeout(() => { setEventLog('スタート！！！'); state.raceStarted = true; requestAnimationFrame(tick); }, 1800);
}

function buildLanes() {
  const lanes = document.getElementById('lanes');
  lanes.innerHTML = '';
  state.runners.forEach((r, i) => {
    const lane = document.createElement('div');
    lane.className = 'lane';
    lane.dataset.idx = i;
    const runner = document.createElement('div');
    runner.className = 'runner' + (r.isPlayer ? ' player' : '');
    runner.innerHTML = `<img src="${r.char.img}" alt="" onerror="this.parentElement.classList.add('no-img'); this.remove();">`;
    lane.appendChild(runner);
    lanes.appendChild(lane);
  });
}

// ===== 念仏ボタン =====
const chantBtn = document.getElementById('chant-btn');
chantBtn.addEventListener('pointerdown', onChant);
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && state.raceStarted && !state.raceEnded) {
    e.preventDefault();
    onChant();
  }
});

function onChant() {
  if (!state.raceStarted || state.raceEnded) return;
  state.chantPower += 1;
  spawnNamu();
  const p = state.runners.find(r => r.isPlayer);
  if (!p || p.finished) return;

  let base = 1.2 + Math.random() * 0.6;
  const elapsed = (performance.now() - state.startTime) / 1000;

  switch (p.char.id) {
    case 'shaka':
      // 釈迦：序盤2倍、15秒過ぎて減衰、25秒以降は0.5倍（ガス欠）
      if (elapsed < 12) base *= 2.0;
      else if (elapsed < 22) base *= 1.0;
      else base *= 0.5;
      break;
    case 'kannon':
      // 千手観音：連打カウントに応じて加速ボーナス（最大1.8倍）
      state.kannonCombo = (state.kannonCombo || 0) + 1;
      const combo = Math.min(state.kannonCombo / 20, 0.8);
      base *= 1.0 + combo;
      if (state.kannonCombo % 10 === 0) setEventLog('🙌 千手フィーバー！手が増えた');
      break;
    case 'fudo':
      // 不動：通常時は1.0倍、ただし「怒りメーター」たまると瞬間加速
      state.fudoAnger = (state.fudoAnger || 0) + 1;
      if (state.fudoAnger >= 25) {
        state.fudoAnger = 0;
        base *= 3.0;
        setEventLog('🔥 不動明王が激怒した！');
      }
      break;
    case 'jizo':
      // 地蔵：5%でバグる → 大ジャンプ or 動かない
      if (Math.random() < 0.05) {
        if (Math.random() < 0.6) {
          base *= 5.0;
          setEventLog('🌀 お地蔵さんがバグった！瞬間移動！');
        } else {
          base = 0;
          setEventLog('🌀 お地蔵さんがフリーズした…');
        }
      }
      break;
    case 'amida':
    default:
      // バランス型
      break;
  }

  p.speed += base;
  flashDash(state.runners.indexOf(p));
}

function spawnNamu() {
  const area = document.getElementById('control-area');
  const el = document.createElement('div');
  el.className = 'namu-float';
  const phrases = ['南無', '南無阿弥陀仏', 'なむなむ', '阿弥陀', '功徳++'];
  el.textContent = phrases[Math.floor(Math.random()*phrases.length)];
  el.style.left = (40 + Math.random()*60) + '%';
  el.style.top = '20px';
  area.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function flashDash(idx) {
  const r = document.querySelectorAll('.runner')[idx];
  if (!r) return;
  r.classList.remove('dashing');
  void r.offsetWidth;
  r.classList.add('dashing');
}

// ===== メインループ =====
let lastT = 0;
function tick(t) {
  if (!lastT) lastT = t;
  const dt = Math.min((t - lastT) / 1000, 0.05);
  lastT = t;

  if (!state.raceEnded) {
    updateRunners(dt);
    updateEvents(dt);
    renderRunners();
    updatePositionDisplay();
    checkFinish(t);
  }

  if (!state.raceEnded) requestAnimationFrame(tick);
}

function updateRunners(dt) {
  const elapsed = (performance.now() - state.startTime) / 1000;
  state.runners.forEach(r => {
    if (r.finished) return;
    if (r.isPlayer) {
      r.speed *= 0.94;
      r.x += r.speed * 30 * dt;
    } else {
      // CPU：キャラ別効果
      let mult = 1.0;
      switch (r.char.id) {
        case 'shaka':
          // 序盤12秒は1.5倍、22秒以降ガス欠0.6倍
          if (elapsed < 12) mult = 1.5;
          else if (elapsed < 22) mult = 1.0;
          else mult = 0.6;
          break;
        case 'kannon':
          // 連打を時間に置き換えて徐々に加速
          mult = 1.0 + Math.min(elapsed / 30, 0.8);
          if (Math.floor(elapsed) > (r._lastTick||0) && Math.floor(elapsed) % 8 === 0) {
            r._lastTick = Math.floor(elapsed);
            setEventLog(`🙌 ${r.char.name}が手を増やした！`);
          }
          break;
        case 'fudo':
          // 怒り：5秒に1回、瞬間加速ブースト
          r._anger = (r._anger || 0) + dt;
          if (r._anger >= 5) {
            r._anger = 0;
            r.speed += 25;
            flashDash(state.runners.indexOf(r));
            setEventLog('🔥 不動明王が激怒した！');
          }
          break;
        case 'jizo':
          // 0.3%/frameでバグる
          if (Math.random() < 0.003) {
            if (Math.random() < 0.6) {
              r.x += 80;
              flashDash(state.runners.indexOf(r));
              setEventLog('🌀 お地蔵さんがバグった！');
            } else {
              r._frozen = 1.2;
              setEventLog('🌀 お地蔵さんがフリーズした…');
            }
          }
          if (r._frozen > 0) {
            r._frozen -= dt;
            r.speed *= 0.7;
            return;
          }
          break;
      }
      const target = 18 * r.char.speedBase * mult + (Math.random() - 0.5) * 5;
      r.speed += (target - r.speed) * 0.05;
      r.x += r.speed * dt;
    }
    if (r.x < 0) r.x = 0;
  });
}

function renderRunners() {
  const track = document.getElementById('race-track');
  const trackW = track.clientWidth - 80;
  const lanes = document.querySelectorAll('.lane');
  state.runners.forEach((r, i) => {
    const ratio = Math.min(r.x / TRACK_LENGTH, 1);
    const lane = lanes[i];
    const runner = lane.querySelector('.runner');
    runner.style.left = (ratio * trackW) + 'px';
  });
}

function updatePositionDisplay() {
  const sorted = [...state.runners].sort((a,b) => b.x - a.x);
  const playerRank = sorted.findIndex(r => r.isPlayer) + 1;
  const playerX = state.runners.find(r=>r.isPlayer).x;
  const pct = Math.min(100, Math.floor(playerX / TRACK_LENGTH * 100));
  document.getElementById('position-display').textContent = `順位：${playerRank}位 / 進捗：${pct}%`;
}

// ===== ランダムイベント =====
const EVENTS = [
  { text: '⚡ 雷が落ちた！全員ひるむ！', fn: () => state.runners.forEach(r => r.speed *= 0.3) },
  { text: '🍌 ライバルがバナナで滑った！', fn: () => {
      const cpus = state.runners.filter(r => !r.isPlayer && !r.finished);
      if (cpus.length) { const v = cpus[Math.floor(Math.random()*cpus.length)]; v.speed *= 0.2; v.x = Math.max(0, v.x - 30); }
    } },
  { text: '🍙 托鉢を受けた仏像が加速！', fn: () => {
      const ones = state.runners.filter(r => !r.finished);
      const v = ones[Math.floor(Math.random()*ones.length)];
      v.speed += 30; flashDash(state.runners.indexOf(v));
    } },
  { text: '☄ 隕石が落ちてきた！', fn: () => {
      const ones = state.runners.filter(r => !r.finished);
      const v = ones[Math.floor(Math.random()*ones.length)];
      v.x = Math.max(0, v.x - 80);
    } },
  { text: '🌸 桜が舞った…全員少しスピードアップ', fn: () => state.runners.forEach(r => r.speed += 4) },
  { text: '😇 一体が突然 悟りを開いて瞑想を始めた', fn: () => {
      const cpus = state.runners.filter(r => !r.isPlayer && !r.finished);
      if (cpus.length) { const v = cpus[Math.floor(Math.random()*cpus.length)]; v.speed = 0; }
    } },
  { text: '🐢 亀がコースを横切った。みんな避けた', fn: () => state.runners.forEach(r => r.speed *= 0.7) },
  { text: '🎺 観客の歓声でテンションUP！', fn: () => state.runners.forEach(r => r.speed += 6) },
];

function updateEvents(dt) {
  state.eventTimer += dt;
  if (state.eventTimer > 4 + Math.random() * 3) {
    state.eventTimer = 0;
    const ev = EVENTS[Math.floor(Math.random()*EVENTS.length)];
    const before = state.runners.map(r => ({ speed: r.speed, x: r.x }));
    ev.fn();
    // 不動：誰でも、減速・後退を70%軽減
    state.runners.forEach((r, i) => {
      if (r.char.id !== 'fudo' || r.finished) return;
      const b = before[i];
      if (r.speed < b.speed) r.speed = b.speed - (b.speed - r.speed) * 0.3;
      if (r.x < b.x) r.x = b.x - (b.x - r.x) * 0.3;
    });
    setEventLog(ev.text);
    flashScreen();
  }
}

function setEventLog(text) {
  document.getElementById('event-log').textContent = text;
}

function flashScreen() {
  const track = document.getElementById('race-track');
  const f = document.createElement('div');
  f.className = 'event-flash';
  track.appendChild(f);
  setTimeout(() => f.remove(), 300);
}

// ===== ゴール判定 =====
function checkFinish(t) {
  state.runners.forEach(r => {
    if (!r.finished && r.x >= TRACK_LENGTH) {
      r.finished = true;
      r.finishTime = t - state.startTime;
    }
  });
  if (state.runners.every(r => r.finished)) {
    state.raceEnded = true;
    setTimeout(showResult, 800);
  }
}

// ===== 結果画面 =====
function showResult() {
  const sorted = [...state.runners].sort((a,b) => a.finishTime - b.finishTime);
  const playerRank = sorted.findIndex(r => r.isPlayer) + 1;
  const winner = sorted[0];

  const titleEl = document.getElementById('result-title');
  const textEl = document.getElementById('result-text');

  if (playerRank === 1) {
    titleEl.textContent = '悟りました。';
    textEl.innerHTML = `${winner.char.name}は誰よりも早く悟りに達した。<br>世界は静寂に包まれた。<br><br>順位：1位 / 5体中`;
  } else if (playerRank <= 3) {
    titleEl.textContent = 'もう少しでした。';
    textEl.innerHTML = `あなたの仏像はまだ煩悩を抱えていたようだ。<br>勝者は『${winner.char.name}』。<br><br>順位：${playerRank}位 / 5体中`;
  } else {
    titleEl.textContent = '煩悩まみれです。';
    textEl.innerHTML = `あなたの念仏は届かなかった。<br>来世にご期待ください。<br>勝者は『${winner.char.name}』。<br><br>順位：${playerRank}位 / 5体中`;
  }

  show('result-screen');
}

// ===== リトライ =====
document.getElementById('retry-btn').onclick = () => {
  state.selectedCharId = null;
  document.getElementById('select-confirm-btn').disabled = true;
  show('title-screen');
};
