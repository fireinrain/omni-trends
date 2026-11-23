import { describe, expect, it } from "vitest"
import { parseHupuStockItems } from "../server/sources/hupu"

const NOW = Date.UTC(2026, 10, 23, 15, 0, 0)

function thread(overrides: Partial<{
  tid: string
  title: string
  url: string
  lights: number
  replies: number
  read: number
  createdAt: number
  repliedAt: number
}> = {}) {
  const tid = overrides.tid ?? "1"
  return {
    tid,
    title: "热门帖子",
    url: `/${tid}.html`,
    lights: 3,
    replies: 10,
    read: 1000,
    createdAt: NOW - 3600_000,
    repliedAt: NOW - 60_000,
    ...overrides,
  }
}

function page(list: unknown[], suffix = "") {
  return `<html><script>window.$$data={"topic":{"threads":{"list":${JSON.stringify(list)}}}}${suffix}</script></html>`
}

describe("parseHupuStockItems", () => {
  it("keeps the hot order and deduplicates by tid", () => {
    const html = page([
      thread({ tid: "1", title: "第一条" }),
      thread({ tid: "2", title: "第二条" }),
      thread({ tid: "1", title: "第一条重复" }),
      thread({ tid: "3", title: "第三条" }),
    ])

    expect(parseHupuStockItems(html, NOW).map(v => v.title)).toEqual(["第一条", "第二条", "第三条"])
  })

  it("exposes repliedAt as pubDate and reply count as info", () => {
    const repliedAt = NOW - 120_000
    const html = page([thread({ tid: "644156449", title: "减仓！调仓！", replies: 143, read: 7593, lights: 7, repliedAt })])

    expect(parseHupuStockItems(html, NOW)).toEqual([{
      id: "644156449",
      title: "减仓！调仓！",
      url: "https://bbs.hupu.com/644156449.html",
      mobileUrl: "https://bbs.hupu.com/644156449.html",
      pubDate: repliedAt,
      extra: { info: "143 回复", hover: "7593 浏览 · 7 点亮" },
    }])
  })

  it("drops stale threads that were not active recently", () => {
    const html = page([
      thread({ tid: "99", title: "置顶旧帖", repliedAt: NOW - 72 * 3600_000 }),
      thread({ tid: "1", title: "活跃帖子", repliedAt: NOW - 600_000 }),
    ])

    expect(parseHupuStockItems(html, NOW).map(v => v.id)).toEqual(["1"])
  })

  it("skips entries without tid, title or url", () => {
    const html = page([
      { title: "无 tid", url: "/1.html", repliedAt: NOW },
      { tid: "2", url: "/2.html", repliedAt: NOW },
      { tid: "3", title: "无 url", repliedAt: NOW },
      thread({ tid: "4" }),
    ])

    expect(parseHupuStockItems(html, NOW).map(v => v.id)).toEqual(["4"])
  })

  it("tolerates a trailing semicolon after the JSON", () => {
    const html = page([thread()], ";")
    expect(parseHupuStockItems(html, NOW)).toHaveLength(1)
  })

  it("throws when the embedded data is missing or malformed", () => {
    expect(() => parseHupuStockItems("<html>no data</html>", NOW)).toThrow("Cannot fetch Hupu stock data")
    expect(() => parseHupuStockItems("<script>window.$$data={broken}</script>", NOW)).toThrow("Cannot fetch Hupu stock data")
    expect(() => parseHupuStockItems("<script>window.$$data={}</script>", NOW)).toThrow("Cannot fetch Hupu stock data")
  })

  it("throws when everything was filtered out instead of caching an empty list", () => {
    const html = page([thread({ repliedAt: NOW - 72 * 3600_000 })])
    expect(() => parseHupuStockItems(html, NOW)).toThrow("empty list")
  })
})
