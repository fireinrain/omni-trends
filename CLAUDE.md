# OmniTrends 开发者说明

> 最后更新：2026-11-19<br>
> 当前版本：0.0.39<br>
> 最近功能提交：`403baea 新增数据源自定义并修复多个数据源`

实时热点新闻聚合阅读器。面向用户的使用说明见 [README.zh-CN.md](README.zh-CN.md) / [README.md](README.md)，本文档面向开发者和维护者。

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19 + TypeScript 5.9 + TanStack Router / TanStack Query + UnoCSS |
| 状态 | Jotai（客户端）+ TanStack Query（请求缓存） |
| 构建 | Vite 7 + SWC + Nitro |
| 服务端 | Nitro（h3），Node.js >= 20 |
| 数据库 | db0 → better-sqlite3 |
| HTTP | ofetch（服务端封装为 `myFetch`） |
| HTML 解析 | Cheerio |
| 测试 | Vitest |
| 包管理 | pnpm 10.30.x |

## 架构概览

### 数据流

```text
浏览器
  ├─ GET /api/s?id=xxx            单个数据源
  ├─ POST /api/s/entire           批量读取缓存
  ├─ GET /api/latest              服务端版本
  └─ POST /api/mcp                MCP 工具入口
        │
        ▼
Nitro / server/api
  ├─ getters.ts                   glob 自动注册数据源
  ├─ database/cache.ts            SQLite 缓存
  └─ utils/                       fetch、RSS、日期、加密
        │
        ▼
server/sources/*.ts               各数据源抓取实现
```

### 数据源注册

1. `shared/pre-sources.ts` 定义所有数据源元信息（名称、分类、颜色、刷新间隔、子源等）。
2. `pnpm gen:sources` 执行 `scripts/source.ts`，生成：
   - `shared/sources.json`：数据源注册表
   - `shared/pinyin.json`：搜索用拼音索引
3. `shared/metadata.ts` 根据 `sources.json` 构建栏目数据，并定义「最热」的中英文预设顺序。
4. `server/getters.ts` 通过 Rollup Glob 插件注册 `server/sources/{*.ts,**/index.ts}`：

```ts
import * as x from "glob:./sources/{*.ts,**/index.ts}"
```

每个数据源文件默认导出 getter；如果导出的是对象，会按 `来源ID -> getter` 展开，用于子源。

`server/glob.d.ts` 是插件生成的类型声明，已纳入版本库；新增数据源后需要一并提交。

### 抓取方式

所有抓取都在服务端完成：

| 方式 | 实现 | 代表 |
|------|------|------|
| HTML/API 解析 | `myFetch` + Cheerio / JSON | 微博、知乎、B 站、财联社 |
| RSS / Atom | `defineRSSSource` + `rss2json.ts` | BBC、Guardian、开源中国、SegmentFault |
| RSSHub | `defineRSSHubSource`，默认 `https://rsshub.rssforever.com` | AP News、Washington Post |
| Google News RSS | `news.google.com/rss/search` | Economist、YouTube |
| 直接 API | `myFetch` 请求 JSON 接口 | Product Hunt、Hugging Face Papers |
| Reader 回退 | 官方源被 Cloudflare 拦截时走 Jina Reader | 中国数字时代 |

`server/utils/fetch.ts` 的 `myFetch`：

- 默认 User-Agent；
- 10 秒超时、3 次重试；
- 配置了 `HTTPS_PROXY` / `HTTP_PROXY` 时，仅对 `PROXY_DOMAINS` 白名单中的域名使用 undici `ProxyAgent`；
- 国内域名仍然直连。

### 缓存

核心逻辑在 `server/api/s/index.ts`：

- 每个数据源有 `interval`，默认 10 分钟；间隔内直接返回缓存。
- 全局 `TTL` 为 30 分钟。
- 超过 `interval` 但未超过 TTL：普通请求返回 `cache`，带 `?latest` 会重新抓取。
- 抓取失败且存在旧缓存时，回退到旧缓存。
- 每个数据源最多返回 30 条（`slice(0, 30)`）。

缓存存储在 `.data/db.sqlite3` 的 `cache` 表，字段为 `id`、`updated`、`data`。`ENABLE_CACHE=false` 可关闭缓存，`INIT_TABLE=false` 可跳过建表。

