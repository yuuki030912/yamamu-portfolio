#!/usr/bin/env node
/**
 * ぽこポケ ポケモン攻略ページ生成スクリプト
 * 使い方: node pocoapokemon/generate-pokemon.js
 * 出力: pocoapokemon/pokemon-*.html, area-*.html, pokedex.html, pokedex.js
 */
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'pokemon-data.json');
const OUT_DIR = __dirname;
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// ===== 定数 =====
const CSP = `default-src 'self'; script-src 'self' https://pagead2.googlesyndication.com https://adservice.google.com https://www.googletagservices.com https://tpc.googlesyndication.com; style-src 'self' 'unsafe-inline'; img-src 'self' https://img.youtube.com https://pagead2.googlesyndication.com https://www.google.com https://googleads.g.doubleclick.net data:; frame-src https://www.youtube.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://pagead2.googlesyndication.com https://adservice.google.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'`;

const GUIDE_STYLE = `
    .guide-article { max-width: 800px; margin: 0 auto; padding: 32px 24px; }
    .guide-article h1 { font-size: 26px; font-weight: 700; color: var(--text-primary); line-height: 1.4; margin-bottom: 16px; }
    .guide-meta { font-size: 13px; color: var(--text-secondary); margin-bottom: 24px; display: flex; gap: 12px; flex-wrap: wrap; }
    .guide-toc { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px 24px; margin-bottom: 32px; }
    .guide-toc h2 { font-size: 16px; font-weight: 700; margin-bottom: 10px; color: var(--text-primary); }
    .guide-toc ol { padding-left: 20px; }
    .guide-toc li { margin-bottom: 4px; }
    .guide-toc a { color: var(--text-primary); text-decoration: none; font-size: 14px; }
    .guide-toc a:hover { color: var(--accent); text-decoration: underline; }
    .guide-body h2 { font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 36px 0 12px; padding-bottom: 8px; border-bottom: 2px solid var(--accent); }
    .guide-body h3 { font-size: 17px; font-weight: 700; color: var(--text-primary); margin: 24px 0 8px; padding-left: 10px; border-left: 3px solid var(--accent); }
    .guide-body p { font-size: 15px; color: var(--text-primary); line-height: 1.9; margin-bottom: 16px; }
    .guide-body ul, .guide-body ol { padding-left: 24px; margin-bottom: 16px; }
    .guide-body li { font-size: 15px; color: var(--text-primary); line-height: 1.8; margin-bottom: 4px; }
    .guide-body strong { color: var(--accent); }
    .info-box { background: var(--chip-bg); border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 14px; line-height: 1.8; }
    .info-box.warning { border-left: 4px solid #e74c3c; }
    .info-box.tip { border-left: 4px solid var(--accent); }
    .result-box { background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1)); border: 2px solid var(--accent); border-radius: 12px; padding: 20px 24px; margin: 20px 0; }
    .result-box h3 { font-size: 16px; font-weight: 700; color: var(--accent); margin-bottom: 8px; border: none; padding: 0; }
    .result-box p { font-size: 15px; margin-bottom: 0; }
    .compare-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
    .compare-table th { background: var(--accent); color: #fff; padding: 10px 12px; text-align: left; font-weight: 600; }
    .compare-table td { padding: 10px 12px; border-bottom: 1px solid var(--border-color); }
    .compare-table tr:nth-child(even) td { background: var(--chip-bg); }
    .related-guides { margin-top: 40px; }
    .related-guides h2 { font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; border: none; padding: 0; }
    .related-guides-list { display: flex; flex-direction: column; gap: 8px; }
    .related-guides-list a { display: block; padding: 12px 16px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); text-decoration: none; font-size: 14px; transition: background 0.2s; }
    .related-guides-list a:hover { background: var(--chip-bg); }
    @media (max-width: 768px) { .guide-article { padding: 20px 16px; } .guide-article h1 { font-size: 20px; } .compare-table { font-size: 12px; } .compare-table th, .compare-table td { padding: 8px 6px; } }`;

// ===== ヘルパー関数 =====
const habitatMap = {};
data.habitats.forEach(h => { habitatMap[h.id] = h; });
const skillMap = {};
data.skills.forEach(s => { skillMap[s.id] = s; });
const areaMap = {};
data.areas.forEach(a => { areaMap[a.id] = a; });

// 画像ファイルの存在チェック (slugベース)
const IMG_DIR = path.join(__dirname, 'img', 'pokemon');
function hasImage(slug) {
  return fs.existsSync(path.join(IMG_DIR, `${slug}.png`));
}
function imgTag(slug, name, size) {
  size = size || 96;
  if (!hasImage(slug)) return '';
  return `<img src="img/pokemon/${slug}.png" alt="${escHtml(name)}" width="${size}" height="${size}" loading="lazy" style="image-rendering:pixelated;">`;
}

// エリアIDを生息地IDから取得
function getAreaForHabitat(habitatId) {
  const h = habitatMap[habitatId];
  return h ? areaMap[h.areaId] : null;
}

function timeLabel(t) {
  if (!t || t === 'all') return 'いつでも';
  const map = { morning: '朝', day: '昼', evening: '夕方', night: '夜' };
  return t.split(',').map(x => map[x.trim()] || x).join('・');
}

