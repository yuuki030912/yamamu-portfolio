# YouTube公式字幕をGitHub Actionsで取得する設定

GitHub共有IPではYouTubeの通常ページがブロックされることがあるため、このワークフローは所有チャンネルの字幕をYouTube Data APIから取得できます。

## 必要な設定

1. Google CloudでYouTube Data API v3を有効にする。
2. OAuth同意画面を設定し、YouTubeチャンネルを所有するGoogleアカウントで `https://www.googleapis.com/auth/youtube.force-ssl` を許可する。
3. オフラインアクセスで取得したOAuthクライアントID、クライアントシークレット、リフレッシュトークンをGitHubリポジトリの `Settings → Secrets and variables → Actions` に登録する。

| GitHub Actions secret | 内容 |
|---|---|
| `YOUTUBE_OAUTH_CLIENT_ID` | Google OAuthクライアントID |
| `YOUTUBE_OAUTH_CLIENT_SECRET` | Google OAuthクライアントシークレット |
| `YOUTUBE_OAUTH_REFRESH_TOKEN` | `youtube.force-ssl` スコープを許可したリフレッシュトークン |

秘密値はファイルやコミットへ書かないでください。3つが揃っていない場合、ワークフローは公式APIを使わず、ログイン情報を必要としない字幕取得へ進みます。定期実行ではAPI枠を浪費しないため説明文だけのAI生成を省略し、手動実行時だけ説明文フォールバックを試します。

## 動作確認

GitHub Actionsの `New video → article draft` を手動実行し、ログに次の表示が出れば公式字幕を利用できています。

```text
字幕取得元: YouTube Data API (ja)
```

字幕がない動画や権限がない動画は、noindexの元下書きを維持します。本文は自動公開されず、事実校閲と品質ゲートを通過したものだけ確認用PRへ入ります。
