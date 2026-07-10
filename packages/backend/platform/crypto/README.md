# @iam/platform-crypto

Centralized approved cryptographic primitives and secret-safe helpers.

当前处于 M0 边界阶段，尚未实现运行能力，也不包含业务规则。

## 职责

- 集中封装 Argon2id、Token/Secret 哈希、随机数和密钥操作。
- 提供可审计、可测试且不会泄漏敏感值的窄接口。

## 非职责

- 领域模块不得自行选择密码学算法或直接使用低层原语。
- 不在日志、错误或审计中返回 Secret、Seed、Token 或密码。

## 公共边界

跨包只能从 `src/index.ts` 导入。当前入口不导出行为；新增公开 API 时必须同步测试、README 和相关契约。

## 验证

- `corepack pnpm --filter @iam/platform-crypto lint`
- `corepack pnpm --filter @iam/platform-crypto typecheck`