function weatherLabel(w) {
  if (!w || w === 'all') return 'すべて';
  const map = { sunny: '晴れ', cloudy: '曇り', rain: '雨', snow: '雪' };
  return w.split(',').map(x => map[x.trim()] || x).join('・');
}

function levelLabel(l) {
  if (l === 1) return '★';
  if (l === 2) return '★★';
  if (l === 3) return '★★★';
  return String(l);
}

function dexStr(n) { return String(n).padStart(3, '0'); }

function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function displayName(p) {
  return p.variant ? `${p.name}（${p.variant}）` : p.name;
}

function getSkillNames(p) {
  return p.skillIds.map(id => skillMap[id] ? skillMap[id].name : '').filter(Boolean);
}

function getSkillDescs(p) {
  return p.skillIds.map(id => skillMap[id]).filter(Boolean);
}

// 同じ図鑑番号のバリアントを検索
function getVariants(pokemon) {
  return data.pokemon.filter(p => p.dexNumber === pokemon.dexNumber && p.slug !== pokemon.slug);
}

// エリアに属するポケモンを検索
function getPokemonInArea(areaId) {
  const areaHabitatIds = data.habitats.filter(h => h.areaId === areaId).map(h => h.id);
  const result = [];
  const seen = new Set();
  data.pokemon.forEach(p => {
    if (seen.has(p.slug)) return;
    const inArea = p.habitats.some(h => areaHabitatIds.includes(h.habitatId));
    if (inArea) {
      seen.add(p.slug);
      result.push(p);
    }
  });
  return result.sort((a, b) => a.dexNumber - b.dexNumber || (a.variant || '').localeCompare(b.variant || ''));
}

// 同じタイプのポケモンを検索
function getPokemonByType(type, excludeSlug, limit) {
  const seen = new Set();
  const res = [];
  data.pokemon.forEach(p => {
    if (p.slug === excludeSlug || seen.has(p.slug)) return;
    if (p.types.includes(type)) { seen.add(p.slug); res.push(p); }
  });
  res.sort((a, b) => a.dexNumber - b.dexNumber);
  return limit ? res.slice(0, limit) : res;
}

// 同じ得意なこと(skill)を持つポケモンを検索
function getPokemonBySkill(skillId, excludeSlug, limit) {
  const seen = new Set();
  const res = [];
  data.pokemon.forEach(p => {
    if (p.slug === excludeSlug || seen.has(p.slug)) return;
    if (p.skillIds.includes(skillId)) { seen.add(p.slug); res.push(p); }
  });
  res.sort((a, b) => a.dexNumber - b.dexNumber);
  return limit ? res.slice(0, limit) : res;
}

// ポケモンへのリンクリストHTML
function pokemonLinkList(list) {
  return `<div class="related-guides-list">
        ${list.map(v => `<a href="pokemon-${v.slug}.html">No.${dexStr(v.dexNumber)} ${escHtml(displayName(v))}（${escHtml(v.types.join('/'))}）</a>`).join('\n        ')}
      </div>`;
}

// 生息地の解説文（エリアごとに具体的な出現条件と入手のコツを文章化）
function habitatNarrative(p) {
  const byArea = [];
  p.habitats.forEach(h => {
    const hab = habitatMap[h.habitatId];
    if (!hab) return;
    const area = areaMap[hab.areaId];
    if (!area) return;
    let entry = byArea.find(e => e.area.id === area.id);
    if (!entry) { entry = { area, spots: [] }; byArea.push(entry); }
    entry.spots.push({ hab, h });
  });
  if (!byArea.length) return '';
  const paras = byArea.map(({ area, spots }) => {
    const spotDescs = spots.map(({ hab, h }) => {
      const conds = [];
      if (h.time && h.time !== 'all') conds.push(`${timeLabel(h.time)}の時間帯`);
      if (h.weather && h.weather !== 'all') conds.push(`天候「${weatherLabel(h.weather)}」`);
      const condStr = conds.length ? `${conds.join('・')}限定で` : 'いつでも';
      return `「${escHtml(hab.name)}」（レア度${levelLabel(h.level)}）に${condStr}出現`;
    });
    const maxLevel = Math.max(...spots.map(s => s.h.level));
    let tip;
    if (maxLevel >= 3) tip = `レア度が高めなので、${escHtml(area.name)}の生息地づくりをしっかり進めてから探すのがおすすめです。`;
    else if (maxLevel >= 2) tip = `${escHtml(area.name)}をある程度発展させると出会いやすくなります。`;
    else tip = `序盤から出会えるので、${escHtml(area.name)}を訪れたら探してみましょう。`;
    return `<p><strong>${escHtml(area.name)}</strong>では${spotDescs.join('、')}します。${tip}</p>`;
  });
  return paras.join('\n      ');
}

