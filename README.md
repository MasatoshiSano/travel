# 2026年6月-7月 イタリア＆フランス旅行

パリ＆ローマ旅行（2026/6/28〜7/6）の計画・準備をまとめたリポジトリ。

## ファイル一覧

| ファイル | 内容 |
|---------|------|
| [schedule_asiana_0628.md](schedule_asiana_0628.md) | **アシアナ航空プラン（6/28出発）✅ 確定版** |
| [hotels.md](hotels.md) | ホテル候補リスト（ローマ8件・パリ8件、予約リンク・日本人総評付き） |
| [rome_restaurants.md](rome_restaurants.md) | ローマ レストラン候補（日本人ブログ頻出店・予約優先度・動線別） |
| [links.md](links.md) | 旅行リンク集（観光チケット・交通・ツアー・航空会社・便利アプリ等） |
| [packing.md](packing.md) | 持ち物リスト完全版（準備スケジュール・実体験ベースの11カテゴリ） |

### 過去プラン（archive/）

| ファイル | 内容 |
|---------|------|
| [archive/schedule_asiana_0705.md](archive/schedule_asiana_0705.md) | アシアナ航空プラン（7/5出発・旧） |
| [archive/schedule_korean-air_0704.md](archive/schedule_korean-air_0704.md) | 大韓航空プラン（7/4出発・旧） |
| [archive/schedule_cathay-pacific_0603.md](archive/schedule_cathay-pacific_0603.md) | キャセイパシフィック航空プラン（6/3出発・旧） |

## 開発環境（Windows）

作業ディレクトリ: `C:\Users\Masatoshi Sano\Projects\travel`

### 初期セットアップ

```powershell
# Git をインストール済みの前提
cd "C:\Users\Masatoshi Sano\Projects"
git clone https://github.com/MasatoshiSano/travel.git
cd travel
```

## デプロイ（AWS S3）

公開先: `s3://honeymoon-roma-paris-2026-863646532781`（ap-northeast-1）
公開URL: <https://honeymoon-roma-paris-2026-863646532781.s3.ap-northeast-1.amazonaws.com/index.html>

### 方式A: GitHub Actions（推奨・自動）

`main` ブランチへ push すると `.github/workflows/deploy-s3.yml` が `site/` を S3 に同期する。

**初回のみ必要な設定:**

1. AWS で `s3:PutObject` / `s3:DeleteObject` / `s3:ListBucket` 権限を持つ IAM ユーザーを作成
2. アクセスキーを発行
3. GitHub リポジトリの **Settings → Secrets and variables → Actions** に以下を登録:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

設定後は `git push origin main` だけでデプロイが走る。手動実行は GitHub の Actions タブから "Run workflow" でも可能。

### 方式B: PowerShell スクリプト（ローカル実行）

ローカルから直接デプロイしたい場合の手段。

```powershell
# 事前準備（1回のみ）
# 1. AWS CLI をインストール: https://aws.amazon.com/cli/
# 2. 認証情報を設定
aws configure

# デプロイ実行
pwsh .\scripts\deploy.ps1

# ドライラン（実際にはアップロードせず差分のみ確認）
pwsh .\scripts\deploy.ps1 -DryRun
```

