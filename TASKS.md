# TASKS.md

> 代码层面的改进清单，不包含文档修改。

## 已完成

### 2026-11-19

- [x] **新增数据源自定义** — 「最热」「实时」支持选择要展示的数据源；选择结果存入 `omni.hiddenSources`，卡片与瀑布流共用 `currentVisibleSourcesAtom`
- [x] **拖拽只作用于可见卡片** — 新增 `applyVisibleOrder()`，隐藏数据源在重新勾选后仍保持原位置
- [x] **新增中国数字时代数据源** — 优先请求官方 RSS，Cloudflare `403` 时回退 Jina Reader；已验证 `/api/s?id=chinadigitaltimes&latest=true` 可返回 7 条数据
- [x] **修复多个数据源** — 联合早报、深潮 TechFlow、开源中国、SegmentFault、证券时报、财联社、PCbeta 等改为当前可用的官方接口或页面解析
- [x] **修复首页白屏** — 写 atom 改为多行写法并补充注释，避免 `mlly` 将 `set` / `source` 误判为导出；重新生成 `imports.app.d.ts`
- [x] **测试补充到 85 个** — 覆盖 `crypto`、`base64`、`rss2json`、RSS/RSSHub getter、日期、共享工具、瀑布流合并/排序、卡片排序

### 2026-11-18

- [x] **批量缓存接口不再静默失败** — `server/api/s/entire.post.ts` 非法请求体返回 4xx；数据库异常记录日志并返回 `[]`，由客户端退化为逐个源请求
- [x] **生成文件移出版本库** — `shared/sources.json`、`shared/pinyin.json` 加入 `.gitignore`，改由 `pnpm gen:sources` 生成
- [x] **自动导入类型声明可独立生成** — 新增 `pnpm gen:imports`（`scripts/imports.ts`），与 Vite 共用 `tools/unimport.ts`
- [x] **修复启动时 favicon 抓取超时** — `dev` / `build` 不再联网抓图标，改为显式 `pnpm gen:icons`；脚本按 `id.split("-")[0]` 去重，只下载缺失图标
- [x] **新增信息瀑布流模式** — 卡片/瀑布流切换、时间分桶 + 来源轮询混排、乱序/时间线切换、响应式分栏与渐进加载
- [x] **确认 `pnpm dev` 可用** — 页面、`/api/latest`、`/api/s?id=weibo` 均正常

## 测试

- [ ] **数据源集成测试** — 为关键数据源（weibo、zhihu、github 等）编写带 mock 的测试，验证解析逻辑仍有效，避免依赖真实网络
- [ ] **前端 hook 测试** — `src/hooks/useRelativeTime.ts` 等目前无测试；`vitest.config.ts` 已支持 `src/**/*.test.ts`，还需补充 jsdom 环境

## 代码质量

- [ ] **数据源错误处理** — 部分 getter 缺少 try/catch，抓取失败时可能抛出未处理异常。可在 `server/getters.ts` 统一包装并记录源 ID
- [ ] **清理剩余 `@ts-expect-error` / `any`** — `strict` 已开启，但 `shared/types.ts`、`server/utils/rss2json.ts` 等仍有绕过 strict 的写法

## 架构与稳定性

- [ ] **数据源健康检查/降级** — `myFetch` 已有 10s 超时 + 3 次重试，但超时源（v2ex、reddit、hackernews 等）仍会拖慢并发抓取；可增加源级超时与降级策略
- [ ] **代理域名白名单可配置** — `server/utils/fetch.ts` 的 `PROXY_DOMAINS` 写死在代码里，建议改为环境变量，减少新增国际源时改代码
- [ ] **降低中国数字时代对 Jina Reader 的依赖** — 官方 RSS 目前可能被 Cloudflare 拦截，可评估更稳定的抓取方式或可配置镜像

## 依赖

- [ ] **dayjs patch** — `package.json` 已把 dayjs 固定为 `1.11.13`，升级时需确认 `patches/dayjs.patch` 仍可应用
- [ ] **nitropack fork** — 使用 `npm:nitro-go@0.0.3` 作为 nitropack 替代，注意上游更新
