# NAI画像生成プロンプト集 — 満員電車おじさんガチャ

NovelAIで以下プロンプトを順に投入し、生成画像をDLしたら指定のファイル名にリネームして
`C:\Users\yamau\Downloads\manin-densha-gacha\assets\` に入れてください。
（assets/に同名のpngを置くだけで自動的にゲームに反映されます）

設定推奨：
- モデル: NAI Diffusion V4.5 Full
- サイズ: Portrait (832×1216) または Square (1024×1024)
- ステップ: デフォルト
- 共通の末尾追加: `, anime style, portrait, head and shoulders, looking at viewer, simple flat background, centered composition`

---

## 1. `sweat.png` — 汗だくおじさん
```
1man, middle-aged japanese salaryman, sweating profusely, large beads of sweat dripping down face, exhausted tired expression, balding, wrinkled white dress shirt, loose dark tie, gross uncomfortable
```

## 2. `drunk.png` — 酒くさおじさん
```
1man, drunk middle-aged japanese salaryman, red flushed face, half-closed bleary eyes, dishevelled dark suit, loose loosened tie, drowsy slack expression, holding can of beer, stubble
```

## 3. `cough.png` — 咳しまくりおじさん
```
1man, middle-aged japanese man coughing into open palm, no mask, sickly pale appearance, runny nose, glasses, grey suit, sick germ, droplets spraying
```

## 4. `tiktok.png` — スマホ爆音おじさん
```
1man, middle-aged japanese man holding smartphone close to face, watching video loudly, no earphones, mischievous grin, balding head, polo shirt, sound waves emanating from phone
```

## 5. `perfume.png` — 香水きついおばさま
```
1woman, middle-aged japanese lady, heavy gaudy makeup, fancy curled hairstyle, ostentatious appearance, spraying perfume bottle, leopard print blouse, large gold jewelry, smug expression
```

## 6. `spread.png` — 足広げおじさん
```
1man, middle-aged japanese salaryman, manspreading, legs wide apart, smug arrogant expression, rough unkempt appearance, dark suit, sitting on train seat, taking up space
```

## 7. `sleep.png` — 寝落ち倒れおじさん
```
1man, middle-aged japanese salaryman fast asleep, head tilted back, mouth wide open, drool dripping, glasses sliding down nose, exhausted, dark suit, snoring
```

## 8. `highschool.png` — 高校生（無害）
```
1boy, young japanese high school student, school uniform blazer, looking down at smartphone, calm peaceful expression, short black hair, white earphones, neutral and harmless
```

## 9. `player.png` — プレイヤー（あなた／サラリーマン）
```
1man, young japanese salaryman in his late 20s, neat tidy appearance, mildly tired determined face, glasses, dark navy blue suit, red tie, short black hair, neutral hopeful expression, protagonist
```

---

## やり方（簡易フロー）

1. NovelAIの画面で 1つめのプロンプトをペースト → 1枚のみ生成（17 Anlas）
2. 生成された画像を保存 → ファイル名を `sweat.png` にリネーム
3. `C:\Users\yamau\Downloads\manin-densha-gacha\assets\` に移動
4. 次のプロンプトへ。9枚分繰り返し
5. すべて配置したら、`index.html` をリロード → 絵文字が画像に切り替わる

不要なら全部やらなくてもOK。1〜2枚あるだけでも雰囲気は出ます。
