export const ZAOBAO_RSS_URL = "https://plink.anyfeeder.com/zaobao/realtime/world"

/**
 * 联合早报国际新闻。
 *
 * 官网已不提供 RSS，直接请求 `www.zaobao.com/news/world` 还会对海外 IP
 * 返回 301 跳转到 `.com.sg`，导致部分服务器解析不到文章列表。
 * 这里改用 RSSHub 的 zaobao/realtime/world 路由，由上游完成抓取与跳转，
 * 本服务只消费标准 RSS，避免区域重定向造成的解析失败。
 */
export default defineRSSSource(ZAOBAO_RSS_URL)
