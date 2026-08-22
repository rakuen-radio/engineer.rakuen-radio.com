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

- 本文は `content/index.md` だけ。`##` 見出しがそのままヘッダーのナビになる
- 色・余白・フォントは `tokens/` が唯一の出所。`styles/site.css` は CSS Nesting で書き、Lightning CSS がコンパイルする
- VRT のベースラインは CI(Linux)が正。**Update VRT snapshots** ワークフローの手動実行で更新する
- デプロイに必要な Secrets: `CLOUDFLARE_API_TOKEN`(Workers Scripts:Edit)/ `CLOUDFLARE_ACCOUNT_ID`

## 既知の制約(upstream)

- `ssg.bare` 有効時は OG 画像が生成されない([ox-content#602](https://github.com/ubugeeei-prod/ox-content/issues/602))。設定と [`og/template.tsx`](og/template.tsx) は用意済み
- `@ox-content/vite-plugin` が `./jsx-runtime` を export していないため型シムが要る([ox-content#601](https://github.com/ubugeeei-prod/ox-content/issues/601))
