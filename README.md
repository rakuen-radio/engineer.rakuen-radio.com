# engineer.rakuen-radio.com

「エンジニアの楽園ラジオ」のウェブサイト。[Ox Content](https://ox-content.void.app/) で `content/index.md` から Zero JavaScript の1ページを生成し、Cloudflare Workers(Static Assets)へ配信します。

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
- ページ全体は [`theme/layout.tsx`](theme/layout.tsx)(Ox Content の `ssg.render` に渡す JSX テーマ)が組み立てる
- 色・余白・フォントは `tokens/` が唯一の出所。`styles/site.css` は CSS Nesting で書き、Lightning CSS がコンパイルする
- VRT のベースラインは CI(Linux)が正。**Update VRT snapshots** ワークフローの手動実行で更新する
- OG 画像は [`og/card.tsx`](og/card.tsx) をビルド時にレンダリングして生成する(Playwright の Chromium が必要)
- デプロイに必要な Secrets: `CLOUDFLARE_API_TOKEN`(Workers Scripts:Edit)/ `CLOUDFLARE_ACCOUNT_ID`

## upstream に投げているもの

- [ox-content#629](https://github.com/ubugeeei-prod/ox-content/issues/629) JSX の型は React 風(`className` / `charSet`)なのにランタイムは属性名をそのまま出力する。`<meta charSet>` はそのため

解決済み: [#601](https://github.com/ubugeeei-prod/ox-content/issues/601)(`./jsx-runtime` の export)、[#602](https://github.com/ubugeeei-prod/ox-content/issues/602)(bare mode で OG 画像が出ない)、[#608](https://github.com/ubugeeei-prod/ox-content/issues/608)(`.ts` テンプレートから package を import できない)、[#609](https://github.com/ubugeeei-prod/ox-content/issues/609)(ドキュメント全体を自前で組めるようにする → `ssg.render`)
