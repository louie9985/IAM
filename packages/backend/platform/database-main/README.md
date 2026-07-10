# @iam/platform-database-main

Main PostgreSQL client, transaction primitives, and migration infrastructure.

当前处于 M0 边界阶段，尚未实现运行能力，也不包含业务规则。

## 职责

- 提供 Main PostgreSQL 连接、事务边界和迁移基础。
- 后续承载平台 Outbox 等明确归属的平台表。

## 非职责

- 不暴露跨模块通用 Repository，不允许绕过领域所有权访问表。
- 不连接独立 Audit PostgreSQL。

## 公共边界

跨包只能从 `src/index.ts` 导入。当前入口不导出行为；新增公开 API 时必须同步测试、README 和相关契约。

## 验证

- `corepack pnpm --filter @iam/platform-database-main lint`
- `corepack pnpm --filter @iam/platform-database-main typecheck`
