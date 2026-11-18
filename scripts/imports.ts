import { writeFile } from "node:fs/promises"
import { createUnimport } from "unimport"
import { unimportDts, unimportOptions } from "../tools/unimport"

const unimport = createUnimport(unimportOptions)
await unimport.init()
await writeFile(unimportDts, await unimport.generateTypeDeclarations(), "utf-8")
console.log("Generated imports.app.d.ts")
