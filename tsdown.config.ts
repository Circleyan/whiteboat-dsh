import type { UserConfig } from "tsdown";

const PACKAGE_ID = "whiteboat-dsh";
const CLIENT_EXTERNALS = new Set([
  "react",
  "react/jsx-runtime",
  "react-dom",
  "react-dom/client",
  "@deepseek-ai/cordis",
  "@deepseek-ai/dsh-client-ui-slots",
  "@deepseek-ai/dsh-client-ui-primitives",
  "@deepseek-ai/dsh-client-runtime/client",
]);

const node: UserConfig = {
  name: PACKAGE_ID,
  entry: { index: "src/index.ts" },
  outDir: "lib",
  format: "esm",
  platform: "node",
  target: "es2022",
  dts: false,
  clean: false,
  outputOptions: { entryFileNames: "index.js" },
};

const client: UserConfig = {
  name: `${PACKAGE_ID}/client`,
  entry: { client: "src/features/water-surface/index.tsx" },
  outDir: "lib",
  format: "cjs",
  platform: "browser",
  target: "es2022",
  dts: false,
  sourcemap: true,
  clean: false,
  loader: {
    ".svg": "text",
  },
  deps: {
    neverBundle: (specifier: string) => CLIENT_EXTERNALS.has(specifier),
    alwaysBundle: (specifier: string) => !CLIENT_EXTERNALS.has(specifier),
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV ?? "production",
    ),
  },
  outputOptions: {
    entryFileNames: "client.js",
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(PACKAGE_ID)}, factory: (require) => {`,
    footer: "return module.exports; } });",
    intro: "var module = { exports: {} }; var exports = module.exports;",
  },
};

export default [node, client];
