# @iam/platform-database-audit

Isolated audit PostgreSQL client and migration infrastructure.

当前处于 M0 边界阶段，尚未实现运行能力，也不包含业务规则。

## 职责

- 提供独立 Audit PostgreSQL Client、迁移目录和读写账号边界。
- 确保审计库故障不会被误装配进认证关键链路。

## 非职责

- 不访问 Main DB 领域表，不向 Auth Runtime 提供审计库凭据。
- 不实现审计领域查询、导出或完整性规则。

## 公共边界

跨包只能从 `src/index.ts` 导入。当前入口不导出行为；新增公开 API 时必须同步测试、README 和相关契约。

## 验证

- `corepack pnpm --filter @iam/platform-database-audit lint`
- `corepack pnpm --filter @iam/platform-database-audit typecheck`