// ポケモン個別ページのFAQを生成
function buildPokemonFaq(p, ctx) {
  const dn = displayName(p);
  const isPlayer = p.dexNumber === 47;
  const faq = [];
  let a1;
  if (p.isLegendary) {
    a1 = `${dn}は伝説のポケモンで、通常の生息地には出現しません。ゆめしま地下で出会うことができます。`;
  } else if (isPlayer) {
    a1 = `${dn}はプレイヤーの分身で、ゲーム開始時から仲間になっています。捕まえる必要はありません。`;
  } else if (p.isEventOnly) {
    a1 = `${dn}はイベント限定ポケモンで、イベント期間中に専用の生息地で出現します。`;
  } else {
    const spots = p.habitats.map(h => {
      const hb = habitatMap[h.habitatId];
      const ar = hb ? areaMap[hb.areaId] : null;
      return hb && ar ? `${ar.name}の「${hb.name}」` : null;
    }).filter(Boolean);
    a1 = `${dn}は${ctx.areaNames || 'フィールド'}で出会えます。${spots.length ? `具体的には${spots.slice(0, 3).join('、')}などに出現します。` : ''}`;
  }
  faq.push({ q: `${dn}はどこで捕まえられる？`, a: a1 });
  faq.push({ q: `${dn}のタイプは？`, a: `${dn}は${ctx.types}タイプのポケモンです。` });
  if (ctx.skillDescs.length) {
    faq.push({
      q: `${dn}の得意なことは？`,
      a: `${dn}の得意なことは「${ctx.skills.join('」「')}」です。${ctx.skillDescs.map(s => `${s.name}は${s.description}`).join(' ')}`
    });
  }
  return faq;
}

// ===== HTML生成共通パーツ =====
function headHtml(title, description, canonical, breadcrumbs, extraStyle, faqList) {
  const bcJson = breadcrumbs.map((b, i) => {
    const item = { "@type": "ListItem", "position": i + 1, "name": b.name };
    if (b.url) item.item = b.url;
    return item;
  });

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="${CSP}">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta name="referrer" content="strict-origin-when-cross-origin">

  <title>${escHtml(title)} | やまむー</title>
  <meta name="description" content="${escHtml(description)}">
  <link rel="canonical" href="${canonical}">

  <meta property="og:type" content="article">
  <meta property="og:title" content="${escHtml(title)}">
  <meta property="og:description" content="${escHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="やまむー【yamamu】">
  <meta property="og:image" content="https://yamamu-youtube.jp/icon.png">

  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escHtml(title)}">
  <meta name="twitter:description" content="${escHtml(description)}">
  <meta name="twitter:image" content="https://yamamu-youtube.jp/icon.png">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${escHtml(title)}",
    "description": "${escHtml(description)}",
    "author": { "@type": "Person", "name": "やまむー" },
    "publisher": { "@type": "Organization", "name": "やまむー【yamamu】", "url": "https://yamamu-youtube.jp" },
    "datePublished": "${data.meta.lastUpdated}",
    "dateModified": "${data.meta.lastUpdated}",
    "mainEntityOfPage": "${canonical}"
  }
  </script>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": ${JSON.stringify(bcJson)}
  }
  </script>
${faqList && faqList.length ? `
  <script type="application/ld+json">
  ${JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faqList.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })) })}
  </script>
` : ''}
  <link rel="stylesheet" href="../style.css">
  <link rel="stylesheet" href="../video.css">
  <style>${GUIDE_STYLE}${extraStyle || ''}</style>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1697281908647985" crossorigin="anonymous"></script>
</head>`;
}

function bodyStart(breadcrumbText) {
  return `
<body>
  <header class="header">
    <a href="index.html" class="header-left" style="text-decoration:none">
      <img src="../icon.png" alt="やまむー" class="header-icon" width="32" height="32">
      <span class="logo-text">ぽこポケ攻略Wiki</span>
    </a>
    <div class="header-right">
      <button class="theme-toggle" id="themeToggle" title="テーマ切替" aria-label="ダークモード切替">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="#606060" d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>
      </button>
    </div>
  </header>

  <nav class="game-nav" aria-label="ゲーム選択">
    <a href="../index.html" class="game-nav-link">トップ</a>
    <a href="../inazuma/" class="game-nav-link">イナイレV</a>
    <a href="../pokepoke/" class="game-nav-link">ポケポケ</a>
    <a href="../pocoapokemon/" class="game-nav-link active">ぽこポケ</a>
  </nav>

  <nav class="breadcrumb" aria-label="パンくずリスト">
    <a href="../index.html">ホーム</a><span>›</span>
    <a href="index.html">ぽこポケ攻略</a><span>›</span>
    ${breadcrumbText}
  </nav>`;
}

function footerHtml(extraScripts) {
  return `
  <footer class="footer">
    <nav aria-label="フッターナビゲーション" style="margin-bottom:8px;">
      <a href="index.html" style="color:var(--text-secondary); margin:0 8px; text-decoration:none; font-size:13px;">ぽこポケ攻略トップ</a>
      <a href="pokedex.html" style="color:var(--text-secondary); margin:0 8px; text-decoration:none; font-size:13px;">ポケモン図鑑</a>
      <a href="../index.html" style="color:var(--text-secondary); margin:0 8px; text-decoration:none; font-size:13px;">ポータル</a>
      <a href="../about.html" style="color:var(--text-secondary); margin:0 8px; text-decoration:none; font-size:13px;">運営者情報</a>
      <a href="../privacy.html" style="color:var(--text-secondary); margin:0 8px; text-decoration:none; font-size:13px;">プライバシーポリシー</a>
      <a href="../contact.html" style="color:var(--text-secondary); margin:0 8px; text-decoration:none; font-size:13px;">お問い合わせ</a>
      <a href="https://www.youtube.com/@yamamu" rel="noopener noreferrer" target="_blank" style="color:var(--text-secondary); margin:0 8px; text-decoration:none; font-size:13px;">YouTube</a>
      <a href="https://twitter.com/YamamuGaming" rel="noopener noreferrer" target="_blank" style="color:var(--text-secondary); margin:0 8px; text-decoration:none; font-size:13px;">X (Twitter)</a>
    </nav>
    <p>&copy; 2026 やまむー【yamamu】. All rights reserved.</p>
  </footer>

  <script src="../theme.js"></script>${extraScripts || ''}
