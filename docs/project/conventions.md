# 开发约定

## 命名与放置

- React 组件：`PascalCase.tsx`
- hooks：`useXxx.ts`
- 通用模块：语义明确的 `camelCase.ts`
- Next.js 路由遵循 App Router 目录约定
- 数据库对象使用 `snake_case`
- 新迁移使用递增编号，命名格式为 `NNN_short_description.sql`

## 变更边界

- 展示变更放在页面或组件；业务规则尽量下沉到 `hooks` 或 `lib`。
- 服务端密钥只允许出现在服务端代码和本地环境变量中。
- 不直接编辑构建生成的 `.next`、`public/sw.js` 或 `public/sw.js.map`。
- 不为了单个功能创建新的顶层目录；先使用现有模块边界。

## 文档约定

- 稳定且跨任务有效的结论写入 `docs/project`。
- 尚在实施的目标、取舍和验收写入 `docs/work/<task>.md`。
- 已完成任务移入 `docs/work/archive/`，并删除已失效的临时讨论。
- 文档只引用代码位置，不大段复制代码，降低双份内容漂移。
