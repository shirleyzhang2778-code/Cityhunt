# 今日复习与薄弱词

## 背景

现有应用可以按章节学习和收藏生词，但缺少跨章节的复习安排。

## 目标

在不改变现有视觉基线和底部导航的情况下，根据学习反馈自动生成今日复习与薄弱词任务。

## 范围

- 包含：本地复习排期、首页今日任务、薄弱词入口、每日目标设置。
- 不包含：服务端表结构变更、排行榜、复杂统计图表。

## 实现决定

- 复用现有闪卡组件，避免产生第二套学习交互。
- 复习排期随单词进度保存在 IndexedDB，旧记录按更新时间兼容。
- 认识后采用递增间隔，不认识的词十分钟后再次到期。

## 验收标准

- [ ] 首页显示今日完成数、待复习数和薄弱词数。
- [ ] 用户可完成今日复习或单独巩固薄弱词。
- [ ] 设置页可选择 10、20、30 个每日目标。
- [ ] 原章节学习、收藏、登录和现有 UI 不受影响。
- [ ] 构建通过并完成线上页面验证。

## 影响文件

- `src/lib/review.ts`
- `src/lib/db/dexie.ts`
- `src/components/flashcard/FlashcardEngine.tsx`
- `src/components/home/TodayReviewCard.tsx`
- `src/app/(main)/HomeClient.tsx`
- `src/app/(main)/review/page.tsx`
- `src/app/(main)/settings/page.tsx`
