import { describe, expect, it } from "vitest"
import { getDatabaseConfig } from "../tools/database-config"

describe("database config", () => {
  it("uses file-backed SQLite by default", () => {
    expect(getDatabaseConfig({})).toEqual({
      default: {
        connector: "better-sqlite3",
      },
    })
  })

  it("uses libSQL HTTP when a Turso URL is provided", () => {
    expect(getDatabaseConfig({
      TURSO_DATABASE_URL: "libsql://example.turso.io",
      TURSO_AUTH_TOKEN: "token",
    })).toEqual({
      default: {
        connector: "libsql-http",
        options: {
          url: "libsql://example.turso.io",
          authToken: "token",
        },
      },
    })
  })

  it("fails fast for Vercel builds without Turso", () => {
    expect(() => getDatabaseConfig({ VERCEL: "1" })).toThrow("TURSO_DATABASE_URL is required for Vercel builds")
    expect(() => getDatabaseConfig({ NITRO_PRESET: "vercel" })).toThrow("TURSO_DATABASE_URL is required for Vercel builds")
    expect(() => getDatabaseConfig({ BUILD_PRESET: "vercel" })).toThrow("TURSO_DATABASE_URL is required for Vercel builds")
  })
})
