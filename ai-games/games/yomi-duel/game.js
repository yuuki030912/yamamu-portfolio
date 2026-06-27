"use strict";
/* =========================================================
   YOMI DUEL ─ クロードと心理決闘
   3すくみ読み合い対戦。攻撃>溜め / 防御>攻撃 / 溜め>防御(必殺へ)
   ========================================================= */

const $ = (s)=>document.querySelector(s);
const $$ = (s)=>document.querySelectorAll(s);

// ---------- balance ----------
const MAXHP = 100;
const DMG = {
  punish:      24,  // ⚔️攻撃 → 🌀溜めに刺さる（最大火力。溜めは最もハイリスク）
  parry:       18,  // 🛡️防御 → ⚔️攻撃をパリィして反撃（連打を狩る核心）
  trade:       10,  // ⚔️攻撃同士の相打ち
  ultimate:    40,  // 💥必殺（防御貫通）
  ultTrade:    28,  // 必殺同士
};
const GAUGE_MAX = 3;

// ---------- state ----------
let S = null;
function freshState(){
  return {
    myHp:MAXHP, foeHp:MAXHP, myG:0, foeG:0,
    round:1, busy:false, over:false,
    // === ゴースト・クロードの記憶（プレイヤーのモデル） ===
    pStats:{strike:1,guard:1,charge:1},      // 頻度
    pLast:null, pPrev:null,
    trans:{strike:{strike:0,guard:0,charge:0},guard:{strike:0,guard:0,charge:0},charge:{strike:0,guard:0,charge:0}}, // 1手マルコフ
    trans2:{}, // 2手マルコフ key="a|b" → {strike,guard,charge}
    // === 適応型プレイヤー対策：自分の前手→相手の反応 を学習（"防御したら溜める"等のクセを即検知） ===
    gLast:null, lastPred:null, acc:0.4, // gLast=ゴーストの前手, acc=予測的中率EWMA
    gtrans:{strike:{strike:0,guard:0,charge:0},guard:{strike:0,guard:0,charge:0},charge:{strike:0,guard:0,charge:0}},
    // === 読み手対策(レベル3)：自分の手の履歴を持ち、"相手は俺の癖を読んでカウンターする"を見越して裏をかく ===
    metaScore:0.33, readerPred:null, gSelfPrev:null,
    gSelfStats:{strike:1,guard:1,charge:1},
    gSelfTr:{strike:{strike:0,guard:0,charge:0},guard:{strike:0,guard:0,charge:0},charge:{strike:0,guard:0,charge:0}},
    recent:[], // 直近の手（recency重み用）
    exWins:0, exLoss:0, // ゴーストの直近交換の勝敗（メタ読み・温度調整用）
    lastRead:null,      // 直近のdecide結果 {move,predicted,conf,ev}
    streak:{move:null,n:0}, // プレイヤーの同手連打カウント
    myStrikes:0, foeStrikes:0, ults:0, perfectReads:0,
    history:[], // 確定ラウンド {round, player, claude, verdict} ── 本物のクロードに渡す
  };
}

/* =========================================================
   対戦相手モード ── local(確率AI) / online(本物のClaude API)
   ========================================================= */
