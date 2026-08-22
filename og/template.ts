/**
 * OG image template entry point.
 *
 * ox-content renders `.tsx` templates through React, so the entry stays a
 * plain `.ts` module: it renders the framework-less JSX card with the
 * Ox Content runtime and hands back the HTML string.
 */
import type { OgImageTemplateFn } from "@ox-content/vite-plugin";
import { OgCard } from "./card";

// `renderToString()` from the plugin would be the tidy unwrap, but a value
// import bundles the entire plugin into the template
// (https://github.com/ubugeeei-prod/ox-content/issues/608), so the
// card's HTML is read off the public `JSXNode` shape instead.
const template: OgImageTemplateFn = (props) => OgCard(props).__html;

export default template;
