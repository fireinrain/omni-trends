import { describe, expect, it } from "vitest"
import { md5, myCrypto } from "./crypto"

describe("myCrypto", () => {
  it("computes SHA-1", async () => {
    expect(await myCrypto("abc", "SHA-1")).toBe("a9993e364706816aba3e25717850c26c9cd0d89d")
  })

  it("computes SHA-256", async () => {
    expect(await myCrypto("abc", "SHA-256")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad")
  })

  it("computes SHA-384", async () => {
    expect(await myCrypto("abc", "SHA-384")).toBe("cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7")
  })

  it("computes SHA-512", async () => {
    expect(await myCrypto("abc", "SHA-512")).toBe("ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f")
  })
})

describe("md5", () => {
  it("computes empty string", async () => {
    expect(await md5("")).toBe("d41d8cd98f00b204e9800998ecf8427e")
  })

  it("computes ascii string", async () => {
    expect(await md5("hello")).toBe("5d41402abc4b2a76b9719d911017c592")
  })

  it("computes multi-byte string", async () => {
    expect(await md5("中文")).toBe("a7bac2239fcdcb3a067903d8077c4a07")
  })

  it("falls back when WebCrypto does not support MD5", async () => {
    // Node 的 WebCrypto 不支持 MD5，正常路径会抛错并回退到 md5 包。
    await expect(crypto.subtle.digest("MD5", new Uint8Array())).rejects.toThrow()
    expect(await md5("hello")).toBe("5d41402abc4b2a76b9719d911017c592")
  })
})