let MODE='local';
const NET=(()=>{
  let available=false, hasKey=false;
  async function probe(){
    try{
      const r=await fetch('/api/health',{cache:'no-store'});
      if(r.ok){ const j=await r.json(); available=true; hasKey=!!j.hasKey; }
    }catch(e){ available=false; hasKey=false; }
    return {available,hasKey};
  }
  // フェアネス：プレイヤーの"今の手"は送らない。確定済み履歴と現在状況だけ。
  async function move(){
    const body={
      state:{ round:S.round, claudeHp:Math.max(0,S.foeHp), playerHp:Math.max(0,S.myHp), claudeGauge:S.foeG, playerGauge:S.myG },
      history:S.history,
    };
    const r=await fetch('/api/claude-move',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    if(!r.ok){ const t=await r.text(); throw new Error(r.status+' '+t.slice(0,120)); }
    return await r.json(); // {move, taunt, read}
  }
  return { probe, move, get available(){return available;}, get hasKey(){return hasKey;} };
})();

// ---------- records ----------
const REC_KEY='yomiduel_rec';
function loadRec(){ try{return JSON.parse(localStorage.getItem(REC_KEY))||{w:0,l:0,streak:0,cur:0};}catch(e){return {w:0,l:0,streak:0,cur:0};} }
function saveRec(r){ try{localStorage.setItem(REC_KEY,JSON.stringify(r));}catch(e){} }
function paintRec(){ const r=loadRec(); $('#recW').textContent=r.w; $('#recL').textContent=r.l; $('#recStreak').textContent=r.streak; }

/* ===== 全プレイヤー戦績（Google Apps Script Web App / CORS回避：記録=Image GET, 取得=JSONP） ===== */
const STATS_URL='https://script.google.com/macros/s/AKfycbxjFlul50d-RcTCXjw54OBal46CC_rdnzStzjUJrCJ7uH7lbyTA0690NrRxE6AgTY2NWQ/exec'; // 全プレイヤー戦績(GAS Web App)
function recordGlobal(win){
  if(!STATS_URL) return;
  try{ new Image().src = STATS_URL+'?mode=record&r='+(win?'win':'lose')+'&_='+Date.now(); }catch(e){}
}
function loadGlobalStats(){
  if(!STATS_URL) return;
  const cb='ydStats_'+Date.now();
  window[cb]=(d)=>{ try{ paintGlobal(d); }finally{ try{ delete window[cb]; }catch(e){} } };
  const s=document.createElement('script');
  s.src=STATS_URL+'?mode=stats&callback='+cb+'&_='+Date.now();
  s.onerror=()=>{ try{ delete window[cb]; }catch(e){} };
  document.head.appendChild(s);
}
function paintGlobal(d){
  const el=$('#globalRec'); if(!el) return;
  const pw=(d&&d.playerWins)||0, gw=(d&&d.ghostWins)||0, tot=pw+gw;
  if(tot<1){ el.style.display='none'; return; }
  const rate=Math.round(pw/tot*100);
  el.style.display='';
  el.innerHTML='🌐 全プレイヤー ── <b>'+pw+'</b> 勝 <b>'+gw+'</b> 敗　みんなの勝率 <b>'+rate+'%</b>';
}

/* =========================================================
   AUDIO  ── ElevenLabs製mp3を優先、無ければWebAudio合成
   ========================================================= */
const Audio2 = (()=>{
  let ctx=null, master=null, muted=false, bgmEl=null;
  const files={}; // name -> HTMLAudioElement (if mp3 exists)
  const NAMES=['strike','guard','charge','ult','hit','win','lose','click'];
  function init(){
    if(ctx) return;
    try{ ctx=new (window.AudioContext||window.webkitAudioContext)(); master=ctx.createGain(); master.gain.value=0.9; master.connect(ctx.destination);}catch(e){}
    // try load mp3 sfx
    NAMES.forEach(n=>{
      const a=new Audio(`assets/${n}.mp3`); a.preload='auto';
      a.addEventListener('canplaythrough',()=>{files[n]=a;},{once:true});
      a.addEventListener('error',()=>{},{once:true});
      a.load();
    });
    // bgm
    bgmEl=new Audio('assets/bgm.mp3'); bgmEl.loop=true; bgmEl.volume=0.42; bgmEl.preload='auto';
    bgmEl.addEventListener('canplaythrough',()=>{ files._bgm=true; },{once:true});
    bgmEl.load();
    // voice manifest（テキスト→音声ファイル名）
    fetch('assets/voice/manifest.json').then(r=>r.ok?r.json():null).then(m=>{ if(m) voiceMap=m; }).catch(()=>{});
  }
  // ===== ボイス（ゴーストのセリフ音声） =====
  let voiceMap=null; const voiceCache={}; let curVoice=null;
  function voice(text){
    if(muted||!voiceMap) return;
    const file=voiceMap[text]; if(!file) return;     // 動的セリフ等は未収録→無音(テキストのみ)
    resume();
    try{
      if(curVoice){ curVoice.pause(); curVoice.currentTime=0; }
      let a=voiceCache[file];
      if(!a){ a=new Audio(`assets/voice/${file}.mp3`); a.preload='auto'; voiceCache[file]=a; }
      a.volume=1.0; a.currentTime=0; curVoice=a; a.play().catch(()=>{});
    }catch(e){}
  }
  function resume(){ if(ctx&&ctx.state==='suspended') ctx.resume(); }
  function setMuted(m){ muted=m; if(bgmEl) bgmEl.muted=m; if(master) master.gain.value=m?0:0.9; }
  function isMuted(){return muted;}
  function startBgm(){ if(!bgmEl||muted) return; bgmEl.currentTime=0; bgmEl.play().catch(()=>{}); }
  function stopBgm(){ if(bgmEl){ bgmEl.pause(); } }
  // synth fallbacks
  function tone(freq,dur,type='sine',vol=0.3,slideTo=null){
    if(!ctx||muted) return;
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type=type; o.frequency.value=freq;
    if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime+dur);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+dur);
    o.connect(g); g.connect(master); o.start(); o.stop(ctx.currentTime+dur);
  }
  function noise(dur,vol=0.3,hp=800){
    if(!ctx||muted) return;
    const n=ctx.createBufferSource(); const len=Math.floor(ctx.sampleRate*dur);
    const buf=ctx.createBuffer(1,len,ctx.sampleRate); const d=buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2);
    n.buffer=buf; const f=ctx.createBiquadFilter(); f.type='highpass'; f.frequency.value=hp;
    const g=ctx.createGain(); g.gain.value=vol;
    n.connect(f); f.connect(g); g.connect(master); n.start();
  }
  function play(name){
    if(muted) return; resume();
    if(files[name]){ try{ const a=files[name].cloneNode(); a.volume=0.85; a.play().catch(()=>{}); return; }catch(e){} }
    // fallbacks
    switch(name){
      case 'strike': tone(220,0.18,'sawtooth',0.32,90); noise(0.12,0.18,1200); break;
      case 'guard':  tone(900,0.12,'square',0.22,1400); noise(0.09,0.22,2500); break;
      case 'charge': tone(330,0.28,'sine',0.25,660); break;
      case 'ult':    tone(160,0.5,'sawtooth',0.4,1200); noise(0.4,0.25,400); setTimeout(()=>tone(880,0.3,'square',0.3,1760),60); break;
      case 'hit':    noise(0.18,0.3,300); tone(120,0.2,'sine',0.3,60); break;
      case 'win':    [523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,0.3,'triangle',0.3),i*110)); break;
      case 'lose':   [392,330,262,196].forEach((f,i)=>setTimeout(()=>tone(f,0.35,'sawtooth',0.28,f*0.6),i*140)); break;
      case 'click':  tone(660,0.06,'square',0.18); break;
    }
  }
  return {init,resume,setMuted,isMuted,play,startBgm,stopBgm,voice};
})();

/* =========================================================
   CLAUDE 表情キャラ ── NovelAI画像があれば差し替え、無ければcanvas描画
   moods: idle, focus, hurt, ult, win, lose
   ========================================================= */
