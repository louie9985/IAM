# @iam/module-identity

Identity registry for tenants, accounts, employees, organization, positions, employment, groups, and imports.

当前处于 M0 边界阶段，公共入口尚未导出领域行为，也未创建空的分层目录。实现首个真实用例时再按 `domain/application/infrastructure/presentation` 建立必要目录。

## 职责

- Tenant、Account、Employee、OrganizationUnit、Position、Employment 和 UserGroup 的身份事实。
- CRM 导入批次、差异、冲突与外部身份映射。
- 向其他模块公开稳定主体状态和组织快照 Facade。

## 非职责

- 不保存角色、权限或 `is_admin` 等授权捷径。
- 不实现密码校验、OIDC、会话或应用 Client 规则。

## 公共边界

跨包只能从 `src/index.ts` 导入。表所有权、允许依赖和事件边界以 `module.yaml` 为准；任何变化必须与代码和测试同一提交更新。

## 验证

- `corepack pnpm --filter @iam/module-identity lint`
- `corepack pnpm --filter @iam/module-identity typecheck`
