import { beforeEach, describe, expect, it, vi } from "vitest"

const { rss2jsonMock, myFetchMock } = vi.hoisted(() => ({
  rss2jsonMock: vi.fn(),
  myFetchMock: vi.fn(),
}))

vi.mock("#/utils/rss2json", () => ({ rss2json: rss2jsonMock }))
vi.mock("#/utils/fetch", () => ({ myFetch: myFetchMock }))

// 在 mock 声明之后导入，确保 source.ts 使用到的是 mock 版本。
const { defineRSSHubSource, defineRSSSource, defineSource } = await import("#/utils/source")

beforeEach(() => {
  rss2jsonMock.mockReset()
  myFetchMock.mockReset()
})

describe("defineSource", () => {
  it("returns the getter as-is", async () => {
    const getter = vi.fn().mockResolvedValue([])
    expect(defineSource(getter)).toBe(getter)
  })
})

describe("defineRSSSource", () => {
  it("maps RSS items to news items", async () => {
    rss2jsonMock.mockResolvedValue({
      items: [
        { title: "First", link: "https://example.com/1", created: "2024-01-01T00:00:00.000Z" },
        { title: "Second", link: "https://example.com/2", created: "2024-01-02T00:00:00.000Z" },
      ],
    })

    const getter = defineRSSSource("https://example.com/rss")
    await expect(getter()).resolves.toEqual([
      { title: "First", url: "https://example.com/1", id: "https://example.com/1", pubDate: "2024-01-01T00:00:00.000Z" },
      { title: "Second", url: "https://example.com/2", id: "https://example.com/2", pubDate: "2024-01-02T00:00:00.000Z" },
    ])
    expect(rss2jsonMock).toHaveBeenCalledWith("https://example.com/rss")
  })

  it("omits pubDate when hiddenDate is set", async () => {
    rss2jsonMock.mockResolvedValue({
      items: [{ title: "First", link: "https://example.com/1", created: "2024-01-01T00:00:00.000Z" }],
    })

    const getter = defineRSSSource("https://example.com/rss", { hiddenDate: true })
    await expect(getter()).resolves.toEqual([
      { title: "First", url: "https://example.com/1", id: "https://example.com/1", pubDate: undefined },
    ])
  })

  it("throws when the feed has no items", async () => {
    rss2jsonMock.mockResolvedValue({ items: [] })
    await expect(defineRSSSource("https://example.com/rss")()).rejects.toThrow("Cannot fetch rss data")
  })

  it("throws when the feed cannot be parsed", async () => {
    rss2jsonMock.mockResolvedValue(undefined)
    await expect(defineRSSSource("https://example.com/rss")()).rejects.toThrow("Cannot fetch rss data")
  })
})

describe("defineRSSHubSource", () => {
  it("requests RSSHub as json and maps items", async () => {
    myFetchMock.mockResolvedValue({
      items: [
        { id: "1", title: "First", url: "https://example.com/1", date_published: "2024-01-01T00:00:00.000Z" },
        { title: "Second", url: "https://example.com/2" },
      ],
    })

    const getter = defineRSSHubSource("/github/trending", { limit: 10 })
    await expect(getter()).resolves.toEqual([
      { title: "First", url: "https://example.com/1", id: "1", pubDate: "2024-01-01T00:00:00.000Z" },
      { title: "Second", url: "https://example.com/2", id: "https://example.com/2", pubDate: undefined },
    ])

    const requested = myFetchMock.mock.calls[0][0] as URL
    expect(requested.origin).toBe("https://rsshub.rssforever.com")
    expect(requested.pathname).toBe("/github/trending")
    expect(requested.searchParams.get("format")).toBe("json")
    expect(requested.searchParams.get("sorted")).toBe("true")
    expect(requested.searchParams.get("limit")).toBe("10")
  })

  it("omits pubDate when hiddenDate is set", async () => {
    myFetchMock.mockResolvedValue({
      items: [{ title: "First", url: "https://example.com/1", date_published: "2024-01-01T00:00:00.000Z" }],
    })

    const getter = defineRSSHubSource("/github/trending", undefined, { hiddenDate: true })
    await expect(getter()).resolves.toEqual([
      { title: "First", url: "https://example.com/1", id: "https://example.com/1", pubDate: undefined },
    ])
  })
})