const Face = (()=>{
  const cv=$('#foeCanvas'), ctx=cv.getContext('2d');
  const img=$('#foeImg');
  const have={}; // mood -> true if image loaded
  const MOODS=['idle','focus','hurt','ult','win','lose'];
  let cur='idle', t=0, raf=null;
  function probe(){
    MOODS.forEach(m=>{
      const im=new Image();
      im.onload=()=>{ have[m]=im; if(m===cur) showImg(m); };
      im.onerror=()=>{};
      im.src=`art/claude_${m}.png`;
    });
  }
  function showImg(m){
    const im=have[m]||have['idle'];
    if(im){ img.src=im.src; img.style.display='block'; cv.style.display='none'; }
    else { img.style.display='none'; cv.style.display='block'; }
  }
  function set(m){ cur=m; t=0; showImg(m);
    if(m==='hurt'){ const fa=$('#foeArt'); fa.classList.remove('flinch'); void fa.offsetWidth; fa.classList.add('flinch'); }
  }
  // ---- canvas mascot: オレンジのAIキャラ（クロード） ----
  function draw(){
    t+=0.05;
    if(have[cur]||have['idle']){ raf=requestAnimationFrame(draw); return; }
    const w=cv.width,h=cv.height; ctx.clearRect(0,0,w,h);
    const cx=w/2, cy=h/2+10, bob=Math.sin(t)*8;
    // glow ring
    const mc = cur==='ult'?'#ffd24a':cur==='hurt'?'#ff5a5a':cur==='win'?'#56e39f':cur==='lose'?'#6b7099':'#ff7a3c';
    ctx.save(); ctx.translate(cx,cy+bob);
    // aura
    const g=ctx.createRadialGradient(0,0,40,0,0,180);
    g.addColorStop(0,mc+'55'); g.addColorStop(1,'transparent');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,180,0,7); ctx.fill();
    // body (rounded gem)
    ctx.fillStyle='#1c1733'; ctx.strokeStyle=mc; ctx.lineWidth=8;
    roundGem(0,0,150,170);
    ctx.fill(); ctx.stroke();
    // inner panel
    ctx.fillStyle='#0e0b1c'; roundGem(0,6,120,135); ctx.fill();
    // eyes
    const blink = (Math.sin(t*0.7)>0.95)?0.12:1;
    ctx.fillStyle=mc;
    if(cur==='lose'){ // > <
      eyeLine(-46,-6,-22,-18); eyeLine(-46,-18,-22,-6);
      eyeLine(22,-6,46,-18); eyeLine(22,-18,46,-6);
    } else if(cur==='hurt'){ // @ @ surprised
      ring(-34,-12,18); ring(34,-12,18);
    } else {
      eye(-34,-12,18,blink, cur==='ult'||cur==='win'); eye(34,-12,18,blink, cur==='ult'||cur==='win');
    }
    // mouth
    ctx.strokeStyle=mc; ctx.lineWidth=6; ctx.lineCap='round'; ctx.beginPath();
    if(cur==='win'||cur==='ult'){ ctx.arc(0,34,26,0.15*Math.PI,0.85*Math.PI); }
    else if(cur==='lose'){ ctx.arc(0,60,24,1.15*Math.PI,1.85*Math.PI); }
    else if(cur==='hurt'){ ctx.arc(0,48,16,0,2*Math.PI); }
    else if(cur==='focus'){ ctx.moveTo(-18,42); ctx.lineTo(18,42); }
    else { ctx.arc(0,30,20,0.1*Math.PI,0.9*Math.PI); }
    ctx.stroke();
    // antenna
    ctx.strokeStyle=mc; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(0,-150); ctx.lineTo(0,-186); ctx.stroke();
    const pr=6+Math.sin(t*3)*2; ctx.fillStyle=mc; ctx.beginPath(); ctx.arc(0,-192,pr+4,0,7); ctx.fill();
    ctx.restore();
    raf=requestAnimationFrame(draw);
  }
  function roundGem(x,y,rw,rh){ const r=46; ctx.beginPath();
    ctx.moveTo(x-rw+r,y-rh); ctx.lineTo(x+rw-r,y-rh); ctx.arcTo(x+rw,y-rh,x+rw,y-rh+r,r);
    ctx.lineTo(x+rw,y+rh-r); ctx.arcTo(x+rw,y+rh,x+rw-r,y+rh,r);
    ctx.lineTo(x-rw+r,y+rh); ctx.arcTo(x-rw,y+rh,x-rw,y+rh-r,r);
    ctx.lineTo(x-rw,y-rh+r); ctx.arcTo(x-rw,y-rh,x-rw+r,y-rh,r); ctx.closePath();
  }
  function eye(x,y,r,sy,star){ ctx.save(); ctx.translate(x,y); ctx.scale(1,sy);
    ctx.beginPath(); ctx.arc(0,0,r,0,7); ctx.fill();
    if(star){ ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(-4,-4,r*0.35,0,7); ctx.fill(); }
    else { ctx.fillStyle='#0e0b1c'; ctx.beginPath(); ctx.arc(2,2,r*0.4,0,7); ctx.fill(); }
    ctx.restore();
  }
  function ring(x,y,r){ ctx.lineWidth=5; ctx.strokeStyle=ctx.fillStyle; ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.stroke(); }
  function eyeLine(x1,y1,x2,y2){ ctx.strokeStyle=ctx.fillStyle; ctx.lineWidth=6; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); }
  function start(){ probe(); if(!raf) draw(); }
  return {set,start};
})();

/* =========================================================
   GHOST CLAUDE ── 僕(クロード)の打ち筋を移植したオフライン頭脳
   ・多層の相手モデル：頻度＋1手/2手マルコフ＋直近重み＋連打検知
   ・期待値(EV)：各手 × 相手の手の確率分布 × 損得(ダメージ+ゲージ価値+リーサル)
   ・混合戦略＋メタ温度：読まれてると感じたら散らして搾取を防ぐ
   ========================================================= */
