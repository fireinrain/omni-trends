import process from "node:process"

export type DatabaseConnector = "better-sqlite3" | "libsql-http"

export interface DatabaseConnectionConfigLike {
  connector: DatabaseConnector
  options?: Record<string, string | undefined>
}

export type DatabaseConfigLike = Record<"default", DatabaseConnectionConfigLike>

/**
 * Nitro serializes database config at build time.
 * Local and Docker keep using the file-backed SQLite database; Vercel uses Turso over HTTP.
 */
export function getDatabaseConfig(env: Record<string, string | undefined> = process.env): DatabaseConfigLike {
  const tursoUrl = env.TURSO_DATABASE_URL?.trim()
  const vercelBuild = env.VERCEL || env.BUILD_PRESET === "vercel" || env.NITRO_PRESET === "vercel" || env.SERVER_PRESET === "vercel"
  if (vercelBuild && !tursoUrl) {
    throw new Error("TURSO_DATABASE_URL is required for Vercel builds")
  }
  if (!tursoUrl) {
    return {
      default: {
        connector: "better-sqlite3",
      },
    }
  }
  return {
    default: {
      connector: "libsql-http",
      options: {
        url: tursoUrl,
        authToken: env.TURSO_AUTH_TOKEN?.trim() || undefined,
      },
    },
  }
}
