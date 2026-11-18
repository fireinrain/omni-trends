import { XMLParser } from "fast-xml-parser"
import type { RSSInfo } from "../types"

export async function rss2json(url: string): Promise<RSSInfo | undefined> {
  if (!/^https?:\/\/[^\s$.?#].\S*/i.test(url)) return

  const data = await myFetch(url, { responseType: "text" })

  return parseRSS(data as string)
}

interface AtomLink {
  href?: string
  rel?: string
  type?: string
}

/**
 * RSS 的 link 是纯文本，Atom 的 link 则是带属性的对象数组（alternate/self/replies 等），
 * 这里统一取可访问的 alternate 地址。
 */
function parseLink(link: string | AtomLink | AtomLink[] | undefined): string {
  if (!link) return ""
  if (typeof link === "string") return link
  if (Array.isArray(link)) {
    const preferred = link.find(item => item?.href && (item.rel === "alternate" || item.type === "text/html"))
    return preferred?.href ?? link.find(item => item?.href)?.href ?? ""
  }
  return link.href ?? ""
}

export function parseRSS(data: string): RSSInfo {
  const xml = new XMLParser({
    attributeNamePrefix: "",
    textNodeName: "$text",
    ignoreAttributes: false,
  })

  const result = xml.parse(data)

  let channel = result.rss && result.rss.channel ? result.rss.channel : result.feed
  if (Array.isArray(channel)) channel = channel[0]

  const rss = {
    title: channel.title ?? "",
    description: channel.description ?? "",
    link: parseLink(channel.link),
    image: channel.image ? channel.image.url : channel["itunes:image"] ? channel["itunes:image"].href : "",
    category: channel.category || [],
    updatedTime: channel.lastBuildDate ?? channel.updated,
    items: [],
  }

  let items = channel.item || channel.entry || []
  if (items && !Array.isArray(items)) items = [items]

  for (let i = 0; i < items.length; i++) {
    const val = items[i]
    const media = {}

    const obj = {
      id: val.guid && val.guid.$text ? val.guid.$text : val.id,
      title: val.title && val.title.$text ? val.title.$text : val.title,
      description: val.summary && val.summary.$text ? val.summary.$text : val.description,
      link: parseLink(val.link),
      author: val.author && val.author.name ? val.author.name : val["dc:creator"],
      created: val.updated ?? val.pubDate ?? val.created,
      category: val.category || [],
      content: val.content && val.content.$text ? val.content.$text : val["content:encoded"],
      enclosures: val.enclosure ? (Array.isArray(val.enclosure) ? val.enclosure : [val.enclosure]) : [],
    };

    ["content:encoded", "podcast:transcript", "itunes:summary", "itunes:author", "itunes:explicit", "itunes:duration", "itunes:season", "itunes:episode", "itunes:episodeType", "itunes:image"].forEach((s) => {
      // @ts-expect-error TODO
      if (val[s]) obj[s.replace(":", "_")] = val[s]
    })

    if (val["media:thumbnail"]) {
      Object.assign(media, { thumbnail: val["media:thumbnail"] })
      obj.enclosures.push(val["media:thumbnail"])
    }

    if (val["media:content"]) {
      Object.assign(media, { thumbnail: val["media:content"] })
      obj.enclosures.push(val["media:content"])
    }

    if (val["media:group"]) {
      if (val["media:group"]["media:title"]) obj.title = val["media:group"]["media:title"]

      if (val["media:group"]["media:description"]) obj.description = val["media:group"]["media:description"]

      if (val["media:group"]["media:thumbnail"]) obj.enclosures.push(val["media:group"]["media:thumbnail"].url)

      if (val["media:group"]["media:content"]) obj.enclosures.push(val["media:group"]["media:content"])
    }

    Object.assign(obj, { media })

    // @ts-expect-error TODO
    rss.items.push(obj)
  }

  return rss
}
