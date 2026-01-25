# 実装タスク (Implementation Tasks)

- [x] 1. プロジェクト初期化とインフラ構築 (#12)
- [x] 1.1 モノレポ構成と開発環境の確立 (#12)
  - git リポジトリの初期化とモノレポ構成 (`frontend/`, `backend/`)
  - `docker-compose.yml` の設定 (Next.js, FastAPI)
  - Supabase CLI を使用したローカル環境セットアップ (`supabase init`, `supabase start`)
  - ローカル開発用 `.env` ファイルの設定
  - _Requirements: 5.3_

- [x] 1.2 フロントエンド アプリケーションのセットアップ (P) (#12)
  - Next.js 16 プロジェクトの初期化 (TypeScript, App Router)
  - Tailwind CSS の設定
  - `next-intl` による国際化対応のセットアップ
  - レスポンシブ対応のベースレイアウト作成
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 1.3 バックエンド アプリケーションのセットアップ (P) (#12)
  - `uv` パッケージマネージャによる Python 3.14 プロジェクト初期化
  - FastAPI と標準依存ライブラリ (pydantic, uvicorn) のインストール
  - Supabase Python クライアントのインストール
  - 基本的な API エントリポイントとヘルスチェックエンドポイントの作成
  - _Requirements: 1.1_

- [x] 2. バックエンド実装: 認証とユーザー (#13)
- [x] 2.1 認証 API の実装 (#13)
  - ログイン・サインアップ用 Auth Router の作成
  - Supabase Auth との連携 (サインアップ、サインイン)
  - 保護ルート用 JWT 検証依存関係の実装
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4_

- [ ] 2.2 ユーザープロファイル API の実装 (#13)
  - プロファイル取得・更新用 User Router の作成
  - 現在のユーザー情報取得エンドポイント (`/users/me`)
  - ユーザープロファイル更新 (名前, アバター) とパスワード変更
  - アカウント削除エンドポイント
  - _Requirements: 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3. バックエンド実装: タスク管理 (#14)
- [ ] 3.1 タスク CRUD API の実装 (#14)
  - タスク用データベーススキーマ定義 (Supabase migration)
  - CRUD エンドポイントを持つ Task Router の作成
  - タスクステータス更新と順序変更ロジックの実装
  - Row Level Security (RLS) または API レベルでのユーザー ID フィルタリング
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 4. フロントエンド実装: 認証 (#15)
- [ ] 4.1 認証ロジックと UI の実装 (#15)
  - NextAuth.js (v5) の設定 (Backend API 接続 Credentials Provider)
  - フォームバリデーション付きログインページ作成
  - フォームバリデーション付き登録ページ作成
  - ルート保護用 Middleware の実装 (未認証リダイレクト)
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4_

- [ ] 5. フロントエンド実装: ユーザープロファイル (#16)
- [ ] 5.1 ユーザー設定 UI の実装 (#16)
  - ユーザー情報表示用プロファイルページ作成
  - ユーザー名・パスワード更新フォーム実装
  - アバターアップロード・更新機能実装
  - アカウント削除確認と実行アクション追加
  - _Requirements: 1.3, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 6. フロントエンド実装: Kanban ボード (#17)
- [ ] 6.1 Kanban UI と DnD の実装 (#17)
  - ボードレイアウト作成 (Todo, In Progress, Done カラム)
  - `@dnd-kit/core` を使用したドラッグ＆ドロップ実装
  - スムーズな楽観的 UI 更新のためのローカル状態管理
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 6.2 タスク操作の実装 (#17)
  - 新規タスク追加用モーダル/フォーム作成
  - タスクカードの編集・削除機能実装
  - ステータス/順序更新のための Backend API 連携
  - _Requirements: 4.4, 4.5_

- [ ] 7. デプロイと統合 (#18)
- [ ] 7.1 デプロイワークフローの設定 (#18)
  - ルーティング/リライト用 `vercel.json` 作成
  - DB マイグレーション用 GitHub Actions 設定 (`supabase db push`)
  - Vercel デプロイ用 GitHub Actions 設定 (`vercel deploy`)
  - 本番ビルドの検証
  - _Requirements: 5.3_
