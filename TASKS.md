# TASKS.md

> 代码改进建议。不包含文档修改，只列代码层面需要做的事。

## 已完成（2026-11-18）

- [x] **批量缓存接口不再静默失败** — `server/api/s/entire.post.ts` 原先空 `catch` 会返回 `undefined`；现在非法请求体返回
  4xx，数据库异常记录日志并返回 `[]`，由客户端退化为逐个源请求
- [x] **生成文件移出版本库** — `shared/sources.json`、`shared/pinyin.json` 加入 `.gitignore`，改由 `pnpm gen:sources` 生成；
  `pnpm typecheck` 前自动生成
- [x] **自动导入类型声明可独立生成** — 新增 `pnpm gen:imports`（`scripts/imports.ts`），与 Vite 共用 `tools/unimport.ts`
  配置，全新克隆无需先跑 `dev`/`build` 即可 `typecheck`
- [x] **补充单元测试** — 新增 `server/utils/{crypto,base64,source}.test.ts`、`shared/utils.test.ts`、
  `src/components/waterfall/utils.test.ts`，覆盖哈希、Base64、RSS/RSSHub getter、delay/randomUUID、瀑布流合并/排序
- [x] **确认 `pnpm dev` 可用** — 实测页面、`/api/latest`、`/api/s?id=weibo` 均正常，原「只能 build 后运行」的记录已过期
- [x] **修复启动时 favicon 抓取超时** — `dev` / `build` 不再联网抓图标，改为显式 `pnpm gen:icons`；脚本按
  `id.split("-")[0]` 去重，只下载缺失图标
- [x] **新增信息瀑布流模式** — 卡片/瀑布流切换、时间分桶 + 来源轮询混排、乱序/时间线切换、响应式分栏与渐进加载

## 测试

- [ ] **数据源集成测试** — 为关键数据源（weibo、zhihu、github 等）编写带 mock 的测试，验证解析逻辑仍有效，避免依赖真实网络
- [ ] **前端 hook 测试** — `src/hooks/useRelativeTime.ts` 等目前无测试；`vitest.config.ts` 已支持 `src/**/*.test.ts`，还需补充
  jsdom 环境

## 代码质量

- [ ] **数据源错误处理** — 部分数据源 getter 缺少 try/catch，抓取失败时可能抛出未处理异常。可在 `server/getters.ts`
  统一包装并记录源 id
- [ ] **清理剩余 `@ts-expect-error` / `any`** — `strict` 已开启，但 `shared/types.ts`、`server/utils/rss2json.ts` 等仍有绕过
  strict 的写法

## 架构

- [ ] **数据源健康检查/降级** — `myFetch` 已有 10s 超时 + 3 次重试，但超时源（v2ex、reddit、hackernews）仍会拖慢整个并发抓取；可增加源级超时与降级策略
- [ ] **代理域名白名单可配置** — `server/utils/fetch.ts` 的 `PROXY_DOMAINS` 写死在代码里，建议改为环境变量，减少新增国际源时改代码

## 依赖

- [ ] **dayjs patch** — `package.json` 已把 dayjs 固定为 `1.11.13`，升级时需确认 `patches/dayjs.patch` 仍可应用
- [ ] **nitropack fork** — 使用 `npm:nitro-go@0.0.3` 作为 nitropack 替代，注意上游更新
