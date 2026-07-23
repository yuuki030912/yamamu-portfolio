import test from "node:test";
import assert from "node:assert/strict";
import { applyArticle, buildGroundedFallbackArticle, canUseDescriptionSource, extractDraft, extractWatchDescription, parseVtt, renderArticle, selectCaptionTrack, validateArticle, validateDescriptionGrounding } from "../scripts/enrich-video-article.mjs";
import { buildDraft, GAMES } from "../scripts/new-video-article-draft.mjs";
import { VIDEO_ARTICLE_OVERRIDES } from "../scripts/video-article-overrides.mjs";

test("hidden属性付きの動画説明欄も記事ソースとして読み取る", () => {
  const draft = extractDraft(`<div data-video-id="hidden-source"></div><h1 class="video-detail-title">検証動画</h1><section class="draft-src" hidden data-article-source="youtube-description"><p>公式説明文</p><p>0:00 はじめに</p></section>`);
  assert.equal(draft.description, "公式説明文\n0:00 はじめに");
});

test("説明文にない弱点を断定しない注意書きは根拠違反にしない", () => {
  const safe = {
    ...article,
    limitations: { heading: "正直な弱点", paragraphs: ["説明文には不利な相手が書かれていません。", "動画本編で確認してください。"] },
    notRecommendedFor: ["不利な相手まで記事だけで断定したい人", "動画を確認したくない人"],
  };
  assert.equal(validateDescriptionGrounding(safe, "動画ではデッキを検証します。2026年版です。").some((error) => error.includes("不利")), false);
});

test("外部AIが使えなくても説明文とチャプターから濃い記事を作る", () => {
  const description = [
    "結論：実際のプレイで新しい構成を検証し、成功と失敗の両方を紹介します。",
    "説明文にある事実だけを使って、見たい場面へ移動しやすくします。",
    "0:00 デッキ紹介",
    "1:20 対戦その1",
    "4:10 対戦その2",
    "8:30 失敗した場面",
    "12:00 まとめと評価",
  ].join("\n");
  const fallback = buildGroundedFallbackArticle({ title: "【テスト】新しい構成を実戦で検証した結果", description });
  const quality = validateArticle(fallback, { minChars: 2000 });
  assert.equal(quality.ok, true, quality.errors.join(" / "));
  assert.equal(validateDescriptionGrounding(fallback, description).length, 0);
  assert.doesNotMatch(JSON.stringify(fallback), /公式説明では|動画説明欄では|記事では|チャプター名では/);
});

test("既存8動画は検索意図別の専用記事を使う", () => {
  assert.equal(Object.keys(VIDEO_ARTICLE_OVERRIDES).length, 8);
  const titles = new Set();
  for (const [id, item] of Object.entries(VIDEO_ARTICLE_OVERRIDES)) {
    const quality = validateArticle(item, { minChars: 2000 });
    assert.equal(quality.ok, true, `${id}: ${quality.errors.join(" / ")}`);
    assert.doesNotMatch(JSON.stringify(item), /公式説明では|動画説明欄では|記事では|チャプター名では/);
    titles.add(item.seoTitle);
  }
  assert.equal(titles.size, 8);
});

test("旧記事を置き換えても次回用の動画説明文を非表示で保存する", () => {
  const legacy = '<h1 class="video-detail-title">旧記事</h1><section class="video-lead-section">旧本文</section><footer class="footer">footer</footer>';
  const rendered = renderArticle(article, { videoId: "source-test" });
  const updated = applyArticle(legacy, article, rendered, { sourceKind: "description", description: "公式説明\n0:00 はじめに\n1:00 まとめ" });
  assert.match(updated, /data-article-source="youtube-description"/);
  assert.match(updated, /<p>0:00 はじめに<\/p>/);
  assert.equal(extractDraft(`<div data-video-id="source-test"></div><h1 class="video-detail-title">保存確認</h1>${updated}`).description, "公式説明\n0:00 はじめに\n1:00 まとめ");
});

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

test("公式字幕では配信中の日本語手動トラックを優先する", () => {
  const selected = selectCaptionTrack([
    { id: "en", snippet: { status: "serving", language: "en", trackKind: "standard", isDraft: false } },
    { id: "ja-asr", snippet: { status: "serving", language: "ja", trackKind: "ASR", isDraft: false } },
    { id: "ja-manual", snippet: { status: "serving", language: "ja", trackKind: "standard", isDraft: false } },
    { id: "failed", snippet: { status: "failed", language: "ja", trackKind: "standard", isDraft: false } },
  ]);
  assert.equal(selected.id, "ja-manual");
});

