# @iam/core

Framework-neutral OIDC, JWKS, strict token validation, and generated API client.

当前处于 M0 边界阶段，尚未发布可消费 API。发布配置默认为受限包，具体 Registry 和发布流程在 Release 任务中确定。

## 职责

- OIDC Discovery、Authorization URL、PKCE、Logout 和严格 JWT 验证。
- JWKS 缓存以及由契约生成的类型化 API Client。

## 非职责

- 不依赖 DOM、React、NestJS 或 IAM 内部后端模块。
- 普通业务请求不得借本 SDK 每次同步调用 IAM 做权限裁决。

## 公共边界

跨包只能从 `src/index.ts` 导入。当前入口不导出行为；新增公开 API 时必须同步测试、README 和相关契约。

## 验证

- `corepack pnpm --filter @iam/core lint`
- `corepack pnpm --filter @iam/core typecheck`
