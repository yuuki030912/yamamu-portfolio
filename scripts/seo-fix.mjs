#!/usr/bin/env node
/**
 * seo-fix.mjs — seo-check.mjs が出す機械的に直せるWARNをまとめて解消する。
 *
 *   node scripts/seo-fix.mjs --dry     # 変更内容だけ表示
 *   node scripts/seo-fix.mjs
 *
 * 直すもの:
 *   1. title が長い  → 末尾のサイト名と、冒頭と重複するゲーム名【】を削る
 *   2. meta description が140字超 → 句点で自然に切り詰める
 *   3. og:locale / og:type / og:url / og:site_name の欠落を補う
 *   4. twitter:card(summary_large_image) と twitter:title/description/image の欠落を補う
 *   5. Article JSON-LD の image / inLanguage の欠落を補う
 *   6. 見出しの h2→h4 飛びを h3 に直す
 * 本文には触らない。
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://yamamu-youtube.jp";
const DRY = process.argv.includes("--dry");

const vis = (s) => [...s].reduce((n, c) => n + (/[\x00-\x7F｡-ﾟ]/.test(c) ? 0.5 : 1), 0);
const pick = (h, re) => (h.match(re) || [])[1];

// 冒頭に短縮名がある場合に削ってよい、正式名称の【】
const REDUNDANT = [
  ["【イナイレV】", ["【イナズマイレブン英雄たちのヴィクトリーロード】", "【イナズマイレブンヴィクトリーロード】", "【イナズマイレブン】"]],
  ["【ぽこポケ】", ["【ぽこぽこあにまる】"]],
];

function shortenTitle(t) {
  let out = t.trim();
  out = out.replace(/\s*[|｜]\s*やまむー(?:【yamamu】)?\s*$/u, "");   // 末尾のサイト名
  for (const [short, longs] of REDUNDANT) {
    if (!out.includes(short)) continue;
    for (const L of longs) out = out.split(L).join("");
  }
  out = out.replace(/\s{2,}/g, " ").trim();

  // まだ長ければ、文末記号で自然に切れる位置を探す。
  // 25〜35字に収まる区切りがある時だけ切る（短すぎる＝主題が落ちる場合は切らない）
  if (vis(out) > 35) {
    let best = null;
    // 文末記号は記号ごと残し、区切り記号（｜、）は落として切る
    for (const m of out.matchAll(/[！？。!?｜|、]/g)) {
      const keep = /[！？。!?]/.test(m[0]);
      const cand = out.slice(0, m.index + (keep ? 1 : 0)).trim();
      const v = vis(cand);
      if (v <= 35 && v >= 25) best = cand;
    }
    if (best) out = best;
  }
  return out;
}

function trimDesc(d, limit = 140) {
  if (vis(d) <= limit) return d;
  // 句点で切れるところを探す
  let best = "";
  for (const part of d.split("。")) {
    const cand = best ? `${best}。${part}` : part;
    if (vis(cand + "。") > limit) break;
    best = cand;
  }
  if (best && vis(best) >= 60) return best + "。";
  // 句点が使えなければ読点、それも無ければハードカット
  let cut = [...d];
  while (vis(cut.join("")) > limit - 1) cut.pop();
  const s = cut.join("");
  const i = Math.max(s.lastIndexOf("、"), s.lastIndexOf("・"));
  return (i > s.length * 0.6 ? s.slice(0, i) : s) + "…";
}

function walk(dir, acc = []) {
  for (const n of readdirSync(dir)) {
    if (n.startsWith(".") || n === "node_modules" || n === "drafts") continue;
    const p = join(dir, n);
    statSync(p).isDirectory() ? walk(p, acc) : /^(guide|video)-.+\.html$/.test(n) && acc.push(p);
  }
  return acc;
}

const tally = {};
const bump = (k) => (tally[k] = (tally[k] || 0) + 1);

for (const abs of walk(ROOT)) {
  let html = readFileSync(abs, "utf8");
  if (/<meta http-equiv="refresh"/i.test(html)) continue;
  const rel = relative(ROOT, abs).replace(/\\/g, "/");
  const url = `${ORIGIN}/${rel}`;
  const isVideo = /\/video-/.test("/" + rel);
  const before = html;
  const notes = [];

  // 1. title
  const title = pick(html, /<title>([\s\S]*?)<\/title>/);
  if (title && vis(title) > 35) {
    const s = shortenTitle(title);
    if (s && s !== title.trim() && vis(s) < vis(title)) {
      html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${s}</title>`);
      notes.push(`title ${vis(title)}→${vis(s)}字`); bump("title");
    }
  }

  // 2. meta description
  const desc = pick(html, /<meta name="description" content="([\s\S]*?)"\s*\/?>/);
  if (desc && vis(desc) > 140) {
    const t = trimDesc(desc);
    if (t !== desc) {
      html = html.replace(
        /(<meta name="description" content=")[\s\S]*?("\s*\/?>)/,
        (_, a, b) => a + t + b
      );
      notes.push(`desc ${vis(desc)}→${vis(t)}字`); bump("description");
    }
  }

  // 3-4. head に足りない meta を補う
  const ogImg = pick(html, /<meta property="og:image" content="([^"]+)"/);
  const curTitle = pick(html, /<title>([\s\S]*?)<\/title>/) || "";
  const ogTitle = pick(html, /<meta property="og:title" content="([^"]*)"/) || curTitle;
  const curDesc = pick(html, /<meta name="description" content="([\s\S]*?)"\s*\/?>/) || "";
  const add = [];
  const has = (s) => html.includes(s);
  if (!has('property="og:locale"')) add.push(`<meta property="og:locale" content="ja_JP">`);
  if (!has('property="og:type"')) add.push(`<meta property="og:type" content="${isVideo ? "video.other" : "article"}">`);
  if (!has('property="og:url"')) add.push(`<meta property="og:url" content="${url}">`);
  if (!has('property="og:site_name"')) add.push(`<meta property="og:site_name" content="やまむー【yamamu】">`);
  if (!has('name="twitter:card"')) add.push(`<meta name="twitter:card" content="summary_large_image">`);
  else if (ogImg && /name="twitter:card" content="summary"/.test(html)) {
    // og:image があるなら大きいカードのほうがクリックされる
    html = html.replace(/(name="twitter:card" content=")summary(")/, "$1summary_large_image$2");
    notes.push("twitter:card→large"); bump("twitter");
  }
  if (!has('name="twitter:title"') && ogTitle) add.push(`<meta name="twitter:title" content="${ogTitle}">`);
  if (!has('name="twitter:description"') && curDesc) add.push(`<meta name="twitter:description" content="${curDesc}">`);
  if (!has('name="twitter:image"') && ogImg) add.push(`<meta name="twitter:image" content="${ogImg}">`);
  if (add.length) {
    html = html.replace("</head>", "  " + add.join("\n  ") + "\n</head>");
    notes.push(`meta補完 ${add.length}件`); bump("meta");
  }

  // 5. Article JSON-LD の image / inLanguage
  html = html.replace(
    /(<script[^>]*application\/ld\+json[^>]*>)([\s\S]*?)(<\/script>)/g,
    (full, open, raw, close) => {
      let data;
      try { data = JSON.parse(raw); } catch { return full; }
      const nodes = data["@graph"] || [data];
      let hit = false;
      for (const n of nodes) {
        if (n["@type"] !== "Article" && n["@type"] !== "BlogPosting") continue;
        if (!n.image && ogImg) { n.image = ogImg; hit = true; }
        if (!n.inLanguage) { n.inLanguage = "ja"; hit = true; }
      }
      if (!hit) return full;
      bump("json-ld");
      const body = data["@graph"]
        ? JSON.stringify({ "@context": data["@context"] || "https://schema.org", "@graph": nodes }, null, 2)
        : JSON.stringify(nodes[0], null, 2);
      return open + "\n" + body.split("\n").map((l) => "  " + l).join("\n") + "\n  " + close;
    }
  );

  // 6. 見出しの h2→h4 飛びを h3 に
  {
    const seq = [...html.matchAll(/<(h[2-4])\b/g)];
    let prev = 0, needFix = false;
    for (const m of seq) { const l = Number(m[1][1]); if (prev === 2 && l === 4) { needFix = true; break; } prev = l; }
    if (needFix) {
      // h3 を一度も使っていないページなら h4 を丸ごと h3 に落とすのが安全
      if (!/<h3\b/.test(html)) {
        html = html.replace(/<h4\b/g, "<h3").replace(/<\/h4>/g, "</h3>");
        notes.push("h4→h3"); bump("見出し");
      }
    }
  }

  if (html !== before) {
    if (!DRY) writeFileSync(abs, html, "utf8");
    console.log(`  ✓ ${rel}  ${notes.join(" / ")}`);
  }
}
console.log(`\n${DRY ? "[dry-run] " : ""}内訳:`, tally);
