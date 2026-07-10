# @iam/web

IAM 唯一 React Web 应用，后续承载公开认证流程、个人安全中心和仅供总管理员使用的治理控制台。

当前 M0 Task 0.3 仅登记 Workspace 边界，尚未创建源码、路由、页面或 Mock 数据。前端应用壳将在 Task 3.2 实现。

## 边界

- 允许依赖公开 Contracts、Core SDK 和 React SDK。
- 禁止导入后端领域包、Repository、Prisma Schema 或 Runtime 内部实现。
- 应用管理员不进入本控制台；应用级权限管理界面位于各接入应用内部。

## 验证

当前包没有可执行源码。使用 `corepack pnpm --filter @iam/web list --depth 0` 验证 Workspace 清单。
