import type { NewsItem } from "@shared/types"

interface NgaItem {
  tid: number
  subject: string
  replies: number
  /** 秒级时间戳：主题创建时间 */
  postdate: number
  /** 秒级时间戳：最后一次回复时间 */
  lastpost: number
  tpcurl: string
}

interface NgaResponse {
  code: number
  result: NgaItem[][]
}

interface NgaTopicResponse {
  code: number
  result: {
    __T?: NgaItem[]
  }
}

/** 置顶公告和长期无人回复的帖子不算热门，默认 7 天未更新的直接丢弃。 */
const MAX_STALE_MS = 7 * 24 * 60 * 60 * 1000
const TOPIC_MAX_STALE_MS = 30 * 24 * 60 * 60 * 1000

function normalizeNgaItems(list: NgaItem[] | undefined, now: number, maxStaleMs: number): NewsItem[] {
  if (!Array.isArray(list)) throw new Error("Cannot fetch NGA data")

  const seen = new Set<number>()
  const items: NewsItem[] = []

  for (const v of list) {
    if (!v?.tid || !v.subject || !v.tpcurl) continue
    if (seen.has(v.tid)) continue

    const lastpost = Number(v.lastpost) * 1000
    if (!Number.isFinite(lastpost) || now - lastpost > maxStaleMs) continue

    seen.add(v.tid)
    items.push({
      id: v.tid,
      title: v.subject,
      url: `https://bbs.nga.cn${v.tpcurl}`,
      // 列表按最近回复的热度排序，时间线也应显示最近活跃时间而不是发帖时间。
      pubDate: lastpost,
      extra: {
        info: `${v.replies} 回复`,
      },
    })
  }

  if (!items.length) throw new Error("Cannot fetch NGA data (empty list)")
  return items
}

/** reply ladder 接口：全站热门回复榜。 */
export function parseNgaItems(res: NgaResponse, now = Date.now()): NewsItem[] {
  if (res?.code !== 0) throw new Error("Cannot fetch NGA data")
  return normalizeNgaItems(res.result?.[0], now, MAX_STALE_MS)
}

/** thread.php?stid=... 接口：专题（股市技术分析）主题列表。 */
export function parseNgaTopicItems(res: NgaTopicResponse, now = Date.now()): NewsItem[] {
  if (res?.code !== 0) throw new Error("Cannot fetch NGA big-era data")
  return normalizeNgaItems(res.result?.__T, now, TOPIC_MAX_STALE_MS)
}

const hot = defineSource(async () => {
  const url = "https://ngabbs.com/nuke.php?__lib=load_topic&__act=load_topic_reply_ladder2&opt=1&all=1"
  const res: NgaResponse = await myFetch(url, {
    responseType: "json",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": "https://ngabbs.com/",
      "X-User-Agent": "NGA_skull/7.3.1(iPhone13,2;iOS 17.2.1)",
    },
    body: "__output=14",
  })

  return parseNgaItems(res)
})

const bigEra = defineSource(async () => {
  // __output=14 让 NGA 直接返回 JSON，避免解析 GBK 页面。
  const url = "https://bbs.nga.cn/thread.php?stid=47206901&__output=14"
  const res: NgaTopicResponse = await myFetch(url, {
    responseType: "json",
    headers: {
      "Referer": "https://bbs.nga.cn/thread.php?stid=47206901",
      "X-User-Agent": "NGA_skull/7.3.1(iPhone13,2;iOS 17.2.1)",
    },
  })

  return parseNgaTopicItems(res)
})

export default defineSource({
  "ngabbs": hot,
  "ngabbs-big-era": bigEra,
})
