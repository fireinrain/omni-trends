import { describe, expect, it } from "vitest"
import type { NewsItem, SourceResponse } from "@shared/types"
import { WATERFALL_BUCKET_MS, mergeWaterfallItems, orderWaterfallItems, parseItemTime, toTimestamp } from "./utils"

const BASE = 10 * WATERFALL_BUCKET_MS

function response(id: SourceResponse["id"], items: NewsItem[], updatedTime: number | string = BASE): SourceResponse {
  return { status: "cache", id, updatedTime, items }
}

function item(id: string, url?: string, pubDate?: number | string): NewsItem {
  return { id, title: id, url: url ?? `https://example.com/${id}`, pubDate }
}

describe("toTimestamp", () => {
  it("parses ISO strings", () => {
    expect(toTimestamp("2024-01-01T00:00:00.000Z")).toBe(Date.parse("2024-01-01T00:00:00.000Z"))
  })

  it("converts second timestamps to milliseconds", () => {
    expect(toTimestamp(1704067200)).toBe(1704067200000)
  })

  it("keeps millisecond timestamps", () => {
    expect(toTimestamp(1704067200000)).toBe(1704067200000)
  })

  it("converts numeric strings", () => {
    expect(toTimestamp("1704067200")).toBe(1704067200000)
    expect(toTimestamp("1704067200000")).toBe(1704067200000)
  })

  it("rejects empty and invalid values", () => {
    expect(toTimestamp(undefined)).toBeUndefined()
    expect(toTimestamp(null)).toBeUndefined()
    expect(toTimestamp("")).toBeUndefined()
    expect(toTimestamp("   ")).toBeUndefined()
    expect(toTimestamp(0)).toBeUndefined()
    expect(toTimestamp(-1)).toBeUndefined()
    expect(toTimestamp("not a date")).toBeUndefined()
  })
})

describe("parseItemTime", () => {
  const t1 = 1704067200000
  const t2 = t1 + 1000

  it("prefers pubDate", () => {
    expect(parseItemTime({ id: 1, title: "", url: "", pubDate: t2, extra: { date: t1 } })).toBe(t2)
  })

  it("falls back to extra.date", () => {
    expect(parseItemTime({ id: 1, title: "", url: "", extra: { date: t1 } })).toBe(t1)
  })

  it("falls back to the source updated time", () => {
    expect(parseItemTime({ id: 1, title: "", url: "" }, t1)).toBe(t1)
  })

  it("returns 0 when no time is available", () => {
    expect(parseItemTime({ id: 1, title: "", url: "" })).toBe(0)
  })
})

describe("mergeWaterfallItems", () => {
  it("merges items from every source and keeps the origin", () => {
    const merged = mergeWaterfallItems([
      response("weibo", [item("a"), item("b")]),
      response("zhihu", [item("c")]),
    ])

    expect(merged.map(entry => entry.key)).toEqual([
      "https://example.com/a",
      "https://example.com/b",
      "https://example.com/c",
    ])
    expect(merged.map(entry => entry.source)).toEqual(["weibo", "weibo", "zhihu"])
  })

  it("dedupes items that share a url", () => {
    const merged = mergeWaterfallItems([
      response("weibo", [item("a", "https://same")]),
      response("zhihu", [item("b", "https://same")]),
    ])

    expect(merged).toHaveLength(1)
    expect(merged[0].source).toBe("weibo")
  })

  it("uses source and id when the item has no url", () => {
    const merged = mergeWaterfallItems([
      response("weibo", [{ id: 1, title: "a", url: "" }]),
      response("zhihu", [{ id: 1, title: "a", url: "" }]),
    ])

    expect(merged).toHaveLength(2)
    expect(merged.map(entry => entry.key)).toEqual(["weibo:1", "zhihu:1"])
  })

  it("uses the source updated time when an item has no date", () => {
    const merged = mergeWaterfallItems([
      response("weibo", [{ id: 1, title: "a", url: "https://a" }], "2024-01-01T00:00:00.000Z"),
    ])

    expect(merged[0].time).toBe(Date.parse("2024-01-01T00:00:00.000Z"))
  })
})

describe("orderWaterfallItems", () => {
  it("sorts strictly by time in timeline mode", () => {
    const merged = [
      { key: "old", item: item("old"), source: "weibo" as const, time: BASE - 1000 },
      { key: "new", item: item("new"), source: "zhihu" as const, time: BASE + 1000 },
      { key: "mid", item: item("mid"), source: "baidu" as const, time: BASE },
    ]

    expect(orderWaterfallItems(merged, "timeline").map(entry => entry.key)).toEqual(["new", "mid", "old"])
  })

  it("bundles new time buckets before old ones in mixed mode", () => {
    const merged = [
      { key: "old", item: item("old"), source: "weibo" as const, time: 9 * WATERFALL_BUCKET_MS },
      { key: "new", item: item("new"), source: "weibo" as const, time: 11 * WATERFALL_BUCKET_MS },
    ]

    expect(orderWaterfallItems(merged, "mixed").map(entry => entry.key)).toEqual(["new", "old"])
  })

  it("interleaves sources inside the same time bucket", () => {
    const merged = [
      { key: "a1", item: item("a1"), source: "weibo" as const, time: BASE + 5 * 60 * 1000 },
      { key: "a2", item: item("a2"), source: "weibo" as const, time: BASE + 4 * 60 * 1000 },
      { key: "b1", item: item("b1"), source: "zhihu" as const, time: BASE + 3 * 60 * 1000 },
      { key: "b2", item: item("b2"), source: "zhihu" as const, time: BASE + 2 * 60 * 1000 },
      { key: "c1", item: item("c1"), source: "baidu" as const, time: BASE + 60 * 1000 },
      { key: "d1", item: item("d1"), source: "weibo" as const, time: 9 * WATERFALL_BUCKET_MS + 60 * 1000 },
      { key: "e1", item: item("e1"), source: "zhihu" as const, time: 9 * WATERFALL_BUCKET_MS },
    ]

    // 第一个桶轮询顺序为 weibo → zhihu → baidu；
    // 第二个桶起点后移一位，变成 zhihu → weibo。
    expect(orderWaterfallItems(merged, "mixed").map(entry => entry.key)).toEqual([
      "a1",
      "b1",
      "c1",
      "a2",
      "b2",
      "e1",
      "d1",
    ])
  })

  it("does not mutate the input", () => {
    const merged = [
      { key: "old", item: item("old"), source: "weibo" as const, time: BASE },
      { key: "new", item: item("new"), source: "weibo" as const, time: BASE + 1000 },
    ]
    const copy = [...merged]

    orderWaterfallItems(merged, "timeline")

    expect(merged).toEqual(copy)
  })
})
