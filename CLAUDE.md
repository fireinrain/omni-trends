# OmniTrends

> 最后更新：2026-11-18

实时热点新闻聚合阅读器，从 100+ 个数据源抓取热门新闻统一展示。

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19 + TypeScript 5.9 + TanStack Router/Query + UnoCSS |
| 状态 | Jotai (客户端) + TanStack Query (服务端) |
| 构建 | Vite 7 + SWC |
| 服务端 | Nitro (h3) — Node.js |
| 数据库 | db0 → SQLite |
| HTTP | ofetch (封装为 myFetch) |
| HTML 解析 | Cheerio |
| 包管理 | pnpm 10 |

## 核心架构

### 数据源自动注册

`shared/pre-sources.ts` 定义所有源元信息，构建时 `scripts/source.ts` 生成 `sources.json`。服务端 `server/getters.ts` 通过 glob 导入 `server/sources/*.ts` 自动注册 getter：

```typescript
import * as x from "glob:./sources/{*.ts,**/index.ts}"
```

每个源文件导出默认函数，返回 `NewsItem[]`。支持子源（sub），如 `bilibili-hot-search`、`bilibili-hot-video`。

### 数据源抓取方式

全部服务端抓取，两种模式：

| 方式 | 说明 | 示例 |
|------|------|------|
| HTML/API 解析 | ofetch 抓取 → Cheerio/JSON 提取 | weibo、zhihu、bilibili |
| RSS/Feed | defineRSSSource / defineRSSHubSource 封装 | BBC、Guardian、AP News |
| Google News RSS | `news.google.com/rss/search?q=site:xxx.com` | Economist、小红书 |
| 直接 API | 调数据源 JSON API | Huggingface Papers |

工具函数在 `server/utils/source.ts`：defineRSSHubSource / defineRSSSource。

### 自适应缓存

两层时间控制（`server/api/s/index.ts`）：

- **interval**：源内容更新频率（微博 2min，Solidot 60min），间隔内直接返缓存
- **TTL**：固定 30min，TTL 外或带 `?latest` 参数才重新抓取

## 目录结构要点

```
shared/
  pre-sources.ts        # 数据源定义（名称、颜色、间隔、分类）
  sources.ts            # 运行时读取 sources.json 的源注册表
  types.ts              # NewsItem, Source, SourceResponse
  consts.ts             # TTL、Interval 常量
  metadata.ts           # 栏目分类（国内/国际/科技/财经/关注/实时/最热）

server/
  sources/              # 数据源实现（85 个 .ts 文件）
  api/s/index.ts        # 核心接口：GET /api/s?id=xxx
  utils/source.ts       # defineRSSHubSource / defineRSSSource
  utils/rss2json.ts     # RSS 解析器
  utils/fetch.ts        # myFetch 封装（含代理支持）
  utils/crypto.ts       # 加密工具
  utils/date.ts         # 日期工具
  utils/base64.ts       # Base64 编码
  utils/logger.ts       # 日志工具
  getters.ts            # glob 自动注册
  database/cache.ts     # 缓存 CRUD

src/
  components/column/    # 新闻栏目组件
  components/header/    # 头部（含 ThemeToggle）
  hooks/useDark.ts      # 暗色模式 hook
  atoms/                # Jotai atoms
```

## 构建与运行

无 base path 前缀，所有环境直接根路径访问：

| 环境 | 访问地址 | 配置 |
|------|----------|------|
| 本地 | `http://localhost:20193/` | 直接启动 |
| 容器 | `http://localhost:4444/` | Docker Compose |

```bash
pnpm dev                                                     # 开发模式，默认 5173 端口
pnpm build && PORT=20193 node --env-file=.env.server dist/output/server/index.mjs
pnpm test --run                                              # 单元测试
pnpm typecheck                                               # 自动生成类型声明后执行 tsc
pnpm gen:icons                                               # 仅为新增数据源下载缺失图标
```

### 生成文件

以下文件不入库，按需生成：

| 文件                                         | 生成命令               | 触发时机                                  |
|--------------------------------------------|--------------------|---------------------------------------|
| `shared/sources.json`、`shared/pinyin.json` | `pnpm gen:sources` | `dev` / `build` / `typecheck`         |
| `imports.app.d.ts`                         | `pnpm gen:imports` | `typecheck`，`dev` / `build` 由 Vite 生成 |

修改 `shared/pre-sources.ts` 后重新运行 `pnpm gen:sources`（或直接 build/typecheck）即可。

数据源图标已全部提交在 `public/icons/`，`dev` / `build` 不会联网抓取。只有新增数据源时才需要运行 `pnpm gen:icons`
补齐缺失图标（已有图标不会重复下载）。

### 测试单个源

```bash
curl -s "http://localhost:20193/api/s?id={source_id}"
```