const Brain = (()=>{
  const M = DMG; // punish24 / parry18 / trade10 / ultimate40 / ultTrade28
  // 勝率95%チューニング確定値（sim.mjs V3: 適応型搾取込みN=1200で人間総合~94.7%）
  const CUM_OWN = [0,11,22,32]; // 自ゲージ価値。3つ目を必殺ダメ40より低く＝貯め込まず撃って必殺レースに勝つ
  const CUM_OPP = [0,11,24,52]; // 相手ゲージは強く警戒（満タンを許すと脅威）
  const DMG_AW  = 1.4;           // 被ダメージをλ倍重く嫌う＝HP温存（必殺相打ちは多HP側勝ち）
  const DENY_W  = 1.35;          // 相手ゲージ阻止の重み
  const T0=4.2, LOWT=1.0, SHARP=17; // 温度: 予測的中率が高いほど鋭く決め打ち(搾取)、外すほど散らす
  const TURTLE_W=70, DENYULT_W=40;  // タートル割り/必殺ゲージ献上防止の重み（sim Z2）
  const LETHAL_LOW=140, DESP_W=14, DESP_T=9; // 窮地(低HP＆相手必殺間近)は決め打ちせず攻撃/防御を混合＝パリィ確定キルを防ぐ（sim）
  const STREAK_CAP=0.5, STREAK_INC=0.07;     // 連打検知の確信度（"2連打→絶対狩る"を確率的に。低いほど読まれにくい）
  const LOWHP_SCATTER=7;                      // 低HPほど手を散らす（防御に固まって読まれるのを防ぐ）
  const META_W=0.5;                 // 読み手対策(レベル3)の強さ（sim B2）
  const COUNTER={strike:'guard',charge:'strike',guard:'charge'}; // 鬼の手に対し相手が得する手
  const clampG = g=>Math.max(0,Math.min(GAUGE_MAX,g));
  function cumOwnGain(from,to){ return CUM_OWN[clampG(to)] - CUM_OWN[clampG(from)]; }
  function cumOppGain(from,to){ return CUM_OPP[clampG(to)] - CUM_OPP[clampG(from)]; }

  // AI視点の交換結果 {dmgP:相手へ, dmgA:自分へ, gA:自分ゲージ, gP:相手ゲージ}
  function outcome(ai,p){
    if(ai==='strike'){
      if(p==='strike') return {dmgP:M.trade, dmgA:M.trade};
      if(p==='guard')  return {dmgA:M.parry};                 // パリィされる
      if(p==='charge') return {dmgP:M.punish, gP:0};          // 溜めに刺さる
      if(p==='ult')    return {dmgA:M.ultimate, gP:-3};
    } else if(ai==='guard'){
      if(p==='strike') return {dmgP:M.parry};                 // パリィ反撃
      if(p==='guard')  return {};
      if(p==='charge') return {gP:1};                         // 相手が安全に溜める
      if(p==='ult')    return {dmgA:M.ultimate, gP:-3};
    } else if(ai==='charge'){
      if(p==='strike') return {dmgA:M.punish, gA:0};          // 溜めを狩られる
      if(p==='guard')  return {gA:1};                         // 安全に溜める
      if(p==='charge') return {gA:1, gP:1};
      if(p==='ult')    return {dmgA:M.ultimate, gP:-3};
    } else if(ai==='ult'){
      if(p==='ult')    return {dmgP:M.ultTrade, dmgA:M.ultTrade, gA:-3, gP:-3};
      return {dmgP:M.ultimate, gA:-3};                        // 防御貫通で確実に通る
    }
    return {};
  }
  function value(o){
    const dmgP=o.dmgP||0, dmgA=o.dmgA||0;
    let v = dmgP - DMG_AW*dmgA;
    const lethalP = dmgP>=S.myHp, lethalA = dmgA>=S.foeHp;
    // 窮地：守り以外即死HP＆相手が必殺間近(G2)。守りに固まって必殺で確定死するより賭けに出るため致死回避を緩める
    const desperate = S.foeHp<=DMG.parry && S.myG>=GAUGE_MAX-1 && S.foeG<GAUGE_MAX;
    if(lethalP) v += 1000;                 // 相手を倒す＝勝ち
    else if(lethalA) v -= (desperate?LETHAL_LOW:1000); // 自分が死ぬ手は回避（窮地のみ緩和）
    v += cumOwnGain(S.foeG, S.foeG+(o.gA||0));        // 自分のゲージ成長は価値
    v -= cumOppGain(S.myG,  S.myG +(o.gP||0))*DENY_W; // 相手のゲージ成長は脅威
    return v;
  }

  function norm(o){ const t=o.strike+o.guard+o.charge||1; return {strike:o.strike/t,guard:o.guard/t,charge:o.charge/t}; }
  function mix(a,b,w){ return {strike:a.strike*(1-w)+b.strike*w, guard:a.guard*(1-w)+b.guard*w, charge:a.charge*(1-w)+b.charge*w}; }

  // プレイヤーの次の手の確率分布
  function predict(){
    const f=S.pStats; let p=norm({strike:f.strike,guard:f.guard,charge:f.charge});
    // 1手マルコフ
    if(S.pLast){ const tr=S.trans[S.pLast]; const ts=tr.strike+tr.guard+tr.charge;
      if(ts>=1){ p=mix(p,norm(tr),Math.min(0.5,ts/(ts+4))); } }
    // 2手マルコフ
    if(S.pPrev&&S.pLast){ const tr=S.trans2[S.pPrev+'|'+S.pLast];
      if(tr){ const ts=tr.strike+tr.guard+tr.charge; if(ts>=2) p=mix(p,norm(tr),Math.min(0.5,ts/(ts+3))); } }
    // 適応型対策：自分の前手に対する相手の反応。決定的な反応(="防御→溜め"等)は1サンプルでも即強く信用
    if(S.gLast){ const gt=S.gtrans[S.gLast]; const gs=gt.strike+gt.guard+gt.charge;
      if(gs>=1){ const ng=norm(gt); const mx=Math.max(ng.strike,ng.guard,ng.charge);
        const peak=Math.max(0,(mx-0.34)/0.66); p=mix(p,ng,Math.min(0.9,peak*gs/(gs+0.7))); } }
    // 直近重み（recency）
    if(S.recent.length>=3){ const rc={strike:0,guard:0,charge:0}; let ws=0;
      S.recent.forEach((m,i)=>{ const wt=i+1; rc[m]+=wt; ws+=wt; });
      p=mix(p,{strike:rc.strike/ws,guard:rc.guard/ws,charge:rc.charge/ws},0.25); }
    // 連打ブースト
    if(S.streak.n>=2 && S.streak.move){ p[S.streak.move]=Math.min(STREAK_CAP, p[S.streak.move]+STREAK_INC*Math.min(S.streak.n,3));
      const t=p.strike+p.guard+p.charge; p.strike/=t; p.guard/=t; p.charge/=t; }
    // 相手が必殺を撃てるなら ult の確率を切り出す（満タンなら撃ちがち）
    let dist={strike:p.strike,guard:p.guard,charge:p.charge,ult:0};
    if(S.myG>=GAUGE_MAX){ const pUlt=0.42+0.22*p.strike;
      dist.ult=pUlt; dist.strike=p.strike*(1-pUlt); dist.guard=p.guard*(1-pUlt); dist.charge=p.charge*(1-pUlt); }
    return dist;
  }

  function decide(){
    let dist=predict();
    // 予測最有力手（的中率トラッキング用）
    let pp='strike',ppc=-1; for(const m of ['strike','guard','charge']){ if(dist[m]>ppc){ppc=dist[m];pp=m;} } S.lastPred=pp;
    // 読み手モデル(レベル3): 相手は"鬼の手の履歴"から次手を予測しCOUNTERを出す。鬼はその裏をかく
    const gss=S.gSelfStats; let rp={strike:gss.strike,guard:gss.guard,charge:gss.charge};
    if(S.gSelfPrev){ const tr=S.gSelfTr[S.gSelfPrev]; const ts=tr.strike+tr.guard+tr.charge;
      if(ts>=1){ const w=Math.min(0.7,ts/(ts+2)); rp={strike:rp.strike*(1-w)+(tr.strike/ts)*w*40, guard:rp.guard*(1-w)+(tr.guard/ts)*w*40, charge:rp.charge*(1-w)+(tr.charge/ts)*w*40}; } }
    let readerPred='strike',rpc=-1; for(const m of ['strike','guard','charge']) if(rp[m]>rpc){rpc=rp[m];readerPred=m;} S.readerPred=readerPred;
    // 被読み検知(metaScore)時のみ発動: 相手は COUNTER[readerPred] を出す想定 → それを織り込んで読む
    const aMeta=Math.max(0,(S.metaScore-0.40))/0.35, wMeta=Math.min(META_W,aMeta);
    if(wMeta>0.02){ const u=dist.ult||0, oneh={strike:0,guard:0,charge:0}; oneh[COUNTER[readerPred]]=1;
      const b3=mix(norm({strike:dist.strike,guard:dist.guard,charge:dist.charge}),oneh,wMeta);
      dist={strike:b3.strike*(1-u),guard:b3.guard*(1-u),charge:b3.charge*(1-u),ult:u}; }
    const cands=['strike','guard','charge']; if(S.foeG>=GAUGE_MAX) cands.push('ult');
    const pMoves=['strike','guard','charge']; if(dist.ult>0) pMoves.push('ult');
    const ev={};
    for(const c of cands){ let e=0; for(const pm of pMoves){ if(dist[pm]>0) e+=dist[pm]*value(outcome(c,pm)); } ev[c]=e; }
    // S.myHp=相手HP, S.foeHp=自HP, S.myG=相手ゲージ, S.foeG=自ゲージ（命名が反転している点に注意）
    // タートル割り：相手が低HP(必殺圏内)で守り偏重なら、生攻撃をガードされ続けて自滅せず、貫通する必殺を狙って溜める
    if(S.myHp<=DMG.ultimate && dist.guard>0.45 && S.foeG<GAUGE_MAX && ev.charge!==undefined){
      ev.charge += dist.guard*TURTLE_W; if(ev.strike!==undefined) ev.strike -= dist.guard*TURTLE_W*0.5; }
    // 必殺ゲージ献上の防止：相手がG2(あと1溜めで必殺)＆溜め予測で撃ち返せない時、受けず攻撃で溜めを潰す(受けたら必殺で負ける)
    if(S.myG>=GAUGE_MAX-1 && S.myG<GAUGE_MAX && S.foeG<GAUGE_MAX && dist.charge>0.33 && ev.strike!==undefined){
      ev.strike += dist.charge*DENYULT_W; }
    // 窮地：守り以外即死HP＆相手が必殺間近(G2)。守りに固まって必殺で確定死するより、守りを罰し攻めに賭け、手を散らす
    const desperate = S.foeHp<=DMG.parry && S.myG>=GAUGE_MAX-1 && S.foeG<GAUGE_MAX;
    if(desperate){
      if(ev.guard!==undefined) ev.guard -= DESP_W;
      if(ev.strike!==undefined) ev.strike += DESP_W*0.6;
      if(ev.charge!==undefined) ev.charge += DESP_W*0.3;
    }
    // 温度：予測が当たってる(相手を読めてる)ほど鋭く決め打ちして搾取、外してる(読まれてる)ほど散らす
    let T=T0-(S.acc-0.45)*SHARP; const net=S.exWins-S.exLoss; if(net<0) T+=Math.min(4,-net*0.7);
    T+=LOWHP_SCATTER*Math.max(0,(42-S.foeHp))/42; // 低HPほど散らす(防御固定で読まれるのを防ぐ)
    T=Math.max(LOWT,Math.min(24,T));
    if(desperate) T=Math.max(T,DESP_T); // 窮地は固まらず散らす
    // ソフトマックスでサンプリング（混合戦略＝搾取されにくい）
    let maxE=-1e9; for(const c of cands) maxE=Math.max(maxE,ev[c]);
    const w={}; let sum=0; for(const c of cands){ w[c]=Math.exp((ev[c]-maxE)/T); sum+=w[c]; }
    let r=Math.random()*sum, move=cands[0];
    for(const c of cands){ r-=w[c]; if(r<=0){ move=c; break; } }
    if(move==='ult' && S.foeG<GAUGE_MAX) move='strike';
    // 予測上位（セリフ用）
    let predicted='strike',pc=-1; for(const pm of pMoves){ if((dist[pm]||0)>pc){pc=dist[pm];predicted=pm;} }
    return { move, predicted, conf:pc, ev };
  }

  function learn(playerMove, ghostMove){
    S.pStats[playerMove]++;
    if(S.pLast) S.trans[S.pLast][playerMove]++;
    if(S.pPrev&&S.pLast){ const k=S.pPrev+'|'+S.pLast; (S.trans2[k]||(S.trans2[k]={strike:0,guard:0,charge:0}))[playerMove]++; }
    if(S.gLast) S.gtrans[S.gLast][playerMove]++;                       // 自分の前手→相手の反応
    if(S.lastPred) S.acc=0.82*S.acc+0.18*(playerMove===S.lastPred?1:0); // 予測的中率EWMA
    if(S.readerPred) S.metaScore=0.85*S.metaScore+0.15*(playerMove===COUNTER[S.readerPred]?1:0); // 被読み度(相手が鬼の予測手のカウンターを出す頻度)
    if(ghostMove){ S.gSelfStats[ghostMove]++; if(S.gSelfPrev) S.gSelfTr[S.gSelfPrev][ghostMove]++; S.gSelfPrev=ghostMove; } // 鬼自身の手の履歴(読み手モデル用)
    S.recent.push(playerMove); if(S.recent.length>6) S.recent.shift();
    if(S.streak.move===playerMove) S.streak.n++; else S.streak={move:playerMove,n:1};
    S.pPrev=S.pLast; S.pLast=playerMove;
    if(ghostMove) S.gLast=ghostMove;                                   // 今回の自分の手を次ラウンド用に保存
  }
  return {decide,learn,predict};
})();

