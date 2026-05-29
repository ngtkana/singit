# Singit

歌ってみた曲候補管理アプリ

## 技術スタック

- **フロントエンド**: Vite + vanilla TypeScript + Tailwind CSS
- **バックエンド**: Firebase Functions
- **データベース**: Firestore
- **認証**: Firebase Authentication
- **ホスティング**: Firebase Hosting
- **Chrome拡張**: Manifest V3

## セットアップ

### 1. 依存関係のインストール

```bash
# フロントエンド
npm install

# Firebase Functions
cd functions
npm install
cd ..
```

### 2. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、Firebase Consoleから取得した値を設定してください。

```bash
cp .env.local.example .env.local
```

### 3. Firebase Emulatorの起動

```bash
firebase emulators:start
```

### 4. 開発サーバーの起動

別ターミナルで：

```bash
npm run dev
```

http://localhost:5173 でアプリにアクセスできます。

## 開発コマンド

```bash
# フロントエンド開発サーバー
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview

# Firebase Emulator起動
firebase emulators:start

# Firebase デプロイ
firebase deploy
```

## プロジェクト構成

```
.
├── public/               # 静的ファイル
├── src/
│   ├── pages/           # ページコンポーネント
│   ├── components/      # 再利用可能なコンポーネント
│   ├── lib/
│   │   ├── firebase/   # Firebase関連
│   │   └── utils/      # ユーティリティ関数
│   ├── types/          # TypeScript型定義
│   └── styles/         # スタイルシート
├── functions/           # Firebase Functions
│   └── src/
│       ├── extension/  # Chrome拡張用API
│       ├── metadata/   # メタデータ取得
│       └── lib/        # 共通ライブラリ
└── extension/           # Chrome拡張
```

## ライセンス

MIT