</body>
</html>`;
}

// ===== ポケモン個別ページ生成 =====
function generatePokemonPage(p) {
  const dn = displayName(p);
  const types = p.types.join(' / ');
  const skills = getSkillNames(p);
  const skillDescs = getSkillDescs(p);
  const variants = getVariants(p);
  const isPlayer = p.dexNumber === 47; // メタモン

  // 生息地からエリア情報を取得
  const areas = [];
  p.habitats.forEach(h => {
    const area = getAreaForHabitat(h.habitatId);
    if (area && !areas.find(a => a.id === area.id)) areas.push(area);
  });

  const areaNames = areas.map(a => a.name).join('・');
  const title = `【ぽこポケ】${dn}の生息地・入手方法`;

  let summaryText;
  if (p.isLegendary) {
    summaryText = `${dn}は伝説のポケモン。ゆめしま地下で出会うことができる。${skills.length ? `得意なことは「${skills.join('」「')}」。` : ''}`;
  } else if (isPlayer) {
    summaryText = `${dn}はプレイヤーの分身。人間に変身して街づくりやポケモンとの交流を楽しもう。得意なことは「へんしん」。`;
  } else if (p.isEventOnly) {
    summaryText = `${dn}はイベント限定ポケモン。${skills.length ? `得意なことは「${skills.join('」「')}」。` : ''}`;
  } else {
    summaryText = `${dn}は${areaNames || 'フィールド'}で出会える${types}タイプのポケモン。${skills.length ? `得意なことは「${skills.join('」「')}」。` : ''}`;
  }

  const description = `ぽこ あ ポケモン（ぽこポケ）の${dn}の生息地・出現条件・得意なことを解説。${areaNames ? areaNames + 'エリアで出現。' : ''}`;
  const canonical = `https://yamamu-youtube.jp/pocoapokemon/pokemon-${p.slug}.html`;
  const breadcrumbs = [
    { name: "ホーム", url: "https://yamamu-youtube.jp/" },
    { name: "ぽこポケ攻略", url: "https://yamamu-youtube.jp/pocoapokemon/" },
    { name: "ポケモン図鑑", url: "https://yamamu-youtube.jp/pocoapokemon/pokedex.html" },
    { name: dn }
  ];

  // 生息地テーブル
  let habitatSection = '';
  if (p.isLegendary) {
    habitatSection = `
      <div class="info-box tip">
        <p style="margin-bottom:4px;"><strong>伝説のポケモン</strong></p>
        <p style="margin-bottom:0;">生息地での入手はできません。ゆめしま地下で出会うことができます。詳しくは<a href="guide-legendary.html" style="color:var(--accent);">伝説ポケモン入手方法ガイド</a>を参照してください。</p>
      </div>`;
  } else if (isPlayer) {
    habitatSection = `
      <div class="info-box tip">
        <p style="margin-bottom:4px;"><strong>プレイヤーキャラクター</strong></p>
        <p style="margin-bottom:0;">メタモンはプレイヤーの分身です。ゲーム開始時から仲間になっており、人間やポケモンに変身してさまざまなわざを使えます。</p>
      </div>`;
  } else if (p.isEventOnly) {
    habitatSection = `
      <div class="info-box warning">
        <p style="margin-bottom:4px;"><strong>イベント限定ポケモン</strong></p>
        <p style="margin-bottom:0;">現在はイベント期間中のみ入手可能です。イベント生息地で出現します。</p>
      </div>`;
    if (p.habitats.length > 0) {
      habitatSection += habitatTable(p) + '\n      ' + habitatNarrative(p);
    }
  } else if (p.habitats.length > 0) {
    habitatSection = habitatTable(p) + '\n      ' + habitatNarrative(p);
  }

  // スキルセクション
  let skillSection = '';
  if (skillDescs.length > 0) {
    skillSection = skillDescs.map(s =>
      `<div class="info-box tip" style="margin-bottom:12px;">
        <p style="margin-bottom:4px;"><strong>${escHtml(s.name)}</strong></p>
        <p style="margin-bottom:0;">${escHtml(s.description)}</p>
      </div>`
    ).join('\n');
  } else {
    skillSection = '<p>特別な得意なことはありません。</p>';
  }

  // バリアントセクション
  let variantSection = '';
  if (variants.length > 0) {
    variantSection = `
    <h2 id="variant">このポケモンの別フォーム</h2>
    <div class="related-guides-list">
      ${variants.map(v => `<a href="pokemon-${v.slug}.html">No.${dexStr(v.dexNumber)} ${displayName(v)}</a>`).join('\n      ')}
    </div>`;
  }

  // 同じタイプ・同じ得意なことのポケモン
  const typeSections = p.types.map(t => {
    const list = getPokemonByType(t, p.slug, 12);
    if (!list.length) return '';
    return `<h3>${escHtml(t)}タイプのポケモン</h3>\n      ${pokemonLinkList(list)}`;
  }).filter(Boolean).join('\n      ');
  const skillLinkSections = p.skillIds.map(id => {
    const sk = skillMap[id];
    if (!sk) return '';
    const list = getPokemonBySkill(id, p.slug, 12);
    if (!list.length) return '';
    return `<h3>「${escHtml(sk.name)}」が得意なポケモン</h3>\n      ${pokemonLinkList(list)}`;
  }).filter(Boolean).join('\n      ');
  const faqList = buildPokemonFaq(p, { types, skills, skillDescs, areaNames });
  const introPara = `${escHtml(dn)}はぽこ あ ポケモンに登場するNo.${dexStr(p.dexNumber)}の${escHtml(types)}タイプのポケモンです。${areaNames ? `主に${escHtml(areaNames)}に生息し、` : ''}${skills.length ? `「${escHtml(skills.join('」「'))}」が得意です。` : ''}このページでは${escHtml(dn)}の生息地・出現条件・得意なこと、同じタイプや得意なことを持つポケモンをまとめています。`;

  // 目次
  const tocItems = [
    '<li><a href="#basic">基本情報</a></li>',
    '<li><a href="#habitat">生息地・入手方法</a></li>',
    '<li><a href="#skills">得意なこと</a></li>',
  ];
  if (typeSections) tocItems.push('<li><a href="#same-type">同じタイプのポケモン</a></li>');
  if (skillLinkSections) tocItems.push('<li><a href="#same-skill">同じ得意なことのポケモン</a></li>');
  if (variants.length > 0) tocItems.push('<li><a href="#variant">別フォーム</a></li>');
  tocItems.push('<li><a href="#faq">よくある質問</a></li>');

  // 関連ページ
  const relatedLinks = [];
  areas.forEach(a => {
    relatedLinks.push(`<a href="area-${a.id}.html">${a.name}のポケモン一覧</a>`);
  });
  relatedLinks.push('<a href="pokedex.html">ポケモン図鑑（全一覧）</a>');
  relatedLinks.push('<a href="guide-habitat.html">生息地づくりガイド</a>');
  relatedLinks.push('<a href="index.html">ぽこポケ攻略トップへ戻る</a>');

  const html = headHtml(title, description, canonical, breadcrumbs, '', faqList) +
    bodyStart(`<a href="pokedex.html">ポケモン図鑑</a><span>›</span>\n    ${escHtml(dn)}`) + `

  <article class="guide-article">
    <h1>${escHtml(title)}</h1>
    <div class="guide-meta">
      <span>やまむー</span>
      <span>2026年3月更新</span>
    </div>

    <div class="result-box" style="display:flex; align-items:center; gap:16px;">
      ${imgTag(p.slug, dn, 80) ? `<div style="flex-shrink:0;">${imgTag(p.slug, dn, 80)}</div>` : ''}
      <div>
        <h3>No.${dexStr(p.dexNumber)} ${escHtml(dn)}（${escHtml(types)}）</h3>
        <p>${escHtml(summaryText)}</p>
      </div>
    </div>

    <nav class="guide-toc">
      <h2>目次</h2>
      <ol>
        ${tocItems.join('\n        ')}
      </ol>
    </nav>

    <div class="guide-body">
      <h2 id="basic">基本情報</h2>
      <table class="compare-table">
        <tr><th>図鑑No.</th><td>${dexStr(p.dexNumber)}</td></tr>
        <tr><th>名前</th><td>${escHtml(dn)}</td></tr>
        <tr><th>タイプ</th><td>${escHtml(types)}</td></tr>
        <tr><th>得意なこと</th><td>${skills.length ? escHtml(skills.join('、')) : 'なし'}</td></tr>
      </table>
      <p>${introPara}</p>

      <h2 id="habitat">生息地・入手方法</h2>
      ${habitatSection}

      <h2 id="skills">得意なこと</h2>
      ${skillSection}

      ${typeSections ? `<h2 id="same-type">${escHtml(dn)}と同じタイプのポケモン</h2>
      <p>${escHtml(dn)}と同じタイプを持つポケモンの一覧です。タイプが同じだと出現エリアや街での使いみちが似ていることがあります。</p>
      ${typeSections}` : ''}

      ${skillLinkSections ? `<h2 id="same-skill">同じ得意なことを持つポケモン</h2>
      <p>${escHtml(dn)}と同じ「得意なこと」を持つポケモンです。街づくりや生息地づくりで似た役割を担うので、入れ替え候補の参考にどうぞ。</p>
      ${skillLinkSections}` : ''}

      ${variantSection}

      <h2 id="faq">${escHtml(dn)}に関するよくある質問</h2>
      ${faqList.map(f => `<div class="info-box"><p style="margin-bottom:4px;"><strong>Q. ${escHtml(f.q)}</strong></p><p style="margin-bottom:0;">A. ${escHtml(f.a)}</p></div>`).join('\n      ')}
    </div>

    <div class="related-guides">
      <h2>関連ページ</h2>
      <div class="related-guides-list">
        ${relatedLinks.join('\n        ')}
      </div>
    </div>
  </article>
` + footerHtml();

  return html;
}

