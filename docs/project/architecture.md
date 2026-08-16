# 技术架构

## 技术栈

- Next.js 15、React 19、TypeScript
- Tailwind CSS、Radix UI、Framer Motion
- Supabase Auth / PostgreSQL
- Dexie / IndexedDB 本地缓存
- Serwist Service Worker

版本以 `package.json` 和锁文件为准。

## 模块边界

```text
页面与组件
  -> hooks / 领域逻辑
    -> IndexedDB（离线读取、即时写入）
    -> Next.js API / Supabase（身份、解锁、云同步）
```

- `src/app` 负责路由装配和页面入口。
- `src/components` 负责展示与可复用交互，不直接承载跨页面数据规则。
- `src/lib/db` 是本地数据结构入口。
- `src/lib/sync` 管理恢复与同步队列。
- `src/app/api` 承担需要服务端凭据或服务端校验的操作。

## 数据原则

1. 章节内容首次获取后写入 IndexedDB，学习流程优先读取本地数据。
2. 用户进度采用本地优先写入，再向云端同步的方式。
3. 激活码核销必须在服务端完成，不能把服务角色密钥暴露给浏览器。
4. 缓存清理只清理可重新下载的媒体或章节缓存，不应删除学习进度。

## 事实来源优先级

当资料不一致时，依次采用：

1. 当前可运行代码与 `package.json`
2. `supabase/migrations` 中按序演进后的最终结构
3. `docs/project` 中的稳定说明
4. `PRDs/development.md` 中的历史设计

注意：迁移文件记录演进过程，早期表结构可能已被后续迁移替换；判断最终结构时必须按文件编号顺序阅读。
