import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

const base = "https://www.zaobao.com"

/**
 * 联合早报国际新闻。
 *
 * 原先通过第三方镜像「早晨报」抓取，该站点目前已无法访问，改为直接解析官网国际版块。
 * 列表项链接形如 `/news/world/story20261118-10020002`，日期可直接从其中解析出来；
 * 部分条目只显示「xx分钟前」，则交给 parseRelativeDate 处理。
 */
export default defineSource(async () => {
  const html = await myFetch(`${base}/news/world`, { responseType: "text" }) as string
  const $ = cheerio.load(html)
  const news: NewsItem[] = []
  const seen = new Set<string>()

  $("[data-testid=\"article-list\"] article").each((_, el) => {
    const article = $(el)
    const link = article.find("a[href*=\"/story\"]").first()
    const href = link.attr("href")
    if (!href) return

    const url = new URL(href, base).toString()
    if (seen.has(url)) return
    seen.add(url)

    const title = (link.attr("title") || article.find("a[title]").first().attr("title") || "").trim()
    if (!title) return

    const time = article.find("div.text-xs span").first().text().trim()
    let pubDate: number | undefined
    const matched = href.match(/story(\d{4})(\d{2})(\d{2})-/)
    if (matched && /^\d{1,2}:\d{2}$/.test(time)) {
      // 官网时间使用新加坡时区（UTC+8），与北京时间一致
      pubDate = tranformToUTC(`${matched[1]}-${matched[2]}-${matched[3]} ${time}`, "YYYY-MM-DD HH:mm", "Asia/Singapore")
    } else if (time) {
      pubDate = new Date(parseRelativeDate(time, "Asia/Singapore")).valueOf()
    }

    news.push({
      id: url,
      url,
      title,
      pubDate,
    })
  })

  return news.sort((m, n) => n.pubDate! > m.pubDate! ? 1 : -1)
})
