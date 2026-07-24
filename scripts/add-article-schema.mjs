#!/usr/bin/env node
/**
 * add-article-schema.mjs — 動画記事に不足しているJSON-LDを補う。
 *
 *   node scripts/add-article-schema.mjs inazuma
 *   node scripts/add-article-schema.mjs inazuma pokepoke --dry
 *
 * 既に入っている型は触らず、足りない型（Article / VideoObject / BreadcrumbList）だけ足す。
 * 記事データは {game}/videos.json（id・title・date・duration・description）から取る。
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://yamamu-youtube.jp";
const DRY = process.argv.includes("--dry");
const games = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!games.length) {
  console.error("使い方: node scripts/add-article-schema.mjs <game> [game...] [--dry]");
  process.exit(2);
}

const GAME_LABEL = {
  inazuma: "イナイレV攻略Wiki",
  pokepoke: "ポケポケ攻略Wiki",
  pocoapokemon: "ぽこポケ攻略Wiki",
  palworld: "パルワールド攻略Wiki",
};

// "12:14" -> "PT12M14S" / "1:02:03" -> "PT1H2M3S"
function isoDuration(d) {
  if (!d) return null;
  const p = String(d).split(":").map(Number);
  if (p.some(isNaN)) return null;
  const [h, m, s] = p.length === 3 ? p : [0, p[0], p[1]];
  return `PT${h ? h + "H" : ""}${m ? m + "M" : ""}${s ? s + "S" : ""}` || "PT0S";
}

const pick = (html, re) => (html.match(re) || [])[1];
const decode = (s) =>
  (s || "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

let touched = 0, skipped = 0;

for (const game of games) {
  const dir = join(ROOT, game);
  const vjPath = join(dir, "videos.json");
  if (!existsSync(dir)) { console.error(`ディレクトリが無い: ${game}`); continue; }
  const videos = existsSync(vjPath) ? JSON.parse(readFileSync(vjPath, "utf8")) : [];
  const byId = Object.fromEntries(videos.map((v) => [v.id, v]));

  for (const name of readdirSync(dir)) {
    if (!/^video-.+\.html$/.test(name)) continue;
    const abs = join(dir, name);
    let html = readFileSync(abs, "utf8");
    const rel = `${game}/${name}`;
    const url = `${ORIGIN}/${rel}`;

    // 既存の型を調べる
    const existing = new Set();
    for (const [, raw] of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)) {
      try {
        const d = JSON.parse(raw);
        for (const n of d["@graph"] || [d]) if (n["@type"]) existing.add(n["@type"]);
      } catch { /* 壊れているブロックは無視 */ }
    }

    const id = pick(html, /youtube\.com\/embed\/([A-Za-z0-9_-]+)/);
    const meta = byId[id] || {};
    const title = decode(pick(html, /<meta property="og:title" content="([^"]*)"/) || pick(html, /<title>([\s\S]*?)<\/title>/) || meta.title || "");
    const desc = decode(pick(html, /<meta name="description" content="([^"]*)"/) || meta.description || "");
    const image = pick(html, /<meta property="og:image" content="([^"]*)"/) || (id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null);
    const date = meta.date || pick(html, /"datePublished"\s*:\s*"([\d-]+)"/) || null;

    if (!title || !date) { skipped++; continue; }

    const nodes = [];
    if (!existing.has("Article") && !existing.has("BlogPosting")) {
      nodes.push({
        "@type": "Article",
        headline: title.slice(0, 110),
        description: desc.slice(0, 300),
        author: { "@type": "Person", name: "やまむー", url: "https://www.youtube.com/@yamamu" },
        publisher: { "@type": "Organization", name: "やまむー【yamamu】", url: ORIGIN },
        datePublished: date,
        dateModified: date,
        mainEntityOfPage: url,
        image,
        inLanguage: "ja",
      });
    }
    if (!existing.has("VideoObject") && id) {
      const dur = isoDuration(meta.duration);
      nodes.push({
        "@type": "VideoObject",
        name: title,
        description: desc.slice(0, 300),
        thumbnailUrl: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${id}`,
        contentUrl: `https://www.youtube.com/watch?v=${id}`,
        uploadDate: date,
        ...(dur ? { duration: dur } : {}),
        author: { "@type": "Person", name: "やまむー" },
      });
    }
    if (!existing.has("BreadcrumbList")) {
      nodes.push({
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: GAME_LABEL[game] || game, item: `${ORIGIN}/${game}/` },
          { "@type": "ListItem", position: 2, name: title.slice(0, 80), item: url },
        ],
      });
    }

    if (!nodes.length) { skipped++; continue; }

    const block =
      `  <!-- JSON-LD (add-article-schema.mjs) -->\n` +
      `  <script type="application/ld+json">\n` +
      JSON.stringify({ "@context": "https://schema.org", "@graph": nodes }, null, 2)
        .split("\n").map((l) => "  " + l).join("\n") +
      `\n  </script>\n`;

    if (!html.includes("</head>")) { skipped++; continue; }
    html = html.replace("</head>", block + "</head>");
    if (!DRY) writeFileSync(abs, html, "utf8");
    touched++;
    console.log(`  + ${rel}  追加: ${nodes.map((n) => n["@type"]).join(", ")}`);
  }
}
console.log(`\n${DRY ? "[dry-run] " : ""}更新 ${touched}件 / スキップ ${skipped}件`);
