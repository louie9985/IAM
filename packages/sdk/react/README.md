# @iam/react

Unstyled React identity, permission, data-scope, and route-guard primitives.

当前处于 M0 边界阶段，尚未发布可消费 API。发布配置默认为受限包，具体 Registry 和发布流程在 Release 任务中确定。

## 职责

- 提供 AuthProvider、身份/权限/DataScope Hook、PermissionGate 和 RouteGuard。
- 处理会话过期、授权版本失效和重新认证交互边界。

## 非职责

- 不强制接入应用采用 IAM 控制台视觉。
- 前端隐藏或置灰不能替代接入应用后端 API 鉴权。

## 公共边界

跨包只能从 `src/index.ts` 导入。当前入口不导出行为；新增公开 API 时必须同步测试、README 和相关契约。

## 验证

- `corepack pnpm --filter @iam/react lint`
- `corepack pnpm --filter @iam/react typecheck`
