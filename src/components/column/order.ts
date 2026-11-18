import type { SourceID } from "@shared/types"

/**
 * 把可见数据源的新顺序写回完整列表。
 *
 * 拖拽排序只作用于当前显示的数据源，被隐藏的数据源需要保持原来的位置，
 * 这样重新勾选时仍能回到用户之前排好的顺序。
 */
export function applyVisibleOrder(all: SourceID[], visibleOrder: SourceID[]): SourceID[] {
  const visibleSet = new Set(visibleOrder)
  let visibleIndex = 0
  return all.map((id) => {
    if (!visibleSet.has(id)) return id
    return visibleOrder[visibleIndex++]
  })
}
