export default defineSource({
  // 官方 Atom feed（最新问题）。原先使用 Google News 的 site: 搜索，国内网络无法访问。
  segmentfault: defineRSSSource("https://segmentfault.com/feeds/questions"),
})
