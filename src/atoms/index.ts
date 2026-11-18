import type { FixedColumnID, SourceID } from "@shared/types"
import type { Update } from "./types"

export const focusSourcesAtom = atom((get) => {
  return get(primitiveMetadataAtom).data.focus
}, (get, set, update: Update<SourceID[]>) => {
  const _ = update instanceof Function ? update(get(focusSourcesAtom)) : update
  set(primitiveMetadataAtom, {
    updatedTime: Date.now(),
    action: "manual",
    data: {
      ...get(primitiveMetadataAtom).data,
      focus: _,
    },
  })
})

export const currentColumnIDAtom = atom<FixedColumnID>("focus")

export const currentSourcesAtom = atom((get) => {
  const id = get(currentColumnIDAtom)
  return get(primitiveMetadataAtom).data[id]
}, (get, set, update: Update<SourceID[]>) => {
  const _ = update instanceof Function ? update(get(currentSourcesAtom)) : update
  set(primitiveMetadataAtom, {
    updatedTime: Date.now(),
    action: "manual",
    data: {
      ...get(primitiveMetadataAtom).data,
      [get(currentColumnIDAtom)]: _,
    },
  })
})

/**
 * 支持自定义展示数据源的栏目。其他栏目（如关注）保持原有行为。
 */
export type CustomizableColumnID = Extract<FixedColumnID, "hottest" | "realtime">

export type HiddenSources = Partial<Record<CustomizableColumnID, SourceID[]>>

/**
 * 每个栏目被隐藏的数据源。保存「隐藏」而不是「展示」，这样以后新增的数据源默认可见。
 * 与 metadata 分开存储，因为 preprocessMetadata 每次都会把默认数据源补回来。
 */
export const hiddenSourcesAtom = atomWithStorage<HiddenSources>("omni.hiddenSources", {})

function isCustomizableColumn(id: FixedColumnID): id is CustomizableColumnID {
  return id === "hottest" || id === "realtime"
}

/**
 * 当前栏目实际需要展示的数据源。最热/实时会过滤掉用户隐藏的数据源。
 */
export const currentVisibleSourcesAtom = atom((get) => {
  const id = get(currentColumnIDAtom)
  const all = get(currentSourcesAtom)
  if (!isCustomizableColumn(id)) return all
  const hidden = get(hiddenSourcesAtom)[id] ?? []
  return all.filter(source => !hidden.includes(source))
})

export const sourceFilterOpenAtom = atom(false)

// 注意：下面两个 atom 保持 atom( 后换行的写法。
// unimport 底层的 mlly 会把单行 atom(null, (get, set, source: ...)) 中的 set/source
// 误判为导出，导致运行时从 atoms/index.ts 导入不存在的 set，页面直接白屏。
export const toggleSourceVisibilityAtom = atom(
  null,
  (get, set, source: SourceID) => {
    const id = get(currentColumnIDAtom)
    if (!isCustomizableColumn(id)) return
    const hiddenSources = get(hiddenSourcesAtom)
    const hidden = hiddenSources[id] ?? []
    const nextHidden = hidden.includes(source)
      ? hidden.filter(item => item !== source)
      : [...hidden, source]
    set(hiddenSourcesAtom, {
      ...hiddenSources,
      [id]: nextHidden,
    })
  },
)

export const setVisibleSourcesAtom = atom(
  null,
  (get, set, visible: SourceID[]) => {
    const id = get(currentColumnIDAtom)
    if (!isCustomizableColumn(id)) return
    const all = get(primitiveMetadataAtom).data[id]
    const visibleSet = new Set(visible)
    set(hiddenSourcesAtom, {
      ...get(hiddenSourcesAtom),
      [id]: all.filter(source => !visibleSet.has(source)),
    })
  },
)

export const goToTopAtom = atom({
  ok: false,
  el: undefined as HTMLElement | undefined,
  fn: undefined as (() => void) | undefined,
})

export type ViewMode = "cards" | "waterfall"
export const viewModeAtom = atomWithStorage<ViewMode>("omni.viewMode", "cards")

export type WaterfallOrder = "mixed" | "timeline"
export const waterfallOrderAtom = atomWithStorage<WaterfallOrder>("omni.waterfallOrder", "mixed")
