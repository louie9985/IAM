# IAM 统一身份与访问管理平台

公司级统一身份与访问管理平台。项目目标包括员工身份主档、标准 OAuth 2.1/OIDC 认证、会话与安全策略、应用权限、长期审计、可视化总管理员控制台，以及面向接入应用的 OpenAPI、SDK 和事件能力。

## 当前状态

项目已进入 M0 工程底座建设阶段，尚未实现 IAM 业务或可运行服务。当前受控文档：

- [项目立项书 V2.0](项目立项书-V2.0.md)：目标、范围、技术路线、里程碑和验收标准。
- [详细设计规格](docs/specs/2026-07-10-iam-platform-design.md)：运行时、领域模型、认证、权限、策略、审计、目录和质量门禁。
- [Agent 工程宪法](AGENTS.md)：后续所有 Agent 和开发者必须遵守的强制规则。
- [项目立项书 V1.0](项目立项书-V1.0.md)：历史版本，仅用于决策追溯。

## 已确认架构摘要

- React 单一前端，物理位于 `apps/frontend/web`。
- NestJS 模块化单体代码，构建为 `auth/control/worker` 三个后端运行时。
- PostgreSQL 主库、独立 PostgreSQL 审计库、Valkey 和 RabbitMQ。
- 所有客户端统一使用 OAuth 2.1/OIDC；机器身份使用 Client Credentials。
- IAM 仅供总管理员进行全局治理；应用管理员在各自应用中管理本应用权限。
- 用户与角色严格分离；权限通过 RoleAssignment 产生。
- 普通业务请求本地验签与鉴权，权限和会话变化通过事件数秒级失效。
- 规则由有类型、版本化的策略中心管理，可按应用和登录通道覆盖。
- GitHub 构建一次不可变镜像，测试验收后以同一 Digest 晋级生产。

## 本地工具链

- Node.js `24.15.0`
- pnpm `11.11.0`（通过 Corepack 使用）
- TypeScript `6.0.3`
- Turborepo `2.10.4`

首次安装依赖：

```powershell
corepack pnpm install --frozen-lockfile
```

根目录已提供 `format:check`、`lint`、`typecheck`、`test`、`test:integration`、
`test:e2e`、`contracts:check`、`architecture:check` 和 `build` 标准命令。

前端 Web、三个后端 Runtime、七个领域模块、七个平台包、Contracts、四个 SDK 和参考应用
已经登记为独立 Workspace。当前只有 19 个包包含最小公共 `index.ts` 并参与 Lint/Typecheck；
Runtime、Web 和参考应用仍只有清单与职责说明，不包含业务源码或 Mock。

## 下一阶段

V2.0 立项书、详细设计、[M0-M4 交付路线图](docs/plans/2026-07-10-iam-delivery-roadmap.md)
和 [M0 工程底座实施计划](docs/plans/2026-07-10-m0-foundation-implementation-plan.md)
已经批准。M0 Task 0.1–0.3 已完成，下一项是 Task 1.1：把包依赖、深层导入、领域纯度、
表所有权和 Runtime 薄入口规则变成自动架构检查；此时仍不应提前实现 IAM 业务或数据库迁移。

文档导航见 [docs/README.md](docs/README.md)。
