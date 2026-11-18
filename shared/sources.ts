import type { Source, SourceID } from "./types"
import _sources from "./sources.json"

type SourcesMap = Record<SourceID, Source>

export const sources = _sources as SourcesMap
export default sources
