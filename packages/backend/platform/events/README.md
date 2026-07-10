# @iam/platform-events

Transactional outbox, CloudEvents transport, delivery, retry, and idempotency primitives.

当前处于 M0 边界阶段，尚未实现运行能力，也不包含业务规则。

## 职责

- 提供事务 Outbox Writer、Dispatcher、Publisher Confirm 和消费幂等基础。
- 封装 RabbitMQ 作为传送层，保持 PostgreSQL Outbox 为事实源。

## 非职责

- 不定义领域事件 Payload；事件 Schema 属于 `@iam/contracts`。
- 不把 RabbitMQ 可用性变成主业务事务提交前置条件。

## 公共边界

跨包只能从 `src/index.ts` 导入。当前入口不导出行为；新增公开 API 时必须同步测试、README 和相关契约。

## 验证

- `corepack pnpm --filter @iam/platform-events lint`
- `corepack pnpm --filter @iam/platform-events typecheck`
