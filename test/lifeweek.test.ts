import { existsSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import sourcesData from "../shared/sources.json"
import pinyinData from "../shared/pinyin.json"
import { parseLifeweekItems } from "../server/sources/lifeweek"

const sources = sourcesData as Record<string, Record<string, any>>
const pinyin = pinyinData as Record<string, string>

describe("三联生活周刊数据源", () => {
  it("只保留编辑部文章，并生成文章链接与时间", () => {
    const items = parseLifeweekItems({
      model: {
        list: [
          { id: 1, title: "\u200B课本内外的孙中山", pubTime: "2026-11-20 17:00:00", contentType: 54 },
          { id: 2, title: "某品牌推广", pubTime: "2026-11-21 10:00:00", contentType: 11 },
          { id: 1, title: "重复文章", pubTime: "2026-11-20 17:00:00", contentType: 54 },
        ],
      },
    })

    expect(items).toHaveLength(1)
    expect(items[0].id).toBe(1)
    expect(items[0].title).toBe("课本内外的孙中山")
    expect(items[0].url).toBe("https://www.lifeweek.com.cn/article/1")
    expect(items[0].pubDate).toBeTypeOf("number")
  })

  it("已生成到 sources.json 且配置正确", () => {
    const source = sources.lifeweek
    expect(source, "lifeweek").toBeDefined()
    expect(source.type).toBe("realtime")
    expect(source.column).toBe("china")
    expect(source.redirect).toBeFalsy()
    expect(pinyin.lifeweek).toBeTruthy()
    expect(existsSync(join(process.cwd(), "public", "icons", "lifeweek.png"))).toBe(true)
  })
})
