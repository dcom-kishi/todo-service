# 開発環境セットアップ

本プロジェクトの開発環境構築手順です。

> [!NOTE]
> 本手順は Windows 環境を前提としています。

## 1. 前提条件のインストール

管理者権限でコマンドラインを起動し、以下のコマンドを実行して必要なツールをインストールします。

```powershell
# Node.js (LTS)
winget install -id OpenJS.NodeJS.LTS --silent

# VS Code
winget install -id Microsoft.VisualStudioCode --silent
```

インストール完了後、コマンドラインを再起動してください。

## 2. Gemini CLI のセットアップ

### インストール

管理者権限のコマンドラインで以下を実行します。

```powershell
npm install -g @google/gemini-cli
gemini
```

### ログインと初期設定

`gemini` コマンド実行後、対話形式でセットアップを行います。

1. **VS Code 連携**:
   - `Do you want to connect VS Code to Gemini CLI?` と聞かれたら `Yes` を選択します。
   - ※ 自動インストールに失敗した場合は、VS Code 拡張機能マーケットプレイスから `Gemini CLI Companion` を手動でインストールしてください。

2. **認証**:
   - `Login with Google` を選択し、ブラウザで Google アカウント認証を行います。
     <img src="./images/setup-development-environment-01.png" width="50%">
     <img src="./images/setup-development-environment-02.png" width="50%">

3. **モデル設定 (Gemini 3 の有効化)**:
   - Gemini CLI 内で `/settings` コマンドを入力します。
   - `Preview Features (e.g., models)` を選択し `true` に設定します。
   - `/model` コマンドを入力し、`Auto (Gemini 3)` が選択可能になっていることを確認します。
     <img src="./images/setup-development-environment-03.png" width="50%">

4. **学習利用無効化**:
   - Gemini CLI 内で `/privacy` コマンドを入力します。
   - `No` を選択します。

## 3. VS Code のセットアップ

### 拡張機能のインストール

VS Code マーケットプレイスから以下の拡張機能をインストールします。

1. **Gemini Code Assist**
   - インストール後、サイドバーのアイコンから `Sign in` を行い、Google アカウントで認証してください。
     <img src="./images/setup-development-environment-04.png" width="50%">
     <img src="./images/setup-development-environment-05.png" width="50%">
     <img src="./images/setup-development-environment-06.png" width="50%">

2. **Gemini CLI Companion**
   - Gemini CLI のセットアップ時にインストールされていない場合は、手動でインストールします。
     <img src="./images/setup-development-environment-07.png" width="50%">

## 4. 仕様駆動開発ツール (cc-sdd) のセットアップ

本プロジェクトでは AI-DLC (AI Development Life Cycle) を回すために `cc-sdd` を使用します。

### インストール

プロジェクトのルートディレクトリで以下のコマンドを実行します。
`--lang ja` オプションにより日本語環境向けにセットアップされます。

```bash
npx cc-sdd@latest --gemini --lang ja
```

### 使用方法

Gemini CLI を再起動（一度 `exit` して再度 `gemini` 起動）すると、以下のカスタムコマンドが使用可能になります。

- `/kiro:spec-init <feature>` : 仕様書のドラフト作成を開始
- `/kiro:spec-requirements {feature}` : 要件定義の作成
- `/kiro:spec-design {feature}` : 設計書の作成
- `/kiro:spec-tasks {feature}` : タスクの作成
- `/kiro:spec-impl {feature}` : 実装の開始
- `/kiro:spec-status {feature}` : 進捗確認

## 5. アプリケーションの起動と確認

### 5.1 環境変数の準備

プロジェクトルートにある `.env.local.example` を `.env.local` にコピーします。

### 5.2 Supabase の起動とキーの取得

Docker Desktop が起動していることを確認し、以下のコマンドを実行します。

```powershell
# Supabase の起動 (ローカルDB)
npx supabase start
```

起動完了後、表示されるログ（または `npx supabase status` コマンドの結果）から以下の値をコピーし、`.env.local` に貼り付けます。

- `anon key` -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role key` -> `SUPABASE_KEY`

### 5.3 サービスの起動

アプリケーション（Frontend/Backend）を起動します。

```powershell
# コンテナのビルドと起動
docker-compose up --build -d
```

### 5.4 動作確認

起動後、以下の方法で正常に連携できているか確認します。

1. **ブラウザで確認**:
   - [http://localhost:3000](http://localhost:3000) にアクセスし、中央のカードに **"Hello World"** と緑文字で表示されていれば成功です。
2. **コマンドで確認**:

   ```powershell
   # Backend 経由での Supabase データ取得確認
   curl.exe -s http://localhost:8000/api/v1/hello-supabase
   ```

   `{"data":"Hello World"}` というレスポンスが返ってくれば正常です。

3. **管理ツール**:
   - **Supabase Studio**: [http://localhost:54323](http://localhost:54323)
     - `Table Editor` から `tasks` テーブルに "Hello World" というデータが入っていることを確認できます。
