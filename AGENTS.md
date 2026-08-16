# 项目协作入口

本文件是本项目的上下文索引。开始任何任务前，先阅读本文件，再按任务类型读取对应文档；不要一次性加载无关文档。

## 项目目标

这是一个面向缅甸语学习者的 Web / PWA 背单词应用。现有前端体验与路由行为是默认基线，除非任务明确要求，否则不要改动视觉样式、页面结构或交互文案。

## 必读索引

- 项目边界与当前能力：[`docs/project/overview.md`](docs/project/overview.md)
- 技术架构与数据流：[`docs/project/architecture.md`](docs/project/architecture.md)
- 开发约定：[`docs/project/conventions.md`](docs/project/conventions.md)
- 原始技术规范（较长，按需读取）：[`PRDs/development.md`](PRDs/development.md)
- 本地运行与部署：[`SETUP.md`](SETUP.md)
- 数据库真实实现：[`supabase/migrations/`](supabase/migrations/)

## 按任务加载上下文

| 任务 | 优先读取 |
| --- | --- |
| 页面、组件、样式 | `docs/project/overview.md`、相关 `src/app` 页面和 `src/components` |
| 学习进度、离线缓存 | `docs/project/architecture.md`、`src/lib/db`、`src/lib/sync` |
| 登录、权限、数据表 | `docs/project/architecture.md`、`supabase/migrations`、相关 API |
| PWA、Service Worker | `next.config.ts`、`src/sw.ts`、`src/app/manifest.ts` |
| 新功能 | `docs/work/README.md`，再创建独立任务文档 |
| 测试或修复 | `docs/testing/README.md`、相关实现文件 |

## 工作规则

1. 代码与运行中的数据库迁移是“当前事实”；文档冲突时，以实现为准并同步修正文档。
2. 新需求先在 `docs/work/` 建立短文档，记录目标、范围、验收标准和关键决定；完成后移入 `docs/work/archive/`。
3. 不把多个功能持续追加到一份超长 PRD。一个任务对应一个上下文文件，公共结论回写项目文档。
4. 前端与数据逻辑分离：可在 `src/lib` 或 API 层完成的变更，不侵入展示组件。
5. 不提交 `.env.local`、密钥、生成目录或构建产物。
6. 数据库变更只能新增迁移，不修改已经执行过的历史迁移。
7. 修改后至少运行类型/构建检查；涉及交互时补充真实页面操作验证。

## 目录职责

```text
src/app/              页面、路由与 API
src/components/       可复用界面组件
src/hooks/            React hooks
src/lib/              数据、同步、音频及通用业务逻辑
supabase/migrations/  按序执行的数据库变更
supabase/functions/   可选的边缘函数实现
docs/project/         稳定、长期有效的项目知识
docs/work/            当前任务的过程文件
docs/testing/         测试策略与验证记录入口
PRDs/                 历史/原始产品与技术资料
public/               静态资源
```
