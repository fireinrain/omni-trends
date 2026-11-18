import fs from "node:fs"
import { Buffer } from "node:buffer"
import { join } from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"
import { consola } from "consola"
import dotenv from "dotenv"
import { ProxyAgent, fetch } from "undici"
import { originSources } from "../shared/pre-sources"

/**
 * 手动补齐缺失的数据源图标。
 *
 * 图标已经提交在 public/icons/，日常 dev/build 不会调用此脚本。
 * 只有新增数据源、需要下载图标时才运行 `pnpm gen:icons`。
 */

const projectDir = fileURLToPath(new URL("..", import.meta.url))
const iconsDir = join(projectDir, "public", "icons")
const CONCURRENCY = 6
const TIMEOUT = 10000

// 手动运行脚本时也能复用 .env.server 里的代理配置。
dotenv.config({ path: join(projectDir, ".env.server"), quiet: true })

const proxyUrl = process.env.HTTPS_PROXY
  || process.env.https_proxy
  || process.env.HTTP_PROXY
  || process.env.http_proxy
const dispatcher = proxyUrl
  ? new ProxyAgent({ uri: proxyUrl, requestTls: { rejectUnauthorized: false } })
  : undefined

function iconKey(id: string) {
  // 与前端一致：bilibili-hot-search -> bilibili.png
  return id.split("-")[0]
}

async function downloadImage(url: string, outputPath: string, id: string) {
  const response = await fetch(url, {
    dispatcher,
    signal: AbortSignal.timeout(TIMEOUT),
  })
  if (!response.ok) throw new Error(`${id}: HTTP ${response.status}`)

  const image = await response.arrayBuffer()
  if (!image.byteLength) throw new Error(`${id}: empty response`)

  fs.writeFileSync(outputPath, Buffer.from(image))
  consola.success(`${id}: icon saved`)
}

async function runPool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  const queue = [...items]
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    let item = queue.shift()
    while (item !== undefined) {
      await fn(item)
      item = queue.shift()
    }
  })
  await Promise.all(workers)
}

async function main() {
  const missing = new Map<string, { id: string, home: string }>()
  for (const [id, source] of Object.entries(originSources)) {
    if (!source.home) continue
    const key = iconKey(id)
    if (fs.existsSync(join(iconsDir, `${key}.png`))) continue
    missing.set(key, { id, home: source.home })
  }

  if (!missing.size) {
    consola.info("All icons are present, nothing to download.")
    return
  }

  consola.info(`Downloading ${missing.size} missing icon(s)...`)
  let failed = 0
  await runPool([...missing.values()], CONCURRENCY, async ({ id, home }) => {
    const key = iconKey(id)
    const host = new URL(home).hostname
    try {
      await downloadImage(
        `https://icons.duckduckgo.com/ip3/${host}.ico`,
        join(iconsDir, `${key}.png`),
        id,
      )
    } catch (e) {
      failed++
      consola.warn(`${id}: failed to download icon (${host})`, e instanceof Error ? e.message : e)
    }
  })

  if (failed) {
    consola.warn(`${failed} icon(s) failed. Existing icons were kept; re-run \`pnpm gen:icons\` later or add icons manually.`)
  } else {
    consola.success("Icons updated.")
  }
}

main().catch((e) => {
  consola.error(e)
  process.exitCode = 1
})
