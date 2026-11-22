import { existsSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { ITHOME_RSS_URL } from "../server/sources/ithome"
import { IFANR_RSS_URL } from "../server/sources/ifanr"
import { GEEKPARK_RSS_URL } from "../server/sources/geekpark"
import { DARING_FIREBALL_RSS_URL } from "../server/sources/daringfireball"
import { CSSTRICKS_RSS_URL } from "../server/sources/csstricks"
import { LINUXDO_TOP_RSS_URL } from "../server/sources/linuxdo_top"
import { HELLOGITHUB_FEATURED_RSS_URL } from "../server/sources/hellogithub_featured"
import sourcesData from "../shared/sources.json"
import pinyinData from "../shared/pinyin.json"

const sources = sourcesData as Record<string, Record<string, any>>
const pinyin = pinyinData as Record<string, string>

describe("数据源 RSS 地址配置", () => {
  it("已有源改用用户指定的官方 RSS", () => {
    expect(ITHOME_RSS_URL).toBe("https://www.ithome.com/rss/")
    expect(IFANR_RSS_URL).toBe("https://www.ifanr.com/feed")
    expect(GEEKPARK_RSS_URL).toBe("https://www.geekpark.net/rss")
  })

  it("新增英文 RSS 源", () => {
    expect(DARING_FIREBALL_RSS_URL).toBe("https://daringfireball.net/feeds/main")
    expect(CSSTRICKS_RSS_URL).toBe("https://css-tricks.com/feed/")
  })

  it("新增 LINUX DO 热门话题与 HellGithub 精选项目", () => {
    expect(LINUXDO_TOP_RSS_URL).toBe("https://linuxdorss.longpink.com/top.xml")
    expect(HELLOGITHUB_FEATURED_RSS_URL).toBe("https://rsshub.liumingye.cn/hellogithub/home")
    expect(HELLOGITHUB_FEATURED_RSS_URL).toContain("/hellogithub/home")
  })
})

describe("新增源的元数据与图标", () => {
  const added = [
    { id: "daringfireball", icon: "daringfireball" },
    { id: "csstricks", icon: "csstricks" },
    { id: "linuxdo-top", icon: "linuxdo" },
    { id: "hellogithub-featured", icon: "hellogithub" },
  ]

  for (const { id, icon } of added) {
    it(`${id} 已生成到 sources.json 且图标存在`, () => {
      const source = sources[id]
      expect(source, id).toBeDefined()
      expect(source.column).toBe("tech")
      expect(source.redirect).toBeFalsy()
      expect(pinyin[id]).toBeTruthy()
      expect(existsSync(join(process.cwd(), "public", "icons", `${icon}.png`)), icon).toBe(true)
    })
  }

  it("原有禁用源 linuxdo 保持禁用", () => {
    expect(sources.linuxdo).toBeUndefined()
  })
})
