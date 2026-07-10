# @iam/platform-testing

Deterministic test clocks, identifiers, fixtures, and infrastructure harnesses.

当前处于 M0 边界阶段，尚未实现运行能力，也不包含业务规则。

## 职责

- 提供确定性 Clock、UUID、Fixture Builder 和 Testcontainers Helper。
- 保护测试不会连接本地开发、测试或生产真实数据库。

## 非职责

- 生产 Runtime 不得依赖本包。
- 不提供长期 Mock 来掩盖真实集成边界。

## 公共边界

跨包只能从 `src/index.ts` 导入。当前入口不导出行为；新增公开 API 时必须同步测试、README 和相关契约。

## 验证

- `corepack pnpm --filter @iam/platform-testing lint`
- `corepack pnpm --filter @iam/platform-testing typecheck`
