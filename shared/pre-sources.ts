import { Interval } from "./consts"
import { typeSafeObjectFromEntries } from "./type.util"
import type { OriginSource, Source, SourceID } from "./types"

const Time = {
  Test: 1,
  Realtime: 2 * 60 * 1000,
  Fast: 5 * 60 * 1000,
  Default: Interval, // 10min
  Common: 30 * 60 * 1000,
  Slow: 60 * 60 * 1000,
}

export const originSources = {
  "douyin": {
    name: "抖音",
    type: "hottest",
    column: "china",
    color: "gray",
    home: "https://www.douyin.com",
  },
  "xiaohongshu": {
    name: "小红书",
    type: "hottest",
    column: "china",
    color: "red",
    home: "https://www.xiaohongshu.com",
  },
  "weibo": {
    name: "微博",
    title: "实时热搜",
    type: "hottest",
    column: "china",
    color: "red",
    interval: Time.Realtime,
    home: "https://weibo.com",
  },
  "zhihu": {
    name: "知乎",
    type: "hottest",
    column: "china",
    color: "blue",
    home: "https://www.zhihu.com",
  },
  "bilibili": {
    name: "哔哩哔哩",
    color: "blue",
    home: "https://www.bilibili.com",
    sub: {
      "hot-search": {
        title: "热搜",
        column: "china",
        type: "hottest",
      },
      "hot-video": {
        title: "热门视频",
        column: "china",
        type: "hottest",
      },
      "ranking": {
        title: "排行榜",
        column: "china",
        type: "hottest",
        interval: Time.Common,
      },
    },
  },
  "baidu": {
    name: "百度热搜",
    column: "china",
    color: "blue",
    type: "hottest",
    home: "https://www.baidu.com",
  },
  "toutiao": {
    name: "今日头条",
    type: "hottest",
    column: "china",
    color: "red",
    home: "https://www.toutiao.com",
  },
  "tencent": {
    name: "腾讯新闻",
    column: "china",
    color: "blue",
    home: "https://news.qq.com",
    sub: {
      hot: {
        title: "综合早报",
        type: "hottest",
        interval: Time.Common,
        home: "https://news.qq.com/tag/aEWqxLtdgmQ=",
      },
    },
  },
  "hupu": {
    name: "虎扑",
    home: "https://hupu.com",
    column: "china",
    title: "主干道热帖",
    type: "hottest",
    color: "red",
  },
  "hupu-stock": {
    name: "虎扑股票区",
    title: "24小时热帖",
    type: "hottest",
    column: "finance",
    color: "red",
    home: "https://bbs.hupu.com/stock",
    desc: "虎扑股票区 24 小时热帖榜",
  },
  "tieba": {
    name: "百度贴吧",
    title: "热议",
    column: "china",
    type: "hottest",
    color: "blue",
    home: "https://tieba.baidu.com",
  },
  "douban": {
    name: "豆瓣",
    column: "china",
    title: "热门电影",
    color: "green",
    type: "hottest",
    home: "https://www.douban.com",
  },
  "sina": {
    name: "新浪",
    type: "hottest",
    column: "china",
    color: "red",
    home: "https://sina.com.cn",
  },
  "zhihu-daily": {
    name: "知乎日报",
    column: "china",
    color: "blue",
    home: "https://daily.zhihu.com",
  },
  "kuaishou": {
    name: "快手",
    type: "hottest",
    column: "china",
    color: "orange",
    home: "https://www.kuaishou.com",
  },
  "36kr": {
    name: "36氪",
    type: "realtime",
    color: "blue",
    home: "https://36kr.com",
    column: "tech",
    sub: {
      quick: {
        title: "快讯",
      },
    },
  },
  "huxiu": {
    name: "虎嗅",
    type: "hottest",
    column: "tech",
    color: "orange",
    home: "https://www.huxiu.com",
  },
  "sspai": {
    name: "少数派",
    column: "tech",
    color: "red",
    type: "hottest",
    home: "https://sspai.com",
  },
  "juejin": {
    name: "稀土掘金",
    column: "tech",
    color: "blue",
    type: "hottest",
    home: "https://juejin.cn",
  },
  "csdn": {
    name: "CSDN",
    type: "hottest",
    column: "tech",
    color: "red",
    home: "https://www.csdn.net",
  },
  "linuxdo": {
    name: "LINUX DO",
    column: "tech",
    color: "slate",
    home: "https://linux.do/",
    disable: true,
    sub: {
      latest: {
        title: "最新",
        home: "https://linux.do/latest",
      },
      hot: {
        title: "今日最热",
        type: "hottest",
        interval: Time.Common,
        home: "https://linux.do/hot",
      },
    },
  },
  "linuxdo-top": {
    name: "LINUX DO",
    title: "热门话题",
    column: "tech",
    type: "realtime",
    color: "slate",
    interval: Time.Common,
    home: "https://linux.do/top",
  },
  "producthunt": {
    name: "Product Hunt",
    color: "red",
    column: "tech",
    type: "hottest",
    home: "https://www.producthunt.com/",
  },
  "github": {
    name: "Github",
    color: "gray",
    home: "https://github.com/",
    column: "tech",
    sub: {
      "trending-today": {
        title: "Today",
        type: "hottest",
      },
    },
  },
  "hackernews": {
    name: "Hacker News",
    color: "orange",
    column: "tech",
    type: "hottest",
    home: "https://news.ycombinator.com/",
  },
  "nowcoder": {
    name: "牛客",
    column: "china",
    color: "blue",
    type: "hottest",
    home: "https://www.nowcoder.com",
  },
  "segmentfault": {
    name: "SegmentFault",
    type: "hottest",
    column: "tech",
    color: "green",
    home: "https://segmentfault.com",
  },
  // ===== 社区 =====
  "huggingface": {
    name: "Huggingface Papers",
    type: "hottest",
    column: "tech",
    color: "yellow",
    home: "https://huggingface.co/papers",
  },
  "thepaper": {
    name: "澎湃新闻",
    interval: Time.Common,
    type: "hottest",
    column: "china",
    title: "热榜",
    color: "gray",
    home: "https://www.thepaper.cn",
  },
  "ifeng": {
    name: "凤凰网",
    column: "china",
    color: "red",
    type: "hottest",
    title: "热点资讯",
    home: "https://www.ifeng.com",
  },
  "cls": {
    name: "财联社",
    color: "red",
    column: "finance",
    home: "https://www.cls.cn",
    sub: {
      telegraph: {
        title: "电报",
        interval: Time.Fast,
        type: "realtime",
      },
      depth: {
        title: "深度",
      },
      hot: {
        title: "热门",
        type: "hottest",
      },
    },
  },
  "xueqiu": {
    name: "雪球",
    color: "blue",
    home: "https://xueqiu.com",
    column: "finance",
    sub: {
      hotstock: {
        title: "热门股票",
        interval: Time.Realtime,
        type: "hottest",
      },
    },
  },
  "wallstreetcn": {
    name: "华尔街见闻",
    color: "blue",
    column: "finance",
    home: "https://wallstreetcn.com/",
    sub: {
      quick: {
        type: "realtime",
        interval: Time.Fast,
        title: "快讯",
      },
      news: {
        title: "最新",
        interval: Time.Common,
      },
      hot: {
        title: "最热",
        type: "hottest",
        interval: Time.Common,
      },
    },
  },
  "sputniknewscn": {
    name: "卫星通讯社",
    color: "orange",
    column: "world",
    home: "https://sputniknews.cn",
  },
  "cankaoxiaoxi": {
    name: "参考消息",
    color: "red",
    column: "world",
    interval: Time.Common,
    home: "https://china.cankaoxiaoxi.com",
  },
  "zaobao": {
    name: "联合早报",
    interval: Time.Common,
    type: "realtime",
    column: "world",
    color: "red",
    desc: "来自联合早报官网: 国际",
    home: "https://www.zaobao.com",
  },
  "v2ex": {
    name: "V2EX",
    color: "slate",
    home: "https://v2ex.com/",
    sub: {
      share: {
        title: "最新分享",
        column: "tech",
      },
    },
  },
  "coolapk": {
    name: "酷安",
    type: "hottest",
    column: "tech",
    color: "green",
    title: "今日最热",
    home: "https://coolapk.com",
  },
  "mktnews": {
    name: "MKTNews",
    column: "finance",
    home: "https://mktnews.net",
    color: "indigo",
    interval: Time.Realtime,
    disable: true,
    sub: {
      flash: {
        title: "快讯",
      },
    },
  },
  "pcbeta": {
    name: "远景论坛",
    color: "blue",
    column: "tech",
    home: "https://bbs.pcbeta.com",
    sub: {
      windows11: {
        title: "Win11",
        type: "realtime",
        interval: Time.Fast,
      },
      windows: {
        title: "Windows 资源",
        type: "realtime",
        interval: Time.Fast,
        disable: true,
      },
    },
  },
  "gelonghui": {
    name: "格隆汇",
    color: "blue",
    title: "事件",
    column: "finance",
    type: "realtime",
    interval: Time.Realtime,
    home: "https://www.gelonghui.com",
  },
  "fastbull": {
    name: "法布财经",
    color: "emerald",
    home: "https://www.fastbull.cn",
    column: "finance",
    disable: true,
    sub: {
      express: {
        title: "快讯",
        type: "realtime",
        interval: Time.Realtime,
      },
      news: {
        title: "头条",
        interval: Time.Common,
      },
    },
  },
  "solidot": {
    name: "Solidot",
    color: "teal",
    column: "tech",
    home: "https://solidot.org",
    interval: Time.Slow,
  },
  "ghxi": {
    name: "果核剥壳",
    column: "china",
    color: "yellow",
    home: "https://www.ghxi.com/",
  },
  "smzdm": {
    name: "什么值得买",
    column: "china",
    color: "red",
    type: "hottest",
    home: "https://www.smzdm.com",
    disable: true,
  },
  "kaopu": {
    name: "靠谱新闻",
    column: "world",
    color: "gray",
    interval: Time.Common,
    desc: "不一定靠谱，多看多思考",
    home: "https://kaopu.news/",
  },
  "jin10": {
    name: "金十数据",
    column: "finance",
    color: "blue",
    type: "realtime",
    home: "https://www.jin10.com",
  },
  "chongbuluo": {
    name: "虫部落",
    column: "china",
    color: "green",
    home: "https://www.chongbuluo.com",
    sub: {
      latest: {
        title: "最新",
        interval: Time.Common,
        home: "https://www.chongbuluo.com/forum.php?mod=guide&view=newthread",
      },
      hot: {
        title: "最热",
        type: "hottest",
        interval: Time.Common,
        home: "https://www.chongbuluo.com/forum.php?mod=guide&view=hot",
      },
    },
  },
  "steam": {
    name: "Steam",
    column: "world",
    title: "在线人数",
    color: "blue",
    type: "hottest",
    home: "https://store.steampowered.com",
  },
  "freebuf": {
    name: "Freebuf",
    column: "china",
    title: "网络安全",
    color: "green",
    home: "https://www.freebuf.com/",
  },

  "qqvideo": {
    name: "腾讯视频",
    column: "china",
    color: "blue",
    home: "https://v.qq.com/",
    sub: {
      "tv-hotsearch": {
        title: "热搜榜",
        type: "hottest",
        interval: Time.Common,
        home: "https://v.qq.com/channel/tv",

      },
    },
  },
  "iqiyi": {
    name: "爱奇艺",
    column: "china",
    color: "green",
    home: "https://www.iqiyi.com",
    sub: {
      "hot-ranklist": {
        title: "热播榜",
        type: "hottest",
        interval: Time.Common,
        home: "https://www.iqiyi.com",
      },
    },
  },
  // ===== 新增热榜源 =====
  "netease-news": {
    name: "网易新闻",
    type: "hottest",
    column: "china",
    color: "red",
    home: "https://news.163.com",
  },
  "ifanr": {
    name: "爱范儿",
    column: "tech",
    color: "green",
    home: "https://www.ifanr.com",
  },
  "guokr": {
    name: "果壳",
    column: "tech",
    color: "green",
    home: "https://www.guokr.com",
  },
  "geekpark": {
    name: "极客公园",
    column: "tech",
    color: "purple",
    home: "https://www.geekpark.net",
  },
  "csstricks": {
    name: "CSS-Tricks",
    column: "tech",
    color: "blue",
    interval: Time.Common,
    home: "https://css-tricks.com",
  },
  "daringfireball": {
    name: "Daring Fireball",
    column: "tech",
    color: "orange",
    interval: Time.Common,
    home: "https://daringfireball.net",
  },
  "nytimes": {
    name: "纽约时报",
    column: "world",
    color: "gray",
    interval: Time.Common,
    home: "https://cn.nytimes.com",
    sub: {
      china: {
        title: "中文",
      },
      global: {
        title: "国际",
      },
    },
  },
  "hellogithub-featured": {
    name: "HelloGitHub",
    title: "精选项目",
    column: "tech",
    color: "green",
    home: "https://hellogithub.com/?sort_by=featured",
  },
  "nodeseek": {
    name: "NodeSeek",
    column: "tech",
    color: "blue",
    home: "https://www.nodeseek.com",
  },
  "hostloc": {
    name: "全球主机交流",
    column: "tech",
    color: "blue",
    home: "https://hostloc.com",
  },
  "52pojie": {
    name: "吾爱破解",
    column: "tech",
    color: "green",
    home: "https://www.52pojie.cn",
  },
  "newsmth": {
    name: "水木社区",
    type: "hottest",
    column: "china",
    color: "blue",
    home: "https://www.newsmth.net",
  },
  "ngabbs": {
    name: "NGA",
    type: "hottest",
    column: "tech",
    color: "blue",
    home: "https://ngabbs.com",
  },
  "ngabbs-big-era": {
    name: "NGA大时代",
    title: "股市技术分析",
    type: "hottest",
    column: "finance",
    color: "blue",
    home: "https://bbs.nga.cn/thread.php?stid=47206901",
  },
  "jianshu": {
    name: "简书",
    column: "china",
    color: "red",
    home: "https://www.jianshu.com",
    disable: true,
  },
  "lol": {
    name: "英雄联盟",
    column: "tech",
    color: "blue",
    home: "https://lol.qq.com",
  },
  "miyoushe": {
    name: "米游社",
    column: "tech",
    color: "blue",
    home: "https://www.miyoushe.com",
    sub: {
      genshin: {
        title: "原神",
      },
      starrail: {
        title: "星穹铁道",
      },
      honkai: {
        title: "崩坏3",
      },
    },
  },
  "acfun": {
    name: "AcFun",
    type: "hottest",
    column: "china",
    color: "blue",
    home: "https://www.acfun.cn",
  },
  "dgtle": {
    name: "数字尾巴",
    column: "tech",
    color: "orange",
    home: "https://www.dgtle.com",
  },
  "weread": {
    name: "微信读书",
    type: "hottest",
    column: "china",
    color: "green",
    home: "https://weread.qq.com",
  },
  "netease-music": {
    name: "网易云音乐",
    type: "hottest",
    column: "china",
    color: "red",
    home: "https://music.163.com",
  },
  "weatheralarm": {
    name: "天气预警",
    column: "china",
    color: "orange",
    interval: Time.Common,
    home: "http://www.nmc.cn",
  },
  "history": {
    name: "历史今天",
    column: "china",
    color: "gray",
    interval: Time.Slow,
    home: "https://baike.baidu.com/calendar",
  },
  "qq-news": {
    name: "腾讯新闻",
    type: "hottest",
    column: "china",
    color: "blue",
    home: "https://news.qq.com",
  },
  // ===== 国际媒体 =====
  "bbc": {
    name: "BBC News",
    type: "realtime",
    column: "world",
    color: "gray",
    home: "https://www.bbc.com/news",
  },
  "apnews": {
    name: "AP News",
    type: "realtime",
    column: "world",
    color: "red",
    home: "https://apnews.com",
  },
  "nhk": {
    name: "NHK World",
    type: "realtime",
    column: "world",
    color: "blue",
    home: "https://www3.nhk.or.jp/nhkworld",
  },
  "washingtonpost": {
    name: "华盛顿邮报",
    type: "realtime",
    column: "world",
    color: "gray",
    home: "https://www.washingtonpost.com",
  },
  "wsj": {
    name: "华尔街日报",
    type: "realtime",
    column: "world",
    color: "blue",
    home: "https://www.wsj.com",
  },
  "aljazeera": {
    name: "半岛电视台",
    type: "realtime",
    column: "world",
    color: "orange",
    home: "https://www.aljazeera.com",
  },
  "guardian": {
    name: "卫报",
    type: "realtime",
    column: "world",
    color: "blue",
    home: "https://www.theguardian.com",
  },
  "economist": {
    name: "经济学人",
    type: "realtime",
    column: "world",
    color: "red",
    interval: Time.Common,
    home: "https://www.economist.com",
  },
  "chinadigitaltimes": {
    name: "中国数字时代",
    type: "realtime",
    column: "world",
    color: "yellow",
    interval: Time.Common,
    desc: "来自中国数字时代官网 RSS",
    home: "https://chinadigitaltimes.net/chinese",
  },
  // ===== 财经 =====
  "techflowpost": {
    name: "深潮 TechFlow",
    type: "realtime",
    column: "finance",
    color: "purple",
    home: "https://www.techflowpost.com",
  },
  "stcn": {
    name: "证券时报",
    type: "hottest",
    column: "finance",
    color: "red",
    home: "https://www.stcn.com",
  },
  // ===== 科技 =====
  "oschina": {
    name: "开源中国",
    type: "realtime",
    column: "tech",
    color: "red",
    home: "https://www.oschina.net",
  },
  "reddit": {
    name: "Reddit",
    color: "orange",
    column: "world",
    home: "https://www.reddit.com",
    sub: {
      hot: {
        title: "Hot",
      },
      worldnews: {
        title: "World News",
        type: "realtime",
      },
    },
  },
  "youtube": {
    name: "YouTube",
    color: "red",
    column: "tech",
    home: "https://www.youtube.com",
  },
  "ithome": {
    name: "IT之家",
    color: "red",
    column: "tech",
    type: "realtime",
    home: "https://www.ithome.com",
  },
  "rust-weekly": {
    name: "Rust Weekly",
    title: "This Week in Rust",
    color: "orange",
    column: "tech",
    type: "realtime",
    interval: Time.Slow,
    home: "https://this-week-in-rust.org",
  },
  "python-weekly": {
    name: "Python Weekly",
    title: "PyCoder's Weekly",
    color: "blue",
    column: "tech",
    type: "realtime",
    interval: Time.Slow,
    home: "https://pycoders.com",
  },
  "java-weekly": {
    name: "Java Weekly",
    title: "Baeldung",
    color: "red",
    column: "tech",
    type: "realtime",
    interval: Time.Slow,
    home: "https://www.baeldung.com/java-weekly",
  },
  "golang-weekly": {
    name: "Golang Weekly",
    color: "teal",
    column: "tech",
    type: "realtime",
    interval: Time.Slow,
    home: "https://golangweekly.com",
  },
  "js-weekly": {
    name: "JS Weekly",
    title: "JavaScript Weekly",
    color: "yellow",
    column: "tech",
    type: "realtime",
    interval: Time.Slow,
    home: "https://javascriptweekly.com",
  },

  // ===== 中文媒体 =====
  "chinanews": {
    name: "中新网",
    title: "即时新闻",
    color: "red",
    column: "china",
    type: "realtime",
    home: "https://www.chinanews.com.cn",
  },
  "tmtpost": {
    name: "钛媒体",
    color: "blue",
    column: "tech",
    type: "realtime",
    home: "https://www.tmtpost.com",
  },
  "leiphone": {
    name: "雷峰网",
    color: "green",
    column: "tech",
    type: "realtime",
    home: "https://www.leiphone.com",
  },
  "eeo": {
    name: "经济观察报",
    color: "blue",
    column: "finance",
    type: "realtime",
    interval: Time.Common,
    home: "http://www.eeo.com.cn",
  },
  "timeweekly": {
    name: "时代周报",
    color: "red",
    column: "china",
    type: "realtime",
    interval: Time.Common,
    home: "http://www.time-weekly.com",
  },
  "lifeweek": {
    name: "三联生活周刊",
    title: "最新文章",
    color: "red",
    column: "china",
    type: "realtime",
    interval: Time.Common,
    home: "https://www.lifeweek.com.cn",
  },

  // ===== 英文科技媒体 =====
  "theverge": {
    name: "The Verge",
    color: "purple",
    column: "tech",
    type: "realtime",
    home: "https://www.theverge.com",
  },
  "techcrunch": {
    name: "TechCrunch",
    color: "green",
    column: "tech",
    type: "realtime",
    home: "https://techcrunch.com",
  },
  "arstechnica": {
    name: "Ars Technica",
    color: "orange",
    column: "tech",
    type: "realtime",
    home: "https://arstechnica.com",
  },
  "wired": {
    name: "WIRED",
    color: "gray",
    column: "tech",
    type: "realtime",
    home: "https://www.wired.com",
  },
  "cnet": {
    name: "CNET",
    color: "red",
    column: "tech",
    type: "realtime",
    home: "https://www.cnet.com",
  },
  "zdnet": {
    name: "ZDNet",
    color: "blue",
    column: "tech",
    type: "realtime",
    home: "https://www.zdnet.com",
  },
  "githubblog": {
    name: "GitHub Blog",
    color: "gray",
    column: "tech",
    type: "realtime",
    interval: Time.Common,
    home: "https://github.blog",
  },
  "stackoverflowblog": {
    name: "Stack Overflow Blog",
    color: "orange",
    column: "tech",
    type: "realtime",
    interval: Time.Common,
    home: "https://stackoverflow.blog",
  },
  "mittechreview": {
    name: "MIT Tech Review",
    color: "red",
    column: "tech",
    type: "realtime",
    home: "https://www.technologyreview.com",
  },
  "ieeespectrum": {
    name: "IEEE Spectrum",
    color: "blue",
    column: "tech",
    type: "realtime",
    home: "https://spectrum.ieee.org",
  },

  // ===== 英文世界 / 财经媒体 =====
  "npr": {
    name: "NPR",
    color: "red",
    column: "world",
    type: "realtime",
    home: "https://www.npr.org",
  },
  "marketwatch": {
    name: "MarketWatch",
    color: "blue",
    column: "finance",
    type: "realtime",
    home: "https://www.marketwatch.com",
  },
  "abcnews": {
    name: "ABC News",
    color: "blue",
    column: "world",
    type: "realtime",
    home: "https://abcnews.go.com",
  },
  "france24": {
    name: "France 24",
    color: "blue",
    column: "world",
    type: "realtime",
    home: "https://www.france24.com",
  },
  "seekingalpha": {
    name: "Seeking Alpha",
    color: "green",
    column: "finance",
    type: "realtime",
    home: "https://seekingalpha.com",
  },
} as const satisfies Record<string, OriginSource>

export function genSources() {
  const _: [SourceID, Source][] = []

  Object.entries(originSources).forEach(([id, source]: [any, OriginSource]) => {
    const parent = {
      name: source.name,
      type: source.type,
      disable: source.disable,
      desc: source.desc,
      column: source.column,
      home: source.home,
      color: source.color ?? "primary",
      interval: source.interval ?? Time.Default,
    }
    if (source.sub && Object.keys(source.sub).length) {
      Object.entries(source.sub).forEach(([subId, subSource], i) => {
        if (i === 0) {
          _.push([
            id,
            {
              redirect: `${id}-${subId}`,
              ...parent,
              ...subSource,
            },
          ] as [any, Source])
        }
        _.push([`${id}-${subId}`, { ...parent, ...subSource }] as [
          any,
          Source,
        ])
      })
    } else {
      _.push([
        id,
        {
          title: source.title,
          ...parent,
        },
      ])
    }
  })

  return typeSafeObjectFromEntries(
    _.filter(([_, v]) => v.disable !== true),
  )
}
