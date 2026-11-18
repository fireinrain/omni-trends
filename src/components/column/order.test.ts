import { describe, expect, it } from "vitest"
import type { SourceID } from "@shared/types"
import { applyVisibleOrder } from "./order"

const all = ["weibo", "zhihu", "baidu", "toutiao"] as SourceID[]

describe("applyVisibleOrder", () => {
  it("reorders visible sources and keeps hidden sources in place", () => {
    expect(applyVisibleOrder(all, ["toutiao", "zhihu"])).toEqual(["weibo", "toutiao", "baidu", "zhihu"])
  })

  it("returns the original list when nothing is visible", () => {
    expect(applyVisibleOrder(all, [])).toEqual(all)
  })

  it("handles an unchanged order", () => {
    expect(applyVisibleOrder(all, ["weibo", "baidu"])).toEqual(all)
  })
})
