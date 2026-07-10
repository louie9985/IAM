# @iam/module-audit

Append-only audit intents, records, search, export, archive, and integrity verification.

当前处于 M0 边界阶段，公共入口尚未导出领域行为，也未创建空的分层目录。实现首个真实用例时再按 `domain/application/infrastructure/presentation` 建立必要目录。

## 职责

- Main DB Audit Intent、独立 Audit DB 摄取和只读检索。
- 异步导出、长期归档驱动和完整性检查。
- 使用白名单快照记录操作时事实，禁止反推历史。

## 非职责

- 不反向调用认证主链路，不成为普通登录的同步依赖。
- 密码、Token、Secret、TOTP Seed 和恢复码永不进入审计。

## 公共边界

跨包只能从 `src/index.ts` 导入。表所有权、允许依赖和事件边界以 `module.yaml` 为准；任何变化必须与代码和测试同一提交更新。

## 验证

- `corepack pnpm --filter @iam/module-audit lint`
- `corepack pnpm --filter @iam/module-audit typecheck`
