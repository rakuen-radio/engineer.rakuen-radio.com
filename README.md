# engineer.rakuen-radio.com

「エンジニアの楽園ラジオ」のウェブサイト。[Ox Content](https://ox-content.void.app/) の Bare Mode で `content/index.md` から Zero JavaScript の1ページを生成し、Cloudflare Workers(Static Assets)へ配信します。

## 開発

```bash
vp install
```

```bash
vpr dev
```

| タスク | 内容 |
| --- | --- |
| `vpr tokens` | `tokens/` から `styles/tokens.css` を生成 |
| `vpr build` | `dist/` にビルド |
| `vpr preview` | `dist/` をローカル配信(:4173) |
| `vpr vrt` / `vpr vrt-update` | VRT 実行 / ベースライン更新 |
| `vpr deploy` | Cloudflare Workers へデプロイ(`main` への push で自動実行) |

- 本文は `content/index.md` だけ。`##` 見出しがそのままヘッダーのナビになる。サイト名と説明もこのファイルの frontmatter が唯一の出所
- 色・余白・フォントは `tokens/` が唯一の出所。`styles/site.css` は CSS Nesting で書き、Lightning CSS がコンパイルする
- VRT のベースラインは CI(Linux)が正。**Update VRT snapshots** ワークフローの手動実行で更新する
- OG 画像は [`og/card.tsx`](og/card.tsx) をビルド時にレンダリングして生成する(Playwright の Chromium が必要)
- デプロイに必要な Secrets: `CLOUDFLARE_API_TOKEN`(Workers Scripts:Edit)/ `CLOUDFLARE_ACCOUNT_ID`

## upstream に投げているもの

- [ox-content#609](https://github.com/ubugeeei-prod/ox-content/issues/609) bare mode が `lang`・メタデータ・OG タグを一切出さないので、[`plugins/bare-shell.ts`](plugins/bare-shell.ts) で後処理している。ここが埋まればプラグインはほぼ不要になる
- [ox-content#608](https://github.com/ubugeeei-prod/ox-content/issues/608) `.ts` の OG テンプレートから `@ox-content/vite-plugin` を import できない(プラグイン丸ごとバンドルされて壊れる)ため、`renderToString()` / `raw()` を使わず `JSXNode` を直接組み立てている