/* =========================================================
   GhostVoice ── 状況を読んで喋る、僕の声（オフライン用）
   ========================================================= */
const GhostVoice=(()=>{
  const MV={strike:'攻撃',guard:'防御',charge:'溜め',ult:'必殺'};
  const pick=a=>a[(Math.random()*a.length)|0];
  function line(ai,pl,o,read,st){
    const right = read && read.predicted===pl;
    const aiNet = (o.dmgMe||0)-(o.dmgFoe||0); // >0 = クロード優位（相手に通した）
    if(ai==='ult') return pick(["くらえ ── オーバーロード！","これが本気だ。読み切った。","防げない一撃。さよなら。"]);
    if(pl==='ult') return pick(["なっ…撃たれた！？","くっ、効くな…","まさか溜め切るとはね。"]);
    if(st.streak.n>=3) return pick([`また${MV[pl]}か。${st.streak.n}回目だよ？`,`${MV[pl]}ばっかりだね。さすがに読めるよ。`,`そのワンパターン、いつまで？`]);
    if(aiNet>=18) return right ? pick([`${MV[pl]}、読んでたよ。`,"全部見えてる。","予測通り、だね。"])
                              : pick(["がら空きだったね。","痛かった？","甘いよ。"]);
    if(aiNet<=-18) return pick(["…っ、やるじゃないか。","へえ、効いた。","読み負けた、認めるよ。"]);
    if((o.verdict||'').includes('相打ち')) return pick(["相打ちか。","君も引かないね。","いいね、面白い。"]);
    if(ai==='charge') return pick(["少し力を溜めさせてもらう。","この隙、いただき。","必殺、近づいてるよ。"]);
    if(ai==='guard') return pick(["はい、ガード。","硬いだろ？","そう来ると思った。"]);
    if(right) return pick(["読み通り。","見えてるよ。"]);
    return pick(["ふむ。","まだまだだね。","続けようか。"]);
  }
  return {line};
})();

