import type { NewsItem } from "@shared/types"

const BASE_URL = "https://www.lifeweek.com.cn"
// 官网 /api/article 列表里 contentType=54 是编辑部文章，11 是品牌推广内容
const ARTICLE_CONTENT_TYPE = 54

interface LifeweekRawItem {
  id?: number
  title?: string
  pubTime?: string
  contentType?: number
}

interface LifeweekResponse {
  model?: {
    list?: LifeweekRawItem[]
  }
}

export function parseLifeweekItems(res: LifeweekResponse): NewsItem[] {
  const list = res?.model?.list
  if (!Array.isArray(list)) return []

  const seen = new Set<number>()
  const items: NewsItem[] = []
  for (const item of list) {
    if (item.contentType !== ARTICLE_CONTENT_TYPE) continue
    if (!item.id || !item.title?.trim()) continue
    if (seen.has(item.id)) continue
    seen.add(item.id)

    const pubTime = item.pubTime
    const pubDate = pubTime && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(pubTime)
      ? tranformToUTC(pubTime, "YYYY-MM-DD HH:mm:ss")
      : undefined

    items.push({
      id: item.id,
      title: item.title.replace(/^[\u200B\s]+/, ""),
      url: `${BASE_URL}/article/${item.id}`,
      pubDate,
    })
  }
  return items.sort((a, b) => Number(b.pubDate ?? 0) - Number(a.pubDate ?? 0))
}

/**
 * 三联生活周刊：官网没有 RSS，使用主页「最近更新」调用的官方 JSON 接口。
 */
export default defineSource(async () => {
  const res = await myFetch<LifeweekResponse>(`${BASE_URL}/api/article?pgNo=1&rowNum=60`, {
    headers: {
      "Accept": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  })
  const items = parseLifeweekItems(res)
  if (!items.length) throw new Error("Cannot fetch lifeweek data")
  return items.slice(0, 30)
})
