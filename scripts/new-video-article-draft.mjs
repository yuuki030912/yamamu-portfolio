// 新着YouTube動画を検知して「記事の下書き」を用意するスクリプト。
//
// やること:
//   1. チャンネルRSSから最新動画を取得
//   2. カットオフ日(PROCESS_SINCE)以降の動画だけを対象にする（既存カタログの遡り処理を防ぐ）
//   3. すべての新着を drafts/pending-videos.md に追記（どのゲームでも取りこぼさない）
//   4. テンプレ対応ゲーム(パルワールド・ポケポケ)は、加えて記事の下書きHTML＋カード＋sitemapを自動生成
//
// 下書きHTMLは noindex + 「🚧下書き」バナー付き。本文は未執筆なので、
// 公開前に人間（またはClaude）が本文を書いて noindex とバナーを外す運用。
//
// ゲーム追加方法: GAMES にエントリを足す（match/dir/label/logo/homeLinks/tags）。
//
// ローカルテスト: node scripts/new-video-article-draft.mjs
//   （PROCESS_SINCE=2026-01-01 で過去分も対象に / DRY_RUN=1 で書き込みなし
//     ONLY_GAME=pokepoke で1ゲームに限定）

import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { constants } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const CHANNEL_ID = "UCZoSz5BvUCPaFP7BPUKZVUQ";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const PROCESS_SINCE = process.env.PROCESS_SINCE || "2026-07-22";
const DRY_RUN = process.env.DRY_RUN === "1";
const ONLY_GAME = process.env.ONLY_GAME || "";

const PENDING_PATH = join(ROOT, "drafts", "pending-videos.md");
// 専用ファイル名(video-<dir>-<id>.html)以外で既に記事化済みの動画。
const HANDLED_IDS = new Set(["MSr1f_02oDA"]); // 序盤の正解 → palworld/guide-beginner.html

// ---- ユーティリティ -------------------------------------------------------

