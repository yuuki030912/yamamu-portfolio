#!/usr/bin/env node
/**
 * seo-check.mjs — 記事ページのSEO要件を一括検証する。
 *
 *   node scripts/seo-check.mjs pokepoke/guide-tenku-no-shihaisha.html
 *   node scripts/seo-check.mjs --all      # guide-*.html / video-*.html を全部
 *
 * 新記事を公開する前に必ず通す。FAILが0になってからcommitする。
 * チェック項目は「記事SEOの標準」= docs/seo-standard.md と対応。
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://yamamu-youtube.jp";

// 日本語は全角=1文字として数える（Googleの表示幅は全角約30〜35文字で打ち切り）
const visualLen = (s) =>
  [...s].reduce((n, c) => n + (/[\x00-\x7F｡-ﾟ]/.test(c) ? 0.5 : 1), 0);

const results = [];
const add = (level, label, msg) => results.push({ level, label, msg });
const PASS = (l, m) => add("PASS", l, m);
const WARN = (l, m) => add("WARN", l, m);
const FAIL = (l, m) => add("FAIL", l, m);

function allHtmlFiles(dir = ROOT, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".") || name === "node_modules" || name === "drafts") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) allHtmlFiles(p, acc);
    else if (name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

function checkPage(relPath) {
  const abs = join(ROOT, relPath);
  if (!existsSync(abs)) {
    FAIL("file", `ファイルが無い: ${relPath}`);
    return;
  }
  const html = readFileSync(abs, "utf8");
  const url = `${ORIGIN}/${relPath.replace(/\\/g, "/")}`;
  const pick = (re) => (html.match(re) || [])[1];

  // 旧URL用のリダイレクトスタブ（meta refresh）は記事ではないので検証対象外
  if (/<meta http-equiv="refresh"/i.test(html)) {
    const to = pick(/<link rel="canonical" href="([^"]+)"/) || "(canonical無し)";
    if (to === "(canonical無し)") WARN("redirect", "リダイレクトスタブにcanonicalが無い");
    else PASS("redirect", `リダイレクトスタブ → ${to}`);
    return;
  }

  // ---- 1. インデックス可否 ----
  if (/noindex/i.test(html)) FAIL("noindex", "noindexが残っている（下書きのまま公開している）");
  else PASS("noindex", "インデックス可");
  if (/<html[^>]+lang="ja"/.test(html)) PASS("lang", 'lang="ja"');
  else WARN("lang", 'html lang="ja" が無い');

  // ---- 2. title ----
  const title = pick(/<title>([\s\S]*?)<\/title>/);
  if (!title) FAIL("title", "titleが無い");
  else {
    const L = visualLen(title);
    if (L > 35) WARN("title", `${L}文字。検索結果で末尾が切れる（推奨30〜35）: ${title}`);
    else PASS("title", `${L}文字: ${title}`);
  }

  // ---- 3. meta description ----
  const desc = pick(/<meta name="description" content="([\s\S]*?)"/);
  if (!desc) FAIL("description", "meta descriptionが無い");
  else {
    const L = visualLen(desc);
    if (L < 60 || L > 140) WARN("description", `${L}文字（推奨80〜140）`);
    else PASS("description", `${L}文字`);
  }

  // ---- 4. canonical ----
  const canon = pick(/<link rel="canonical" href="([^"]+)"/);
  if (!canon) FAIL("canonical", "canonicalが無い");
  else if (canon !== url) FAIL("canonical", `URL不一致\n      canonical: ${canon}\n      実パス:    ${url}`);
  else PASS("canonical", canon);

  // ---- 5. OGP / Twitter ----
  const ogImg = pick(/<meta property="og:image" content="([^"]+)"/);
  for (const k of ["og:type", "og:title", "og:description", "og:url", "og:site_name", "og:locale"]) {
    if (html.includes(`property="${k}"`)) PASS(k, "あり");
    else WARN(k, "無し");
  }
  if (!ogImg) FAIL("og:image", "og:imageが無い");
  else if (!ogImg.startsWith(ORIGIN)) {
    WARN("og:image", `自ドメイン外の画像を使っている（他人のサムネはNG）: ${ogImg}`);
  } else {
    const imgRel = ogImg.replace(`${ORIGIN}/`, "");
    const imgAbs = join(ROOT, imgRel);
    if (!existsSync(imgAbs)) FAIL("og:image", `画像ファイルが無い: ${imgRel}`);
    else {
      const w = Number(pick(/<meta property="og:image:width" content="(\d+)"/));
      const h = Number(pick(/<meta property="og:image:height" content="(\d+)"/));
      const kb = statSync(imgAbs).size / 1024;
      if (!w || !h) WARN("og:image", "og:image:width/height の指定が無い");
      else if (w < 1200 || h < 630) WARN("og:image", `${w}x${h} は小さい（推奨1200x630以上）`);
      else PASS("og:image", `${w}x${h} / ${kb.toFixed(0)}KB / 自ドメイン`);
      if (kb > 800) WARN("og:image", `${kb.toFixed(0)}KB は重い（1MB未満に）`);
    }
  }
  if (/name="twitter:card" content="summary_large_image"/.test(html)) PASS("twitter:card", "summary_large_image");
  else WARN("twitter:card", "summary_large_image が無い");

  // ---- 6. 構造化データ ----
  const blocks = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)];
  if (!blocks.length) FAIL("json-ld", "JSON-LDが無い");
  let article = null, hasBreadcrumb = false, hasFaq = false;
  for (const [, raw] of blocks) {
    let data;
    try { data = JSON.parse(raw); } catch (e) { FAIL("json-ld", `JSONが壊れている: ${e.message}`); continue; }
    for (const node of data["@graph"] || [data]) {
      if (node["@type"] === "Article" || node["@type"] === "BlogPosting") article = node;
      if (node["@type"] === "BreadcrumbList") hasBreadcrumb = true;
      if (node["@type"] === "FAQPage") hasFaq = true;
    }
  }
  if (!article) FAIL("json-ld", "Article スキーマが無い");
  else {
    const need = ["headline", "author", "publisher", "datePublished", "dateModified", "mainEntityOfPage", "image", "inLanguage"];
    const miss = need.filter((k) => !article[k]);
    if (miss.length) WARN("json-ld", `Articleに不足: ${miss.join(", ")}`);
    else PASS("json-ld", "Article 必須項目そろっている");
    if (article.dateModified && article.datePublished && article.dateModified < article.datePublished)
      FAIL("json-ld", "dateModified が datePublished より古い");
  }
  hasBreadcrumb ? PASS("breadcrumb", "BreadcrumbList あり")
                : WARN("breadcrumb", "BreadcrumbList が無い（パンくずを表示しているなら入れる）");
  if (hasFaq) PASS("faq", "FAQPage あり（AI検索向けの資産）");

  // ---- 7. 見出し ----
  const h1 = [...html.matchAll(/<h1[\s>]/g)].length;
  if (h1 === 1) PASS("h1", "1つ");
  else FAIL("h1", `${h1}個ある（1つにする）`);
  const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  let skip = null, prev = 0;
  for (const l of levels) { if (prev && l > prev + 1) { skip = `h${prev}→h${l}`; break; } prev = l; }
  skip ? WARN("見出し階層", `レベルが飛んでいる: ${skip}`) : PASS("見出し階層", "飛びなし");

  // ---- 8. 目次と見出しの整合 ----
  const toc = [...html.matchAll(/<a href="#([\w-]+)">([^<]+)<\/a>/g)];
  const heads = Object.fromEntries(
    [...html.matchAll(/<h2 id="([\w-]+)"[^>]*>([\s\S]*?)<\/h2>/g)]
      .map(([, id, t]) => [id, t.replace(/<[^>]*>/g, "").replace(/^\d+\.\s*/, "").trim()])
  );
  const mism = toc.filter(([, id, label]) => heads[id] && !heads[id].includes(label.trim()) && !label.trim().includes(heads[id]));
  if (!toc.length) WARN("目次", "目次アンカーが無い");
  else if (mism.length) WARN("目次", `見出しと文言が食い違う: ${mism.map((m) => m[2]).join(" / ")}`);
  else PASS("目次", `${toc.length}項目、見出しと一致`);

  // ---- 9. 画像（記事本文内のみ。ヘッダーのロゴ等サイト共通パーツは対象外） ----
  const body = (html.match(/<article[\s\S]*?<\/article>/) || [html])[0];
  const imgs = [...body.matchAll(/<img\s[^>]*>/g)].map((m) => m[0]);
  const noAlt = imgs.filter((t) => !/alt="[^"]+"/.test(t));
  const noDim = imgs.filter((t) => !/width="\d+"/.test(t) || !/height="\d+"/.test(t));
  const raster = imgs.filter((t) => /src="[^"]+\.(png|jpe?g)"/i.test(t) && !/ogp-/.test(t));
  noAlt.length ? FAIL("img alt", `${noAlt.length}/${imgs.length}枚にaltが無い`) : PASS("img alt", `${imgs.length}枚すべてalt付き`);
  noDim.length ? WARN("img 寸法", `${noDim.length}枚にwidth/heightが無い（CLSの原因）`) : PASS("img 寸法", "全て指定あり");
  raster.length ? WARN("img 形式", `${raster.length}枚がPNG/JPEGのまま（WebP化で約8割削減）`) : PASS("img 形式", "WebP化済み");

  // ---- 10. 内部リンク（この記事への被リンク） ----
  const base = relPath.split(/[\\/]/).pop();
  const inbound = allHtmlFiles().filter((f) => f !== abs && readFileSync(f, "utf8").includes(base));
  if (inbound.length === 0) FAIL("内部リンク", "どこからもリンクされていない（孤立ページ）");
  else if (inbound.length < 3) WARN("内部リンク", `${inbound.length}本のみ。関連記事から増やす`);
  else PASS("内部リンク", `${inbound.length}本: ${inbound.map((f) => relative(ROOT, f)).join(", ")}`);

  // ---- 11. sitemap ----
  const smPath = join(ROOT, "sitemap.xml");
  if (!existsSync(smPath)) WARN("sitemap", "sitemap.xmlが無い");
  else {
    const sm = readFileSync(smPath, "utf8");
    if (!sm.includes(url)) FAIL("sitemap", "sitemapに未登録");
    else {
      const seg = sm.split("<url>").find((s) => s.includes(url)) || "";
      const lastmod = (seg.match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1];
      if (article?.dateModified && lastmod !== article.dateModified)
        WARN("sitemap", `lastmod(${lastmod}) が dateModified(${article.dateModified}) と不一致`);
      else PASS("sitemap", `登録済み lastmod=${lastmod}`);
    }
  }

  // ---- 12. llms.txt（AI検索対策） ----
  const llmsPath = join(ROOT, "llms.txt");
  if (!existsSync(llmsPath)) WARN("llms.txt", "llms.txtが無い");
  else if (!readFileSync(llmsPath, "utf8").includes(url))
    WARN("llms.txt", "この記事がllms.txtに載っていない（AI検索の流入を取り逃す）");
  else PASS("llms.txt", "記載あり");
}

