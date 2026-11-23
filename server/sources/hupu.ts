import type { NewsItem } from "@shared/types"

interface HotItem {
  id: string
  title: string
  url: string
  mobileUrl: string
}

interface HupuThread {
  tid: string
  title: string
  /** 相对路径，例如 /644156449.html */
  url: string
  /** 点亮数 */
  lights: number
  replies: number
  /** 浏览数 */
  read: number
  /** 毫秒级时间戳：发帖时间 */
  createdAt: number
  /** 毫秒级时间戳：最后回复时间 */
  repliedAt: number
}

interface HupuPageData {
  topic?: {
    threads?: {
      list?: HupuThread[]
    }
  }
}

/** 24 小时榜按最近活跃排序，留一倍余量丢弃置顶/陈旧帖子。 */
const STOCK_MAX_STALE_MS = 48 * 60 * 60 * 1000

/** 从股票区页面内嵌的 window.$$data 中解析帖子列表。 */
export function parseHupuStockItems(html: string, now = Date.now()): NewsItem[] {
  const match = html.match(/window\.\$\$data\s*=([\s\S]*?)<\/script>/)
  if (!match) throw new Error("Cannot fetch Hupu stock data")

  let data: HupuPageData
  try {
    data = JSON.parse(match[1].trim().replace(/;\s*$/, ""))
  } catch {
    throw new Error("Cannot fetch Hupu stock data")
  }

  const list = data?.topic?.threads?.list
  if (!Array.isArray(list)) throw new Error("Cannot fetch Hupu stock data")

  const seen = new Set<string>()
  const items: NewsItem[] = []

  for (const v of list) {
    if (!v?.tid || !v.title || !v.url) continue
    if (seen.has(v.tid)) continue

    const repliedAt = Number(v.repliedAt)
    if (!Number.isFinite(repliedAt) || now - repliedAt > STOCK_MAX_STALE_MS) continue

    seen.add(v.tid)
    const url = `https://bbs.hupu.com${v.url}`
    items.push({
      id: v.tid,
      title: v.title,
      url,
      mobileUrl: url,
      // 热榜按最近回复的热度排序，时间线也应显示最近活跃时间而不是发帖时间。
      pubDate: repliedAt,
      extra: {
        info: `${v.replies} 回复`,
        hover: `${v.read} 浏览 · ${v.lights} 点亮`,
      },
    })
  }

  if (!items.length) throw new Error("Cannot fetch Hupu stock data (empty list)")
  return items
}

const hot = defineSource(async () => {
  // 获取虎扑新热榜页面的HTML内容
  const html = await myFetch(`https://bbs.hupu.com/topic-daily-hot`)

  // 正则表达式匹配新的热榜项结构
  const regex = /<li class="bbs-sl-web-post-body">[\s\S]*?<a href="(\/[^"]+?\.html)"[^>]*?class="p-title"[^>]*>([^<]+)<\/a>/g

  const result: HotItem[] = []
  let match

  // 将赋值操作移到循环内部，修复no-cond-assign警告
  while (true) {
    match = regex.exec(html)
    if (!match) break

    const [, path, title] = match

    // 构建完整URL
    const url = `https://bbs.hupu.com${path}`

    result.push({
      id: path,
      title: title.trim(),
      url,
      mobileUrl: url,
    })
  }

  return result
})

const stock = defineSource(async () => {
  // 股票区「24小时榜」，页面内嵌 window.$$data JSON，比解析 HTML 更稳定。
  const html = await myFetch("https://bbs.hupu.com/stock-hot", { responseType: "text" }) as string
  return parseHupuStockItems(html)
})

export default defineSource({
  "hupu": hot,
  "hupu-stock": stock,
})
