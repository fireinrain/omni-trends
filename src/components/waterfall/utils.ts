import type { NewsItem, SourceID, SourceResponse } from "@shared/types"

/**
 * 瀑布流内部的统一条目：把各数据源的消息展平成同一种结构，
 * 便于合并、去重、排序和渲染。
 */
export interface WaterfallItem {
  key: string
  item: NewsItem
  source: SourceID
  /** 毫秒时间戳，无法解析时为 0 */
  time: number
}

/** 乱序模式的时间分桶大小：30 分钟。 */
export const WATERFALL_BUCKET_MS = 30 * 60 * 1000

/**
 * 把各数据源返回的时间统一转成毫秒时间戳。
 * 兼容 ISO 字符串、秒级时间戳、毫秒级时间戳、纯数字字符串。
 */
export function toTimestamp(raw: number | string | undefined | null): number | undefined {
  if (raw === undefined || raw === null || raw === "") return undefined

  if (typeof raw === "number") {
    if (!Number.isFinite(raw) || raw <= 0) return undefined
    // 10 位是秒，13 位是毫秒
    return raw < 1e12 ? raw * 1000 : raw
  }

  const value = raw.trim()
  if (!value) return undefined

  if (/^\d+(?:\.\d+)?$/.test(value)) {
    const num = Number(value)
    if (!Number.isFinite(num) || num <= 0) return undefined
    return num < 1e12 ? num * 1000 : num
  }

  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

/**
 * 取单条消息的时间：优先 pubDate，其次 extra.date，最后回退到数据源的 updatedTime。
 */
export function parseItemTime(item: NewsItem, fallback?: number | string): number {
  return toTimestamp(item.pubDate)
    ?? toTimestamp(item.extra?.date)
    ?? toTimestamp(fallback)
    ?? 0
}

function itemKey(item: NewsItem, source: SourceID): string {
  return item.url || `${source}:${item.id}`
}

/**
 * 合并当前栏目所有数据源的消息。
 * 以 url 去重（同一热点可能被多个源收录），没有 url 时用 source + id。
 */
export function mergeWaterfallItems(responses: SourceResponse[]): WaterfallItem[] {
  const seen = new Set<string>()
  const merged: WaterfallItem[] = []

  for (const response of responses) {
    const source = response.id
    for (const item of response.items ?? []) {
      const key = itemKey(item, source)
      if (seen.has(key)) continue
      seen.add(key)
      merged.push({
        key,
        item,
        source,
        time: parseItemTime(item, response.updatedTime),
      })
    }
  }

  return merged
}

/**
 * 排序瀑布流条目。
 *
 * - `timeline`：严格按时间倒序。
 * - `mixed`：先按 30 分钟分桶（桶之间仍是时间倒序），
 *   桶内按数据源分组后轮询交错，做到“基于时间线但乱序”。
 *   轮询起点随桶轮换，避免每个时间段的开头总是同一个源。
 */
export function orderWaterfallItems(items: WaterfallItem[], order: "mixed" | "timeline"): WaterfallItem[] {
  const sorted = [...items].sort((a, b) => {
    if (b.time !== a.time) return b.time - a.time
    if (a.source !== b.source) return a.source < b.source ? -1 : 1
    return a.key < b.key ? -1 : a.key > b.key ? 1 : 0
  })

  if (order === "timeline") return sorted

  const buckets = new Map<number, WaterfallItem[]>()
  for (const entry of sorted) {
    const bucketKey = Math.floor(entry.time / WATERFALL_BUCKET_MS)
    const bucket = buckets.get(bucketKey)
    if (bucket) bucket.push(entry)
    else buckets.set(bucketKey, [entry])
  }

  const result: WaterfallItem[] = []
  const bucketKeys = [...buckets.keys()].sort((a, b) => b - a)

  bucketKeys.forEach((bucketKey, bucketIndex) => {
    const groups = new Map<SourceID, WaterfallItem[]>()
    for (const entry of buckets.get(bucketKey)!) {
      const group = groups.get(entry.source)
      if (group) group.push(entry)
      else groups.set(entry.source, [entry])
    }

    const groupList = [...groups.values()]
    const offset = bucketIndex % groupList.length
    const rotated = [...groupList.slice(offset), ...groupList.slice(0, offset)]
    const maxLength = Math.max(...rotated.map(group => group.length))

    for (let i = 0; i < maxLength; i++) {
      for (const group of rotated) {
        if (i < group.length) result.push(group[i])
      }
    }
  })

  return result
}
