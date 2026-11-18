import type { SourceID, SourceResponse } from "@shared/types"
import { cacheSources, refetchSources } from "~/utils/data"

/**
 * 拉取单个数据源。卡片模式和瀑布流模式共用，避免两套缓存/刷新逻辑。
 */
export async function fetchSource(id: SourceID): Promise<SourceResponse> {
  let url = `/s?id=${id}`
  if (refetchSources.has(id)) {
    url = `/s?id=${id}&latest`
    refetchSources.delete(id)
  } else if (cacheSources.has(id)) {
    // wait animation
    await delay(200)
    return cacheSources.get(id)!
  }

  const response: SourceResponse = await myFetch(url)

  try {
    if (response.items && sources[id].type === "hottest" && cacheSources.has(id)) {
      response.items.forEach((item, i) => {
        const o = cacheSources.get(id)!.items.findIndex(k => k.id === item.id)
        item.extra = {
          ...item?.extra,
          diff: o === -1 ? undefined : o - i,
        }
      })
    }
  } catch (e) {
    console.error(e)
  }

  cacheSources.set(id, response)
  return response
}

export function sourceQueryOptions(id: SourceID) {
  return {
    queryKey: ["source", id] as const,
    queryFn: () => fetchSource(id),
    placeholderData: (prev: SourceResponse | undefined) => prev,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  }
}
