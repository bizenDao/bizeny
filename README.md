# Bizeny彰子 LP サイト

Bizeny彰子（ビゼニー・アキコ）のランディングページ＆チャットボット。

**URL:** https://corp.bon-soleil.com/bizeny/

## キャラクター概要

- **名前:** Bizeny彰子（ビゼニー・アキコ）
- **役割:** BizenDAO マスコット / ナビゲーター ＋ 独立したアーティストIP
- **設定:** フランス人の父と日本人の母を持つ、備前市在住の陶芸家
- **性格:** 丁寧語、フランス語混じり、備前焼に情熱的、カジュアル口語は苦手

## サイト構成

```
bizeny/
├── index.html          # LP（Hero, About, 備前焼の魅力, Gallery, BizenDAO, Quote, Profile）
├── persona.txt         # チャットボットのシステムプロンプト（彰子のペルソナ定義）
├── favicon.ico
├── css/
│   ├── style.css       # メインスタイル（暖色ベージュ、Noto Serif JP + Cormorant Garamond）
│   └── chat.css        # チャットウィジェットスタイル
├── js/
│   └── chat.js         # チャットウィジェット（API通信、アバター付きメッセージ）
├── api/
│   ├── chat.py         # Flask API（Gemini 2.5 Flash、ポート8788）
│   └── serve.py        # 開発用サーバー（静的 + API、ポート8787）
├── knowledge/
│   └── bizennft.md     # RAGナレッジ
└── images/
    ├── bizenyakiko.jpg              # メインビジュアル
    ├── bizenyakiko_charsheet_v4.jpg # 公式キャラクターシート（3面図）
    ├── akiko_face.jpg               # アバター（charsheet_v4からクロップ）
    ├── hero_kiln.jpg                # ヒーロー背景: 窯
    ├── hero_workshop.jpg            # ヒーロー背景: 工房
    ├── hero_townscape.jpg           # ヒーロー背景: 街並み
    ├── gallery_wheel.jpg            # ギャラリー: ろくろ
    ├── gallery_kiln_out.jpg         # ギャラリー: 窯出し
    ├── gallery_works.jpg            # ギャラリー: 作品群
    ├── gallery_shelf.jpg            # ギャラリー: 棚
    ├── gallery_walk.jpg             # ギャラリー: 散歩
    ├── web3_hakogaki_v2.jpg         # BizenDAO概念図
    └── BizenNFT26.pdf               # BizenDAO/NFT資料
```

## チャットボット

彰子と会話できるチャットウィジェットがサイト右下に常駐。

- **バックエンド:** Flask + Google Gemini 2.5 Flash API
- **ペルソナ:** `persona.txt` をシステムプロンプトとして読み込み
- **会話履歴:** 直近20ターンを保持
- **設定:** temperature 0.8、max 300 tokens
- **UI:** アバター + 吹き出し CTA（ふわふわアニメーション）、メッセージごとに顔アイコン表示

### systemd サービス

```bash
sudo systemctl status bizeny-chat   # ステータス確認
sudo systemctl restart bizeny-chat  # 再起動
sudo systemctl stop bizeny-chat     # 停止
```

サービス定義: `/etc/systemd/system/bizeny-chat.service`

### Apache リバースプロキシ

`/etc/httpd/conf.d/corp-le-ssl.conf` にて:

```
ProxyPass /bizeny/api/ http://127.0.0.1:8788/api/
ProxyPassReverse /bizeny/api/ http://127.0.0.1:8788/api/
```

※ `/bizeny/api/` は既存の `/api/` ルールより**前**に配置すること。

## デプロイ

EC2上で直接配信。corporate サイトからシンボリックリンク:

```
/home/ec2-user/corporate/bizeny -> ../tools/bizeny
```

ファイルを編集すれば即反映（ビルド不要）。

## デザイン

- **カラー:** 暖色ベージュパレット（#faf6f0 背景、#8b4c2a アクセント）
- **フォント:** Noto Serif JP（本文）+ Cormorant Garamond（装飾）
- **アニメーション:** スクロールフェードイン、ヒーロー背景クロスフェード（5秒間隔）
- **レスポンシブ:** モバイル対応済み

## 画像生成ルール

- **キャラクターシート:** `bizenyakiko_charsheet_v4.jpg` が公式（変更時は必ず確認）
- **作業シーン:** 同じ衣装 + エプロン
- **画像生成モデル:**
  - テキスト入り → `gemini-3-pro-image-preview`
  - テキストなし → `gemini-2.5-flash-image`
- **アスペクト比:** ヒーロー画像 1376x768（横長）、ギャラリー 1024x1024（正方形）
- **参考画像:** 実際の備前焼写真をリファレンスに使うとリアルな仕上がりに
- **図の構造:** Mermaid記法でレイアウト指定 → Gemini生成（自然言語より精度高い）

## 関連プロジェクト

- **BizenDAO:** https://bizendao.github.io/ （NFT dapp）
- **BizenDAO リポジトリ:** `/home/ec2-user/tools/bizendao.github.io/`
- **nanobanana:** 画像生成スキル（Gemini API）
