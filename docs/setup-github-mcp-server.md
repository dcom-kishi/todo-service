# GitHub MCP Server セットアップ

GitHub MCP (Model Context Protocol) Server を導入することで、MCP 対応の AI クライアント（Claude Desktop, Cursor, VS Code 等）が GitHub のリポジトリ情報や Issue、PR に直接アクセスできるようになります。

## 1. 前提条件

- **Rancher Desktop (WSL)**:
  - コンテナ実行環境として Rancher Desktop を使用します。
  - **インストール**:
    管理者権限のコマンドラインで以下のコマンドを実行します。
    ```
    winget install --id SUSE.RancherDesktop --silent
    ```
  - インストール後、設定画面で **WSL Integration** を有効にし、Container Engine は `dockerd (moby)` を選択してください。
  - **初期設定**:
    1. Rancher Desktop を起動します。
    2. **Container Engine** の設定で `dockerd (moby)` を選択します。
    3. **WSL Integration** のタブで、使用している WSL ディストリビューション（例: `Ubuntu`）にチェックを入れます。
    4. 設定が完了したら、コマンドラインまたは WSL 上で `docker --version` を実行し、コマンドが認識されることを確認してください。
- **GitHub Personal Access Token (PAT)**:
  - GitHub の Developer Settings から生成します。
  - **作成手順**:
    1. GitHub 右上のアイコン > **Settings** > **Developer settings** を開きます。
    2. **Personal access tokens** > **Fine-grained tokens** を選択し、**Generate new token** をクリックします。
    3. **Token name** に任意の名前（例: `github-mcp-server`）を入力し、**Expiration** を設定します。
    4. **Repository access** で、この機能を使用したいリポジトリ（例: `All repositories` または特定のリポジトリ）を選択します。
    5. **Permissions** > **Repository permissions** で、最低限以下の権限を設定します:
       - **Contents**: `Read and write`
       - **Issues**: `Read and write`
       - **Pull requests**: `Read and write`
       - **Metadata**: `Read-only` (必須)
    6. **Generate token** をクリックし、生成されたトークンをコピーします（再表示されないため注意）。

## 2. 環境変数の準備

セキュリティのため、アクセストークンなどの認証情報は `.env.local` ファイルで管理します。
プロジェクトルートにある `.env.local.example` を `.env.local` にコピーし、取得したトークンを記述してください。

```text
GITHUB_PERSONAL_ACCESS_TOKEN=github_pat_xxxxxxxxxxxx
```

## 3. クライアント設定

MCP クライアントの設定ファイルに以下の設定を追加してください。

### 設定ファイルの場所

使用するクライアントによって異なりますが、代表的な配置場所は以下の通りです。

- **Gemini CLI**: プロジェクトルートの `.gemini/settings.json`

### 設定例 (JSON)

`.env.local` ファイルのパスは、コマンドを実行するディレクトリからの相対パスでの指定が推奨されます（例: `./.env.local`）。これにより、他の開発者も設定を容易に再利用できます。

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--env-file",
        "./.env.local",
        "ghcr.io/github/github-mcp-server"
      ]
    }
  }
}

```

## 4. 利用可能な機能

- リポジトリ内のファイル検索・読み取り
- Issue の検索・作成・更新
- Pull Request の内容確認
- コミット履歴の確認

## 5. Gemini CLI での使用例

設定が完了したら、Gemini CLI とのチャットで自然言語を使って GitHub の操作が可能になります。

### 接続確認（Issue の一覧表示）

まず、リポジトリの Issue を一覧表示して接続を確認します。

> **User**: このリポジトリの Issue を一覧表示して

### Issue の作成

新しい Issue を作成することも可能です。

> **User**: バグ報告の Issue を作成して。タイトルは「ログイン画面でエラーが発生する」、内容は「再現手順...」

### Issue の検索

特定のキーワードを含む Issue を検索できます。

> **User**: "mcp" に関する Issue を検索して