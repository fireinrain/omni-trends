# OmniTrends

![](/public/logo.png)

实时热点与新闻聚合阅读器，汇总全球 100+ 个数据源的热门内容，以卡片或信息流的方式统一阅读。

**在线访问**: https://news.furina.in/<br>
**English**: [README.md](README.md)<br>
**更新记录**: [GitHub Releases](https://github.com/fireinrain/omni-trends/releases)

> 基于 [NewsNow](https://github.com/ourongxing/newsnow) 二次开发，扩展了数据源、代理支持、视图模式和多个数据源修复。

## 核心特性

- **122 个数据源**：覆盖国内、国际、科技、财经等分类，包含 44 个「最热」源和 47 个「实时」源。
- **两种阅读模式**：卡片模式适合按来源浏览，瀑布流模式适合按时间线混排阅读。
- **数据源自定义**：「最热」「实时」栏目可以自由勾选要展示的数据源。
- **关注与搜索**：收藏常用数据源到「关注」，通过名称、标题或拼音快速搜索全部数据源。
- **拖拽排序**：卡片顺序可拖动调整，刷新和重新进入后保持。
- **响应式布局**：桌面多栏、移动端横向滑动，瀑布流自动切换 1–3 栏。
- **代理支持**：通过 `HTTPS_PROXY` / `HTTP_PROXY` 访问需要代理的国际站点。
- **灵活缓存**：本地 / Docker 使用文件 SQLite，Vercel 可选 Turso/libSQL，减少重复抓取并提升首屏速度。
- **深色/浅色模式**、**中英文界面**、**PWA 安装**。

## 界面与交互

### 顶部导航

顶部固定导航顺序为 **最热 / 实时 / 关注 / 更多**：

| 入口 | 说明 |
|------|------|
| 最热 | 聚合各平台热榜，支持自定义展示的数据源 |
| 实时 | 聚合新闻快讯与时间线内容，支持自定义展示的数据源 |
| 关注 | 用户通过星标收藏的数据源 |
| 更多 | 打开数据源搜索面板，可按分类浏览全部数据源 |

首页默认展示「关注」；如果还没有收藏任何数据源，则展示「最热」。

### 卡片模式

- 按数据源分卡片展示，桌面端为响应式网格，移动端为横向滑动。
- 每张卡片支持单独刷新、星标收藏和拖拽排序。
- 拖拽后的顺序保存在浏览器 localStorage 中；隐藏的数据源会保留原位置。
- 热榜类数据源会显示排名变化。

### 瀑布流模式

通过顶部视图切换按钮进入瀑布流：

- 合并当前栏目内所有**可见**数据源的内容，并按 URL 去重。
- **乱序**：按 30 分钟时间桶分组，桶内按来源轮询交错，形成「基于时间线但来源混排」的信息流。
- **时间线**：严格按发布时间倒序排列。
- 自动根据屏幕宽度切换 1 / 2 / 3 栏，每页 30 条，滚动到底部附近自动加载更多。
- 与卡片模式共用同一份数据源选择，切换视图不会改变展示范围。
- 顶部会显示部分数据源加载失败的提示。

### 数据源自定义

在「最热」或「实时」栏目点击顶部的滑杆图标，可以：

- 勾选或取消勾选数据源；
- 一键全选或清空；
- 实时预览当前已选数量。

选择结果保存在 `localStorage` 的 `omni.hiddenSources` 中，卡片模式和瀑布流模式共享同一份选择。由于保存的是「隐藏列表」，以后新增的数据源默认可见。

### 搜索与关注

- 点击「更多」或按 `Ctrl/Cmd + K` 打开搜索面板。
- 支持按数据源名称、副标题和拼音搜索。
- 桌面端会在右侧预览选中数据源的卡片。
- 点击星标即可加入或移出「关注」。

## 数据源

当前项目注册了 **110 个数据源 ID**（含子源），抓取实现位于 `server/sources/`。数据源元信息集中定义在 `shared/pre-sources.ts`，运行时注册表由 `pnpm gen:sources` 生成。

### 分类概览

| 分类 | 代表数据源 |
|------|------------|
| 国内 | 微博、知乎、抖音、小红书、B 站、百度、今日头条、贴吧、豆瓣、中新网、时代周报、三联生活周刊 |
| 国际 | BBC、The Guardian、纽约时报、WSJ、NHK、联合早报、中国数字时代、NPR、ABC News、France 24 |
| 科技 | GitHub、Hacker News、Product Hunt、36 氪、IT之家、爱范儿、极客公园、少数派、掘金、PCbeta、酷安、钛媒体、雷峰网、The Verge、TechCrunch、Ars Technica、WIRED、Daring Fireball、CSS-Tricks、CNET、ZDNet、GitHub Blog、Stack Overflow Blog、MIT Tech Review、IEEE Spectrum、JS Weekly、Python Weekly、Golang Weekly、Rust Weekly、Java Weekly |
| 财经 | 财联社、雪球、华尔街见闻、证券时报、深潮 TechFlow、格隆汇、NGA大时代、虎扑股票区、经济观察报、MarketWatch、Seeking Alpha |
| 社区 | V2EX、NGA、NodeSeek、吾爱破解、水木社区、Linux.do（部分源暂不可用） |

### 抓取方式

所有数据源均在服务端抓取，常见实现方式如下：

| 方式 | 说明 | 代表 |
|------|------|------|
| HTML/API 解析 | `myFetch` 抓取后用 Cheerio 或 JSON 解析 | 微博、知乎、B 站、财联社 |
| RSS / Atom | `defineRSSSource` 解析官方订阅源 | BBC、Guardian、开源中国、SegmentFault |
| RSSHub | `defineRSSHubSource` 通过 RSSHub 获取 | AP News、Washington Post |
| Google News RSS | 使用 `news.google.com/rss/search` 兜底 | Economist、YouTube |
| 直接 API | 调用站点公开 JSON 接口 | Product Hunt、Hugging Face Papers |
| Reader 回退 | 官方源被 Cloudflare 拦截时用 Jina Reader 读取 | 中国数字时代 |

### 抓取与缓存策略

- `server/utils/fetch.ts` 中的 `myFetch` 统一设置 User-Agent、10 秒超时和 3 次重试。
- 国际站点默认走代理白名单，国内站点直连；白名单位于 `server/utils/fetch.ts` 的 `PROXY_DOMAINS`。
- `/api/s` 每个数据源最多返回 30 条。
- 每个数据源有 `interval` 刷新间隔；距离上次缓存小于 `interval` 时直接返回缓存。
- 全局 `TTL` 为 30 分钟；带 `?latest` 可绕过 TTL，但不能绕过 `interval`。
- 抓取失败时会优先回退到已有缓存。
- 在 Vercel 上缓存通过 HTTP 存入 Turso/libSQL；本地和 Docker 仍使用文件 SQLite。

### 数据源稳定性

以下数据源已针对当前站点结构做过修复，正常情况下可直接使用：

- **财联社（CLS）**：使用官网接口签名请求。
- **PCbeta**：处理论坛的环境校验和滑块校验 Cookie。
- **联合早报**：使用 `zaobao/realtime/world` RSS 源，避开官网的地区跳转。
- **IT之家 / 爱范儿 / 极客公园**：由 HTML/私有接口改用官方 RSS。
- **Daring Fireball / CSS-Tricks**：使用官方 RSS。
- **LINUX DO 热门话题**：使用 `linuxdorss.longpink.com/top.xml` 的 RSS 镜像（旧的 `linuxdo` 源保持禁用）。
- **HelloGitHub 精选项目**：通过公共 RSSHub 实例使用 `hellogithub/home` 路由。
- **深潮 TechFlow**：使用官方 RSS。
- **开源中国**：使用官方 RSS。
- **SegmentFault**：使用官方 Atom feed。
- **证券时报**：使用官网快讯 JSON 接口。
- **中国数字时代**：优先请求官方 RSS，遇到 Cloudflare `403` 时回退到 Jina Reader。

已知限制：

- `server/sources/weibo.ts` 中硬编码了微博 Cookie，可能随时失效。
- 小红书移动端接口会间歇性限流，配置 `XHS_COOKIE` 后可回退到 Web 接口。
- freebuf 有 TLS 指纹检测，必须使用 `node:https`，不能直接用 ofetch/undici。
- 中国数字时代官网启用了 Cloudflare 人机校验，Jina Reader 回退依赖第三方服务可用。
- 部分数据源通过 `disable: true` 主动关闭，例如 MKTNews、法布财经、什么值得买（smzdm）、简书、Linux.do 等。

## 快速开始

> 需要 Node.js >= 20 和 pnpm 10（推荐通过 corepack 启用）。

```bash
corepack enable
pnpm install
cp example.env.server .env.server
pnpm dev
```

开发服务器默认地址：http://localhost:5173/

前端与 `/api` 由同一个 Vite/Nitro 实例提供。

`.env.server` 可以留空；只有使用 Product Hunt、小红书回退或代理时才需要填写。

### 生产构建与运行

```bash
pnpm build
PORT=20193 node --env-file=.env.server dist/output/server/index.mjs
```

访问 http://localhost:20193/。

也可以使用：

```bash
PORT=20193 pnpm start
```

`pnpm start` 会读取 `.env.server`，因此需要先创建该文件。

## 配置

复制 `example.env.server` 为 `.env.server`，按需填写：

| 变量 | 必填 | 说明 |
|------|------|------|
| `PORT` | 否 | 服务端口，默认 3000；示例使用 20193 |
| `ENABLE_CACHE` | 否 | 是否启用 SQLite 缓存，默认启用；设为 `false` 关闭 |
| `INIT_TABLE` | 否 | 是否在启动时初始化缓存表，默认启用；设为 `false` 跳过 |
| `TURSO_DATABASE_URL` | 仅 Vercel | Turso/libSQL 地址，例如 `libsql://...turso.io`；构建时设置后 Nitro 会使用 HTTP 缓存而不是本地 SQLite |
| `TURSO_AUTH_TOKEN` | 否 | Turso 鉴权 Token，私有数据库必须配置 |
| `PRODUCTHUNT_API_TOKEN` | 否 | Product Hunt 数据源 Token，未配置时该源会抓取失败 |
| `XHS_COOKIE` | 否 | 小红书 Web 回退接口 Cookie，必须包含 `web_session` |
| `HTTPS_PROXY` | 否 | HTTPS 代理地址，例如 `http://127.0.0.1:7897` |
| `HTTP_PROXY` | 否 | HTTP 代理地址，通常与 `HTTPS_PROXY` 相同 |

> `example.env.server` 中的 `G_CLIENT_ID`、`G_CLIENT_SECRET`、`JWT_SECRET` 是历史 OAuth 配置占位，当前代码不再读取，可以留空。

> Nitro 会在构建时序列化数据库配置。Turso 变量必须在 `pnpm build` / Vercel 构建前设置，修改后需要重新部署。

### 代理说明

代理只对 `server/utils/fetch.ts` 中 `PROXY_DOMAINS` 匹配的域名生效，例如 Reddit、Hacker News、BBC、纽约时报、WSJ、Product Hunt、中国数字时代等。国内数据源仍然直连。

新增国际数据源且需要代理时，把对应域名加入 `PROXY_DOMAINS`，然后重启服务。

## 部署

### 本地部署

```bash
pnpm install
pnpm build
PORT=20193 node --env-file=.env.server dist/output/server/index.mjs
```

### Docker Compose：从源码构建

```bash
docker compose -f docker-compose.local.yml up -d --build
```

访问 http://localhost:4444/。

### Docker Compose：使用已发布镜像

```bash
docker compose up -d
```

默认镜像为 `ghcr.io/fireinrain/omni-trends:main`，访问 http://localhost:4444/。

缓存数据保存在名为 `omnitrends_data` 的 Docker volume 中，挂载到容器内 `/usr/app/.data`。

### CI 镜像

`.github/workflows/docker.yml` 会在推送 `main` 分支或 `v*` 标签时构建并推送 `linux/amd64` 镜像到 GHCR。构建在 `ubuntu-24.04` 上原生运行，设置 60 分钟超时和按分支分组的并发控制，旧任务不会一直占用构建资源。

### Vercel + Turso

1. 创建 Turso 数据库和访问 Token。可以手动初始化一次缓存表，然后在 Vercel 设置 `INIT_TABLE=false`：
   ```sql
   CREATE TABLE IF NOT EXISTS cache (
     id TEXT PRIMARY KEY,
     updated INTEGER,
     data TEXT
   );
   ```
2. 在 Vercel 项目设置中添加 `TURSO_DATABASE_URL`（例如 `libsql://<db>-<org>.turso.io`）和 `TURSO_AUTH_TOKEN`。
3. 构建命令使用 `pnpm build`。Vercel 构建会自动识别并生成 `.vercel/output`；也可以显式设置 `BUILD_PRESET=vercel` 或 `NITRO_PRESET=vercel`。
4. 修改任一 Turso 变量后需要重新部署，因为 Nitro 会在构建时把数据库选项写入服务端产物。

本地和 Docker 部署不需要配置 Turso 变量，仍使用 `.data` 下的 SQLite 文件。

## 开发

### 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器（自动生成 sources） |
| `pnpm build` | 生产构建 |
| `pnpm start` | 运行已构建产物，读取 `.env.server` |
| `pnpm test --run` | 运行全部单元测试 |
| `pnpm lint` | ESLint 检查 |
| `pnpm typecheck` | 生成 sources/imports 后执行 TypeScript 检查 |
| `pnpm gen:sources` | 生成 `shared/sources.json` 和 `shared/pinyin.json` |
| `pnpm gen:imports` | 生成自动导入类型 `imports.app.d.ts` |
| `pnpm gen:icons` | 仅为新增数据源下载缺失图标 |
| `pnpm release` | 使用 bumpp 发布版本 |

`pnpm dev` 和 `pnpm build` 会通过 `presource` 自动执行 `gen:sources`。

### 生成文件

| 文件 | 生成方式 | 是否入库 |
|------|----------|----------|
| `shared/sources.json` | `pnpm gen:sources` | 否 |
| `shared/pinyin.json` | `pnpm gen:sources` | 否 |
| `imports.app.d.ts` | `pnpm gen:imports` | 否 |
| `server/glob.d.ts` | Vite/Nitro 构建时由 Rollup Glob 插件生成 | 是，变更后需要提交 |
| `public/icons/*.png` | `pnpm gen:icons` | 是 |

修改 `shared/pre-sources.ts` 后，执行 `pnpm gen:sources`；新增数据源后，还需要执行 `pnpm gen:icons` 补齐图标。

### 目录结构

```text
shared/                 # 前后端共享定义
  pre-sources.ts        # 数据源元信息
  sources.ts            # 读取生成的 sources.json
  metadata.ts           # 栏目、最热排序
  types.ts              # NewsItem、Source、SourceResponse 等类型
  consts.ts             # TTL、Interval、版本信息

server/
  api/                  # Nitro API
    s/index.ts          # GET /api/s
    s/entire.post.ts    # POST /api/s/entire
    latest.ts           # GET /api/latest
    mcp.post.ts         # POST /api/mcp
  sources/              # 各数据源抓取实现
  getters.ts            # 通过 glob 自动注册数据源
  database/cache.ts     # SQLite 缓存
  mcp/                  # MCP Server
  utils/                # fetch、RSS、日期、加密、日志等工具

src/
  atoms/                # Jotai 状态
  components/
    column/             # 卡片视图与拖拽排序
    waterfall/          # 瀑布流视图
    header/             # 头部、视图切换、数据源筛选
    common/             # 搜索、拖拽、滚动条、Toast
  hooks/                # 查询、刷新、关注、PWA 等 hooks
  routes/               # TanStack Router 路由
  locales/              # 中英文文案

scripts/                # sources、imports、图标生成脚本
tools/                  # unimport、Rollup Glob 等构建工具
docs/archive/           # 历史文档，仅作存档
```

## 添加数据源

### 1. 定义元信息

在 `shared/pre-sources.ts` 的 `originSources` 中新增条目：

```ts
export const originSources = {
  // ... 其他数据源
  example: {
    name: "示例站点",
    type: "realtime", // 或 "hottest"
    column: "tech", // china / world / tech / finance
    color: "blue",
    interval: 10 * 60 * 1000,
    home: "https://example.com",
    desc: "示例数据源",
  },
}
```

常用字段：

| 字段 | 说明 |
|------|------|
| `name` | 数据源名称 |
| `title` | 卡片副标题，例如「热搜」「快讯」 |
| `type` | `hottest` 或 `realtime`，决定归入哪个固定栏目 |
| `column` | `china` / `world` / `tech` / `finance` |
| `color` | UnoCSS 颜色名，如 `blue`、`red`、`green` |
| `interval` | 抓取间隔，单位毫秒 |
| `home` | 站点首页 |
| `desc` | 描述，显示在卡片提示中 |
| `sub` | 子源定义，例如 `bilibili-hot-search` |
| `disable` | 设为 `true` 可临时关闭该源 |

### 2. 实现抓取逻辑

在 `server/sources/` 下创建同名文件，默认导出一个 getter：

```ts
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const html = await myFetch("https://example.com", { responseType: "text" }) as string
  // 使用 cheerio 或 JSON API 解析
  return [] as NewsItem[]
})
```

RSS 源可以直接使用封装：

```ts
export default defineRSSSource("https://example.com/feed.xml")
```

RSSHub 源：

```ts
export default defineRSSHubSource("/example/topic")
```

子源可以导出对象映射：

```ts
export default defineSource({
  "example": hot,
  "example-sub": sub,
})
```

每个条目必须包含唯一的 `id`、`title` 和 `url`，可选 `mobileUrl`、`pubDate`、`extra`。

### 3. 生成并测试

```bash
pnpm gen:sources
pnpm gen:icons
pnpm dev
```

测试单个数据源：

```bash
curl "http://localhost:5173/api/s?id=example&latest"
```

生产模式使用对应端口，例如：

```bash
curl "http://localhost:20193/api/s?id=example&latest"
```

最后执行：

```bash
pnpm lint
pnpm typecheck
pnpm test --run
pnpm build
```

### 4. 注意事项

- XML/RSS 内容建议加 `responseType: "text"`，避免 ofetch 自动解析 XML 出错。
- 需要代理的站点要把域名加入 `server/utils/fetch.ts` 的 `PROXY_DOMAINS`。
- 图标查找规则是 `public/icons/{id.split("-")[0]}.png`，新增源后运行 `pnpm gen:icons`。
- `server/glob.d.ts` 是生成的类型声明但已入库，新增源后应一并提交。
- 不要新增名为 `source`、`imports` 的 npm script，避免触发 npm 的 `pre`/`post` 生命周期。

## API 与缓存

### API 接口

| 接口 | 说明 |
|------|------|
| `GET /api/s?id={sourceID}` | 获取单个数据源，优先返回缓存 |
| `GET /api/s?id={sourceID}&latest` | 跳过 TTL，尽量抓取最新数据 |
| `POST /api/s/entire` | 批量读取缓存，请求体 `{ "sources": ["weibo", "zhihu"] }` |
| `GET /api/latest` | 返回当前服务端版本 `{ "v": "0.0.39" }` |
| `POST /api/mcp` | MCP Streamable HTTP 入口，提供 `get_hotest_latest_news` 工具 |

### 缓存行为

- 缓存存储在 `.data/db.sqlite3`，表名为 `cache`，字段为 `id`、`updated`、`data`。
- `interval` 内直接返回缓存，即使带 `?latest` 也不会重新抓取。
- 超过 `interval` 但未超过 30 分钟 TTL 时，普通请求返回缓存，`?latest` 会重新抓取。
- 抓取失败且存在旧缓存时，返回旧缓存并在响应中标记为 `cache`。

清除单个数据源缓存：

```bash
sqlite3 .data/db.sqlite3 "DELETE FROM cache WHERE id='weibo';"
```

## 排障

### 首页空白，控制台提示 `does not provide an export named 'set'`

这是 `unimport` 底层 `mlly` 的解析问题。单行写法：

```ts
// 不要写成这样：
export const toggleSourceVisibilityAtom = atom(null, (get, set, source: SourceID) => {
  // ...
})
```

会被误判为导出了 `set`，从而生成不存在的自动导入。`src/atoms/index.ts` 中的写 atom 必须保持多行写法：

```ts
export const toggleSourceVisibilityAtom = atom(
  null,
  (get, set, source: SourceID) => {
    // ...
  },
)
```

修改后重新运行 `pnpm gen:imports`，并重启 `pnpm dev`。

### 数据源返回 403 或超时

- 国际站点：检查 `.env.server` 中的 `HTTPS_PROXY` / `HTTP_PROXY`，并确认域名在 `PROXY_DOMAINS` 中。
- 国内站点：确认本机网络可访问；部分站点有频率限制或人机校验。
- 中国数字时代：官方 RSS 可能被 Cloudflare 拦截，项目会自动回退到 Jina Reader。
- 其他源：使用 `curl` 直接访问接口确认是否仍可用，再调整抓取逻辑。

### 缺少生成文件

```bash
pnpm gen:sources
pnpm gen:imports
```

### 图标缺失

```bash
pnpm gen:icons
```

### 端口被占用

```bash
PORT=20194 pnpm dev
```

## 文档

- [English README](README.md)
- [贡献指南](CONTRIBUTING.md)
- [CLAUDE.md](CLAUDE.md) — 面向开发者的架构与维护说明
- [TASKS.md](TASKS.md) — 待办与代码改进清单
- [docs/review_mimo.md](docs/review_mimo.md) — 历史代码审阅报告，部分结论已过时
- [docs/archive/](docs/archive/) — 历史文档，仅作存档，不代表当前实现

## 致谢

基于 [ourongxing](https://github.com/ourongxing) 的 [NewsNow](https://github.com/ourongxing/newsnow) 二次开发。上游项目采用 MIT 协议。

## 协议

本项目采用 [AGPL-3.0](./LICENSE)。
