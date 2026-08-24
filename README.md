# engineer.rakuen-radio.com

「エンジニアの楽園ラジオ」のウェブサイト。[Ox Content](https://ox-content.void.app/) で `content/index.md` から完全静的な1ページを生成し、Cloudflare Workers(Static Assets)へ配信します。自前の JavaScript はゼロで、配信されるのはテーマ由来のアセットだけです。

## 開発

```bash
vp install
```

```bash
vpr dev
```

| タスク | 内容 |
| --- | --- |
| `vpr build` | `dist/` にビルド |
| `vpr preview` | `dist/` をローカル配信(:4173) |
| `vpr vrt` / `vpr vrt-update` | VRT 実行 / ベースライン更新 |
| `vpr deploy` | Cloudflare Workers へデプロイ(`main` への push で自動実行) |

- 本文は `content/index.md`(と 404 用の `content/404.md`)。見た目は Ox Content の
  **Theme API**(`defineTheme({ extends: defaultTheme })`)そのまま — 土台なので独自デザインは持たない
- OG 画像は [`og/card.tsx`](og/card.tsx) をビルド時にレンダリングして生成する
  (Playwright の Chromium が必要)。色もテーマのパレットを参照する
- VRT のベースラインは CI(Linux)が正。**Update VRT snapshots** ワークフローの手動実行で更新する
- デプロイに必要な Secrets: `CLOUDFLARE_API_TOKEN`(Workers Scripts:Edit)/ `CLOUDFLARE_ACCOUNT_ID`

## upstream メモ

解決済み: [#601](https://github.com/ubugeeei-prod/ox-content/issues/601)(`./jsx-runtime` の export)、[#602](https://github.com/ubugeeei-prod/ox-content/issues/602)(bare mode で OG 画像が出ない)、[#608](https://github.com/ubugeeei-prod/ox-content/issues/608)(`.ts` テンプレートから package を import できない)、[#609](https://github.com/ubugeeei-prod/ox-content/issues/609)(ドキュメント全体を自前で組めるようにする → `ssg.render`)、[#629](https://github.com/ubugeeei-prod/ox-content/issues/629)(JSX の属性名出力 → 2.90.0 の #637 で HTML 属性名を出力)
