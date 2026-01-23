# Todo Service - Backend

FastAPI を使用した Todo サービスのバックエンド API です。
認証とユーザー管理、タスク管理の機能を提供します。

## 依存関係
- Python 3.14 (推奨)
- [uv](https://docs.astral.sh/uv/) (パッケージマネージャ)
- Supabase (Auth / Database)

## セットアップ

### 1. パッケージのインストール
`uv` を使用して依存関係をインストールします。

```bash
cd backend
uv sync
```

### 2. 環境変数の設定
`backend/.env` または `backend/.env.local` を作成し、以下の項目を設定します。

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

> [!IMPORTANT]
> `SUPABASE_SERVICE_ROLE_KEY` はユーザーの削除やパスワードの強制更新など、管理者権限が必要な操作に使用されます。

## 開発とテスト

### サーバーの起動 (ローカル)
```bash
uv run uvicorn main:app --reload
```

### ユニットテストの実行
テストには `pytest` を使用します。モジュール読み込みのため `PYTHONPATH` を設定して実行してください。

```powershell
# Windows (PowerShell)
$env:PYTHONPATH = "."; uv run pytest

# Linux / macOS
PYTHONPATH=. uv run pytest
```

### テスト内容
- **認証 (`tests/test_auth.py`)**: サインアップ、バリデーション（パスワード複雑性、NGワード）、ログイン、ログアウト。
- **ユーザー管理 (`tests/test_users.py`)**: プロフィール取得、更新、アカウント削除。
