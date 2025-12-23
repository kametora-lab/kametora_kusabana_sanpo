# プロジェクト要件定義書：Flower Album Site (amamikusabana2)

## 1. プロジェクト概要
奄美大島の植物・野草を紹介するためのデジタル図鑑（Flower Album）を構築する。
既存のデータ管理手法を活かしつつ、Y2K/サイバーパンク/ネオンの美学を取り入れた魅力的でモダンなWebサイトを目指す。

## 2. 目的・ゴール
- **ユーザー体験の向上**: 訪問者が直感的に植物を探し、視覚的に楽しめるインターフェースを提供する。
- **管理の効率化**: 画像ファイルを追加するだけで基本的なデータ登録が完了する自動化フローを確立する。
- **ブランディング**: 「Digital Botanical Database ver.2025」として、独自の世界観（近未来的・電脳的）を表現する。

## 3. ターゲットユーザー
- 奄美大島の自然・植物に興味がある観光客、愛好家。
- レトロフューチャー（Y2K）やサイバーパンクデザインを好む層。

## 4. 機能要件
### フロントエンド
- **トップページ**: 
  - ヒーローセクション（インパクトのあるタイトル、アニメーション）。
  - ピックアップ（Featured）植物の表示。
  - 主要カテゴリへの導線。
- **一覧ページ**: 
  - 全植物のカード表示（サムネイル、名称）。
  - **フィルタリング機能**:
    - 色（Yellow, Red, Blue, Purple, Green, White, Other）。
    - 開花月（1月〜12月）。
- **詳細ページ**:
  - 植物写真のギャラリー表示（複数枚対応）。
  - 植物名（カタカナ）、学名、説明文の表示。
  - 関連タグ（色、月）の表示。
- **レスポンシブ対応**: PC、タブレット、スマートフォンで最適に表示されること。

### バックエンド・データ管理
- **データソース**: `src/data/plants.json` を正とする。
- **画像管理**: `public/images` ディレクトリに格納。
- **自動化スクリプト (`update_plants.cjs`)**:
  - 画像ファイル名（例: `adan_00.jpg`）からID（`adan`）を抽出。
  - 新規IDの場合、ローマ字→カタカナ変換でタイトルを自動生成しJSONに追加。
  - 既存IDの場合、新規画像をJSONリストに追加。

## 5. 非機能要件
- **パフォーマンス**: Astroによる静的サイト生成（SSG）で高速な読み込みを実現。
- **デザイン**: 
  - ネオンカラー（ピンク、シアン、パープル）を基調としたダークモードデザイン。
  - グラスモーフィズム（すりガラス効果）や発光表現の使用。
- **拡張性**: 将来的な植物数の増加（数百〜数千件）に耐えうる構成。

---

# システム仕様書

## 1. 技術スタック
- **フレームワーク**: Astro v5
- **UIライブラリ**: React v19
- **スタイリング**: Tailwind CSS v4 (Vite plugin)
- **ビルドツール**: Vite
- **スクリプト実行**: Node.js (CommonJS)

## 2. ディレクトリ構成
```text
/
├── public/
│   └── images/       # 植物画像格納場所
├── scripts/
│   └── update_plants.cjs # JSON更新用スクリプト
├── src/
│   ├── components/   # NeonButtonなどのUIコンポーネント
│   ├── data/
│   │   └── plants.json # 植物データ（マスターデータ）
│   ├── layouts/      # 共通レイアウト (Layout.astro)
│   └── pages/
│       ├── index.astro         # トップページ
│       ├── plants/
│       │   ├── index.astro     # 一覧ページ（想定）
│       │   └── [slug].astro    # 詳細ページ（動的ルート）
└── astro.config.mjs  # Astro設定
```

## 3. データモデル (Plant Object)
`src/data/plants.json` の各エントリ構造:

| フィールド名 | 型 | 説明 | 例 |
| --- | --- | --- | --- |
| `id` | String | ユニークID（画像ファイル名プレフィックス） | `"adan"` |
| `slug` | String | URL用スラッグ（通常IDと同じ） | `"adan"` |
| `title` | String | 表示名（カタカナ） | `"アダン"` |
| `description`| String | 説明文 | `"海岸近くに自生する..."` |
| `images` | Array<String> | 画像パスの配列 | `["/images/adan_00.jpg"]` |
| `colors` | Array<String> | 花の色タグ | `["yellow", "orange"]` |
| `months` | Array<String> | 開花月タグ | `["6月", "7月"]` |
| `meta` | Object | メタデータ | `{ "scientificName": "Pandanus odoratissimus" }` |

## 4. デザインシステム仕様
### カラーパレット (Tailwind config参照)
- **Neon Pink**: アクセント、強調、グロー効果。
- **Neon Cyan**: リンク、アクション、サイバー的な装飾。
- **Neon Purple**: 背景グラデーション、深みのある発光。
- **Base**: `min-h-screen`, 黒/ダークグレー背景。

### UIコンポーネント
- **NeonButton**: ホバー時に強く発光するアクションボタン。
- **Glass Panel**: 半透明の背景 + ボーダー発光を持つカード要素。
- **Typography**:
  - タイトル等の装飾文字には `font-display` (Orbitron等) を使用。
  - 本文は可読性の高いサンセリフ体を使用。

## 5. 運用フロー
1.  **画像追加**: ユーザーが `public/images` に写真をアップロード（命名規則: `id_xx.jpg`）。
2.  **データ更新**: 開発環境で `node scripts/update_plants.cjs` を実行。
3.  **情報追記**: `src/data/plants.json` を開き、自動生成されたエントリの `description` や `colors` を手動編集。
4.  **ビルド**: サイトをビルド・デプロイして反映。
