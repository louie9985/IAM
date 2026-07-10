# @iam/platform-config

Fail-fast typed runtime configuration and redacted startup summaries.

当前处于 M0 边界阶段，尚未实现运行能力，也不包含业务规则。

## 职责

- 解析并校验 Common、Auth、Control、Worker 和 Web Build 环境配置。
- 输出脱敏后的有效配置摘要，阻止环境串用和危险生产开关。

## 非职责

- 登录失败阈值、并发设备数等业务规则不进入环境变量。
- 不持有领域状态，也不向日志回显 Secret 原值。

## 公共边界

跨包只能从 `src/index.ts` 导入。当前入口不导出行为；新增公开 API 时必须同步测试、README 和相关契约。

## 验证

- `corepack pnpm --filter @iam/platform-config lint`
- `corepack pnpm --filter @iam/platform-config typecheck`
