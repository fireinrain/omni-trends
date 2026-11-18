export {}
declare global {
  const $: typeof import('clsx').clsx
  const Author: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/consts').Author
  const Homepage: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/consts').Homepage
  const Interval: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/consts').Interval
  const SourceResponse: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/utils/data').SourceResponse
  const TTL: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/consts').TTL
  const Timer: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/utils/index').Timer
  const Version: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/consts').Version
  const atom: typeof import('jotai').atom
  const atomWithStorage: typeof import('jotai/utils').atomWithStorage
  const cacheSources: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/utils/data').cacheSources
  const columns: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/metadata').columns
  const currentColumnIDAtom: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/atoms/index').currentColumnIDAtom
  const currentSourcesAtom: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/atoms/index').currentSourcesAtom
  const delay: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/utils').delay
  const fixedColumnIds: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/metadata').fixedColumnIds
  const focusSourcesAtom: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/atoms/index').focusSourcesAtom
  const genSources: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/pre-sources').genSources
  const goToTopAtom: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/atoms/index').goToTopAtom
  const hiddenColumns: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/metadata').hiddenColumns
  const hottestOrderEn: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/metadata').hottestOrderEn
  const hottestOrderZh: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/metadata').hottestOrderZh
  const isPageReload: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/hooks/useOnReload').isPageReload
  const isiOS: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/utils/index').isiOS
  const metadata: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/metadata').metadata
  const myFetch: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/utils/index').myFetch
  const originSources: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/pre-sources').originSources
  const preprocessMetadata: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/atoms/primitiveMetadataAtom').preprocessMetadata
  const primitiveMetadataAtom: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/atoms/primitiveMetadataAtom').primitiveMetadataAtom
  const projectDir: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/dir').projectDir
  const randomUUID: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/utils').randomUUID
  const refetchSources: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/utils/data').refetchSources
  const sources: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/sources').default
  const toastAtom: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/hooks/useToast').toastAtom
  const typeSafeObjectEntries: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/type.util').typeSafeObjectEntries
  const typeSafeObjectFromEntries: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/type.util').typeSafeObjectFromEntries
  const useAtom: typeof import('jotai').useAtom
  const useAtomValue: typeof import('jotai').useAtomValue
  const useCallback: typeof import('react').useCallback
  const useContext: typeof import('react').useContext
  const useDark: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/hooks/useDark').useDark
  const useEffect: typeof import('react').useEffect
  const useEntireQuery: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/hooks/query').useEntireQuery
  const useFocus: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/hooks/useFocus').useFocus
  const useFocusWith: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/hooks/useFocus').useFocusWith
  const useLang: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/hooks/useLang').useLang
  const useMemo: typeof import('react').useMemo
  const useOnReload: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/hooks/useOnReload').useOnReload
  const usePWA: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/hooks/usePWA').usePWA
  const useReducer: typeof import('react').useReducer
  const useRef: typeof import('react').useRef
  const useRefetch: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/hooks/useRefetch').useRefetch
  const useRelativeTime: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/hooks/useRelativeTime').useRelativeTime
  const useSearchBar: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/hooks/useSearch').useSearchBar
  const useSetAtom: typeof import('jotai').useSetAtom
  const useState: typeof import('react').useState
  const useToast: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/hooks/useToast').useToast
  const useUpdateQuery: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/hooks/query').useUpdateQuery
  const verifyPrimitiveMetadata: typeof import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/verify').verifyPrimitiveMetadata
}
// for type re-export
declare global {
  // @ts-ignore
  export type { Lang } from '/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/hooks/useLang'
  import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/hooks/useLang')
  // @ts-ignore
  export type { OmitNever, UnionToIntersection, MaybePromise } from '/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/type.util'
  import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/type.util')
  // @ts-ignore
  export type { Color, SourceID, AllSourceID, ColumnID, Metadata, PrimitiveMetadata, FixedColumnID, HiddenColumnID, OriginSource, Source, Column, NewsItem } from '/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/types'
  import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/shared/types')
  // @ts-ignore
  export type { Timer } from '/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/utils/index'
  import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/utils/index')
  // @ts-ignore
  export type { Update, ToastItem } from '/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/atoms/types'
  import('/Users/sunrise/CodeGround/WebstormProjects/omni-trends/src/atoms/types')
}