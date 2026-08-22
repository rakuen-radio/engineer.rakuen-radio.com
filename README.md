# engineer.rakuen-radio.com

「エンジニアの楽園ラジオ」のウェブサイト。
[Ox Content](https://ox-content.void.app/) **Bare Mode** で Markdown から Zero JavaScript の静的サイトを生成します。

- Node.js 26 / pnpm / [Vite+](https://viteplus.dev/)(`vp`)/ TypeScript 7
- コマンドは `vp` に統一(インストールもタスク実行も `vp`。CI は [`setup-vp`](https://github.com/voidzero-dev/setup-vp))
- タスクは Vite Task(`vite.config.ts` の `run.tasks`)のみ。npm scripts は使いません
- 依存のバージョンは pnpm catalog(`pnpm-workspace.yaml` の `catalog`)で一元管理
- デザイントークンは Style Dictionary(`tokens/*.tokens.json` → `--rkn-*` CSS 変数)
- VRT は Playwright、ホスティングは Cloudflare Workers(Static Assets)

## 開発

```bash
vp install
```

```bash
vp run dev
```

| タスク | 内容 |
| --- | --- |
| `vp run tokens` | トークンから `public/styles/tokens.css` を生成 |
| `vp run build` | 静的サイトをビルド(`dist/`、JS ゼロ) |
| `vp run preview` | `dist/` をローカル配信(:4173) |
| `vp run vrt` / `vp run vrt-update` | VRT 実行 / ベースライン更新 |
| `vp run deploy` | ビルドして Cloudflare Workers へデプロイ |

- ページ追加: `content/` に Markdown を置き、`tests/vrt/pages.spec.ts` に 1 行追加
- 色・余白・フォント変更: `tokens/` を編集(`site.css` はトークン変数のみ参照)

## 仕組み

`ssg.bare: true` が素の HTML を出力し、[`plugins/bare-shell.ts`](plugins/bare-shell.ts) がビルド後に
CSS リンクとヘッダー/フッターを注入してプレースホルダー JS を削除します。`dist/` に `.js` は含まれません。

## VRT

ベースラインは `tests/vrt/__screenshots__/`(プラットフォーム別サフィックス)。
CI(Linux)の正は **Update VRT snapshots** ワークフロー(手動実行)が生成してブランチにコミットします。
Linux ベースラインが未コミットの間、CI の VRT ジョブはスキップされます。

## デプロイ

`main` への push で [`deploy.yml`](.github/workflows/deploy.yml) が `vp run deploy` を実行します。
Secrets: `CLOUDFLARE_API_TOKEN`(Workers Scripts:Edit)/ `CLOUDFLARE_ACCOUNT_ID`。
カスタムドメインは初回デプロイ後に Cloudflare 側で設定してください。

## 既知の制約(upstream)

- ox-content は `ssg.bare` 有効時に OG 画像生成をスキップする(設定と
  [`og/template.tsx`](og/template.tsx) は用意済み。upstream 対応後に有効化される)
- `.tsx` OG テンプレートは現状 react/react-dom(SSR)必須。テンプレートは
  Ox Content JSX ランタイム前提の framework-less 記法で書いてある
- `@ox-content/vite-plugin` が `./jsx-runtime` を export していないため
  [`og/ox-jsx-runtime.d.ts`](og/ox-jsx-runtime.d.ts) の型シムで補っている