function habitatTable(p) {
  let rows = p.habitats.map(h => {
    const hab = habitatMap[h.habitatId];
    const area = hab ? areaMap[hab.areaId] : null;
    return `        <tr>
          <td>${area ? `<a href="area-${area.id}.html" style="color:var(--accent);">${escHtml(area.name)}</a>` : '—'}</td>
          <td>${hab ? escHtml(hab.name) : '—'}</td>
          <td>${levelLabel(h.level)}</td>
          <td>${timeLabel(h.time)}</td>
          <td>${weatherLabel(h.weather)}</td>
        </tr>`;
  }).join('\n');

  return `
      <table class="compare-table">
        <thead><tr><th>エリア</th><th>生息地</th><th>レア度</th><th>時間帯</th><th>天候</th></tr></thead>
        <tbody>
${rows}
        </tbody>
      </table>`;
}

// ===== エリアページ生成 =====
function generateAreaPage(area) {
  const pokemonList = getPokemonInArea(area.id);
  const title = `【ぽこポケ】${area.name}のポケモン一覧｜出現条件まとめ`;
  const description = `ぽこ あ ポケモンの${area.name}で出会えるポケモン${pokemonList.length}種類の一覧。生息地・出現時間帯・天候条件を網羅。`;
  const canonical = `https://yamamu-youtube.jp/pocoapokemon/area-${area.id}.html`;
  const breadcrumbs = [
    { name: "ホーム", url: "https://yamamu-youtube.jp/" },
    { name: "ぽこポケ攻略", url: "https://yamamu-youtube.jp/pocoapokemon/" },
    { name: `${area.name}のポケモン一覧` }
  ];

  // メインテーブル
  const areaHabitatIds = data.habitats.filter(h => h.areaId === area.id).map(h => h.id);
  const rows = pokemonList.map(p => {
    const areaHabitats = p.habitats.filter(h => areaHabitatIds.includes(h.habitatId));
    const times = new Set();
    const weathers = new Set();
    areaHabitats.forEach(h => {
      (h.time || 'all').split(',').forEach(t => times.add(t.trim()));
      (h.weather || 'all').split(',').forEach(w => weathers.add(w.trim()));
    });
    const timeStr = times.has('all') ? 'いつでも' : timeLabel([...times].join(','));
    const weatherStr = weathers.has('all') ? 'すべて' : weatherLabel([...weathers].join(','));
    const skills = getSkillNames(p);

    const icon = hasImage(p.slug) ? `<img src="img/pokemon/${p.slug}.png" alt="${escHtml(p.name)}" width="32" height="32" loading="lazy" style="vertical-align:middle; margin-right:4px; image-rendering:pixelated;">` : '';

    return `        <tr>
          <td>${dexStr(p.dexNumber)}</td>
          <td><a href="pokemon-${p.slug}.html" style="color:var(--accent);">${icon}${escHtml(displayName(p))}</a></td>
          <td>${escHtml(p.types.join('/'))}</td>
          <td>${skills.length ? escHtml(skills.join('、')) : '—'}</td>
          <td>${timeStr}</td>
          <td>${weatherStr}</td>
        </tr>`;
  }).join('\n');

  // 他のエリアリンク
  const otherAreas = data.areas.filter(a => a.id !== area.id && !['challenge', 'cloud'].includes(a.id));
  const areaLinks = otherAreas.map(a => `<a href="area-${a.id}.html">${a.name}のポケモン一覧</a>`).join('\n        ');

  const html = headHtml(title, description, canonical, breadcrumbs) +
    bodyStart(escHtml(`${area.name}のポケモン一覧`)) + `

  <article class="guide-article">
    <h1>${escHtml(title)}</h1>
    <div class="guide-meta">
      <span>やまむー</span>
      <span>2026年3月更新</span>
    </div>

    <div class="result-box">
      <h3>${escHtml(area.name)}で出会えるポケモン：${pokemonList.length}種類</h3>
      <p>${escHtml(area.description)}</p>
    </div>

    <div class="guide-body">
      <h2 id="list">ポケモン一覧</h2>
      <table class="compare-table">
        <thead><tr><th>No.</th><th>ポケモン</th><th>タイプ</th><th>得意</th><th>時間帯</th><th>天候</th></tr></thead>
        <tbody>
${rows}
        </tbody>
      </table>
    </div>

    <div class="related-guides">
      <h2>他のエリア</h2>
      <div class="related-guides-list">
        ${areaLinks}
        <a href="pokedex.html">ポケモン図鑑（全一覧）</a>
        <a href="guide-habitat.html">生息地づくりガイド</a>
        <a href="index.html">ぽこポケ攻略トップへ戻る</a>
      </div>
    </div>
  </article>
` + footerHtml();

  return html;
}