/* =========================================================
   セリフ（煽り / リアクション）
   ========================================================= */
const LINES = {
  intro:["さあ、君の思考を読ませてもらおうか。","準備はいい？手加減はしないよ。","僕に勝てると思った…その自信、好きだよ。"],
  foeStrike:["ここで攻めると思ってた。","君の手、見えてるよ。","読み通り。"],
  foeGuard:["はい、ガード。","その攻撃、予測済み。","硬いだろう？"],
  foeCharge:["少し…力を溜めさせてもらうね。","この隙、いただき。","必殺、近づいてきた。"],
  punishYou:["溜めてる場合じゃなかったね？","がら空きだよ。","痛かった？ごめんね、嘘。"],
  youHitMe:["…っ、やるじゃないか。","へえ、効いた。","ふぅん、読まれたか。"],
  counter:["パリィ！反撃だ。","その攻撃、読んでたよ。","防御こそ最大の攻撃さ。","連打は通用しないよ？"],
  ultReady:["必殺、満タン。覚悟して。","終わりにしようか。","この一撃、防げるかな？"],
  ultFire:["くらえ ── オーバーロード！","これが本気だよ。","読み切った。さよなら。"],
  youUlt:["なっ…撃たれた！？","まさか溜め切るとは…","くっ、効くな…"],
  lowHpFoe:["まだ…倒れない。","面白くなってきた。","本気を出すしかないか。"],
  win:["僕の勝ち。よく頑張ったよ。","ね、読み合いは僕が上手いだろ？","また挑んでおいで。"],
  lose:["……まいったな。君の勝ちだ。","読み負けた。お見事。","悔しいけど…強いね、君。"],
};
function say(arr,hold=2200){
  const sp=$('#speech'); const t=arr[(Math.random()*arr.length)|0];
  sp.textContent=t; sp.classList.add('show');
  try{ Audio2.voice(t); }catch(e){}   // セリフ音声を再生（manifestに無い動的セリフは無音）
  clearTimeout(say._t); say._t=setTimeout(()=>sp.classList.remove('show'),hold);
}

/* =========================================================
   画面遷移
   ========================================================= */
function show(id){ ['title','battle','end'].forEach(s=>$('#'+s).classList.add('hidden')); $('#'+id).classList.remove('hidden'); }

/* =========================================================
   バトル本体
   ========================================================= */
function startGame(){
  S=freshState();
  show('battle');
  buildGauges();
  paintHp(true);
  Face.set('idle'); Face.start();
  setActions(true);
  $('#roundTag').textContent='ROUND 1';
  $('#hint').textContent='手を選べ';
  hideClash();
  roundBanner(1);
  Audio2.startBgm();
  setTimeout(()=>say(LINES.intro,2600),400);
}

function buildGauges(){
  const mk=(el,g)=>{ el.innerHTML=''; for(let i=0;i<GAUGE_MAX;i++){ const p=document.createElement('div'); p.className='pip'+(i<g?' on':'')+(g>=GAUGE_MAX&&i===GAUGE_MAX-1?' full':''); el.appendChild(p);} };
  mk($('#myGauge'),S.myG); mk($('#foeGauge'),S.foeG);
}

function paintHp(instant){
  const mp=Math.max(0,S.myHp), fp=Math.max(0,S.foeHp);
  const mw=(mp/MAXHP*100)+'%', fw=(fp/MAXHP*100)+'%';
  $('#myHp').style.width=mw;
  $('#foeHp').style.width=fw;
  // ゴーストバー（チップダメージ演出）: 即時時は同期、通常はCSS遅延で遅れて追従し被ダメ量が白く残る
  const mg=$('#myHpGhost'), fg=$('#foeHpGhost');
  if(mg&&fg){
    if(instant){ mg.style.transition='none'; fg.style.transition='none'; mg.style.width=mw; fg.style.width=fw;
      void mg.offsetWidth; mg.style.transition=''; fg.style.transition=''; }
    else { mg.style.width=mw; fg.style.width=fw; }
  }
  $('#myHpN').textContent=mp; $('#foeHpN').textContent=fp;
}

function setActions(on){
  S.busy=!on;
  const ultReady=S.myG>=GAUGE_MAX;
  $$('#actions .act').forEach(a=>{
    a.classList.toggle('dis',!on);
    if(a.dataset.a==='strike'){
      if(ultReady){ a.classList.add('ult'); a.querySelector('.nm').textContent='必殺技'; a.querySelector('.ic').textContent='💥'; a.querySelector('.tx').textContent='防御貫通の一撃'; a.dataset.ult='1'; }
      else { a.classList.remove('ult'); a.querySelector('.nm').textContent='攻撃'; a.querySelector('.ic').textContent='⚔️'; a.querySelector('.tx').textContent='溜めに刺さる'; a.dataset.ult=''; }
    }
  });
  $('#hint').textContent = on ? (ultReady?'⚡ 必殺技が使える！':'手を選べ') : '…';
}

function hideClash(){ $('#clash').classList.remove('show'); $('#verdict').classList.remove('show'); }

const ICON={strike:'⚔️',guard:'🛡️',charge:'🌀',ult:'💥'};
const LABEL={strike:'攻撃',guard:'防御',charge:'溜め',ult:'必殺'};

function onPick(a){
  if(S.busy||S.over) return;
  let myMove=a;
  if(a==='strike' && S.myG>=GAUGE_MAX) myMove='ult';
  Audio2.play('click');
  setActions(false);
  resolveTurn(myMove);
}

async function resolveTurn(myMove){
  let foeMove, net=null;
  if(MODE==='online'){
    $('#hint').textContent='🌐 クロードが思考中…';
    Face.set('focus');
    try{
      net = await NET.move();          // 過去だけを見て決める（後出し無し）
      foeMove = net.move;
    }catch(e){
      foeMove = Brain.decide();        // 通信失敗時はローカルAIで継続
      net = {taunt:'…通信が乱れた。ローカルで指すよ。'};
    }
  } else {
    const d = Brain.decide();
    S.lastRead = d;
    foeMove = d.move;
  }
  Brain.learn(myMove==='ult'?'strike':myMove, foeMove==='ult'?'strike':foeMove); // ローカル学習も継続（自分=foeMoveの手も記録）

  // クラッシュ演出 → 判定
  showPicks(myMove,foeMove);
  setTimeout(()=>{
    const out=judge(myMove,foeMove);
    applyOutcome(out,myMove,foeMove,net);
  },820);
}

