# Amami Digital Botanical Database

奄美大島の植物・野草をネオン / Y2K / サイバーテイストで紹介するデジタルフローラ図鑑。
Astro v5 + React v19 + Tailwind CSS v4 で構築。

## プロジェクト概要

- **ビジュアル**: ネオン / サイバー / グラスモーフィズムのデータベース UI
- **目的**: 画像ベースの植物データを管理し、一覧・検索・詳細で閲覧
- **自動化**: 画像追加 → スクリプトで `plants.json` 自動生成

## 開発コマンド

| コマンド                         | 内容                                               |
| :------------------------------- | :------------------------------------------------- |
| `npm run dev`                    | ローカル開発サーバー起動 (`localhost:4321`)        |
| `npm run build`                  | 本番用の静的ファイルをビルド                       |
| `node scripts/update_plants.cjs` | `public/images` から `src/data/plants.json` を更新 |

## データ更新フロー

1. `public/images` に植物画像を追加（命名: `id_00.jpg`）。
2. `node scripts/update_plants.cjs` を実行してデータを生成。
3. `src/data/plants.json` を編集し説明文・色・開花月などを追記。

## 主要パス

- `src/pages/`: ページルーティング
- `src/pages/plants/index.astro`: 図鑑一覧ページ
- `src/components/PlantList.tsx`: 植物一覧 UI
- `src/data/plants.json`: 植物データ
- `src/data/colors.json`: カラーパレット定義
- `public/images/`: 画像アセット
- `scripts/update_plants.cjs`: データ更新スクリプト

## UI 方針

- ネオン / サイバー / グラスモーフィズムの世界観を維持
- Tailwind ユーティリティ中心でコンポーネントは軽量に保つ
