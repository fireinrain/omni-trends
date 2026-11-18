import type { NewsItem } from "@shared/types"

const feedUrl = "https://chinadigitaltimes.net/chinese/feed/"
const readerUrl = `https://r.jina.ai/${feedUrl}`

/**
 * 先直接请求官网 RSS。
 */
async function fetchOfficialFeed(): Promise<NewsItem[]> {
  const xml = await myFetch(feedUrl, {
    responseType: "text",
    timeout: 8000,
    retry: 0,
  }) as string

  const data = parseRSS(xml)
  if (!data.items.length) throw new Error("Empty chinadigitaltimes feed")

  return data.items.map(item => ({
    id: item.link,
    title: item.title,
    url: item.link,
    pubDate: item.created,
  }))
}

/**
 * 官网启用了 Cloudflare 人机校验，服务端直接请求时可能返回 403。
 * Jina Reader 可以读取同一份 RSS，并把条目转换成 markdown，这里再解析回新闻列表。
 */
function parseReaderMarkdown(markdown: string): NewsItem[] {
  const items: NewsItem[] = []
  const lines = markdown.split("\n")
  const dateRegex = /^[A-Z][a-z]{2}, \d{1,2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} [+-]\d{4}$/

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^###\s+\[(.+)\]\((https?:\/\/\S+)\)\s*$/)
    if (!match) continue

    const [, title, url] = match
    let pubDate: string | undefined
    for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
      const line = lines[j].trim()
      if (dateRegex.test(line)) {
        pubDate = line
        break
      }
    }

    items.push({ id: url, title, url, pubDate })
  }

  return items
}

export default defineSource(async () => {
  try {
    return await fetchOfficialFeed()
  } catch {
    const markdown = await myFetch(readerUrl, {
      responseType: "text",
      timeout: 20000,
    }) as string
    const items = parseReaderMarkdown(markdown)
    if (!items.length) throw new Error("Cannot fetch chinadigitaltimes data")
    return items
  }
})