function decodeXml(v) {
  return v
    .replace(/&#x([0-9a-f]+);/gi, (_, c) => String.fromCodePoint(parseInt(c, 16)))
    .replace(/&#(\d+);/g, (_, c) => String.fromCodePoint(parseInt(c, 10)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}
function escapeHtml(v) {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function escapeJson(v) {
  return v.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ").trim();
}
async function exists(p) {
  try { await access(p, constants.F_OK); return true; } catch { return false; }
}

// ---- ゲーム設定 -----------------------------------------------------------

function palTags(title) {
  const t = ["パルワールド", "Palworld"];
  if (/ハードコア/i.test(title)) t.push("ハードコアモード", "実況");
  if (/おすすめ|パル紹介|捕ま|最強/i.test(title)) t.push("おすすめパル", "序盤攻略");
  if (/序盤|始め|初心者/i.test(title)) t.push("序盤攻略", "初心者");
  if (/設定|効率|レベル|厳選/i.test(title)) t.push("効率");
  t.push("やまむー");
  return [...new Set(t)];
}
function pokeTags(title) {
  const t = ["ポケポケ", "ポケカポケット"];
  if (/デッキ|ex|EX/.test(title)) t.push("デッキ");
  if (/対戦|勝|www|ｗｗｗ/.test(title)) t.push("対戦");
  if (/最強|環境|Tier/i.test(title)) t.push("環境");
  t.push("やまむー");
  return [...new Set(t)];
}

export const GAMES = {
  palworld: {
    key: "palworld", label: "パルワールド", dir: "palworld",
    logo: "パルワールド攻略Wiki", navActive: "palworld",
    match: (t) => /パルワールド|palworld/i.test(t),
    tags: palTags,
    homeLinks: [["index.html", "ホーム"], ["guide-beginner.html", "序盤完全ガイド"], ["../en/", "English"]],
  },
  pokepoke: {
    key: "pokepoke", label: "ポケポケ", dir: "pokepoke",
    logo: "ポケポケ攻略Wiki", navActive: "pokepoke",
    match: (t) => /ポケポケ/.test(t),
    tags: pokeTags,
    homeLinks: [["index.html", "ホーム"]],
  },
};

function classify(title) {
  for (const g of Object.values(GAMES)) if (g.match(title)) return g;
  if (/イナズマ|イナイレ|inazuma/i.test(title)) return { key: "inazuma", label: "イナイレV", templated: false };
  if (/ぽこ.?あ.?ポケモン|ぽこポケ/i.test(title)) return { key: "pocoapokemon", label: "ぽこポケ", templated: false };
  return { key: "other", label: "その他", templated: false };
}

// ---- 記事の下書きHTML（ゲーム共通テンプレ）--------------------------------

function gameNav(active) {
  const link = (href, label, key) =>
    `    <a href="${href}" class="game-nav-link${active === key ? " active" : ""}">${label}</a>`;
  return `  <nav class="game-nav" aria-label="ゲーム選択">
    <a href="../index.html" class="game-nav-link">トップ</a>
${link("../inazuma/", "イナイレV", "inazuma")}
${link("../pokepoke/", "ポケポケ", "pokepoke")}
${link("../pocoapokemon/", "ぽこポケ", "pocoapokemon")}
${link("../palworld/", "パルワールド", "palworld")}
  </nav>`;
}
function wikiNav(cfg) {
  const links = cfg.homeLinks.map(([h, l], i) =>
    `    <a href="${h}" class="wiki-nav-link${i === 0 ? " active" : ""}">${l}</a>`).join("\n");
  return `  <nav class="wiki-nav" aria-label="メインナビゲーション">\n${links}\n  </nav>`;
}

export function buildDraft(cfg, { id, title, description, published }) {
  const date = (published || "").slice(0, 10);
  const safeTitle = escapeHtml(title);
  const metaDesc = escapeHtml((description.split("\n").find((l) => l.trim()) || title).slice(0, 110));
  const tags = cfg.tags(title).map((t) => `      <span class="video-tag">${escapeHtml(t)}</span>`).join("\n");
  const descBlock = description.split("\n").map((line) => {
    const t = line.trim();
    return t ? `<p style="margin:2px 0; font-size:13px; color:var(--text-secondary);">${escapeHtml(t)}</p>` : "";
  }).filter(Boolean).join("\n        ");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex"><!-- 🚧下書き: 本文を完成させたら削除して公開 -->
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://pagead2.googlesyndication.com https://adservice.google.com https://www.googletagservices.com https://tpc.googlesyndication.com; style-src 'self' 'unsafe-inline'; img-src 'self' https://img.youtube.com https://pagead2.googlesyndication.com https://www.google.com https://googleads.g.doubleclick.net data:; frame-src https://www.youtube.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://pagead2.googlesyndication.com https://adservice.google.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta name="referrer" content="strict-origin-when-cross-origin">

  <title>【下書き】${safeTitle}｜やまむー</title>
  <meta name="description" content="${metaDesc}">
  <link rel="canonical" href="https://yamamu-youtube.jp/${cfg.dir}/video-${cfg.dir}-${id}.html">

  <meta property="og:type" content="article">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:url" content="https://yamamu-youtube.jp/${cfg.dir}/video-${cfg.dir}-${id}.html">
  <meta property="og:site_name" content="やまむー【yamamu】">
  <meta property="og:image" content="https://img.youtube.com/vi/${id}/hqdefault.jpg">
  <meta property="og:locale" content="ja_JP">

  <!-- JSON-LD: VideoObject -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "${escapeJson(title)}",
    "description": "${escapeJson(metaDesc)}",
    "thumbnailUrl": "https://img.youtube.com/vi/${id}/hqdefault.jpg",
    "embedUrl": "https://www.youtube.com/embed/${id}",
    "contentUrl": "https://www.youtube.com/watch?v=${id}",
    "uploadDate": "${date}",
    "author": { "@type": "Person", "name": "やまむー", "url": "https://www.youtube.com/@yamamu" }
  }
  </script>

  <link rel="preconnect" href="https://img.youtube.com">
  <link rel="preconnect" href="https://www.youtube.com">
  <script src="/theme-init.js"></script>
  <link rel="stylesheet" href="../style.css">
  <link rel="stylesheet" href="../video.css">
  <style>
    .draft-banner { max-width:960px; margin:16px auto 0; padding:14px 18px; background:#7c2d12; color:#fff; border-radius:8px; font-size:14px; line-height:1.7; }
    .draft-banner strong { color:#fde68a; }
    .draft-src { max-width:960px; margin:16px auto; padding:16px 20px; background:var(--bg-card); border:1px dashed var(--border-color); border-radius:8px; }
    .draft-src h2 { font-size:15px; color:var(--text-primary); margin-bottom:8px; }
    .draft-src p { margin:2px 0; }
  </style>
</head>
<body>
  <header class="header">
    <a href="index.html" class="header-left" style="text-decoration:none">
      <img src="../icon.png" alt="やまむー" class="header-icon" width="32" height="32">
      <span class="logo-text">${cfg.logo}</span>
    </a>
    <div class="header-right">
      <button class="theme-toggle" id="themeToggle" title="テーマ切替">
        <svg viewBox="0 0 24 24" width="22" height="22"><path fill="#606060" d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>
      </button>
    </div>
  </header>

${gameNav(cfg.navActive)}
${wikiNav(cfg)}

  <div class="draft-banner">
    🚧 <strong>この記事は自動生成された下書きです。</strong> 本文（「動画の内容まとめ」）はまだ書かれていません。
    公開する前に、下の「元動画の説明文」を素材に本文を執筆し、<strong>noindexメタ・このバナー・元説明文ブロックを削除</strong>してください。
    Claudeに「この動画記事にして」と伝えれば仕上げます。
  </div>

  <nav class="breadcrumb" aria-label="パンくずリスト">
    <a href="index.html">ホーム</a><span>›</span>${safeTitle}
  </nav>

  <section class="video-player-section">
    <div class="video-player-container">
      <div class="yt-lazy" data-video-id="${id}" data-title="${safeTitle}" style="position:relative;width:100%;height:100%;cursor:pointer;background:#000;">
        <noscript>
          <iframe src="https://www.youtube.com/embed/${id}" title="${safeTitle}" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"></iframe>
        </noscript>
      </div>
    </div>
  </section>

  <article class="video-detail">
    <h1 class="video-detail-title">${safeTitle}</h1>
    <div class="video-detail-meta">
      <span>${date}</span>
      <span class="video-category-tag">${cfg.label}</span>
    </div>
    <div class="video-tags" style="margin-top:12px; display:flex; flex-wrap:wrap; gap:6px;">
${tags}
    </div>
  </article>

  <!-- TODO: ここに「動画の内容まとめ」記事本文（リード文→見出し→表→FAQ）を書く。
       構成の型は同ディレクトリの既存 video-*.html を参照。 -->

  <section class="draft-src">
    <h2>▼ 元動画の説明文（記事化の素材・公開前に削除）</h2>
        ${descBlock}
  </section>

  <footer class="footer">
    <nav class="footer-nav" aria-label="フッターナビゲーション">
      <a href="../index.html">ポータル</a>
      <a href="index.html">ホーム</a>
      <a href="../about.html">運営者情報</a>
      <a href="https://www.youtube.com/@yamamu" rel="noopener noreferrer" target="_blank">YouTube</a>
    </nav>
    <p>&copy; 2026 やまむー【yamamu】. All rights reserved.</p>
  </footer>

  <script src="../youtube-lazy.js"></script>
  <script src="../theme.js"></script>
</body>
</html>
`;
}

function videoCard(cfg, id, title, draft = true) {
  const mark = draft ? "🚧 " : "";
  return `      <a class="pw-video-card" href="video-${cfg.dir}-${id}.html">
        <img src="https://img.youtube.com/vi/${id}/hqdefault.jpg" alt="${escapeHtml(title)}" loading="lazy">
        <div class="vt">${mark}${escapeHtml(title)}</div>
      </a>`;
}
function sitemapEntry(cfg, id) {
  return `  <url>
    <loc>https://yamamu-youtube.jp/${cfg.dir}/video-${cfg.dir}-${id}.html</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
}

// ---- メイン ---------------------------------------------------------------

async function main() {
  const res = await fetch(FEED_URL, { headers: { Accept: "application/atom+xml" } });
  if (!res.ok) throw new Error(`YouTube feed returned ${res.status}`);
  const xml = await res.text();

  const entries = (xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? []).flatMap((e) => {
    const id = e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const rawTitle = e.match(/<media:title>([\s\S]*?)<\/media:title>/)?.[1]
      ?? e.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const published = e.match(/<published>([^<]+)<\/published>/)?.[1];
    const description = e.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] ?? "";
    if (!id || !rawTitle) return [];
    return [{ id, title: decodeXml(rawTitle.trim()), published, description: decodeXml(description) }];
  });

  const recent = entries.filter((v) => (v.published || "") >= `${PROCESS_SINCE}T00:00:00`);

  let pending = "";
  if (await exists(PENDING_PATH)) pending = await readFile(PENDING_PATH, "utf8");

  const newForPending = [];
  const toGenerate = []; // { cfg, video }

  for (const v of recent) {
    if (HANDLED_IDS.has(v.id)) continue;
    const game = classify(v.title);
    if (ONLY_GAME && game.key !== ONLY_GAME) continue;
    const cfg = GAMES[game.key];
    const alreadyPending = pending.includes(`(${v.id})`) || pending.includes(`v=${v.id}`);
    const hasArticle = cfg
      && await exists(join(ROOT, cfg.dir, `video-${cfg.dir}-${v.id}.html`));
    if (!alreadyPending && !hasArticle) newForPending.push({ ...v, game });
    if (cfg && !hasArticle) toGenerate.push({ cfg, video: v });
  }

  if (newForPending.length === 0 && toGenerate.length === 0) {
    console.log("新着なし（すべて処理済み or カットオフ前）");
    if (process.env.GITHUB_OUTPUT) await writeFile(process.env.GITHUB_OUTPUT, "has_changes=false\n", { flag: "a" });
    return;
  }

  const summary = [];

  // 1) pending-videos.md
  if (newForPending.length > 0) {
    let body = pending || `# 記事化 待ちの新着動画\n\n自動検知された新着動画のリスト。テンプレ対応ゲームは下書き記事が自動生成されます（PR参照）。\nその他ゲームは、記事化する場合は手動で対応してください。\n\n`;
    for (const v of newForPending) {
      const done = GAMES[v.game.key] ? "下書き自動生成済み" : "要手動";
      body += `- [ ] **${v.game.label}** [${v.title}](https://www.youtube.com/watch?v=${v.id}) (${v.id}) — ${v.published?.slice(0, 10)} — ${done}\n`;
      summary.push(`${v.game.label}: ${v.title}`);
    }
    if (!DRY_RUN) { await mkdir(join(ROOT, "drafts"), { recursive: true }); await writeFile(PENDING_PATH, body, "utf8"); }
    console.log(`pending-videos.md に ${newForPending.length} 件追記`);
  }

  // 2) テンプレ対応ゲームは下書き記事＋カード＋sitemap
  for (const { cfg, video: v } of toGenerate) {
    const draftPath = join(ROOT, cfg.dir, `video-${cfg.dir}-${v.id}.html`);
    if (!DRY_RUN) await writeFile(draftPath, buildDraft(cfg, v), "utf8");
    console.log(`下書き生成: ${cfg.dir}/video-${cfg.dir}-${v.id}.html`);

    const indexPath = join(ROOT, cfg.dir, "index.html");
    const idx = await readFile(indexPath, "utf8");
    const anchor = '<div class="pw-video-grid">';
    if (idx.includes(anchor) && !idx.includes(`video-${cfg.dir}-${v.id}.html`)) {
      const updated = idx.replace(anchor, `${anchor}\n${videoCard(cfg, v.id, v.title)}`);
      if (!DRY_RUN) await writeFile(indexPath, updated, "utf8");
      console.log("  → index.html にカード挿入");
    } else {
      console.log("  ⚠ index.html のグリッドが見つからない or カード既出。手動確認。");
    }

    const smPath = join(ROOT, "sitemap.xml");
    const sm = await readFile(smPath, "utf8");
    if (!sm.includes(`video-${cfg.dir}-${v.id}.html`)) {
      const updated = sm.replace("</urlset>", `${sitemapEntry(cfg, v.id)}</urlset>`);
      if (!DRY_RUN) await writeFile(smPath, updated, "utf8");
      console.log("  → sitemap.xml に追記");
    }
  }

  if (process.env.GITHUB_OUTPUT) {
    await writeFile(process.env.GITHUB_OUTPUT,
      `has_changes=true\npr_title=🎬 新着動画の記事下書き（${summary.length || toGenerate.length}件）\n`, { flag: "a" });
  }

  console.log("\n=== まとめ ===");
  console.log(summary.join("\n"));
  if (DRY_RUN) console.log("\n(DRY_RUN: ファイルは書き込んでいません)");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
