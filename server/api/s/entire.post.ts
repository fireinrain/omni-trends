import type { SourceID, SourceResponse } from "@shared/types"
import { getCacheTable } from "#/database/cache"

export default defineEventHandler(async (event): Promise<SourceResponse[]> => {
  // 请求体解析放在 try 外，非法 JSON 等客户端错误仍返回 4xx。
  const body: { sources?: SourceID[] } | undefined = await readBody(event)
  const ids = Array.isArray(body?.sources) ? body.sources.filter(id => sources[id]) : []
  if (!ids.length) return []

  try {
    const cacheTable = await getCacheTable()
    if (!cacheTable) return []

    const caches = await cacheTable.getEntire(ids)
    const now = Date.now()
    return caches.map(cache => ({
      status: "cache",
      id: cache.id,
      items: cache.items,
      updatedTime: now - cache.updated < sources[cache.id].interval ? now : cache.updated,
    })) as SourceResponse[]
  } catch (e) {
    // 该接口只读缓存，数据库异常时返回空数组，客户端会退化为逐个源请求。
    logger.error("failed to get entire cache", e)
    return []
  }
})
