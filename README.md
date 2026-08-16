# 缅甸语专业背单词 App (Web/PWA)

## 快速开始

详细步骤见 **[SETUP.md](./SETUP.md)**。

```bash
npm install
cp .env.example .env.local   # 填入 Supabase 密钥
npm run dev
```

在 Supabase SQL Editor 执行 `supabase/migrations/*.sql` 与 `supabase/seed.sql`。
激活码核销已内置为 `POST /api/redeem-activation`（无需单独部署 Edge Function）。

## 测试激活码

- `DEMO2024` — 解锁《琉璃宫史·第一卷》
- `TESTCODE1` / `VIPBOOK01`

## 文档

- 项目协作入口：[`AGENTS.md`](./AGENTS.md)
- 文档导航：[`docs/README.md`](./docs/README.md)
- 原始技术规范：[`PRDs/development.md`](./PRDs/development.md)
