export const HELLOGITHUB_FEATURED_RSS_URL = "https://rsshub.liumingye.cn/hellogithub/home"

/**
 * HelloGitHub 精选项目。
 * 使用公共 RSSHub 实例的 /hellogithub/home 路由（rsshub://hellogithub/home）。
 * 项目内置的 defineRSSHubSource 固定使用 rsshub.rssforever.com，当前返回 503，
 * 因此这里直接用可用的公共实例地址消费标准 RSS。
 */
const hellogithubFeatured = defineRSSSource(HELLOGITHUB_FEATURED_RSS_URL)

export default defineSource({
  "hellogithub-featured": hellogithubFeatured,
})
