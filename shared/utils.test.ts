import { afterEach, describe, expect, it, vi } from "vitest"
import { delay, randomUUID } from "./utils"

describe("delay", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("resolves after the given time", async () => {
    vi.useFakeTimers()
    let resolved = false
    const promise = delay(1000).then(() => {
      resolved = true
    })

    await vi.advanceTimersByTimeAsync(999)
    expect(resolved).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    await promise
    expect(resolved).toBe(true)
  })
})

describe("randomUUID", () => {
  it("returns a v4 UUID", () => {
    expect(randomUUID()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })

  it("returns unique values", () => {
    const values = new Set(Array.from({ length: 1000 }, randomUUID))
    expect(values.size).toBe(1000)
  })
})
