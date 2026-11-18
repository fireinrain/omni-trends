# OmniTrends

![](/public/logo.png)

实时热点新闻聚合阅读器 — 基于 [NewsNow](https://github.com/ourongxing/newsnow) 二次开发，扩展了更多数据源、代理支持和 bug 修复。

**在线访问**: https://news.furina.in/

[English](README.md)

## 与原版的区别

- **100+ 个数据源**，覆盖国内、国际媒体、科技、财经
- **代理支持** — 在 `.env.server` 配置 `HTTPS_PROXY` 即可访问被墙站点
- **修复多个失效源** — freebuf（TLS 指纹绕过）、小红书（edith API）等
- **信息瀑布流模式** — 在卡片视图外提供基于时间线、按来源混排的热点信息流
- **深色/浅色模式**切换
- **PWA 支持** — 可安装为桌面应用

## 快速开始

```bash
pnpm install
pnpm build
PORT=20193 node --env-file=.env.server dist/output/server/index.mjs
```

## 配置

复制 `example.env.server` 为 `.env.server`：

```env
G_CLIENT_ID=
G_CLIENT_SECRET=
JWT_SECRET=
INIT_TABLE=true
ENABLE_CACHE=true
PRODUCTHUNT_API_TOKEN=
XHS_COOKIE=
```

代理和端口配置见 `.env.server`（实际使用，不入库）：
```env
PORT=20193
HTTPS_PROXY=http://127.0.0.1:7897
HTTP_PROXY=http://127.0.0.1:7897
```

代理为可选项，但访问国际源（Reddit、HackerNews、BBC、纽约时报等）时必须配置。

## 部署

支持两种部署方式：本地部署与容器部署。

### 本地部署

```bash
pnpm build
PORT=20193 node --env-file=.env.server dist/output/server/index.mjs
```

### 容器部署

```bash
docker compose -f docker-compose.local.yml up -d --build   # 从源码构建镜像
docker compose up -d                                        # 拉取已发布镜像
```

访问 http://localhost:4444/

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19 + TanStack Router/Query + UnoCSS |
| 后端 | Nitro (h3) — Node.js |
| 数据库 | SQLite |
| HTTP | ofetch + undici ProxyAgent |
| 构建 | Vite 7 + pnpm |

## 数据源

完整列表见 `shared/sources.json`（`pnpm presource` 生成），共 100+ 个源。

## 开发

> 需要 Node.js >= 20

```bash
corepack enable
pnpm install
pnpm dev          # http://localhost:5173
```

常用命令：

```bash
pnpm build        # 生产构建
pnpm test --run   # 单元测试
pnpm typecheck    # 类型检查（自动生成 sources.json 与类型声明）
pnpm lint         # ESLint
```

生产运行：

```bash
pnpm build
PORT=20193 node --env-file=.env.server dist/output/server/index.mjs
```

### 添加数据源

1. 在 `shared/pre-sources.ts` 定义元信息
2. 在 `server/sources/{name}.ts` 创建抓取逻辑
3. 重新构建并测试：`curl http://localhost:20193/api/s?id={name}&latest`

> `shared/sources.json` 和 `shared/pinyin.json` 是生成文件（已 gitignore），由 `pnpm build` / `pnpm dev` / `pnpm typecheck`
> 自动生成。

## 致谢

基于 [ourongxing](https://github.com/ourongxing) 的 [NewsNow](https://github.com/ourongxing/newsnow) 二次开发，原项目采用 MIT 协议。

## 许可证

[MIT](./LICENSE)
