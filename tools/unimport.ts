import { join } from "node:path"
import type { UnimportOptions } from "unimport"
import { projectDir } from "../shared/dir"

/**
 * Shared unimport options for Vite (automatic imports at runtime)
 * and scripts/imports.ts (type declaration generation).
 */
export const unimportOptions: Partial<UnimportOptions> = {
  dirs: ["src/hooks", "shared", "src/utils", "src/atoms"].map(dir => join(projectDir, dir)),
  presets: ["react", {
    from: "jotai",
    imports: ["atom", "useAtom", "useAtomValue", "useSetAtom"],
  }],
  imports: [
    { from: "clsx", name: "clsx", as: "$" },
    { from: "jotai/utils", name: "atomWithStorage" },
  ],
}

export const unimportDts = join(projectDir, "imports.app.d.ts")
