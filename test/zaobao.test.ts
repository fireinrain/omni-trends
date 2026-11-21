import { existsSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import sourcesData from "../shared/sources.json"
import pinyinData from "../shared/pinyin.json"
import { ZAOBAO_RSS_URL } from "../server/sources/zaobao"

const sources = sourcesData as Record<string, Record<string, any>>
const pinyin = pinyinData as Record<string, string>

describe("联合早报数据源", () => {
  it("使用 RSS 地址而不是直接抓取官网 HTML", () => {
    expect(ZAOBAO_RSS_URL).toBe("https://plink.anyfeeder.com/zaobao/realtime/world")
    expect(ZAOBAO_RSS_URL).toContain("/zaobao/realtime/world")
  })

  it("已生成到 sources.json 且配置正确", () => {
    const source = sources.zaobao
    expect(source, "zaobao").toBeDefined()
    expect(source.type).toBe("realtime")
    expect(source.column).toBe("world")
    expect(source.redirect).toBeFalsy()
    expect(pinyin.zaobao).toBeTruthy()
    expect(existsSync(join(process.cwd(), "public", "icons", "zaobao.png"))).toBe(true)
  })
})
