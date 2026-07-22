// noindex の動画記事下書きを、字幕に基づく内容の濃い攻略記事へ変換する。
// GitHub Actions では GITHUB_TOKEN の models:read 権限で GitHub Models を利用する。
// 本文は必ず noindex のままPRに出し、人間が動画と照合してから公開する。

import { access, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PROMPT_PATH = join(ROOT, "prompts", "video-article-system.md");
const MODEL = process.env.ARTICLE_MODEL || "openai/gpt-4.1";
const TOKEN = process.env.GH_MODELS_TOKEN || process.env.GITHUB_TOKEN || "";
const DRY_RUN = process.env.ARTICLE_DRY_RUN === "1";
const ONLY_VIDEO = process.env.ONLY_VIDEO || "";
const MIN_TRANSCRIPT_CHARS = 800;
const MIN_ARTICLE_CHARS = 2200;

const GAME_DIRS = ["palworld", "pokepoke"];

function decodeHtml(value) {
  return String(value || "")
    .replace(/&#x([0-9a-f]+);/gi, (_, c) => String.fromCodePoint(parseInt(c, 16)))
    .replace(/&#(\d+);/g, (_, c) => String.fromCodePoint(parseInt(c, 10)))
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

export function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function stripHtml(value) {
  return decodeHtml(String(value || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " "))
    .replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function exists(path) {
  return access(path, constants.F_OK).then(() => true, () => false);
}

function parseClock(value) {
  const parts = value.replace(",", ".").split(":").map(Number);
  if (parts.some(Number.isNaN)) return 0;
  if (parts.length === 3) return Math.round(parts[0] * 3600 + parts[1] * 60 + parts[2]);
  return Math.round(parts[0] * 60 + parts[1]);
}

function clock(seconds) {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
}

export function parseVtt(raw) {
  const cues = [];
  for (const block of String(raw || "").replace(/\r/g, "").split(/\n{2,}/)) {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const timingIndex = lines.findIndex((line) => line.includes(" --> "));
    if (timingIndex < 0) continue;
    const start = parseClock(lines[timingIndex].split(" --> ")[0]);
    const text = decodeHtml(lines.slice(timingIndex + 1).join(" ")
      .replace(/<\d\d:\d\d(?::\d\d)?\.\d+>/g, " ").replace(/<[^>]+>/g, " "))
      .replace(/\s+/g, " ").trim();
    if (!text) continue;
    const previous = cues.at(-1);
    if (previous?.text === text) continue;
    if (previous && start - previous.start <= 3 && text.startsWith(previous.text)) {
      cues[cues.length - 1] = { start: previous.start, text };
      continue;
    }
    cues.push({ start, text });
  }
  return cues;
}

async function fetchTranscript(videoId) {
  const temp = await mkdtemp(join(tmpdir(), "yamamu-captions-"));
  try {
    const output = join(temp, "%(id)s.%(ext)s");
    const commonArgs = [
      "--no-playlist", "--skip-download", "--write-subs", "--write-auto-subs",
      "--sub-langs", "ja.*,ja,en.*", "--sub-format", "vtt", "--no-warnings",
      "--extractor-args", "youtubepot-bgutilhttp:base_url=http://127.0.0.1:4416",
      "-o", output,
    ];
    // GitHub-hosted runners are sometimes blocked by YouTube. Try the official
    // yt-dlp client fallbacks without passing a creator account cookie.
    const clients = [
      "web;fetch_pot=always",
      "mweb;fetch_pot=always",
      "web_embedded",
      "android_vr",
    ];
    let lastError;
    for (const client of clients) {
      try {
        await execFileAsync("yt-dlp", [
          ...commonArgs,
          "--extractor-args", `youtube:player_client=${client}`,
          `https://www.youtube.com/watch?v=${videoId}`,
        ], { timeout: 120_000, maxBuffer: 4 * 1024 * 1024 });
        const files = (await readdir(temp)).filter((file) => file.endsWith(".vtt"))
          .sort((a, b) => Number(!/\.ja(?:[.-]|$)/i.test(a)) - Number(!/\.ja(?:[.-]|$)/i.test(b)));
        if (files.length) {
          console.log(`  字幕取得クライアント: ${client.split(";")[0]}`);
          return parseVtt(await readFile(join(temp, files[0]), "utf8"));
        }
      } catch (error) {
        lastError = error;
      }
    }
    if (lastError) console.warn(`  ⚠ 字幕取得失敗: ${lastError.message}`);
    return [];
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

export function extractDraft(html, path = "") {
  const id = html.match(/data-video-id="([^"]+)"/)?.[1] || "";
  const title = stripHtml(html.match(/<h1 class="video-detail-title">([\s\S]*?)<\/h1>/)?.[1] || "");
  const descriptionBlock = html.match(/<section class="draft-src">([\s\S]*?)<\/section>/)?.[1] || "";
  const description = [...descriptionBlock.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((match) => stripHtml(match[1])).filter(Boolean).join("\n");
  const published = html.match(/<div class="video-detail-meta">[\s\S]*?<span>(\d{4}-\d{2}-\d{2})<\/span>/)?.[1] || "";
  return { id, title, description, published, path };
}

function normalizeArticle(value) {
  const a = value && typeof value === "object" ? value : {};
  return {
    seoTitle: String(a.seoTitle || "").trim(),
    metaDescription: String(a.metaDescription || "").trim(),
    lead: String(a.lead || "").trim(),
    summaryPoints: Array.isArray(a.summaryPoints) ? a.summaryPoints.map(String).map((v) => v.trim()).filter(Boolean) : [],
    moments: Array.isArray(a.moments) ? a.moments.map((m) => ({ timeSeconds: Math.max(0, Math.round(Number(m?.timeSeconds) || 0)), label: String(m?.label || "").trim(), description: String(m?.description || "").trim() })).filter((m) => m.label && m.description) : [],
    sections: Array.isArray(a.sections) ? a.sections.map((s) => ({ heading: String(s?.heading || "").trim(), paragraphs: Array.isArray(s?.paragraphs) ? s.paragraphs.map(String).map((v) => v.trim()).filter(Boolean) : [], bullets: Array.isArray(s?.bullets) ? s.bullets.map(String).map((v) => v.trim()).filter(Boolean) : [] })).filter((s) => s.heading && s.paragraphs.length) : [],
    limitations: { heading: String(a.limitations?.heading || "正直な弱点・注意点").trim(), paragraphs: Array.isArray(a.limitations?.paragraphs) ? a.limitations.paragraphs.map(String).map((v) => v.trim()).filter(Boolean) : [] },
    recommendedFor: Array.isArray(a.recommendedFor) ? a.recommendedFor.map(String).map((v) => v.trim()).filter(Boolean) : [],
    notRecommendedFor: Array.isArray(a.notRecommendedFor) ? a.notRecommendedFor.map(String).map((v) => v.trim()).filter(Boolean) : [],
    faq: Array.isArray(a.faq) ? a.faq.map((f) => ({ question: String(f?.question || "").trim(), answer: String(f?.answer || "").trim() })).filter((f) => f.question && f.answer) : [],
    conclusion: String(a.conclusion || "").trim(),
  };
}

function articleText(article) {
  return [article.lead, ...article.summaryPoints, ...article.moments.flatMap((m) => [m.label, m.description]), ...article.sections.flatMap((s) => [s.heading, ...s.paragraphs, ...s.bullets]), ...article.limitations.paragraphs, ...article.recommendedFor, ...article.notRecommendedFor, ...article.faq.flatMap((f) => [f.question, f.answer]), article.conclusion].join("\n");
}

export function validateArticle(input) {
  const article = normalizeArticle(input);
  const errors = [];
  const length = articleText(article).replace(/\s/g, "").length;
  if (article.seoTitle.length < 15 || article.seoTitle.length > 60) errors.push("SEOタイトルは15〜60文字にする");
  if (article.metaDescription.length < 70 || article.metaDescription.length > 170) errors.push("メタ説明は70〜170文字にする");
  if (article.lead.length < 120) errors.push("導入文が短すぎる");
  if (article.summaryPoints.length < 3) errors.push("要点が3件未満");
  if (article.sections.length < 4) errors.push("本文見出しが4件未満");
  if (article.sections.some((s) => s.paragraphs.length < 2)) errors.push("各見出しは原則2段落以上にする");
  if (article.limitations.paragraphs.length < 2) errors.push("弱点・注意点が不足");
  if (article.recommendedFor.length < 2 || article.notRecommendedFor.length < 2) errors.push("向く人・向かない人が不足");
  if (article.faq.length < 3) errors.push("FAQが3件未満");
  if (article.conclusion.length < 100) errors.push("結論が短すぎる");
  if (length < MIN_ARTICLE_CHARS) errors.push(`本文が短すぎる（${length}文字 / 最低${MIN_ARTICLE_CHARS}文字）`);
  return { ok: errors.length === 0, errors, article, length };
}

function safeJson(text) {
  const cleaned = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

async function generateArticle(draft, transcript, previousErrors = []) {
  if (!TOKEN) throw new Error("GH_MODELS_TOKEN がありません");
  const systemPrompt = await readFile(PROMPT_PATH, "utf8");
  const transcriptText = transcript.map((cue) => `[${clock(cue.start)}] ${cue.text}`).join("\n").slice(0, 60_000);
  const retry = previousErrors.length ? `\n前回の出力は次の品質基準を満たしませんでした。必ず修正してください。\n- ${previousErrors.join("\n- ")}` : "";
  const userPrompt = `次のYouTube動画を攻略記事にしてください。\n\n【動画タイトル】\n${draft.title}\n\n【公開日】\n${draft.published}\n\n【動画説明文】\n${draft.description || "（説明文なし）"}\n\n【字幕】\n${transcriptText}${retry}`;
  const response = await fetch("https://models.github.ai/inference/chat/completions", {
    method: "POST",
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json", "X-GitHub-Api-Version": "2026-03-10" },
    body: JSON.stringify({ model: MODEL, temperature: 0.2, max_tokens: 8000, response_format: { type: "json_object" }, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }] }),
  });
  if (!response.ok) throw new Error(`GitHub Models ${response.status}: ${(await response.text()).slice(0, 500)}`);
  const data = await response.json();
  return safeJson(data.choices?.[0]?.message?.content);
}

function list(items) {
  return `<ul style="margin:12px 0 20px; padding-left:1.4em; line-height:1.9;">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function paragraphList(items) {
  return items.map((item) => `      <p>${escapeHtml(item)}</p>`).join("\n");
}

export function renderArticle(articleInput, { videoId, related = [] } = {}) {
  const article = normalizeArticle(articleInput);
  const moments = article.moments.length ? `
      <h3>動画の重要ポイント</h3>
      <div style="overflow-x:auto"><table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">
        <thead><tr style="background:var(--accent); color:#fff;"><th style="padding:10px; text-align:left;">時間</th><th style="padding:10px; text-align:left;">内容</th></tr></thead>
        <tbody>${article.moments.map((m) => `<tr><td style="padding:10px; border:1px solid var(--border-color); white-space:nowrap;"><a href="https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&t=${m.timeSeconds}s" target="_blank" rel="noopener">${clock(m.timeSeconds)}</a></td><td style="padding:10px; border:1px solid var(--border-color);"><strong>${escapeHtml(m.label)}</strong><br>${escapeHtml(m.description)}</td></tr>`).join("")}</tbody>
      </table></div>` : "";
  const sections = article.sections.map((s) => `
      <h3>${escapeHtml(s.heading)}</h3>
${paragraphList(s.paragraphs)}
${s.bullets.length ? list(s.bullets) : ""}`).join("\n");
  const faq = article.faq.map((f, index) => `<details style="margin-bottom:12px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; overflow:hidden;"${index === 0 ? " open" : ""}><summary style="padding:12px 16px; font-size:15px; font-weight:600; cursor:pointer;">${escapeHtml(f.question)}</summary><p style="padding:0 16px 12px; line-height:1.8;">${escapeHtml(f.answer)}</p></details>`).join("\n");
  const relatedHtml = related.length ? `<section class="related-section"><h2 class="related-title">関連する攻略記事</h2><div class="related-grid">${related.map((r) => `<a href="${escapeHtml(r.href)}" class="video-card"><div class="video-info"><h3 class="video-title">${escapeHtml(r.title)}</h3><p class="video-meta">攻略記事</p></div></a>`).join("")}</div></section>` : "";
  return `<!-- AI_ARTICLE_START -->
  <section class="video-lead-section" style="max-width:960px; margin:24px auto; padding:0 24px;">
    <div style="background:var(--bg-card); border-left:4px solid var(--accent); border-radius:8px; padding:18px 22px;"><p style="margin:0; font-size:15px; line-height:1.9; font-weight:500;">${escapeHtml(article.lead)}</p></div>
  </section>
  <section class="video-content-section">
    <h2 class="video-content-heading">先に結論・動画の要点</h2>
    <div class="video-content-body">
${list(article.summaryPoints)}
      <p style="text-align:center; margin:24px 0;"><a href="https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}" target="_blank" rel="noopener" style="display:inline-block; padding:12px 20px; background:var(--accent); color:#fff; border-radius:8px; font-weight:700;">動画で実際のプレイを見る ↗</a></p>
${moments}
${sections}
      <div style="background:var(--chip-bg); border-left:4px solid #d97706; border-radius:8px; padding:16px 18px; margin:24px 0;"><h3 style="margin-top:0;">${escapeHtml(article.limitations.heading)}</h3>${paragraphList(article.limitations.paragraphs)}</div>
      <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:14px; margin:24px 0;"><div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; padding:16px;"><h3 style="margin-top:0;">こんな人・状況におすすめ</h3>${list(article.recommendedFor)}</div><div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; padding:16px;"><h3 style="margin-top:0;">おすすめしにくい人・状況</h3>${list(article.notRecommendedFor)}</div></div>
      <h3>結論</h3><p>${escapeHtml(article.conclusion)}</p>
      <p style="text-align:center; margin:28px 0 4px;"><a href="https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}" target="_blank" rel="noopener" style="display:inline-block; padding:12px 20px; background:var(--accent); color:#fff; border-radius:8px; font-weight:700;">動画を最初から見る ↗</a></p>
    </div>
  </section>
  <section class="faq-section" style="max-width:960px; margin:0 auto; padding:0 24px 32px;"><h2 style="font-size:18px; font-weight:700; margin-bottom:16px; padding-bottom:8px; border-bottom:2px solid var(--accent);">よくある質問</h2>${faq}</section>
  ${relatedHtml}
  <!-- AI_ARTICLE_END -->`;
}

async function relatedArticles(path) {
  const dir = dirname(path);
  const files = (await readdir(dir)).filter((name) => /^video-.*\.html$/.test(name) && name !== basename(path));
  const result = [];
  for (const name of files) {
    const html = await readFile(join(dir, name), "utf8");
    if (html.includes('<meta name="robots" content="noindex"')) continue;
    const title = stripHtml(html.match(/<h1 class="video-detail-title">([\s\S]*?)<\/h1>/)?.[1] || "");
    if (title) result.push({ href: name, title });
    if (result.length === 2) break;
  }
  return result;
}

function applyArticle(html, article, rendered) {
  const safeTitle = escapeHtml(article.seoTitle);
  const safeDescription = escapeHtml(article.metaDescription);
  let updated = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${safeTitle}｜やまむー</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${safeDescription}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${safeTitle}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${safeDescription}">`)
    .replace(/<h1 class="video-detail-title">[\s\S]*?<\/h1>/, `<h1 class="video-detail-title">${safeTitle}</h1>`)
    .replace(/<div class="draft-banner">[\s\S]*?<\/div>/, `<div class="draft-banner">🚧 <strong>字幕をもとにAIが作成した記事下書きです。</strong> 数値・固有名詞・プレイ結果を動画と照合してください。確認後に noindex、このバナー、元説明文ブロックを削除して公開します。</div>`);
  if (/<!-- AI_ARTICLE_START -->[\s\S]*?<!-- AI_ARTICLE_END -->/.test(updated)) {
    updated = updated.replace(/<!-- AI_ARTICLE_START -->[\s\S]*?<!-- AI_ARTICLE_END -->/, rendered);
  } else {
    updated = updated.replace(/\s*<!-- TODO:[\s\S]*?-->\s*/, `\n\n${rendered}\n\n`);
  }
  return updated;
}

async function findDrafts() {
  const drafts = [];
  for (const dir of GAME_DIRS) {
    const full = join(ROOT, dir);
    if (!(await exists(full))) continue;
    for (const file of await readdir(full)) {
      if (!/^video-.*\.html$/.test(file)) continue;
      const path = join(full, file);
      const html = await readFile(path, "utf8");
      if (!html.includes('<meta name="robots" content="noindex"')) continue;
      if (html.includes("<!-- AI_ARTICLE_START -->")) continue;
      const draft = extractDraft(html, path);
      if (!draft.id || !draft.title || (ONLY_VIDEO && draft.id !== ONLY_VIDEO)) continue;
      drafts.push({ ...draft, html });
    }
  }
  return drafts;
}

async function main() {
  const drafts = await findDrafts();
  if (!drafts.length) {
    console.log("内容生成が必要な noindex 下書きはありません。");
    if (process.env.GITHUB_OUTPUT) await writeFile(process.env.GITHUB_OUTPUT, "has_changes=false\n", { flag: "a" });
    return;
  }
  let changed = 0;
  for (const draft of drafts) {
    console.log(`\n記事化: ${relative(ROOT, draft.path)} (${draft.id})`);
    const transcript = await fetchTranscript(draft.id);
    const transcriptChars = transcript.map((cue) => cue.text).join("").length;
    console.log(`  字幕: ${transcript.length}区間 / ${transcriptChars}文字`);
    if (transcriptChars < MIN_TRANSCRIPT_CHARS) {
      console.warn(`  ⚠ 字幕が短いため本文を生成しません。noindex 下書きを維持します。`);
      continue;
    }
    try {
      let raw = await generateArticle(draft, transcript);
      let quality = validateArticle(raw);
      if (!quality.ok) {
        console.warn(`  再生成: ${quality.errors.join(" / ")}`);
        raw = await generateArticle(draft, transcript, quality.errors);
        quality = validateArticle(raw);
      }
      if (!quality.ok) {
        console.warn(`  ⚠ 品質基準未達のため採用しません: ${quality.errors.join(" / ")}`);
        continue;
      }
      const related = await relatedArticles(draft.path);
      const rendered = renderArticle(quality.article, { videoId: draft.id, related });
      const updated = applyArticle(draft.html, quality.article, rendered);
      if (!DRY_RUN) await writeFile(draft.path, updated, "utf8");
      changed += 1;
      console.log(`  ✓ ${quality.length}文字・${quality.article.sections.length}見出し・FAQ ${quality.article.faq.length}件`);
    } catch (error) {
      console.warn(`  ⚠ 記事生成失敗: ${error.message}`);
    }
  }
  if (process.env.GITHUB_OUTPUT) await writeFile(process.env.GITHUB_OUTPUT, `has_changes=${changed > 0}\nenriched_count=${changed}\n`, { flag: "a" });
  console.log(`\n内容の濃い記事下書きを ${changed} 件生成しました。${DRY_RUN ? "（DRY_RUN）" : ""}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
