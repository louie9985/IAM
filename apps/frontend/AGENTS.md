# Frontend Agent Rules

本文件适用于 `apps/frontend/**`，并补充根目录 `AGENTS.md`。

- 前端只能依赖 `@iam/contracts`、`@iam/core` 和 `@iam/react` 等公开契约或 SDK，禁止导入 `packages/backend/**`。
- 页面、组件、查询、Mutation、表单、Schema 和测试按业务领域纵向组织；禁止创建根级业务 `services/`、`hooks/` 或 `pages/` 大目录。
- TanStack Query 管理服务端状态，筛选、分页和详情状态进入 URL；React Context 仅保存身份、主题和环境信息。
- `ui/` 只放无业务语义组件，不请求 API、不判断角色；权限体验使用权限代码和 SDK Hook，后端鉴权仍是安全边界。
- 浏览器不得把 Access Token、Refresh Token、Secret、恢复码或 TOTP Seed 写入可读存储、日志、错误报告或测试快照。
- 修改前读取目标应用 README 和相关产品规格；完成后至少运行该 Workspace 的 Lint、Typecheck、Test 和 Build。