`/api/s/entire` 只读取缓存，不触发抓取；请求体非法时返回 4xx，数据库异常时记录日志并返回 `[]`，由前端退化为单源请求。

### 前端状态

主要 Jotai atom 位于 `src/atoms/`：

| localStorage key | 内容 |
|------------------|------|
| `metadata` | 各固定栏目的数据源顺序、关注列表、更新时间 |
| `omni.hiddenSources` | 「最热」「实时」中被用户隐藏的数据源 |
| `omni.viewMode` | `cards` / `waterfall` |
| `omni.waterfallOrder` | `mixed` / `timeline` |
| `color-scheme` | `auto` / `light` / `dark` |

关键点：

- `preprocessMetadata` 每次从 localStorage 恢复时都会把默认数据源补回来，所以数据源展示范围不能直接存在 metadata 里，而是单独用 `hiddenSourcesAtom` 保存「隐藏列表」。
- `currentVisibleSourcesAtom` 统一计算当前栏目实际可见的数据源；卡片、瀑布流和刷新按钮都使用它。
- 新增数据源默认可见，因为保存的是隐藏项。

### 视图

**卡片模式**：`src/components/column/`

- 响应式网格，移动端横向滑动。
- 使用 Pragmatic Drag and Drop 实现卡片拖拽。
- `applyVisibleOrder()` 只重排可见卡片，隐藏数据源保持原位置。
- 「最热」栏目首次进入或切换语言时按 `hottestOrderZh` / `hottestOrderEn` 排序；用户手动拖拽后不再覆盖顺序。

**瀑布流模式**：`src/components/waterfall/`

- `mergeWaterfallItems()` 合并当前栏目所有可见数据源，按 URL 去重。
- `orderWaterfallItems()` 支持：
  - `timeline`：严格按时间倒序；
  - `mixed`：30 分钟时间桶，桶内按来源轮询交错。
- 1 / 2 / 3 栏响应式布局，每页 30 条，滚动接近底部时追加。
- 与卡片模式共用 `currentVisibleSourcesAtom`，所以切换视图不会改变数据源范围。

### 数据源自定义与搜索

- 自定义入口：`src/components/header/source-filter.tsx`，仅在最热 / 实时显示。
- 选择结果写入 `omni.hiddenSources`，全选 / 清空都通过 `setVisibleSourcesAtom`。
- 搜索入口：`src/components/common/search-bar/`，点击「更多」或 `Ctrl/Cmd + K` 打开。
- 搜索支持名称、副标题和拼音；选中数据源后可以星标加入「关注」。
- 首页（`src/routes/index.tsx`）在关注列表非空时展示「关注」，否则展示「最热」。

### 国际化、主题与 PWA

- 文案在 `src/locales/zh.json` 和 `src/locales/en.json`。
- 主题使用 `useDark()`，默认 `auto`，跟随系统。
- PWA 配置在 `pwa.config.ts`，Service Worker 文件为 `swx.js`。
- 版本更新提示通过 `/api/latest` 比较服务端版本与构建版本。

## 目录结构

```text
shared/
  pre-sources.ts        # 数据源元信息
  sources.ts            # 运行时读取 sources.json
  metadata.ts           # 栏目定义、最热排序
  types.ts              # NewsItem / Source / SourceResponse
  consts.ts             # TTL、Interval、版本、作者
  verify.ts             # localStorage 数据校验

server/
  api/
    s/index.ts          # GET /api/s
    s/entire.post.ts    # POST /api/s/entire
    latest.ts           # GET /api/latest
    mcp.post.ts         # POST /api/mcp
  sources/              # 数据源实现（80+ 个文件，含子源）
  getters.ts            # glob 自动注册
  database/cache.ts     # SQLite 缓存
  mcp/                  # MCP Server
  utils/                # fetch、RSS、日期、加密、日志
  glob.d.ts             # 生成的 glob 类型声明（已入库）

src/
  atoms/                # Jotai 状态
  components/
    column/             # 卡片模式与拖拽排序
    waterfall/          # 瀑布流模式
    header/             # 头部、视图切换、数据源筛选
    common/             # 搜索、拖拽、滚动条、Toast
  hooks/                # 查询、刷新、关注、PWA
  routes/               # TanStack Router
  locales/              # 中英文文案
  styles/               # 全局样式

scripts/                # gen:sources / gen:imports / gen:icons
tools/                  # unimport、Rollup Glob
docs/archive/           # 历史文档，仅作存档
```

