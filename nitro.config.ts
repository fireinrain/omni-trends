import { join } from "node:path"
import process from "node:process"
import viteNitro from "vite-plugin-with-nitro"
import { getDatabaseConfig } from "./tools/database-config"
import { RollopGlob } from "./tools/rollup-glob"
import { projectDir } from "./shared/dir"

const database = getDatabaseConfig()
const preset = process.env.BUILD_PRESET || process.env.NITRO_PRESET || (process.env.VERCEL ? "vercel" : undefined)

const nitroOption: Parameters<typeof viteNitro>[0] = {
  experimental: {
    database: true,
  },
  rollupConfig: {
    plugins: [RollopGlob()],
  },
  sourceMap: false,
  database,
  devDatabase: database,
  imports: {
    dirs: ["server/utils", "shared"],
  },
  ...(preset ? { preset } : {}),
  alias: {
    "@shared": join(projectDir, "shared"),
    "#": join(projectDir, "server"),
  },
}

export default function () {
  return viteNitro(nitroOption)
}
