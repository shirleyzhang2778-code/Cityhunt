# 本地运行与 Cloudflare 部署

## 1. Supabase

1. 创建项目 → Settings → API 复制 URL 与 keys
2. SQL Editor 依次执行：
   - `supabase/migrations/001_init.sql`
   - `supabase/migrations/002_auth_trigger.sql`
   - `supabase/seed.sql`
3. Authentication → Providers → Email：关闭「Confirm email」（便于开发登录）
4. 将 `SUPABASE_SERVICE_ROLE_KEY` 填入 `.env.local`（仅服务端，勿提交 Git）

## 2. 本地环境

```bash
cp .env.example .env.local
# 编辑填入 Supabase 与 NEXT_PUBLIC_APP_URL
npm install
npm run dev
```

## 3. 字体（M4）

将 `Pyidaungsu-Regular.woff2` 放入 `public/fonts/`。未放置时使用 Noto Sans Myanmar 回退。

## 4. Cloudflare Demo

1. 使用 Cloudflare 账号完成 Wrangler 登录。
2. 在 Cloudflare 环境配置公开的 Supabase URL 与匿名 Key。
3. 服务角色密钥仅在确有服务端需求且用户明确授权时配置，不能进入浏览器。
4. 运行 `npm run build` 完成本地生产构建检查。
5. 运行 `npm run deploy` 发布到 Cloudflare Workers。
6. 按 `docs/project/release-checklist.md` 验证并记录 Version ID。

当前 Demo 地址：`https://myanmar-vocab-app.shirleyzhang2778.workers.dev`

## 5. 测试账号与激活码

- 注册：微信号任意 + 密码 ≥6 位
- 激活码：`DEMO2024` / `TESTCODE1` / `VIPBOOK01` → 解锁《琉璃宫史·第一卷》
- 免费词书：《基础日常·体验册》无需激活码

## 6. Edge Function（可选）

已提供等价的 Next.js API：`POST /api/redeem-activation`。若仍要部署 Supabase Edge：

```bash
supabase functions deploy redeem-activation
```
