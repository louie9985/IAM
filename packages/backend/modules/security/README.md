# @iam/module-security

Typed security policies, login controls, IP rules, lockouts, and risk evaluation.

当前处于 M0 边界阶段，公共入口尚未导出领域行为，也未创建空的分层目录。实现首个真实用例时再按 `domain/application/infrastructure/presentation` 建立必要目录。

## 职责

- 类型化、版本化策略的解析、发布、继承和账号例外。
- 登录失败计数、临时锁定、IP 名单和风险评估。
- 密码/TOTP 规则和敏感操作安全评估上下文。

## 非职责

- 不可把租户隔离、PKCE、后端鉴权或审计等安全不变量变成关闭开关。
- 不拥有凭据明文、OAuth Client 或 Session 记录。

## 公共边界

跨包只能从 `src/index.ts` 导入。表所有权、允许依赖和事件边界以 `module.yaml` 为准；任何变化必须与代码和测试同一提交更新。

## 验证

- `corepack pnpm --filter @iam/module-security lint`
- `corepack pnpm --filter @iam/module-security typecheck`
