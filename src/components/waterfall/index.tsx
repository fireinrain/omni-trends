import type { SourceResponse } from "@shared/types"
import { useQueries } from "@tanstack/react-query"
import { motion, useInView } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useWindowSize } from "react-use"
import type { WaterfallItem } from "./utils"
import { mergeWaterfallItems, orderWaterfallItems } from "./utils"
import { useEntireQuery } from "~/hooks/query"
import { sourceQueryOptions } from "~/hooks/useSourceQuery"

const PAGE_SIZE = 30
const LOAD_MORE_MARGIN = "400px 0px"

/**
 * 信息瀑布流模式。
 *
 * 把当前栏目内所有数据源的消息合并成一条信息流：
 * - 按时间分桶，桶与桶之间保持时间线；
 * - 桶内按来源轮询交错，形成「基于时间线但乱序」的观感；
 * - 按屏幕宽度分栏后轮询铺开，形成响应式 masonry，并支持渐进加载。
 */
export function Waterfall() {
  // 与卡片模式共用同一份可见数据源，瀑布流只展示用户选中的范围。
  const sourceIds = useAtomValue(currentVisibleSourcesAtom)
  const setSourceFilterOpen = useSetAtom(sourceFilterOpenAtom)
  const [order, setOrder] = useAtom(waterfallOrderAtom)
  const { t } = useTranslation()
  const { width } = useWindowSize()
  const isMobile = width < 768
  const columnCount = width < 640 ? 1 : width < 1280 ? 2 : 3

  const entireQuery = useEntireQuery(sourceIds)

  // 等批量缓存接口返回后再请求单源，避免同时发起几十个请求。
  const { responses, pending, failed } = useQueries({
    queries: sourceIds.map(id => ({
      ...sourceQueryOptions(id),
      enabled: !entireQuery.isPending,
    })),
    combine: (results) => {
      const responses: SourceResponse[] = []
      let pending = false
      let failed = 0
      for (const result of results) {
        if (result.data) responses.push(result.data)
        if (result.isPending) pending = true
        if (result.isError) failed++
      }
      return { responses, pending, failed }
    },
  })

  const items = useMemo(
    () => orderWaterfallItems(mergeWaterfallItems(responses), order),
    [responses, order],
  )

  const sourceKey = sourceIds.join("|")
  const [limit, setLimit] = useState(PAGE_SIZE)

  useEffect(() => {
    setLimit(PAGE_SIZE)
  }, [sourceKey, order])

  const visibleItems = useMemo(() => items.slice(0, limit), [items, limit])
  const hasMore = limit < items.length

  // 轮询铺开，保证最新内容分布在每一栏顶部。
  const columns = useMemo(() => {
    const groups: WaterfallItem[][] = Array.from({ length: columnCount }, () => [])
    visibleItems.forEach((entry, index) => groups[index % columnCount].push(entry))
    return groups
  }, [visibleItems, columnCount])

  const sentinelRef = useRef<HTMLDivElement>(null)
  const sentinelInView = useInView(sentinelRef, { margin: LOAD_MORE_MARGIN })

  useEffect(() => {
    if (!sentinelInView || !hasMore) return
    setLimit(current => Math.min(current + PAGE_SIZE, items.length))
  }, [sentinelInView, hasMore, items.length])

  const loading = entireQuery.isPending || pending

  if (!sourceIds.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-sm op-60">
        <span>{t("waterfall.empty")}</span>
        <button
          type="button"
          className="rounded-full bg-primary/10 px-4 py-2 op-100 transition-all hover:bg-primary/20"
          onClick={() => setSourceFilterOpen(true)}
        >
          <span className="i-ph:sliders-horizontal-duotone mr-1 align-middle" />
          {t("customize.title")}
        </button>
      </div>
    )
  }

  if (loading && !items.length) {
    return <EmptyState message={t("status.loading")} pulse />
  }

  return (
    <div className="px-2 pb-10">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="op-60">
          <span className={$("i-ph:columns-duotone", "mr-1 align-middle")} />
          {t("waterfall.hint", { count: items.length })}
        </span>
        {failed > 0 && (
          <span className="op-60 text-amber-600 dark:text-amber-400">
            <span className={$("i-ph:warning-circle-duotone", "mr-1 align-middle")} />
            {t("waterfall.partialFail", { count: failed })}
          </span>
        )}
        <span className="ml-auto inline-flex rounded-full bg-neutral-400/10 p-1">
          <OrderButton active={order === "mixed"} onClick={() => setOrder("mixed")}>
            {t("waterfall.mixed")}
          </OrderButton>
          <OrderButton active={order === "timeline"} onClick={() => setOrder("timeline")}>
            {t("waterfall.timeline")}
          </OrderButton>
        </span>
      </div>

      <div className="flex items-start gap-4">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="min-w-0 flex-1">
            {column.map((entry, rowIndex) => (
              <WaterfallCard
                key={entry.key}
                entry={entry}
                index={rowIndex * columnCount + columnIndex}
                isMobile={isMobile}
              />
            ))}
          </div>
        ))}
      </div>

      {!items.length && !loading && <EmptyState message={t("waterfall.empty")} />}

      {hasMore && (
        <div ref={sentinelRef} className="mt-2 flex justify-center">
          <button
            type="button"
            className={$(
              "rounded-full bg-neutral-400/10 px-5 py-2 text-sm op-70",
              "hover:bg-neutral-400/20 hover:op-100 transition-all",
            )}
            onClick={() => setLimit(current => Math.min(current + PAGE_SIZE, items.length))}
          >
            <span className={$("i-ph:caret-down-duotone", "mr-1 align-middle")} />
            {t("waterfall.loadMore")}
          </button>
        </div>
      )}
    </div>
  )
}

function OrderButton({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={$(
        "rounded-full px-3 py-1 text-xs transition-all",
        active ? "bg-base shadow-sm op-100" : "op-50 hover:op-80",
      )}
    >
      {children}
    </button>
  )
}

function EmptyState({ message, pulse }: { message: string, pulse?: boolean }) {
  return (
    <div className={$("flex min-h-40 items-center justify-center text-sm op-50", pulse && "animate-pulse")}>
      {message}
    </div>
  )
}

function WaterfallCard({ entry, index, isMobile }: { entry: WaterfallItem, index: number, isMobile: boolean }) {
  const { item, source, time } = entry
  const meta = sources[source]
  const relativeTime = useRelativeTime(time || "")
  const href = isMobile ? item.mobileUrl || item.url : item.url

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={item.extra?.hover}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 12) * 0.015 }}
      className={$(
        "mb-4 block rounded-2xl border border-neutral-400/10 p-4",
        "bg-base bg-op-60 transition-all",
        "hover:(bg-op-90 shadow-lg -translate-y-0.5)",
        "visited:(text-neutral-400)",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className="h-5 w-5 shrink-0 rounded-full bg-cover"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}icons/${source.split("-")[0]}.png)` }}
        />
        <span className={$("truncate text-xs font-medium", `color-${meta.color}-500`)}>
          {meta.name}
        </span>
        {meta.title && <span className="truncate text-xs op-50">{meta.title}</span>}
        {relativeTime && <span className="ml-auto shrink-0 text-xs op-50">{relativeTime}</span>}
      </div>
      <p className="text-sm leading-relaxed">{item.title}</p>
      {item.extra?.info && <p className="mt-2 text-xs op-60">{item.extra.info}</p>}
    </motion.a>
  )
}
