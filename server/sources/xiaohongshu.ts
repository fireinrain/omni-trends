import process from "node:process"
import { Xhshow } from "@ikenxuan/xhshow-ts"
import type { NewsItem } from "@shared/types"

// 小红书没有公开的热榜接口，这里提供两条抓取策略：
//
// 1. 移动端热搜接口（首选）：复用抓包得到的固定 iOS 客户端指纹，无需登录。
//    小红书按设备指纹/IP 间歇性限流（返回 code=300013），这是常态而非故障，
//    因此被限流时需要回退到策略二。
// 2. Web 端热搜接口（回退）：使用 @ikenxuan/xhshow-ts 动态生成 x-s 等签名，
//    但需要提供登录态 Cookie（XHS_COOKIE，须包含 web_session）。
const MOBILE_ENDPOINT = "https://edith.xiaohongshu.com/api/sns/v1/search/hot_list"

const MOBILE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.7(0x18000733) NetType/WIFI Language/zh_CN",
  "Referer": "https://app.xhs.cn/",
  "xy-direction": "22",
  "xy-platform-info": "platform=iOS&version=8.7&build=8070515&deviceId=C323D3A5-6A27-4CE6-AA0E-51C9D4C26A24&bundle=com.xingin.discover",
  "xy-common-params": "app_id=ECFAAF02&build=8070515&channel=AppStore&deviceId=C323D3A5-6A27-4CE6-AA0E-51C9D4C26A24&device_fingerprint=20230920120211bd7b71a80778509cf4211099ea911000010d2f20f6050264&device_fingerprint1=20230920120211bd7b71a80778509cf4211099ea911000010d2f20f6050264&device_model=phone&fid=1695182528-0-0-63b29d709954a1bb8c8733eb2fb58f29&gid=7dc4f3d168c355f1a886c54a898c6ef21fe7b9a847359afc77fc24ad&identifier_flag=0&lang=zh-Hans&launch_id=716882697&platform=iOS&project_id=ECFAAF&sid=session.1695189743787849952190&t=1695190591&teenager=0&tz=Asia/Shanghai&uis=light&version=8.7",
  "shield": "XYAAAAAQAAAAEAAABTAAAAUzUWEe4xG1IYD9/c+qCLOlKGmTtFa+lG434Oe+FTRagxxoaz6rUWSZ3+juJYz8RZqct+oNMyZQxLEBaBEL+H3i0RhOBVGrauzVSARchIWFYwbwkV",
}

async function fetchMobileHotList(): Promise<NewsItem[]> {
  const res: any = await myFetch(MOBILE_ENDPOINT, { headers: MOBILE_HEADERS })

  if (res?.code === 300013) {
    throw new Error("xiaohongshu mobile hot list throttled (code=300013)")
  }
  if (!res?.success || !Array.isArray(res?.data?.items)) {
    throw new Error(`xiaohongshu mobile hot list error: code=${res?.code}, msg=${res?.msg || res?.message}`)
  }

  const news: NewsItem[] = res.data.items
    .filter((item: any) => item?.title)
    .map((item: any) => ({
      id: item.id || item.title,
      title: item.title,
      url: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(item.title)}`,
      extra: {
        info: item.score || undefined,
      },
    }))

  if (!news.length) {
    throw new Error("xiaohongshu mobile hot list returned empty")
  }

  return news
}

async function fetchWebTrending(): Promise<NewsItem[]> {
  const cookieStr = process.env.XHS_COOKIE
  if (!cookieStr) {
    throw new Error("XHS_COOKIE is not set")
  }

  // 从浏览器复制的完整 Cookie 中解析出 a1 / webId / web_session
  const cookies: Record<string, string> = {}
  for (const part of cookieStr.split(";")) {
    const idx = part.indexOf("=")
    if (idx === -1) continue
    const key = part.slice(0, idx).trim()
    const value = part.slice(idx + 1).trim()
    if (key) cookies[key] = value
  }

  const webSession = cookies.web_session
  if (!webSession) {
    throw new Error("XHS_COOKIE must include web_session")
  }

  const a1 = cookies.a1 || Xhshow.generateA1()
  const webId = cookies.webId || Xhshow.generateWebId(a1)

  const uri = "/api/sns/web/v1/search/trending/query"
  const params = { num: "20" }
  const client = new Xhshow()

  // 动态生成 x-s / x-s-common / x-t / 追踪 ID 等请求头（xyw 为数据接口所需的签名格式）
  const signedHeaders = client.signHeadersGet(
    uri,
    { a1, webId, web_session: webSession },
    "xhs-pc-web",
    params,
    undefined,
    undefined,
    "xyw",
  )

  const url = `https://edith.xiaohongshu.com${uri}?${new URLSearchParams(params).toString()}`
  const res: any = await myFetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      "Origin": "https://www.xiaohongshu.com",
      "Referer": "https://www.xiaohongshu.com/explore",
      "Accept": "application/json, text/plain, */*",
      "Cookie": `a1=${a1}; webId=${webId}; web_session=${webSession}`,
      ...signedHeaders,
    },
  })

  const queries = res?.data?.queries
  if (!res?.success || !Array.isArray(queries) || !queries.length) {
    throw new Error(`xiaohongshu web trending error: code=${res?.code}, msg=${res?.msg || res?.message}`)
  }

  const news: NewsItem[] = queries
    .filter((item: any) => item?.title && item?.searchWord)
    .map((item: any) => ({
      id: item.searchWord,
      title: item.title,
      url: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(item.searchWord)}`,
    }))

  if (!news.length) {
    throw new Error("xiaohongshu web trending returned empty")
  }

  return news
}

export default defineSource(async () => {
  try {
    return await fetchMobileHotList()
  } catch (mobileErr) {
    try {
      return await fetchWebTrending()
    } catch (webErr) {
      throw new Error(
        `Cannot fetch xiaohongshu hot list. mobile: ${(mobileErr as Error).message}; web: ${(webErr as Error).message}`,
      )
    }
  }
})
