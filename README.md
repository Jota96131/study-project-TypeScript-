# サービス名

StudyLog

# サービスの説明

学習内容と学習時間を記録・管理できるWebアプリケーションです。日々の学習をテーブル形式で一覧表示し、記録の追加・編集・削除が行えます。

## 主な機能

- 学習記録の一覧表示（テーブル形式）
- 新規記録の登録（学習内容・学習時間）
- 既存記録の編集
- 記録の削除

## 技術スタック

- React 19 / TypeScript
- Vite（ビルドツール）
- Chakra UI（UIコンポーネント）
- Supabase（データベース）
- Jest / React Testing Library（テスト）

## 環境設定

### 前提条件

- Node.js（v18以上推奨）
- npm

### 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、以下の変数を設定してください。

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 依存パッケージのインストール

```bash
npm install
```

## 起動方法

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスしてください。

### その他のコマンド

| コマンド          | 説明                   |
| ----------------- | ---------------------- |
| `npm run build`   | 本番用ビルド           |
| `npm run preview` | ビルド結果のプレビュー |
| `npm run lint`    | ESLintによるコード検査 |
| `npm run test`    | Jestによるテスト実行   |
