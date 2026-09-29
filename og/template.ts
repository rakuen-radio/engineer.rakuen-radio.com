/**
 * OG image template entry point.
 *
 * ox-content renders `.tsx` templates through React, so the entry stays a
 * plain `.ts` module: it renders the framework-less JSX card with the
 * Ox Content runtime and hands back the HTML string.
 */
import { renderToString, type OgImageTemplateFn } from "@ox-content/vite-plugin";
import { OgCard } from "./card";

const template: OgImageTemplateFn = (props) => renderToString(OgCard(props));

export default template;
