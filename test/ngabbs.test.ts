import { describe, expect, it } from "vitest"
import { parseNgaItems, parseNgaTopicItems } from "../server/sources/ngabbs"

const NOW = Date.UTC(2026, 10, 21, 6, 0, 0)

function item(overrides: Partial<{
  tid: number
  subject: string
  replies: number
  postdate: number
  lastpost: number
  tpcurl: string
}> = {}) {
  const tid = overrides.tid ?? 1
  return {
    tid,
    subject: "热门主题",
    replies: 10,
    postdate: NOW / 1000 - 3600,
    lastpost: NOW / 1000 - 60,
    tpcurl: `/read.php?tid=${tid}`,
    ...overrides,
  }
}

describe("parseNgaItems", () => {
  it("deduplicates topics by tid and keeps the original hot order", () => {
    const res = {
      code: 0,
      result: [[
        item({ tid: 1, subject: "第一条" }),
        item({ tid: 2, subject: "第二条" }),
        item({ tid: 1, subject: "第一条重复" }),
        item({ tid: 3, subject: "第三条" }),
      ]],
    }

    expect(parseNgaItems(res, NOW).map(v => v.title)).toEqual(["第一条", "第二条", "第三条"])
  })

  it("drops pinned notices and stale topics that were not replied to recently", () => {
    const res = {
      code: 0,
      result: [[
        item({ tid: 99, subject: "置顶公告", replies: 0, lastpost: NOW / 1000 - 180 * 86400 }),
        item({ tid: 98, subject: "沉帖", lastpost: NOW / 1000 - 30 * 86400 }),
        item({ tid: 1, subject: "活跃主题", lastpost: NOW / 1000 - 600 }),
      ]],
    }

    expect(parseNgaItems(res, NOW).map(v => v.id)).toEqual([1])
  })

  it("exposes lastpost as a millisecond pubDate and reply count as info", () => {
    const lastpost = NOW / 1000 - 120
    const res = { code: 0, result: [[item({ tid: 1, replies: 42, lastpost })]] }

    expect(parseNgaItems(res, NOW)).toEqual([{
      id: 1,
      title: "热门主题",
      url: "https://bbs.nga.cn/read.php?tid=1",
      pubDate: lastpost * 1000,
      extra: { info: "42 回复" },
    }])
  })

  it("throws on an error response or malformed payload", () => {
    expect(() => parseNgaItems({ code: 1, result: [[]] }, NOW)).toThrow("Cannot fetch NGA data")
    expect(() => parseNgaItems({ code: 0, result: [] }, NOW)).toThrow("Cannot fetch NGA data")
    expect(() => parseNgaItems({} as never, NOW)).toThrow("Cannot fetch NGA data")
  })

  it("throws when everything was filtered out instead of caching an empty list", () => {
    const res = { code: 0, result: [[item({ lastpost: NOW / 1000 - 30 * 86400 })]] }
    expect(() => parseNgaItems(res, NOW)).toThrow("empty list")
  })
})

describe("parseNgaTopicItems", () => {
  it("parses the stid thread list and drops its pinned notice", () => {
    const res = {
      code: 0,
      result: {
        __T: [
          item({ tid: 47212166, subject: "[置顶]都管好嘴", replies: 0, lastpost: NOW / 1000 - 120 * 86400 }),
          item({ tid: 47958504, subject: "字节为什么不上市", replies: 1, lastpost: NOW / 1000 - 60 }),
          item({ tid: 47958504, subject: "字节为什么不上市（重复）" }),
        ],
      },
    }

    expect(parseNgaTopicItems(res, NOW)).toEqual([{
      id: 47958504,
      title: "字节为什么不上市",
      url: "https://bbs.nga.cn/read.php?tid=47958504",
      pubDate: (NOW / 1000 - 60) * 1000,
      extra: { info: "1 回复" },
    }])
  })

  it("keeps topics that were active within 30 days", () => {
    const res = { code: 0, result: { __T: [item({ lastpost: NOW / 1000 - 15 * 86400 })] } }
    expect(parseNgaTopicItems(res, NOW)).toHaveLength(1)
  })

  it("throws on an error response or missing topic list", () => {
    expect(() => parseNgaTopicItems({ code: 1, result: { __T: [] } }, NOW)).toThrow("Cannot fetch NGA big-era data")
    expect(() => parseNgaTopicItems({ code: 0, result: {} }, NOW)).toThrow("Cannot fetch NGA data")
  })
})