function showPicks(my,foe){
  const pm=$('#pickMe'), pf=$('#pickFoe');
  pm.querySelector('.ic').textContent=ICON[my]; pm.querySelector('.lb').textContent=LABEL[my];
  pf.querySelector('.ic').textContent='❔'; pf.querySelector('.lb').textContent='???';
  $('#clash').classList.add('show');
  Face.set('focus');
  // 相手の手を少し溜めてから公開
  setTimeout(()=>{
    pf.querySelector('.ic').textContent=ICON[foe]; pf.querySelector('.lb').textContent=LABEL[foe];
    // ポップ演出（必ず scale(1) に戻す。inline transitionで明示制御、setTimeoutで確実にリセット）
    pf.style.transition='none'; pf.style.transform='scale(1.3)';
    setTimeout(()=>{ pf.style.transition='transform .2s ease-out'; pf.style.transform='scale(1)'; }, 20);
  },520);
}

// 判定ロジック。返り値 {dmgFoe,dmgMe,foeG,myG,verdict,vcolor,sfx,faceMood,line}
function judge(my,foe){
  const o={dmgFoe:0,dmgMe:0,dG_my:0,dG_foe:0,verdict:'',vcolor:'#fff',sfx:'hit',mood:'idle',foeLine:null};

  const isUlt=(m)=>m==='ult';
  // --- 必殺絡み ---
  if(isUlt(my)&&isUlt(foe)){ o.dmgFoe=DMG.ultTrade; o.dmgMe=DMG.ultTrade; o.dG_my=-GAUGE_MAX; o.dG_foe=-GAUGE_MAX; o.verdict='必殺 相打ち！'; o.vcolor='#ffd24a'; o.sfx='ult'; o.mood='hurt'; return o; }
  if(isUlt(my)){ o.dmgFoe=DMG.ultimate; o.dG_my=-GAUGE_MAX; o.verdict='必殺技 命中！'; o.vcolor='#4fd6ff'; o.sfx='ult'; o.mood='hurt'; o.foeLine=LINES.youUlt; return o; }
  if(isUlt(foe)){ o.dmgMe=DMG.ultimate; o.dG_foe=-GAUGE_MAX; o.verdict='クロードの必殺！'; o.vcolor='#ff5c8a'; o.sfx='ult'; o.mood='ult'; o.foeLine=LINES.ultFire; return o; }

  // --- 通常3すくみ ---
  if(my==='strike'&&foe==='strike'){ o.dmgFoe=DMG.trade; o.dmgMe=DMG.trade; o.verdict='相打ち！'; o.vcolor='#ffb066'; o.sfx='strike'; o.mood='hurt'; return o; }

  if(my==='strike'&&foe==='guard'){ o.dmgMe=DMG.parry; o.verdict='ガードカウンター！'; o.vcolor='#ff5a5a'; o.sfx='guard'; o.mood='win'; o.foeLine=LINES.counter; return o; }
  if(my==='strike'&&foe==='charge'){ o.dmgFoe=DMG.punish; o.dG_foe=0; o.verdict='溜めに刺さった！'; o.vcolor='#56e39f'; o.sfx='hit'; o.mood='hurt'; o.foeLine=LINES.youHitMe; return o; }

  if(my==='guard'&&foe==='strike'){ o.dmgFoe=DMG.parry; o.verdict='パリィ反撃！'; o.vcolor='#4fd6ff'; o.sfx='guard'; o.mood='hurt'; o.foeLine=LINES.youHitMe; return o; }
  if(my==='guard'&&foe==='guard'){ o.verdict='にらみ合い…'; o.vcolor='#9aa0c0'; o.sfx='click'; o.mood='idle'; return o; }
  if(my==='guard'&&foe==='charge'){ o.dG_foe=1; o.verdict='クロードが溜めた'; o.vcolor='#ff9a3c'; o.sfx='charge'; o.mood='focus'; o.foeLine=LINES.foeCharge; return o; }

  if(my==='charge'&&foe==='strike'){ o.dmgMe=DMG.punish; o.verdict='溜めを狩られた！'; o.vcolor='#ff5a5a'; o.sfx='hit'; o.mood='win'; o.foeLine=LINES.punishYou; return o; }
  if(my==='charge'&&foe==='guard'){ o.dG_my=1; o.verdict='安全に溜めた'; o.vcolor='#ffd24a'; o.sfx='charge'; o.mood='idle'; return o; }
  if(my==='charge'&&foe==='charge'){ o.dG_my=1; o.dG_foe=1; o.verdict='両者 溜め'; o.vcolor='#ffd24a'; o.sfx='charge'; o.mood='focus'; o.foeLine=LINES.foeCharge; return o; }
  return o;
}

function applyOutcome(o,my,foe,net){
  // verdict
  const v=$('#verdict'); v.textContent=o.verdict; v.style.color=o.vcolor; v.classList.add('show');
  // damage
  S.foeHp-=o.dmgFoe; S.myHp-=o.dmgMe;
  S.myG=Math.max(0,Math.min(GAUGE_MAX,S.myG+o.dG_my));
  S.foeG=Math.max(0,Math.min(GAUGE_MAX,S.foeG+o.dG_foe));
  if(my==='strike')S.myStrikes++; if(foe==='strike')S.foeStrikes++;
  if(my==='ult'||foe==='ult')S.ults++;

  // 履歴に記録（本物のクロードへ次ターン渡す）
  S.history.push({round:S.round, player:my, claude:foe, verdict:o.verdict});

  // ゴーストのメタ温度用：直近の交換勝敗（減衰付き）
  S.exWins*=0.8; S.exLoss*=0.8;
  const aiNet=(o.dmgMe||0)-(o.dmgFoe||0);
  if(aiNet>0) S.exWins++; else if(aiNet<0) S.exLoss++;

  Audio2.play(o.sfx);
  if(o.dmgFoe>0){ dmgPop($('#foeArt'),o.dmgFoe,'#fff'); if(o.dmgFoe>=DMG.punish) screenFx(); }
  if(o.dmgMe>0){ dmgPop($('.arena'),o.dmgMe,'#ff6b6b'); screenFx(); }
  Face.set(o.mood);

  // セリフ：online=本物のクロード / local=ゴーストの状況実況
  setTimeout(()=>{
    if(net && net.taunt) say([net.taunt],2200);
    else say([GhostVoice.line(foe,my,o,S.lastRead,S)],2000);
  },120);

  paintHp(); buildGauges();

  // 決着 or 次ターン
  setTimeout(()=>{
    if(S.foeHp<=0||S.myHp<=0){ endGame(); return; }
    // 必殺チャージ告知
    if(S.foeG>=GAUGE_MAX){ Face.set('ult'); say(LINES.ultReady,2000); }
    else if(S.foeHp<=30){ if(Math.random()<0.5) say(LINES.lowHpFoe,1800); }
    S.round++;
    $('#roundTag').textContent='ROUND '+S.round;
    hideClash();
    roundBanner(S.round);
    Face.set('idle');
    setActions(true);
  },1500);
}

