import { existsSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import sourcesData from "../shared/sources.json"
import pinyinData from "../shared/pinyin.json"
import media from "../server/sources/media"

const sources = sourcesData as Record<string, Record<string, any>>
const pinyin = pinyinData as Record<string, string>

const cnSources = ["chinanews", "tmtpost", "leiphone", "eeo", "timeweekly"]
const enSources = [
  "theverge",
  "techcrunch",
  "arstechnica",
  "wired",
  "cnet",
  "zdnet",
  "githubblog",
  "stackoverflowblog",
  "mittechreview",
  "ieeespectrum",
  "npr",
  "marketwatch",
  "abcnews",
  "france24",
  "seekingalpha",
]
const all = [...cnSources, ...enSources]

describe("中英文媒体数据源", () => {
  it("为全部 20 个源提供 getter", () => {
    for (const id of all) {
      expect(media, id).toHaveProperty(id)
      expect(media[id as keyof typeof media], id).toBeTypeOf("function")
    }
  })

  it("已生成到 sources.json 且配置正确", () => {
    for (const id of all) {
      const source = sources[id]
      expect(source, id).toBeDefined()
      expect(source.type, id).toBe("realtime")
      expect(source.redirect, id).toBeFalsy()
    }
    expect(sources.chinanews.column).toBe("china")
    expect(sources.eeo.column).toBe("finance")
    expect(sources.theverge.column).toBe("tech")
    expect(sources.npr.column).toBe("world")
  })

  it("图标与拼音搜索词齐全", () => {
    for (const id of all) {
      expect(existsSync(join(process.cwd(), "public", "icons", `${id}.png`)), id).toBe(true)
      expect(pinyin[id], id).toBeTruthy()
    }
  })
})
