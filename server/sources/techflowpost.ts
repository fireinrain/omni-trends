export default defineSource({
  // 官方 RSS（快讯 + 文章）。原先使用 Google News 的 site: 搜索，国内网络无法访问。
  techflowpost: defineRSSSource("https://www.techflowpost.com/rss/v2/feed.xml?lang=zh-CN&type=all&topic=all&tag=all"),
})
