# @iam/nestjs

NestJS guards, decorators, authorization caches, event recovery, and audit adapters.

当前处于 M0 边界阶段，尚未发布可消费 API。发布配置默认为受限包，具体 Registry 和发布流程在 Release 任务中确定。

## 职责

- 提供权限 Decorator、Identity/Authorization Context 和 Token Guard。
- 维护授权版本、Session 吊销缓存、事件幂等和断线增量恢复。

## 非职责

- 不连接 IAM 数据库，不导入内部领域模块。
- 不自动拼接接入应用的业务 SQL 或替代其 Repository 鉴权。

## 公共边界

跨包只能从 `src/index.ts` 导入。当前入口不导出行为；新增公开 API 时必须同步测试、README 和相关契约。

## 验证

- `corepack pnpm --filter @iam/nestjs lint`
- `corepack pnpm --filter @iam/nestjs typecheck`
