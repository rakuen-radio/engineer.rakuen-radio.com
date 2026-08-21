/**
 * Type shim for the Ox Content JSX runtime.
 *
 * The published @ox-content/vite-plugin package does not (yet) expose
 * `./jsx-runtime` in its `exports`, so the automatic JSX transform
 * (`jsxImportSource` in tsconfig) cannot resolve its types. Remove this
 * file once upstream ships the export.
 */
declare module "@ox-content/vite-plugin/jsx-runtime" {
  export namespace JSX {
    type Element = string;
    interface IntrinsicElements {
      [elemName: string]: Record<string, unknown>;
    }
    interface ElementChildrenAttribute {
      children: unknown;
    }
  }
  export function jsx(
    type: unknown,
    props: Record<string, unknown>,
    key?: unknown,
  ): string;
  export function jsxs(
    type: unknown,
    props: Record<string, unknown>,
    key?: unknown,
  ): string;
  export function Fragment(props: { children?: unknown }): string;
}
