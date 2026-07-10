# @iam/module-session

Authoritative sessions, devices, refresh token families, and revocation.

当前处于 M0 边界阶段，公共入口尚未导出领域行为，也未创建空的分层目录。实现首个真实用例时再按 `domain/application/infrastructure/presentation` 建立必要目录。

## 职责

- 在线 Session、登录设备和 Web 服务端会话状态。
- Refresh Token Family 轮换、复用检测和吊销。
- 按租户、账号、应用和通道执行并发会话约束。

## 非职责

- 不读取角色或权限表，不计算业务数据范围。
- 不根据 User-Agent 推断登录通道。

## 公共边界

跨包只能从 `src/index.ts` 导入。表所有权、允许依赖和事件边界以 `module.yaml` 为准；任何变化必须与代码和测试同一提交更新。

## 验证

- `corepack pnpm --filter @iam/module-session lint`
- `corepack pnpm --filter @iam/module-session typecheck`
