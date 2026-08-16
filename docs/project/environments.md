# 环境边界

## 环境矩阵

| 环境 | 用途 | 数据与账号 | 发布要求 |
| --- | --- | --- | --- |
| Local | 快速开发和调试 | 本地配置；使用测试账号 | 类型/构建检查通过 |
| Demo | 向他人演示当前版本 | Cloudflare Worker；只使用演示所需配置 | 核心 URL 和登录流程验证 |
| Production | 正式用户使用 | 独立正式配置和数据 | 完整验收、监控、回滚点和用户许可 |

## 当前事实

- 当前公网地址 `https://myanmar-vocab-app.shirleyzhang2778.workers.dev` 定义为 Demo 环境。
- 当前发布平台为 Cloudflare Workers，配置入口为 `wrangler.jsonc` 和 `open-next.config.ts`。
- Supabase 提供身份与云端数据；`SUPABASE_SERVICE_ROLE_KEY` 只能存在于可信服务端环境。
- `.env.local`、`.dev.vars` 和任何真实密钥不得提交 Git。

## 配置规则

- `NEXT_PUBLIC_*` 会进入浏览器，只能存放允许公开的配置。
- 服务角色密钥不能放入前端变量、页面代码、日志或截图。
- Demo 与 Production 应使用不同的项目、密钥或至少不同权限边界。
- 新环境变量必须同步更新 `.env.example`，只写占位值和用途。
- Agent 不得根据本地密钥自动推断有权将其上传到任何云平台。

## 环境提升

从 Local 提升到 Demo 前验证构建和核心页面；从 Demo 提升到 Production 前重新执行发布清单，不以“演示环境可用”代替生产验收。
