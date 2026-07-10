# @iam/platform-observability

Structured logging, tracing, metrics, health, and sensitive-field redaction.

当前处于 M0 边界阶段，尚未实现运行能力，也不包含业务规则。

## 职责

- 统一 Pino 日志、Trace/Request ID、Prometheus 指标和健康契约。
- 集中执行 password、token、secret、authorization 和 cookie 字段脱敏。

## 非职责

- 指标标签不包含账号、IP 等高基数或敏感值。
- Liveness 不访问下游，Readiness 只报告当前 Runtime 的真实依赖。

## 公共边界

跨包只能从 `src/index.ts` 导入。当前入口不导出行为；新增公开 API 时必须同步测试、README 和相关契约。

## 验证

- `corepack pnpm --filter @iam/platform-observability lint`
- `corepack pnpm --filter @iam/platform-observability typecheck`