// ===== 図鑑一覧ページ生成 =====
function generatePokedexPage() {
  const title = '【ぽこポケ】ポケモン図鑑｜全ポケモン一覧・生息地検索';
  const description = `ぽこ あ ポケモン（ぽこポケ）の全${data.meta.totalPokemon}種類のポケモン一覧。エリア・タイプで絞り込み検索可能。`;
  const canonical = 'https://yamamu-youtube.jp/pocoapokemon/pokedex.html';
  const breadcrumbs = [
    { name: "ホーム", url: "https://yamamu-youtube.jp/" },
    { name: "ぽこポケ攻略", url: "https://yamamu-youtube.jp/pocoapokemon/" },
    { name: "ポケモン図鑑" }
  ];

  const extraStyle = `
    .pokedex-search { width: 100%; padding: 12px 16px; font-size: 15px; border: 2px solid var(--border-color); border-radius: 8px; background: var(--bg-card); color: var(--text-primary); margin-bottom: 16px; box-sizing: border-box; }
    .pokedex-search:focus { border-color: var(--accent); outline: none; }
    .filter-bar { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
    .filter-chip { padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); font-size: 13px; cursor: pointer; transition: all 0.2s; }
    .filter-chip.active { background: var(--accent); color: #fff; border-color: var(--accent); }
    .filter-chip:hover { border-color: var(--accent); }
    .pokemon-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .pokemon-card { display: block; padding: 12px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; text-decoration: none; color: var(--text-primary); transition: background 0.2s; font-size: 13px; }
    .pokemon-card:hover { background: var(--chip-bg); border-color: var(--accent); }
    .pokemon-dex { font-size: 11px; color: var(--text-secondary); }
    .pokemon-name { display: block; font-weight: 700; font-size: 14px; margin: 2px 0; }
    .pokemon-type { font-size: 12px; color: var(--text-secondary); }
    .pokemon-badge { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-left: 4px; }
    .badge-legendary { background: #f39c12; color: #fff; }
    .badge-event { background: #e74c3c; color: #fff; }
    .pokedex-count { font-size: 14px; color: var(--text-secondary); margin-bottom: 12px; }
    @media (max-width: 768px) { .pokemon-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .pokemon-grid { grid-template-columns: 1fr; } }`;

  // タイプ一覧
  const allTypes = new Set();
  data.pokemon.forEach(p => p.types.forEach(t => allTypes.add(t)));
  const typeList = [...allTypes].sort();

  // エリアチップ
  const mainAreas = data.areas.filter(a => !['challenge', 'cloud'].includes(a.id));
  const areaChips = mainAreas.map(a =>
    `<button class="filter-chip" data-filter="area-${a.id}">${escHtml(a.name)}</button>`
  ).join('\n      ');

  const typeChips = typeList.map(t =>
    `<button class="filter-chip" data-filter="type-${escHtml(t)}">${escHtml(t)}</button>`
  ).join('\n      ');

  // ポケモンカード
  const areaHabitatMap = {};
  data.areas.forEach(a => {
    areaHabitatMap[a.id] = data.habitats.filter(h => h.areaId === a.id).map(h => h.id);
  });

  const cards = data.pokemon.map(p => {
    const pokemonAreas = [];
    data.areas.forEach(a => {
      if (p.habitats.some(h => (areaHabitatMap[a.id] || []).includes(h.habitatId))) {
        pokemonAreas.push(a.id);
      }
    });

    let badge = '';
    if (p.isLegendary) badge = '<span class="pokemon-badge badge-legendary">伝説</span>';
    else if (p.isEventOnly) badge = '<span class="pokemon-badge badge-event">イベント</span>';

    const cardImg = hasImage(p.slug) ? `<img src="img/pokemon/${p.slug}.png" alt="${escHtml(p.name)}" width="48" height="48" loading="lazy" style="image-rendering:pixelated;">` : '';

    return `    <a href="pokemon-${p.slug}.html" class="pokemon-card" data-name="${escHtml(p.name)}" data-types="${escHtml(p.types.join(','))}" data-areas="${pokemonAreas.join(',')}" data-dex="${dexStr(p.dexNumber)}">
      <div style="display:flex; align-items:center; gap:8px;">
        ${cardImg ? `<div style="flex-shrink:0;">${cardImg}</div>` : ''}
        <div>
          <span class="pokemon-dex">No.${dexStr(p.dexNumber)}</span>
          <span class="pokemon-name">${escHtml(displayName(p))}${badge}</span>
          <span class="pokemon-type">${escHtml(p.types.join(' / '))}</span>
        </div>
      </div>
    </a>`;
  }).join('\n');

  const html = headHtml(title, description, canonical, breadcrumbs, extraStyle) +
    bodyStart('<span>ポケモン図鑑</span>') + `

  <article class="guide-article">
    <h1>${escHtml(title)}</h1>
    <div class="guide-meta">
      <span>やまむー</span>
      <span>2026年3月更新</span>
    </div>

    <div class="result-box">
      <h3>全${data.meta.totalPokemon}種類のポケモンを網羅！</h3>
      <p>ぽこ あ ポケモンに登場する全ポケモンの一覧です。名前検索・エリア・タイプで絞り込みできます。各ポケモンをクリックすると<strong>生息地・出現条件・得意なこと</strong>の詳細ページへ移動します。</p>
    </div>

    <input type="text" class="pokedex-search" id="pokemonSearch" placeholder="ポケモン名で検索...">

    <div class="filter-bar" id="filterBar">
      <button class="filter-chip active" data-filter="all">すべて</button>
      ${areaChips}
      ${typeChips}
      <button class="filter-chip" data-filter="legendary">伝説</button>
    </div>

    <p class="pokedex-count" id="pokedexCount">全${data.pokemon.length}件表示中</p>

    <div class="pokemon-grid" id="pokemonGrid">
${cards}
    </div>

    <div class="related-guides" style="margin-top:32px;">
      <h2>エリア別ポケモン一覧</h2>
      <div class="related-guides-list">
        ${mainAreas.map(a => `<a href="area-${a.id}.html">${a.name}のポケモン一覧</a>`).join('\n        ')}
        <a href="guide-habitat.html">生息地づくりガイド</a>
        <a href="index.html">ぽこポケ攻略トップへ戻る</a>
      </div>
    </div>
  </article>
` + footerHtml('\n  <script src="pokedex.js"></script>');

  return html;
}

