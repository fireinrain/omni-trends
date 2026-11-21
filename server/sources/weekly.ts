import type { NewsItem } from "@shared/types"
import type { RSSInfo } from "../types"

/**
 * 把周刊的 RSS/Atom 转成卡片数据。
 *
 * 这类订阅源一期只有一条，标题就是当期的亮点，link 指向该期正文；
 * 因此直接用 link 作为 id，避免同一期被重复展示。
 */
export function parseWeeklyItems(data: RSSInfo | undefined, titlePattern?: RegExp): NewsItem[] {
  if (!data?.items.length) throw new Error("Cannot fetch weekly feed")

  const seen = new Set<string>()
  const items: NewsItem[] = []

  for (const item of data.items) {
    const title = typeof item.title === "string" ? item.title.trim() : ""
    const url = item.link
    if (!title || !url || !/^https?:\/\//.test(url)) continue
    if (titlePattern && !titlePattern.test(title)) continue
    if (seen.has(url)) continue

    seen.add(url)
    items.push({
      id: url,
      title,
      url,
      pubDate: item.created,
    })
  }

  if (!items.length) throw new Error("Cannot fetch weekly feed (empty list)")
  return items
}

async function fetchWeekly(url: string, titlePattern?: RegExp): Promise<NewsItem[]> {
  const data = await rss2json(url)
  return parseWeeklyItems(data, titlePattern)
}

const rustWeekly = defineSource(() => fetchWeekly("https://this-week-in-rust.org/rss.xml"))
// pythonweekly.com 有 Cloudflare 校验，改用同样每周出版的 PyCoder's Weekly。
const pythonWeekly = defineSource(() => fetchWeekly("https://pycoders.com/feed"))
// Baeldung 的 /java-weekly/feed 是评论源，周刊正刊发布在主 feed 里。
const javaWeekly = defineSource(() => fetchWeekly("https://www.baeldung.com/feed", /^Java Weekly/i))
const golangWeekly = defineSource(() => fetchWeekly("https://golangweekly.com/rss/"))
const jsWeekly = defineSource(() => fetchWeekly("https://javascriptweekly.com/rss/"))

export default defineSource({
  "rust-weekly": rustWeekly,
  "python-weekly": pythonWeekly,
  "java-weekly": javaWeekly,
  "golang-weekly": golangWeekly,
  "js-weekly": jsWeekly,
})
