# @iam/module-authentication

OIDC interactions, credentials, authentication strength, MFA, and administrator password reset.

当前处于 M0 边界阶段，公共入口尚未导出领域行为，也未创建空的分层目录。实现首个真实用例时再按 `domain/application/infrastructure/presentation` 建立必要目录。

## 职责

- OIDC 交互编排、凭据认证、认证强度和 Step-up。
- 密码、TOTP、恢复码、管理员重置和一次性临时密码的领域规则。
- 通过公开 Facade 协作 Identity、Security、Applications 和 Session。

## 非职责

- 不自行实现 OAuth/OIDC 状态机，协议状态必须由 `oidc-provider` 驱动。
- 不拥有账号组织、会话、角色权限或应用注册表。
- 首版不实现短信、邮箱验证码或自助找回密码。

## 公共边界

跨包只能从 `src/index.ts` 导入。表所有权、允许依赖和事件边界以 `module.yaml` 为准；任何变化必须与代码和测试同一提交更新。

## 验证

- `corepack pnpm --filter @iam/module-authentication lint`
- `corepack pnpm --filter @iam/module-authentication typecheck`
