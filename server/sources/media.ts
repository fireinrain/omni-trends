/**
 * 中文 / 英文媒体 RSS 源。
 *
 * 这些站点都提供标准的 RSS 或 Atom 订阅，统一走 defineRSSSource：
 * 标题、link、pubDate 由 rss2json 解析后映射成卡片数据。
 */

// ===== 中文媒体 =====
const chinanews = defineRSSSource("https://www.chinanews.com.cn/rss/scroll-news.xml")
const tmtpost = defineRSSSource("https://www.tmtpost.com/rss.xml")
const leiphone = defineRSSSource("https://www.leiphone.com/feed")
const eeo = defineRSSSource("https://www.eeo.com.cn/rss.xml")
const timeweekly = defineRSSSource("https://www.time-weekly.com/rss")

// ===== 英文科技媒体 =====
const theverge = defineRSSSource("https://www.theverge.com/rss/index.xml")
const techcrunch = defineRSSSource("https://techcrunch.com/feed/")
const arstechnica = defineRSSSource("https://feeds.arstechnica.com/arstechnica/index")
const wired = defineRSSSource("https://www.wired.com/feed/rss")
const cnet = defineRSSSource("https://www.cnet.com/rss/all/")
const zdnet = defineRSSSource("https://www.zdnet.com/news/rss.xml")
const githubblog = defineRSSSource("https://github.blog/feed/")
const stackoverflowblog = defineRSSSource("https://stackoverflow.blog/feed/")
const mittechreview = defineRSSSource("https://www.technologyreview.com/feed/")
const ieeespectrum = defineRSSSource("https://spectrum.ieee.org/feeds/topic.rss")

// ===== 英文世界 / 财经媒体 =====
const npr = defineRSSSource("https://feeds.npr.org/1001/rss.xml")
const marketwatch = defineRSSSource("https://feeds.marketwatch.com/marketwatch/topstories/")
const abcnews = defineRSSSource("https://abcnews.go.com/abcnews/topstories")
const france24 = defineRSSSource("https://www.france24.com/en/rss")
const seekingalpha = defineRSSSource("https://seekingalpha.com/feed.xml")

export default defineSource({
  chinanews,
  tmtpost,
  leiphone,
  eeo,
  timeweekly,
  theverge,
  techcrunch,
  arstechnica,
  wired,
  cnet,
  zdnet,
  githubblog,
  stackoverflowblog,
  mittechreview,
  ieeespectrum,
  npr,
  marketwatch,
  abcnews,
  france24,
  seekingalpha,
})
