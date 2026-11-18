interface StcnItem {
  id?: number
  title?: string
  url?: string
  web_url?: string
  /** 毫秒时间戳 */
  time?: number
  /** 秒级时间戳 */
  show_time?: number
}

interface StcnRes {
  state: number
  data: StcnItem[]
}

/**
 * 证券时报「人民财讯」快讯列表。
 *
 * 原先使用 Google News 的 site: 搜索，国内网络无法访问。
 * 官网该列表由前端请求同一个地址（type=kx）返回 JSON，带毫秒时间戳，直接使用即可。
 */
export default defineSource(async () => {
  const res = await myFetch<StcnRes>("https://www.stcn.com/article/list.html?type=kx", {
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "Accept": "application/json",
    },
  })
  if (res.state !== 1 || !Array.isArray(res.data)) throw new Error("Cannot fetch stcn data")

  const base = "https://www.stcn.com"
  return res.data
    .filter(item => item.title && (item.url || item.web_url))
    .map(item => ({
      id: item.id ?? item.url ?? item.web_url!,
      title: item.title!,
      url: new URL(item.url ?? item.web_url!, base).toString(),
      pubDate: item.time ?? (item.show_time ? item.show_time * 1000 : undefined),
    }))
})
