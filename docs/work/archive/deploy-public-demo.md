# 发布公网演示版

## 背景

需要让其他人通过公网地址访问应用，并能够注册、登录和进入主页面。

## 目标

将当前 Next.js 应用发布到 Cloudflare Workers，配置演示环境所需变量，并验证公网访问。

## 范围

- 包含：修复生产构建阻塞、配置 Cloudflare Workers、发布和公网验收。
- 不包含：前端视觉、页面结构和交互文案调整。

## 验收标准

- [x] 生产构建通过
- [x] 公网地址可访问
- [x] 登录页面和主页面可访问
- [x] 服务角色密钥未暴露到浏览器
- [x] 生词本不因云端连接缓慢而阻塞本地页面

## 发布记录

- 环境：Demo
- 地址：`https://myanmar-vocab-app.shirleyzhang2778.workers.dev`
- 平台：Cloudflare Workers / OpenNext
- 回滚：使用 Cloudflare Worker 版本回滚，并将代码恢复至对应 Git 提交。

## 影响文件

- `src/app/(main)/HomeClient.tsx`
- `src/lib/supabase/server.ts`
- `src/middleware.ts`
- `src/sw.ts`