## API

| 接口 | 说明 |
|------|------|
| `GET /api/s?id={sourceID}` | 获取单个数据源，优先缓存 |
| `GET /api/s?id={sourceID}&latest` | 绕过 TTL，尝试抓取最新数据 |
| `POST /api/s/entire` | 批量读取缓存，请求体 `{ "sources": ["weibo", "zhihu"] }` |
| `GET /api/latest` | 返回 `{ "v": "0.0.39" }` |
| `POST /api/mcp` | MCP Streamable HTTP，工具名 `get_hotest_latest_news` |

`/api/s` 会处理 `redirect` 数据源：例如父级 ID 会重定向到第一个子源。无有效 ID 时返回 500，错误信息为 `Invalid source id`。

## 构建与运行

| 环境 | 地址 | 说明 |
|------|------|------|
| 开发 | `http://localhost:5173/` | `pnpm dev`，前端与 `/api` 同端口 |
| 本地生产 | `http://localhost:20193/` | `PORT=20193 node --env-file=.env.server dist/output/server/index.mjs` |
| Docker | `http://localhost:4444/` | `docker compose up -d` |

```bash
pnpm dev                  # 开发模式
pnpm build                # 生产构建
pnpm start                # 运行构建产物，读取 .env.server
pnpm test --run           # 单元测试
pnpm lint                 # ESLint
pnpm typecheck            # 生成 sources/imports 后执行 tsc
pnpm gen:sources          # 生成 sources.json / pinyin.json
pnpm gen:imports          # 生成 imports.app.d.ts
pnpm gen:icons            # 补齐新增数据源图标
pnpm release              # bumpp 发布
```

### 生成文件

| 文件 | 生成命令 | 触发时机 | 是否入库 |
|------|----------|----------|----------|
| `shared/sources.json` | `pnpm gen:sources` | `dev` / `build` / `typecheck` | 否 |
| `shared/pinyin.json` | `pnpm gen:sources` | `dev` / `build` / `typecheck` | 否 |
| `imports.app.d.ts` | `pnpm gen:imports` | `typecheck`，`dev` / `build` 由 Vite 生成 | 否 |
| `server/glob.d.ts` | Vite/Nitro 构建时由 Rollup Glob 生成 | `dev` / `build` | 是 |
| `public/icons/*.png` | `pnpm gen:icons` | 手动执行 | 是 |

图标已全部入库，`dev` / `build` 不会联网抓取。新增数据源后运行 `pnpm gen:icons` 补齐缺失图标即可，已有图标不会重复下载。图标查找规则为 `public/icons/{id.split("-")[0]}.png`。

### 测试现状

截至 2026-11-19：

- `pnpm lint` 通过
- `pnpm typecheck` 通过
- `pnpm test --run` 通过，9 个测试文件、85 个测试
- `pnpm build` 通过

测试覆盖 crypto、base64、RSS 解析、RSS/RSSHub getter、日期工具、共享工具、瀑布流合并/排序、卡片排序等。

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `PORT` | 否 | 监听端口，默认 3000；本项目示例使用 20193 / 4444 |
| `ENABLE_CACHE` | 否 | 是否启用 SQLite 缓存，默认启用 |
| `INIT_TABLE` | 否 | 是否在启动时初始化缓存表，默认启用 |
| `PRODUCTHUNT_API_TOKEN` | 否 | Product Hunt 数据源 Token，未配置时该源会失败 |
| `XHS_COOKIE` | 否 | 小红书 Web 回退接口 Cookie，必须包含 `web_session` |
| `HTTPS_PROXY` / `HTTP_PROXY` | 否 | 代理地址，仅作用于 `PROXY_DOMAINS` 白名单 |

`example.env.server` 中的 `G_CLIENT_ID`、`G_CLIENT_SECRET`、`JWT_SECRET` 是历史 OAuth 配置占位；当前代码不再读取，可以留空。

## 添加数据源