// ===== pokedex.js 生成 =====
function generatePokedexJs() {
  return `(function() {
  'use strict';
  var search = document.getElementById('pokemonSearch');
  var grid = document.getElementById('pokemonGrid');
  var filterBar = document.getElementById('filterBar');
  var countEl = document.getElementById('pokedexCount');
  var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.pokemon-card')) : [];
  var activeFilter = 'all';

  function updateCount() {
    var visible = cards.filter(function(c) { return c.style.display !== 'none'; }).length;
    if (countEl) countEl.textContent = '全' + visible + '件表示中';
  }

  function applyFilters() {
    var query = (search ? search.value : '').toLowerCase();
    cards.forEach(function(card) {
      var name = (card.getAttribute('data-name') || '').toLowerCase();
      var types = card.getAttribute('data-types') || '';
      var areas = card.getAttribute('data-areas') || '';
      var matchSearch = !query || name.indexOf(query) !== -1;
      var matchFilter = true;
      if (activeFilter === 'all') {
        matchFilter = true;
      } else if (activeFilter === 'legendary') {
        matchFilter = card.querySelector('.badge-legendary') !== null;
      } else if (activeFilter.indexOf('area-') === 0) {
        var areaId = activeFilter.replace('area-', '');
        matchFilter = areas.split(',').indexOf(areaId) !== -1;
      } else if (activeFilter.indexOf('type-') === 0) {
        var typeStr = activeFilter.replace('type-', '');
        matchFilter = types.split(',').indexOf(typeStr) !== -1;
      }
      card.style.display = (matchSearch && matchFilter) ? '' : 'none';
    });
    updateCount();
  }

  if (search) {
    search.addEventListener('input', applyFilters);
  }

  if (filterBar) {
    filterBar.addEventListener('click', function(e) {
      var chip = e.target.closest('.filter-chip');
      if (!chip) return;
      activeFilter = chip.getAttribute('data-filter') || 'all';
      var chips = filterBar.querySelectorAll('.filter-chip');
      for (var i = 0; i < chips.length; i++) {
        chips[i].classList.toggle('active', chips[i] === chip);
      }
      applyFilters();
      if (activeFilter !== 'all') {
        history.replaceState(null, '', '#' + activeFilter);
      } else {
        history.replaceState(null, '', location.pathname);
      }
    });
  }

  // URLハッシュ対応
  function loadFromHash() {
    var hash = location.hash.replace('#', '');
    if (hash) {
      activeFilter = hash;
      var chips = filterBar ? filterBar.querySelectorAll('.filter-chip') : [];
      for (var i = 0; i < chips.length; i++) {
        chips[i].classList.toggle('active', (chips[i].getAttribute('data-filter') || '') === hash);
      }
      applyFilters();
    }
  }
  loadFromHash();
  window.addEventListener('hashchange', loadFromHash);
})();
`;
}

