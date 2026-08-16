# FEAT-004 今日复习进度条颜色对齐

## 目标与范围

- 将首页“今日复习”进度条从纯色改为词书进度条使用的绿色到蓝色渐变。
- 不修改进度计算、卡片布局、按钮、文案和其他页面。

## 影响文件

- `src/components/home/TodayReviewCard.tsx`

## 验收与回滚

- [x] 构建通过。
- [x] 首页进度条与词书进度条使用相同渐变色 `#34D399 → #60A5FA`。
- 回滚：恢复进度条原有 `bg-primary` 类。

## 发布记录

- 环境：Cloudflare Demo
- 版本：`ec0efb7d-43ca-40ef-b7cd-2cffbd19ffc2`
