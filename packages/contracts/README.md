# @iam/contracts

Public source-of-truth package for IAM API, event, policy, permission, and observability contracts.

当前处于 M0 边界阶段；只有出现首个真实契约时才创建 `src/api`、`src/events`、`src/policies` 或 `src/permissions` 目录。

## 职责

- 人工维护 API Schema、事件 Schema、策略目录和权限契约。
- 作为 OpenAPI、事件 JSON Schema、策略目录和 SDK Client 的唯一生成输入。

## 非职责

- 生成产物不得在本包或下游 SDK 中手工修改。
- 不包含领域 Repository、数据库 Client 或 Runtime 装配。

## 公共边界

跨包只能从 `src/index.ts` 导入。当前入口不导出行为；新增公开 API 时必须同步测试、README 和相关契约。

## 验证

- `corepack pnpm --filter @iam/contracts lint`
- `corepack pnpm --filter @iam/contracts typecheck`