// ---- 実行 ----
const args = process.argv.slice(2);
let targets = [];
if (args[0] === "--all") {
  targets = allHtmlFiles()
    .map((f) => relative(ROOT, f).replace(/\\/g, "/"))
    .filter((f) => /\/(guide|video)-[^/]+\.html$/.test("/" + f));
} else if (args.length) {
  targets = args.map((a) => a.replace(/\\/g, "/").replace(new RegExp("^" + ROOT.replace(/\\/g, "/") + "/"), ""));
} else {
  console.error("使い方: node scripts/seo-check.mjs <記事パス> | --all");
  process.exit(2);
}

let totalFail = 0;
for (const t of targets) {
  results.length = 0;
  checkPage(t);
  const fails = results.filter((r) => r.level === "FAIL").length;
  const warns = results.filter((r) => r.level === "WARN").length;
  totalFail += fails;
  const mark = fails ? "NG" : warns ? "OK(要改善)" : "OK";
  console.log(`\n=== ${t}  [${mark}]  FAIL:${fails} WARN:${warns} ===`);
  for (const r of results) {
    if (targets.length > 1 && r.level === "PASS") continue; // 一括時はPASSを省略
    console.log(`  [${r.level}] ${r.label}: ${r.msg}`);
  }
}
console.log(`\n${targets.length}ページ検証。FAIL合計: ${totalFail}`);
process.exit(totalFail ? 1 : 0);
