# Backend Agent Rules

本文件适用于 `apps/backend/**` 和后端运行入口，并补充根目录 `AGENTS.md`。

- `*-runtime` 只能包含启动、装配、配置、健康检查和优雅关闭；禁止放置领域实体、业务 Service、Repository 或跨模块查询。
- 领域逻辑位于 `packages/backend/modules/*`，平台适配位于 `packages/backend/platform/*`；Runtime 只能从包根公共入口导入。
- 后端依赖方向保持 `presentation -> application -> domain`，Infrastructure 只能实现 Application Port；Domain 必须是纯 TypeScript。
- 新包依赖、表所有权、事件生产或消费必须同步更新目标模块 `module.yaml` 和 README。
- Auth Runtime 不得获得 Audit DB 凭据；Worker 不得注册公网业务 Controller；Control 不得承担 OIDC 协议状态机。
- 修改前读取目标 Runtime README、相关模块 README/module.yaml 和规格；完成后运行受影响 Workspace 的 Lint、Typecheck、Test 和 Build。