test("十分な説明文とチャプターだけを字幕なし記事の根拠にできる", () => {
  const detailed = `${"具体的な動画説明です。".repeat(30)}\n0:00 デッキ紹介\n1:20 対戦1\n5:40 対戦2`;
  const source = canUseDescriptionSource(detailed);
  assert.equal(source.ok, true);
  assert.equal(source.chapters, 3);
  assert.equal(canUseDescriptionSource("短い説明\n0:00 紹介").ok, false);
});

test("YouTubeページから改行を含む最新説明文を取り出す", () => {
  const html = '<script>{"shortDescription":"結論：実戦解説です。\\n0:00 デッキ紹介\\n1:20 対戦①"}</script>';
  assert.equal(extractWatchDescription(html), "結論：実戦解説です。\n0:00 デッキ紹介\n1:20 対戦①");
  assert.equal(extractWatchDescription("説明文なし"), "");
});

test("イナイレ方式の自動記事化はポケポケとパルワールドだけを対象にする", () => {
  assert.deepEqual(Object.keys(GAMES).sort(), ["palworld", "pokepoke"]);
  for (const [key, title] of [
    ["palworld", "【パルワールド】初心者向け序盤攻略"],
    ["pokepoke", "【ポケポケ】新デッキを対戦で検証"],
  ]) {
    const cfg = GAMES[key];
    assert.equal(cfg.match(title), true);
    const draft = buildDraft(cfg, {
      id: `${key}-test`, title, description: "動画で実際の攻略手順を解説します。", published: "2026-07-22T00:00:00Z",
    });
    assert.match(draft, new RegExp(`video-${key}-${key}-test\\.html`));
    assert.match(draft, /meta name="robots" content="noindex"/);
  }
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

test("SEOタイトルとFAQ構造化データを記事本文と同期する", () => {
  const source = '<head><title>旧</title><meta name="description" content="旧"><meta property="og:title" content="旧"><meta property="og:description" content="旧"><meta name="twitter:title" content="旧"><script type="application/ld+json">{"@type":"Article","headline":"旧"}</script></head><h1 class="video-detail-title">旧</h1><footer class="footer"></footer>';
  const updated = applyArticle(source, article, renderArticle(article, { videoId: "seo-test" }));
  assert.match(updated, new RegExp(`<meta name="twitter:title" content="${article.seoTitle}">`));
  assert.match(updated, new RegExp(`"headline":"${article.seoTitle}"`));
  assert.match(updated, /id="article-faq-jsonld"/);
  assert.match(updated, /"@type":"FAQPage"/);
  assert.equal((updated.match(/article-faq-jsonld/g) || []).length, 1);
});

test("Article構造化データがない新着下書きにもSEO情報を補う", () => {
  const source = '<head><title>旧</title><meta name="description" content="旧"><meta property="og:title" content="旧"><meta property="og:description" content="旧"><meta property="og:image" content="https://img.youtube.com/test.jpg"><link rel="canonical" href="https://example.com/article"></head><h1 class="video-detail-title">旧</h1><footer class="footer"></footer>';
  const updated = applyArticle(source, article, renderArticle(article, { videoId: "new-draft" }));
  assert.match(updated, /id="article-metadata-jsonld"/);
  assert.match(updated, /<meta name="twitter:title"/);
  assert.match(updated, /"@type":"Article"/);
  assert.match(updated, /"mainEntityOfPage":\{"@type":"WebPage","@id":"https:\/\/example.com\/article"\}/);
});

test("旧方式の公開記事本文をAI記事へ重複なく置換する", () => {
  const legacy = '<title>旧タイトル</title><meta name="description" content="旧説明"><meta property="og:title" content="旧"><meta property="og:description" content="旧"><h1 class="video-detail-title">旧</h1><section class="video-lead-section">旧導入</section><section class="video-content-section">旧本文</section><section class="faq-section">旧FAQ</section><section class="related-section">旧関連記事</section><footer class="footer">フッター</footer>';
  const rendered = renderArticle(article, { videoId: "abc123" });
  const updated = applyArticle(legacy, article, rendered);
  assert.doesNotMatch(updated, /旧導入|旧本文|旧FAQ|旧関連記事/);
  assert.equal((updated.match(/AI_ARTICLE_START/g) || []).length, 1);
  assert.match(updated, /フッター/);
});
