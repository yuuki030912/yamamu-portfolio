import test from "node:test";
import assert from "node:assert/strict";
import { canUseDescriptionSource, extractDraft, parseVtt, renderArticle, validateArticle, validateDescriptionGrounding } from "../scripts/enrich-video-article.mjs";

const paragraph = "実際の動画内で確認できるプレイ結果をもとに、強みだけでなく事故が起きた場面と判断理由まで具体的に整理します。検索から来た人が動画を見なくても結論を理解でき、詳しい動きを動画で確認できる内容です。";
const article = {
  seoTitle: "序盤攻略で失敗しないパートナーの選び方と実戦結果",
  metaDescription: "序盤攻略で役立つ選び方を、実際のプレイ結果と失敗した場面から詳しく解説。おすすめできる状況、正直な弱点、具体的な使い分け、重要な動画場面と判断理由までまとめます。",
  lead: paragraph.repeat(2),
  summaryPoints: [paragraph, paragraph, paragraph],
  moments: [{ timeSeconds: 62, label: "実戦開始", description: paragraph }],
  sections: Array.from({ length: 4 }, (_, index) => ({ heading: `具体的なポイント${index + 1}`, paragraphs: [paragraph.repeat(2), paragraph.repeat(2)], bullets: [paragraph] })),
  limitations: { heading: "正直な弱点", paragraphs: [paragraph.repeat(2), paragraph.repeat(2)] },
  recommendedFor: [paragraph, paragraph],
  notRecommendedFor: [paragraph, paragraph],
  faq: Array.from({ length: 3 }, (_, index) => ({ question: `質問${index + 1}は？`, answer: paragraph.repeat(2) })),
  conclusion: paragraph.repeat(2),
};

test("VTTから重複を抑えて字幕区間を取り出す", () => {
  const cues = parseVtt(`WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nこんにちは\n\n00:00:02.000 --> 00:00:03.000\nこんにちは\n\n00:01:05.000 --> 00:01:07.000\n<strong>結論です</strong>`);
  assert.deepEqual(cues, [{ start: 1, text: "こんにちは" }, { start: 65, text: "結論です" }]);
});

test("下書きHTMLから動画情報を抽出する", () => {
  const draft = extractDraft(`<div data-video-id="abc123"></div><h1 class="video-detail-title">タイトル&amp;検証</h1><div class="video-detail-meta"><span>2026-07-22</span></div><section class="draft-src"><p>説明1</p><p>説明2</p></section>`);
  assert.equal(draft.id, "abc123");
  assert.equal(draft.title, "タイトル&検証");
  assert.equal(draft.description, "説明1\n説明2");
});

test("十分な説明文とチャプターだけを字幕なし記事の根拠にできる", () => {
  const detailed = `${"具体的な動画説明です。".repeat(30)}\n0:00 デッキ紹介\n1:20 対戦1\n5:40 対戦2`;
  const source = canUseDescriptionSource(detailed);
  assert.equal(source.ok, true);
  assert.equal(source.chapters, 3);
  assert.equal(canUseDescriptionSource("短い説明\n0:00 紹介").ok, false);
});

test("内容の薄い記事は品質ゲートで落とす", () => {
  const result = validateArticle({ seoTitle: "短い", metaDescription: "短い", lead: "短い" });
  assert.equal(result.ok, false);
  assert.ok(result.errors.length >= 5);
});

test("説明文にないゲーム効果や評価語を検出する", () => {
  const errors = validateDescriptionGrounding({ ...article, conclusion: `${article.conclusion} 高耐久の相手には火力不足です。` }, "動画では対戦結果を紹介します。");
  assert.ok(errors.some((error) => error.includes("耐久")));
  assert.ok(errors.some((error) => error.includes("火力")));
  assert.deepEqual(validateDescriptionGrounding({ ...article, conclusion: `${article.conclusion} 高耐久です。` }, "高耐久の動きを検証します。"), []);
});

test("十分な記事をHTMLへ安全に変換する", () => {
  const quality = validateArticle(article);
  assert.equal(quality.ok, true, quality.errors.join(" / "));
  const html = renderArticle({ ...article, lead: `${article.lead}<script>alert(1)</script>` }, { videoId: "abc123" });
  assert.match(html, /AI_ARTICLE_START/);
  assert.match(html, /よくある質問/);
  assert.match(html, /watch\?v=abc123&amp;t=62s|watch\?v=abc123&t=62s/);
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;script&gt;alert/);
});
