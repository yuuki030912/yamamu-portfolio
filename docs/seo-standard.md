# 記事SEOの標準（新規記事はこれを満たしてから公開）

検証は自動化してある。**公開前に必ず通す**：

```bash
node scripts/seo-check.mjs pokepoke/guide-xxx.html   # 単体
node scripts/seo-check.mjs --all                      # サイト全体
```

FAIL が 0 になるまで commit しない。WARN は理由があれば残してよい。
（`meta http-equiv="refresh"` のリダイレクトスタブは自動で対象外になる）

---

## 必須（FAIL＝公開不可）

| 項目 | 基準 |
|---|---|
| noindex | 残っていないこと。自動生成の下書きは仕上げ時に noindex・🚧バナー・元説明文ブロックの3点を外す |
| title | 存在する。**全角30〜35文字**（それ以上は検索結果で末尾が切れる。`｜やまむー`は入らないなら削る） |
| meta description | 存在する。全角80〜140文字 |
| canonical | 実際の公開URLと完全一致（サブディレクトリの付け忘れが起きやすい） |
| og:image | **自ドメインの画像**。他人のYouTubeサムネを流用しない。1200×630以上、1MB未満 |
| JSON-LD | Article必須（headline / author / publisher / datePublished / dateModified / mainEntityOfPage / image / inLanguage） |
| h1 | ページに1つだけ |
| sitemap.xml | URL登録済み。`lastmod` は Article の `dateModified` と一致させる |
| 内部リンク | 最低1本、できれば3本以上。孤立ページを作らない |

## 推奨（WARN）

- **BreadcrumbList** — パンくずを表示しているなら構造化データも入れる
- **FAQPage** — Googleのリッチリザルトは2023年に大幅縮小したので順位効果は薄いが、**AI検索（ChatGPT / Perplexity / AI Overviews）に読ませる資産**として有効
- **og:image:width / height / alt**、twitter:card は `summary_large_image`
- **画像はWebP**（PNG比で約8割削減。`Image.save(..., "WEBP", quality=84, method=6)`）
- 画像に **width / height 属性**（CLS対策）と alt
- **目次の文言と実際のh2を一致させる**（片方だけ書き換えると食い違う）
- 見出しレベルを飛ばさない（h2→h4など）
- **llms.txt に記事を追記**（AI検索の流入源。ゲームのセクションが無ければ新設する）

## 更新したとき

内容を直したら**必ず3点セットで更新**する。どれか1つ忘れると鮮度シグナルが噛み合わない。

1. Article の `dateModified`
2. sitemap.xml の `lastmod`
3. 本文の「◯年◯月◯日更新」表示

## 時事ネタ記事（新パック・アップデート等）の勝ち筋

大手（GameWith / game8 / AppMedia）は当日中に公開するので、ビッグワード正面勝負は不利。狙うのは**ロングテールの疑問形**：

- 「〇〇 いつから」「〇〇 何時」
- 「〇〇 強い？」「〇〇 当たり」
- 「〇〇 やるべきこと」「温存 すべき」

→ FAQセクションをその文言で作る。h2も説明調より疑問形に寄せると拾われやすい。
→ 差別化は**一次情報**（実際にプレイした考察・動画）。記事冒頭に動画を埋めて「自分で触った上での結論」を明示する。
