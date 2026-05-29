# Amami Digital Botanical Database

奄美大島の植物・野草を紹介するデジタルフローラ図鑑。
Astro v5 + React v19 + Tailwind CSS v4 で構築。

## プロジェクト概要

- **ビジュアル**: ネオン / サイバー / グラスモーフィズムのデータベース UI
- **目的**: 画像ベースの植物データを管理し、一覧・検索・詳細で閲覧
- **運用**: `plants.json` を中心に、Excel/CSV/TSV 同期 or 直接編集で更新

## 主要ページ

- `/` : トップページ
- `/plants` : 図鑑一覧ページ
- `/plants/[slug]` : 詳細ページ

## 開発コマンド

| コマンド           | 内容                                               |
| :----------------- | :------------------------------------------------- |
| `npm run dev`      | ローカル開発サーバー起動 (`localhost:4321`)        |
| `npm run build`    | 本番用の静的ファイルをビルド                       |
| `npm run preview`  | ビルド成果物のプレビュー                           |
| `npm run export`   | `src/data/plants.json` → `data/plants.xlsx` へ出力 |
| `npm run sync`     | `data/plants.xlsx` → `src/data/plants.json` を生成 |
| `npm run sync-csv` | `img_dl/images_new.csv` → `src/data/plants.json`   |
| `npm run sync-tsv` | `img_dl/images_new.tsv` → `src/data/plants.json`   |

## データ更新フロー（基本）

1. `public/images` に植物画像を追加（命名: `0001_00.jpg` のような `id_00.jpg` 形式）。
2. `src/data/plants.json` を直接編集して内容を更新。
3. 必要に応じて `npm run build` で反映確認。

## 一括更新（任意）

- `npm run export` で `plants.json` を Excel 化し、編集後に `npm run sync` で戻す。
- `npm run sync` は `data/plants.xlsx` の `id` を基準に `public/images` を走査して画像を紐付ける。
- `npm run sync-csv` は `img_dl/images_new.csv` を読み込み、`id` を 4 桁に補正して同期する。
- `npm run sync-tsv` は `img_dl/images_new.tsv` を読み込み、Shift-JIS/UTF-8 を自動判定する。
- 画像は `public/images` の実ファイル名から自動で紐づくため、ID の命名規則は揃えておく。

## データ構造（plants.json）

- `images` は文字列配列 or `{ src, memo, alt }` 配列のどちらでも可。
- `colors` と `months` は配列。`months` は `1月`〜`12月` の表記を推奨。

## 主要パス

- `src/pages/`: ページルーティング
- `src/pages/plants/index.astro`: 図鑑一覧ページ
- `src/pages/plants/[slug].astro`: 詳細ページ
- `src/components/PlantList.tsx`: 植物一覧 UI
- `src/data/plants.json`: 植物データ
- `src/data/colors.json`: カラーパレット定義
- `public/images/`: 画像アセット
- `data/plants.xlsx`: Excel 管理用データ

## UI 方針

- ネオン / サイバー / グラスモーフィズムの世界観を維持
- Tailwind ユーティリティ中心でコンポーネントは軽量に保つ
