import { ourongxing } from "@ourongxing/eslint-config"

/** @type {import("@ourongxing/eslint-config").TypedFlatConfigItem[]} */
const config = ourongxing({
  type: "app",
  // 貌似不能 ./ 开头，
  ignores: ["src/routeTree.gen.ts", "imports.app.d.ts", "public/", ".vscode", "docs/", "**/*.json"],
})

export default config
