# 文档中心

文档按“稳定知识、当前工作、测试依据、历史资料”分层，避免把所有上下文堆进同一个文件。

## 稳定知识

- [`project/overview.md`](project/overview.md)：产品目标、用户流程、范围边界
- [`project/architecture.md`](project/architecture.md)：技术栈、模块关系、数据流与事实来源
- [`project/conventions.md`](project/conventions.md)：目录、命名、变更和文档约定
- [`project/development-workflow.md`](project/development-workflow.md)：从需求到交付的标准流程与四个闸门
- [`project/environments.md`](project/environments.md)：本地、演示和正式环境边界
- [`project/release-checklist.md`](project/release-checklist.md)：发布、验证与回滚清单

## 过程文件

- [`work/README.md`](work/README.md)：新任务模板与归档方式
- [`work/TEMPLATE.md`](work/TEMPLATE.md)：可直接复制的新功能/修复任务模板
- `work/archive/`：已完成任务的过程记录

## 测试

- [`testing/README.md`](testing/README.md)：最低验证要求和测试记录方式
- [`testing/feature-test-template.md`](testing/feature-test-template.md)：功能测试记录模板

## 历史资料

原始长篇技术规范保留在 [`../PRDs/development.md`](../PRDs/development.md)。它用于追溯设计意图，不自动代表当前实现；发生冲突时，以代码与数据库迁移为准。
