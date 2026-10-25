# AGENTS.md

## Project overview
Neon/Y2K-style digital flora database built with Astro v5 + React v19 + Tailwind CSS v4.

## Key paths
- Pages: `src/pages/`
- Components: `src/components/`
- Data: `src/data/plants.json`, `src/data/colors.json`
- Assets: `public/images/`
- Scripts: `scripts/update_plants.cjs`

## Common commands
- `npm run dev` (local dev server)
- `npm run build` (production build)
- `node scripts/update_plants.cjs` (regenerate `plants.json` from images)

## Data update flow
1) Add plant images to `public/images` using `id_00.jpg` naming.
2) Run `node scripts/update_plants.cjs`.
3) Edit `src/data/plants.json` for descriptions, colors, and months.

## UI conventions
- Preserve the neon / cyber / glassmorphism visual language.
- Prefer Tailwind utility classes; keep components lean.
- Database list UI lives in `src/components/PlantList.tsx` and `src/pages/plants/index.astro`.

## Local Skills (`.agents/skills/`)
- `add-new-plant`: 新規草花登録・画像追加スキル（`.agents/skills/add-new-plant/SKILL.md`）
- `create-insta-carousel`: Instagram用4:5カルーセル画像＆投稿文生成スキル（`.agents/skills/create-insta-carousel/SKILL.md`）。ユーザーが「カルーセル作成して」「インスタのカルーセル作って」などと依頼した際は、必ずこのスキルを起動し、`insta_carousel/generate_carousel.py` を使って生成すること。
