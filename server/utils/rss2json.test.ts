import { describe, expect, it } from "vitest"
import { parseRSS } from "./rss2json"

const rss = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>Example</title>
    <link>https://example.com</link>
    <description>Example feed</description>
    <lastBuildDate>Wed, 18 Nov 2026 11:36:50 +0000</lastBuildDate>
    <item>
      <title>Hello</title>
      <link>https://example.com/1</link>
      <description>First item</description>
      <pubDate>Wed, 18 Nov 2026 11:36:50 +0000</pubDate>
    </item>
  </channel>
</rss>`

describe("parseRSS", () => {
  it("parses rss channel and items", () => {
    const data = parseRSS(rss)

    expect(data.title).toBe("Example")
    expect(data.description).toBe("Example feed")
    expect(data.link).toBe("https://example.com")
    expect(data.items).toHaveLength(1)
    expect(data.items[0]).toMatchObject({
      title: "Hello",
      link: "https://example.com/1",
      description: "First item",
      created: "Wed, 18 Nov 2026 11:36:50 +0000",
    })
  })

  it("picks the alternate link from atom entries", () => {
    const atom = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title type="text">SegmentFault 最新的问题</title>
  <link rel="alternate" type="text/html" href="https://segmentfault.com" />
  <link rel="self" type="application/atom+xml" href="https://segmentfault.com/feeds/questions" />
  <updated>2026-11-17T17:40:04+08:00</updated>
  <entry>
    <title type="text">How to test atom?</title>
    <link rel="alternate" type="text/html" href="https://segmentfault.com/q/1" />
    <link rel="replies" type="text/html" href="https://segmentfault.com/q/1" />
    <id>https://segmentfault.com/q/1</id>
    <updated>2026-11-17T17:40:04+08:00</updated>
  </entry>
</feed>`

    const data = parseRSS(atom)

    expect(data.link).toBe("https://segmentfault.com")
    expect(data.items).toHaveLength(1)
    expect(data.items[0]).toMatchObject({
      title: "How to test atom?",
      link: "https://segmentfault.com/q/1",
      created: "2026-11-17T17:40:04+08:00",
    })
  })
})