// ===== メイン実行 =====
console.log('ぽこポケ ポケモンページ生成開始...');
let generated = 0;

// ポケモン個別ページ
data.pokemon.forEach(p => {
  const html = generatePokemonPage(p);
  fs.writeFileSync(path.join(OUT_DIR, `pokemon-${p.slug}.html`), html, 'utf8');
  generated++;
});
console.log(`  ポケモン個別ページ: ${generated}件`);

// エリアページ（主要5エリアのみ）
const mainAreaIds = ['pasapasa', 'gotsugotsu', 'donyori', 'kirakira', 'massara'];
mainAreaIds.forEach(areaId => {
  const area = areaMap[areaId];
  if (!area) return;
  const html = generateAreaPage(area);
  fs.writeFileSync(path.join(OUT_DIR, `area-${areaId}.html`), html, 'utf8');
  generated++;
});
console.log(`  エリアページ: ${mainAreaIds.length}件`);

// 図鑑ページ
const pokedexHtml = generatePokedexPage();
fs.writeFileSync(path.join(OUT_DIR, 'pokedex.html'), pokedexHtml, 'utf8');
generated++;
console.log('  図鑑ページ: 1件');

// pokedex.js
const pokedexJs = generatePokedexJs();
fs.writeFileSync(path.join(OUT_DIR, 'pokedex.js'), pokedexJs, 'utf8');
console.log('  pokedex.js: 1件');

console.log(`\n合計 ${generated} ページ生成完了！`);
console.log('次のステップ: index.htmlの更新、sitemap.xmlの更新');
