import { describe, expect, it } from "vitest"
import type { RSSInfo } from "../server/types"
import { parseWeeklyItems } from "../server/sources/weekly"

function feed(items: Partial<RSSInfo["items"][number]>[]): RSSInfo {
  return {
    title: "Weekly",
    description: "",
    link: "https://example.com",
    image: "",
    updatedTime: "",
    items: items.map((item, i) => ({
      title: `Issue #${i}`,
      description: "",
      link: `https://example.com/issues/${i}`,
      created: "2026-11-20T00:00:00Z",
      ...item,
    })),
  }
}

describe("parseWeeklyItems", () => {
  it("maps feed entries to cards and dedupes by link", () => {
    const data = feed([
      {
        title: "Issue #811",
        link: "https://javascriptweekly.com/issues/811",
        created: "Tue, 17 Nov 2026 00:00:00 +0000",
      },
      {
        title: "Duplicate",
        link: "https://javascriptweekly.com/issues/811",
      },
    ])

    expect(parseWeeklyItems(data)).toEqual([{
      id: "https://javascriptweekly.com/issues/811",
      title: "Issue #811",
      url: "https://javascriptweekly.com/issues/811",
      pubDate: "Tue, 17 Nov 2026 00:00:00 +0000",
    }])
  })

  it("filters issues by title, e.g. Java Weekly from Baeldung's main feed", () => {
    const data = feed([
      { title: "Java Weekly, Issue 672", link: "https://www.baeldung.com/java-weekly-672" },
      { title: "A Guide to JUnit", link: "https://www.baeldung.com/junit" },
    ])

    expect(parseWeeklyItems(data, /^Java Weekly/i).map(v => v.title)).toEqual(["Java Weekly, Issue 672"])
  })

  it("skips entries without a usable link and throws when nothing is left", () => {
    expect(() => parseWeeklyItems(feed([{ title: "No link", link: "" }]))).toThrow("empty list")
    expect(() => parseWeeklyItems(undefined)).toThrow("Cannot fetch weekly feed")
  })
})
