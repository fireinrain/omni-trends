import { Buffer } from "node:buffer"
import { describe, expect, it } from "vitest"
import { encodeBase64 } from "./base64"

describe("encodeBase64", () => {
  it("encodes empty string", () => {
    expect(encodeBase64("")).toBe("")
  })

  it("encodes ascii string", () => {
    expect(encodeBase64("hello")).toBe("aGVsbG8=")
  })

  it("encodes multi-byte string", () => {
    expect(encodeBase64("你好")).toBe("5L2g5aW9")
  })

  it("encodes url-like string", () => {
    expect(encodeBase64("omni-trends")).toBe("b21uaS10cmVuZHM=")
  })

  it("round-trips", () => {
    const value = "a".repeat(1000)
    expect(Buffer.from(encodeBase64(value), "base64").toString()).toBe(value)
  })
})
