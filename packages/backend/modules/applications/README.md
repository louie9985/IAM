# @iam/module-applications

Applications, OAuth clients, resource servers, scopes, secrets, and service principals.

当前处于 M0 边界阶段，公共入口尚未导出领域行为，也未创建空的分层目录。实现首个真实用例时再按 `domain/application/infrastructure/presentation` 建立必要目录。

## 职责

- Application、OAuthClient、ResourceServer、Scope 和 ServicePrincipal 注册表。
- 回调、登出地址、Grant、Audience、通道和 Client 策略。
- Client Secret 的哈希保存、轮换重叠窗口和紧急吊销。

## 非职责

- 不实现 OIDC 授权流程或用户认证。
- 不管理应用内角色分配，也不访问接入应用业务数据。

## 公共边界

跨包只能从 `src/index.ts` 导入。表所有权、允许依赖和事件边界以 `module.yaml` 为准；任何变化必须与代码和测试同一提交更新。

## 验证

- `corepack pnpm --filter @iam/module-applications lint`
- `corepack pnpm --filter @iam/module-applications typecheck`