用户向文档见 [README.zh-CN.md 的「添加数据源」](README.zh-CN.md#添加数据源)。维护时重点注意：

1. 在 `shared/pre-sources.ts` 中定义元信息。
2. 在 `server/sources/{id}.ts` 实现 getter，或使用 `defineRSSSource` / `defineRSSHubSource`。
3. 子源使用对象映射导出，例如：

```ts
export default defineSource({
  "example": hot,
  "example-sub": sub,
})
```

4. 运行 `pnpm gen:sources` 和 `pnpm gen:icons`。
5. 启动 `pnpm dev`，测试 `curl "http://localhost:5173/api/s?id={id}&latest"`。
6. 提交时包含 `server/glob.d.ts` 的变更。

### 常见实现约定

- XML/RSS 请求使用 `responseType: "text"`，再交给 `rss2json.ts`。
- 需要代理的国际站点，把域名加入 `server/utils/fetch.ts` 的 `PROXY_DOMAINS`。
- 抓取失败优先回退缓存，不要静默返回空数组。
- 部分站点有 TLS 指纹检测，例如 freebuf 使用 `node:https`。
- 数据源可临时关闭：在 `pre-sources.ts` 对应条目加 `disable: true`。
- 不要新增名为 `source` 或 `imports` 的 npm script，避免 npm `pre`/`post` 钩子冲突。

## 维护注意事项

### CI 镜像构建

`.github/workflows/docker.yml` 只构建并推送 `linux/amd64` 镜像到 GHCR，在 `ubuntu-24.04` 上原生构建：

- 设置 `timeout-minutes: 60`，并用 `concurrency` 取消已被新提交取代的运行，避免任务超过 6 小时上限。
- 使用 GHA 构建缓存（`scope=linux-amd64`）加速重复构建。
- 不再使用 QEMU 或 arm64 runner；之前的跨架构模拟构建曾导致任务超时。
- Dockerfile 使用 `pnpm install --frozen-lockfile`，因此改动依赖时必须同步更新 `pnpm-lock.yaml`。
- Actions 使用 Node 24 runtime 的版本：`checkout@v7`、`setup-node@v7`（release 工作流）、Docker 系列 `login@v4` / `setup-buildx@v4` / `metadata@v6` / `build-push@v7`。

### unimport / mlly 的单行写 atom 问题

`unimport` 底层的 `mlly` 会把单行写 atom 的参数误判为导出：

```ts
export const toggleSourceVisibilityAtom = atom(null, (get, set, source: SourceID) => {
```

这会生成 `import { set } from "/src/atoms/index.ts"`，但该文件并没有导出 `set`，页面会白屏并报：

```text
does not provide an export named 'set'
```

因此 `src/atoms/index.ts` 中的写 atom 必须保持多行：

```ts
export const toggleSourceVisibilityAtom = atom(
  null,
  (get, set, source: SourceID) => {
    // ...
  },
)
```

修改后运行 `pnpm gen:imports`，并重启 `pnpm dev`。

### 数据源已知限制

- `server/sources/weibo.ts` 硬编码了微博 Cookie，可能随时失效；不要在没有验证的情况下随意替换。
- 小红书移动端接口会间歇性返回 `code=300013`，这是限流而非代码错误；`XHS_COOKIE` 用于回退 Web 接口。
- 中国数字时代官方 RSS 可能返回 Cloudflare `403`，当前回退到 `https://r.jina.ai/https://chinadigitaltimes.net/chinese/feed/`。
- freebuf 有 TLS 指纹检测，必须使用 `node:https`。
- 部分源通过 `disable: true` 关闭：smzdm（JS challenge）、MKTNews（API 403）、Fastbull（SPA 改版）、JianShu（动态加载）、Linux.do（网络限制）等。

### 其他

- 参考项目在 `vendors/`，已 gitignore。
- 清除单个源缓存：`sqlite3 .data/db.sqlite3 "DELETE FROM cache WHERE id='xxx';"`
- 生成文件不要手动编辑。
- `docs/archive/` 是历史记录，不要把其中的旧架构或旧部署方案当作当前实现。

## 待办

代码层面的待办见 [TASKS.md](TASKS.md)。当前主要包括数据源集成测试、前端 hook 测试、统一数据源错误处理、代理白名单配置化、依赖跟进等。
