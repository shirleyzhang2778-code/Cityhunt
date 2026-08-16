# 发布公网演示版

## 背景

需要让其他人通过公网地址访问应用，并能够注册、登录和进入主页面。

## 目标

将当前 Next.js 应用发布到腾讯云 EdgeOne Pages，配置 Supabase 生产环境变量，并验证身份流程。

## 范围

- 包含：修复生产构建阻塞、配置 EdgeOne 部署环境、发布和公网验收。
- 不包含：前端视觉、页面结构和交互文案调整。

## 验收标准

- [ ] 生产构建通过
- [ ] 公网地址可访问
- [ ] 新用户可注册并登录
- [ ] 登录后可进入首页
- [ ] 服务角色密钥未暴露到浏览器

## 影响文件

- `src/app/(main)/HomeClient.tsx`
- `src/lib/supabase/server.ts`
- `src/middleware.ts`
- `src/sw.ts`