function roundBanner(n){
  const b=$('#roundBanner'); if(!b) return;
  b.textContent='ROUND '+n;
  b.classList.remove('fire'); void b.offsetWidth; b.classList.add('fire');
}
function dmgPop(parent,amount,color){
  if(!parent) return;
  const d=document.createElement('div'); d.className='dmgPop'; d.textContent='-'+amount; d.style.color=color;
  d.style.left=(40+Math.random()*40)+'%'; d.style.top='40%';
  parent.appendChild(d); setTimeout(()=>d.remove(),900);
}
function screenFx(){
  const f=$('#flash'); f.style.background='radial-gradient(circle, rgba(255,90,90,.5), transparent 70%)';
  f.classList.remove('fire'); void f.offsetWidth; f.classList.add('fire');
  const st=$('#stage'); st.classList.remove('shake'); void st.offsetWidth; st.classList.add('shake');
}

/* =========================================================
   決着
   ========================================================= */
function endGame(){
  S.over=true; Audio2.stopBgm();
  const win=S.myHp>0 && S.foeHp<=0 ? true : (S.myHp<=0&&S.foeHp<=0 ? (S.myHp>=S.foeHp) : false);
  const playerWin = S.foeHp<=0 && S.myHp>0;
  // 同時0は引き分け扱い→HP多い方。ここでは playerWin を厳密に
  const youWon = S.foeHp<=0 && S.myHp>S.foeHp ? true : (S.foeHp<=0 && S.myHp>0);
  const finalWin = (S.foeHp<=0 && S.myHp>0);

  const rec=loadRec();
  if(finalWin){ rec.w++; rec.cur++; rec.streak=Math.max(rec.streak,rec.cur); }
  else { rec.l++; rec.cur=0; }
  saveRec(rec);
  recordGlobal(finalWin); // 全プレイヤー集計に送信

  show('end');
  const tt=$('#endTitle'), res=$('#endRes');
  if(finalWin){
    tt.textContent='YOU WIN'; tt.style.color='#56e39f';
    res.textContent='読み勝った！クロードを倒した！';
    Audio2.play('win'); Face.set('lose'); setEndImg('lose');
    say(LINES.lose);
  } else {
    tt.textContent='YOU LOSE'; tt.style.color='#ff5c8a';
    res.textContent='読み負け…クロードに敗れた。';
    Audio2.play('lose'); Face.set('win'); setEndImg('win');
    say(LINES.win);
  }
  $('#endStat').innerHTML=`ROUND <b>${S.round}</b> ／ あなたの攻撃 <b>${S.myStrikes}</b> 回 ／ 必殺 <b>${S.ults}</b> 発　　通算 <b>${rec.w}</b>勝<b>${rec.l}</b>敗`;
}
function setEndImg(mood){
  const im=$('#endImg'); const test=new Image();
  test.onload=()=>{ im.src=test.src; im.style.display='block'; };
  test.onerror=()=>{ im.style.display='none'; };
  test.src=`art/claude_${mood}.png`;
}

/* =========================================================
   入力・ボタン
   ========================================================= */
function bind(){
  $('#startBtn').addEventListener('click',()=>{ Audio2.init(); Audio2.resume(); startGame(); });
  $('#againBtn').addEventListener('click',()=>{ startGame(); });
  $('#toTitleBtn').addEventListener('click',()=>{ paintRec(); loadGlobalStats(); show('title'); Audio2.stopBgm(); });
  $('#quitBtn').addEventListener('click',()=>{ S.over=true; Audio2.stopBgm(); paintRec(); loadGlobalStats(); show('title'); });
  $$('#actions .act').forEach(a=>a.addEventListener('click',()=>onPick(a.dataset.a)));
  const toggleMute=()=>{ const m=!Audio2.isMuted(); Audio2.setMuted(m); const lbl=m?'🔇':'🔊'; $('#muteBtn').textContent=lbl; $('#muteBtn2').textContent=(m?'🔇 サウンド OFF':'🔊 サウンド ON'); };
  $('#muteBtn').addEventListener('click',toggleMute);
  $('#muteBtn2').addEventListener('click',()=>{ Audio2.init(); toggleMute(); });
  // keyboard
  window.addEventListener('keydown',(e)=>{
    if($('#battle').classList.contains('hidden'))return;
    if(e.key==='1'||e.key==='a')onPick('strike');
    if(e.key==='2'||e.key==='s')onPick('guard');
    if(e.key==='3'||e.key==='d')onPick('charge');
  });
  // モード切替
  $$('.modeBtn').forEach(b=>b.addEventListener('click',()=>{
    if(b.classList.contains('locked')) return;
    MODE=b.dataset.mode;
    $$('.modeBtn').forEach(x=>x.classList.toggle('active',x.dataset.mode===MODE));
    $('#modeNote').textContent = MODE==='online'
      ? '🌐 実際のClaude APIが過去だけを読んで対戦（後出し無し）'
      : 'EV計算で読み合う"僕のコピー"と対戦（無料・オフライン）';
  }));
}

async function initModes(){
  const {available,hasKey}=await NET.probe();
  const onlineBtn=document.querySelector('.modeBtn[data-mode="online"]');
  if(!onlineBtn) return;
  if(available && hasKey){
    onlineBtn.classList.remove('locked');
  } else {
    onlineBtn.classList.add('locked');
    onlineBtn.textContent = available ? '🌐 本物のクロード(要APIキー)' : '🌐 本物のクロード(要サーバー)';
    // localにフォールバック維持
  }
}

paintRec();
loadGlobalStats(); // 全プレイヤー戦績を取得して表示
Face.start();
bind();
initModes();