### 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `PORT` | 否 | 默认 3000，本项目用 20193 |
| `PRODUCTHUNT_API_TOKEN` | 否 | Product Hunt 数据源 |
| `XHS_COOKIE` | 否 | 小红书数据源回退方案（移动端接口被限流时回退到 Web 接口所需的登录 Cookie，需含 `web_session`） |

## 当前工作状态

### 已完成

- 新增 14 个数据源（提交 `0b431c3` 和 `dcb6424`）
  - 直接 RSS：BBC、Guardian、NHK、WSJ
  - RSSHub：AP News、Washington Post
  - 自定义解析：Al Jazeera
  - 直接 API：Huggingface Papers
  - Google News RSS：Economist、TechFlow、证券时报、开源中国、SegmentFault
- 启用深色/浅色模式切换（ThemeToggle，默认 auto）
- 下载新源图标到 `public/icons/`
- 新增「信息瀑布流」视图（2026-11-18）：
  - 顶部按钮在「卡片模式 / 瀑布流模式」间切换，选择持久化到 `omni.viewMode`
  - 合并当前栏目的所有数据源，按时间分桶、桶内按来源轮询交错，实现基于时间线但乱序的信息流
  - 支持「乱序 / 时间线」切换、响应式分栏和渐进加载（`src/components/waterfall/`）
- 停止在 `dev` / `build` 时抓取 favicon（2026-11-18）：
  - 图标已全部入库，`presource` 只生成 sources/pinyin
  - `scripts/favicon.ts` 改为显式 `pnpm gen:icons`，按 `id.split("-")[0]` 去重，仅下载缺失图标
- 工程化修复（2026-11-18）：
  - `entire.post.ts` 不再静默吞异常，非法请求体返回 4xx
  - `sources.json` / `pinyin.json` 移出版本库，避免生成物与源码漂移
  - `imports.app.d.ts` 可独立生成，全新克隆可直接 `pnpm typecheck`
  - 测试从 2 个文件扩充到 6 个，覆盖 crypto/base64/source/shared utils
- 数据源修复（2026-05-22）：
  - **freebuf**：改用 `node:https` + RSS feed（ofetch/undici 被 TLS 指纹检测拦截 405）
  - **xiaohongshu**：改用 edith API 热搜接口（需完整移动端 headers 含 shield/xy-common-params）
  - **ghxi（果核剥壳）**：移除 disable 启用，cheerio 解析正常
  - **fastbull**：标记 disable（网站改版为纯 SPA，无公开 API）
  - **mktnews**：标记 disable（API 返回 403）
  - **jianshu**：标记 disable（SSR 只渲染 4 条，其余客户端动态加载，无可用 API）

### 下一步

1. 考虑添加更多国际媒体：Reuters、CCTV、人民网、财新
2. 验证 36kr 快讯是否仍能拿到数据
3. 处理超时源（v2ex、reddit、hackernews 等需要代理的国外源）

### 已知问题

- `server/sources/weibo.ts` 硬编码了微博 Cookie，可能随时失效
- 36kr 人气榜被 WAF 拦截，无法服务端抓取
- freebuf 有 TLS 指纹检测，必须用 `node:https` 而非 ofetch/undici
- xiaohongshu edith API 的 headers 含硬编码设备指纹，可能随时失效
- smzdm 有 JS challenge 反爬，linuxdo 被墙，均无法服务端抓取

## 注意事项

- 参考项目在 `vendors/`（DailyHotApi、next-daily-hot、HotList-Web），已 gitignore
- 图标查找逻辑：`src/components/column/card.tsx` → `url(/icons/${id.split("-")[0]}.png)`
- 图标文件已入库；新增数据源后运行 `pnpm gen:icons`，脚本只补齐缺失项，不会覆盖已有图标
- RSS 解析用 `rss2json.ts`；ofetch 自动解析 XML 会出错时需加 `responseType: "text"`
- 部分网站有 TLS 指纹检测（如 freebuf），ofetch/undici 会被拦截，需用 `node:https` 模块绕过
- 数据源禁用方式：在 `shared/pre-sources.ts` 对应源配置中加 `disable: true`
- 测试单个源时直接根路径：`curl http://localhost:20193/api/s?id={id}&latest`
- 缓存存储在 `.data/db.sqlite3`，清除特定源缓存：`sqlite3 .data/db.sqlite3 "DELETE FROM cache WHERE id='xxx';"`
- `shared/sources.json`、`shared/pinyin.json`、`imports.app.d.ts` 均为生成文件（已 gitignore），不要手动编辑
- 新增 npm script 时避免使用可能与现有脚本形成 `pre`/`post` 钩子的名字（例如已有 `presource` 时不要再加 `source`）

## 参考文档

- `docs/archive/` — 历史文档（上游分析、bug 修复记录、部署方案对比）
