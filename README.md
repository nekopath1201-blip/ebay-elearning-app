# eBay研修 Eラーニング

キャラクター「チビ太」が案内するeBay業務研修用のEラーニングシステム。管理者がセクション・課題（動画/テキスト/ファイル/クイズ）を作成し、受講者は順にこなして進捗を積み上げる。

同ディレクトリ内の「にゃん助Eラーニング」(elearning-app) を元にした、eBay研修専用の別プロジェクト。

## 課題タイプと添付できるもの

- **テキスト+画像**: 本文テキスト＋画像を複数枚添付可能
- **動画+テキスト+画像**: 動画1本＋本文テキスト＋画像を複数枚添付可能
- **ファイル+画像**: 任意のファイル1点＋画像を複数枚添付可能
- **クイズ**: 選択式の設問（複数問）

画像・動画・ファイルの添付は、課題作成後の編集画面（`/admin/sections/[id]/tasks/[taskId]`）から行う。

## 技術スタック

- Next.js 16 (App Router, TypeScript)
- Prisma + PostgreSQL（Neon等を想定）
- NextAuth.js v5（Credentials認証、管理者発行アカウントのみ）
- S3互換ストレージ（動画・画像・ファイルアップロード用）
- Tailwind CSS

## セットアップ（ローカル）

このプロジェクトは既存の「にゃん助Eラーニング」とは別の新規プロジェクトのため、**新しいPostgreSQL DB（Neon等）とS3互換ストレージ（バケット）を別途用意する**必要がある。既存プロジェクトと共用しないこと。

```bash
npm install
cp .env.example .env  # DATABASE_URL等を実際の値に差し替える
npx prisma migrate dev --name init  # 初回のみ：マイグレーション作成+DB反映
npx tsx prisma/seed.ts               # 管理者アカウント作成
npm run dev
```

シードで作成される初期管理者アカウント: `admin@example.com` / `admin1234`（本番運用前に必ずパスワードを変更すること）。

## デプロイ構成（既存プロジェクトと同様の想定）

- **ホスティング**: Vercel（既存の「にゃん助Eラーニング」とは別のVercelプロジェクトとして作成する）
- **DB**: Neon（PostgreSQL）※新規プロジェクトを作成
- **ストレージ**: Cloudflare R2 / AWS S3（新規バケットを作成）
- Vercelの環境変数に `DATABASE_URL` / `NEXTAUTH_SECRET` / `NEXTAUTH_URL` / `S3_*` を設定する
- スキーマ変更時は `npx prisma migrate dev --name <変更内容>` でマイグレーションを作成し、コミットしてpushする

S3系の環境変数が未設定の場合、動画・画像・ファイルのアップロード機能はエラーメッセージを表示する（テキスト・クイズ課題は設定なしでも利用可能）。

## ディレクトリ構成

```
src/
  app/
    login/              ログインページ
    admin/              管理者向け（セクション・課題CRUD、受講者管理）
    student/            受講者向け（セクション/課題一覧、課題詳細、クイズ）
    api/upload/presign  S3アップロード用presigned URL発行
    actions/            Server Actions（CRUD・ログイン/ログアウト・進捗更新）
  lib/                  Prisma/S3/認証/進捗集計/猫メッセージ
  components/           管理者UI・受講者UI・猫マスコット
  proxy.ts              ルート保護（Next.js 16でmiddleware.tsから改称）
```

## チビ太の仕組み

`src/lib/catMessages.ts` にイベント種別（開始/正解/不正解/課題完了/セクション完了/全完了）ごとの定型セリフを定義し、`getCatMessage()` でランダムに選択して表示する（AI呼び出しなし、ルールベース）。イラストは使用せず、吹き出しのテキストのみで案内する。
