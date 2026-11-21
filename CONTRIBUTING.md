# Contributing to OmniTrends

Thanks for contributing! This guide covers the common workflow. For architecture details, see [CLAUDE.md](CLAUDE.md). For user-facing documentation, see [README.md](README.md) and [README.zh-CN.md](README.zh-CN.md).

## Before you start

Requirements:

- Node.js >= 20
- pnpm 10 (enable with `corepack enable`)

```bash
pnpm install
cp example.env.server .env.server   # optional; fill in only what you need
pnpm dev                            # http://localhost:5173
```

## Adding a source

### 1. Create a branch

```bash
git checkout -b add-example-source
```

### 2. Register the source

Add an entry to `originSources` in `shared/pre-sources.ts`:

```ts
export const originSources = {
  // ... other sources
  example: {
    name: "Example",
    type: "realtime", // or "hottest"
    column: "tech", // china / world / tech / finance
    color: "blue",
    interval: 10 * 60 * 1000,
    home: "https://example.com",
    desc: "Example source",
  },
}
```

Useful fields:

| Field | Description |
|-------|-------------|
| `name` | Display name |
| `title` | Optional subtitle such as "Trending" or "Flash" |
| `type` | `hottest` or `realtime`; decides the fixed column |
| `column` | `china` / `world` / `tech` / `finance` |
| `color` | UnoCSS color name |
| `interval` | Fetch interval in milliseconds |
| `home` | Site home page |
| `desc` | Tooltip description |
| `sub` | Sub-source definitions |
| `disable` | Set `true` to disable the source |

### 3. Implement the getter

Create a file under `server/sources/` with the same ID:

```ts
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const html = await myFetch("https://example.com", { responseType: "text" }) as string
  // Parse with cheerio or a JSON API
  return [] as NewsItem[]
})
```

For an RSS or Atom feed:

```ts
export default defineRSSSource("https://example.com/feed.xml")
```

For RSSHub:

```ts
export default defineRSSHubSource("/example/topic")
```

For sub-sources, export an object map:

```ts
export default defineSource({
  "example": hot,
  "example-sub": sub,
})
```

Each item must include a unique `id`, `title`, and `url`. Optional fields include `mobileUrl`, `pubDate`, and `extra`.

### 4. Regenerate generated files

```bash
pnpm gen:sources     # shared/sources.json and shared/pinyin.json
pnpm gen:icons       # download missing icons for new sources
pnpm dev
```

### 5. Test the source

```bash
curl "http://localhost:5173/api/s?id=example&latest"
```

In production mode use the server port:

```bash
curl "http://localhost:20193/api/s?id=example&latest"
```

Then run the quality checks:

```bash
pnpm lint
pnpm typecheck
pnpm test --run
pnpm build
```

### 6. Commit

```bash
git add .
git commit -m "feat: add example source"
```

Include `server/glob.d.ts` if it changed. It is generated during the Vite/Nitro build but tracked in Git.

## Source implementation notes

- All fetching happens on the server. Do not call third-party APIs directly from the browser.
- Use `responseType: "text"` for XML/RSS content and parse it with `rss2json.ts`.
- If an international site needs a proxy, add its domain to `PROXY_DOMAINS` in `server/utils/fetch.ts`.
- Icons resolve to `public/icons/{id.split("-")[0]}.png`. Run `pnpm gen:icons` after adding a source.
- Prefer returning cached data on fetch failure rather than silently returning an empty array.
- Some sites use TLS fingerprint checks; freebuf uses `node:https` for this reason.
- Do not add npm scripts named `source` or `imports`; they can conflict with npm `pre`/`post` lifecycle hooks.

### The unimport/mlly caveat

Keep Jotai write atoms in `src/atoms/index.ts` multiline:

```ts
export const exampleAtom = atom(
  null,
  (get, set, value: string) => {
    // ...
  },
)
```

A single-line write atom can make `mlly` treat `set` or other parameters as exports, producing a runtime error such as:

```text
does not provide an export named 'set'
```

## Code style

- Follow the existing TypeScript/React style.
- Run `pnpm lint` before committing. ESLint runs automatically through lint-staged on commit.
- Keep comments concise and explain non-obvious workarounds.

## Reporting bugs

When reporting a source failure, include:

- source ID
- request URL, e.g. `/api/s?id=example&latest`
- response status or error message
- whether a proxy is configured
- approximate time of the failure

## License

By contributing, you agree that your contributions are licensed under the project's [AGPL-3.0](./LICENSE) license.
