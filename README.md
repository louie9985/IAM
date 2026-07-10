# IAM 统一身份与访问管理平台

公司级统一身份与访问管理平台。项目目标包括员工身份主档、标准 OAuth 2.1/OIDC 认证、会话与安全策略、应用权限、长期审计、可视化总管理员控制台，以及面向接入应用的 OpenAPI、SDK 和事件能力。

## 当前状态

项目处于设计确认阶段，尚未搭建代码和运行环境。当前受控文档：

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

## 下一阶段

V2.0 立项书和详细设计已经完成讨论。项目负责人审阅并批准
[M0-M4 交付路线图](docs/plans/2026-07-10-iam-delivery-roadmap.md)与
[M0 工程底座实施计划](docs/plans/2026-07-10-m0-foundation-implementation-plan.md)后，
再执行 M0。当前阶段不应提前创建业务代码、数据库迁移或生产配置。

文档导航见 [docs/README.md](docs/README.md)。
