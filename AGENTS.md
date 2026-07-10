# AGENTS.md - IAM 项目工程宪法

> 本文件是所有 Agent 和开发者进入仓库后的强制入口。
> 项目当前上游依据为 `项目立项书-V2.0.md` 和
> `docs/specs/2026-07-10-iam-platform-design.md`。
> 若代码、任务描述与已审批文档冲突，先停止实现并提交 ADR/规格变更，不得自行改写架构。

## 1. 开始任务前

1. 阅读本文件、任务相关规格、目标模块 `README.md` 和 `module.yaml`。
2. 若路径下存在更具体的 `AGENTS.md`，继续读取；局部规则只能补充本文件。
3. 明确允许修改路径、验收条件、风险等级、契约影响、测试和回滚方式。
4. 先检查工作区现有改动。未经用户明确要求，不覆盖、回滚或整理他人改动。
5. 一个任务只处理一个可验证的领域行为；跨模块边界变更必须先更新规格或 ADR。

## 2. 最高优先级不变量

### 身份与权限

- Account、Employee、Employment、UserGroup 和 Role 必须分开建模。
- Account/Employee 禁止增加 `role`、`role_code`、`is_admin` 等角色字段。
- 部门、岗位、用户组不是角色；只有显式 RoleAssignment 产生权限。
- 权限不得直接授予用户。角色必须属于一个 Application，禁止跨应用混装权限。
- IAM 总管理员也通过受保护的系统 RoleAssignment 授权，不使用隐藏布尔开关。
- 前端隐藏、置灰或路由守卫不能替代后端 API 鉴权。
- Token 不携带完整角色、菜单或数据范围，只携带稳定主体和授权版本。
- 普通业务请求本地验签和鉴权，不得改为每次同步调用 IAM。

### 认证与安全

- OAuth/OIDC 状态机使用 `oidc-provider`，禁止自行实现授权码、PKCE 或 Token 协议。
- 禁止 Implicit Grant 和 Resource Owner Password Credentials Grant。
- 生产 Token 使用 RS256 和 JWKS；禁止回退到共享 HS256 密钥。
- 密码使用集中封装的 Argon2id；业务模块禁止自行选择密码学算法。
- Refresh Token 只存哈希并强制轮换；复用触发整个 Token Family 吊销。
- Secret、密码、Token、TOTP Seed 和恢复码不得进入日志、审计或提示词。
- 未知 JWT `kid` 必须刷新 JWKS 后拒绝未知密钥，禁止只解码不验签。
- 高风险管理操作必须后端鉴权、Step-up、填写原因并记录审计。

### 策略与会话

- 运行规则使用 `packages/contracts/src/policies` 登记的有类型 Policy Key。
- 禁止在数据库中创建未登记 Key，禁止使用无约束 EAV/JSON 绕过 Schema。
- 已发布策略不可原地修改；变更和回滚都发布新版本。
- 租户隔离、PKCE、审计不可删除、后端鉴权等安全不变量不得做成关闭开关。
- 登录通道来自 OAuth Client 的 `WEB/MOBILE/DESKTOP/SERVICE` 配置，不根据 User-Agent 推断。
- 并发会话按 `(tenant, account, application, channel)` 分别计算。

### 数据、租户与审计

- 所有领域实体和查询必须带 `tenant_id`；禁止无租户 Repository 查询。
- 每张表只有一个领域所有者；禁止跨模块直接访问对方 Repository 或表。
- 关键变更、Audit Intent 和 Outbox 必须在同一主库事务内写入。
- 历史依赖操作时快照和版本，禁止用当前组织、角色或策略反推过去。
- 审计记录只增不改；密码、Token、Secret、TOTP Seed 和恢复码永不入审计。
- RabbitMQ 是传送层，不是事实源；关键事件以 PostgreSQL Outbox 为事实源。

## 3. 目录与依赖

```text
apps/frontend/*                 前端应用
apps/backend/*-runtime          薄运行入口，只做装配
packages/backend/modules/*      领域模块
packages/backend/platform/*     无业务规则的平台能力
packages/contracts              API、事件、策略和权限契约
packages/sdk/*                  对外 SDK
```

- 前端只能依赖 Contracts、SDK Core 和 React SDK，禁止导入 `packages/backend/**`。
- Runtime 只允许入口、装配、配置和健康检查，禁止直接放领域业务逻辑。
- 后端依赖方向为 `presentation -> application -> domain`；Infrastructure 实现 Application Port。
- Domain 必须是纯 TypeScript，禁止依赖 NestJS、Prisma、HTTP、Valkey 或 RabbitMQ。
- 跨包只能从目标包根 `index.ts` 导入，禁止深层导入。
- 禁止建立承载业务逻辑的全局 `common/`、`utils/`、`helpers/` 或 `services/` 大杂烩。
- 新跨模块依赖、表所有权或事件必须先更新 `module.yaml`、架构文档和相应测试。

## 4. 前端规则

- 页面、组件、Query、Mutation、表单和测试按领域纵向放置。
- 服务端状态使用 TanStack Query；筛选、分页和详情状态进入 URL。
- React Context 只保存当前身份、主题和环境信息；未经 ADR 不引入 Redux/Zustand。
- UI 组件禁止拼接 API URL，统一调用生成 Client 或领域 Query/Mutation。
- 禁止硬编码 `user.role === ...`；使用权限 Hook 和后端权限代码。
- `ui/` 只能包含无业务语义组件，不能请求 API 或执行权限判断。
- Secret、恢复码只显示一次；审计界面不提供编辑和删除入口。
- 列表、详情、差异、异步任务、Loading、Empty、Error 和 Disabled 状态必须完整。

## 5. API、事件与生成代码

- 人工事实源位于 `packages/contracts/src/{api,events,policies,permissions}`。
- OpenAPI、事件 JSON Schema、策略目录和 SDK Client 均为生成产物，禁止手改。
- 修改契约后必须重新生成；CI 要求重新生成后工作区无差异。
- OIDC 标准端点使用标准错误；管理 API 使用 RFC 9457 Problem Details。
- 写操作使用 `Idempotency-Key`；并发编辑使用 `ETag/If-Match`；`X-Request-ID` 只追踪。
- 事件采用 CloudEvents 1.0、至少一次投递、`event_id` 幂等和聚合版本恢复。
- 权限代码必须存在于已登记 Manifest；废弃权限不得被新代码引用。

## 6. 数据库迁移

- Prisma Migration 可由 Agent 辅助生成，但迁移 SQL 必须人工审查。
- 审查必须覆盖锁表、索引、回填、兼容期、备份条件和回滚路径。
- 采用 Expand-Migrate-Contract；禁止在同一发布中直接删除仍被上一版本使用的结构。
- Agent 不得自动执行生产迁移，不得自动批准迁移 PR。
- 数据修复脚本必须幂等、可试运行、可审计，并先在测试服务器验证。

## 7. 测试与风险分级

### 红类

OIDC/Token、密码/MFA、租户隔离、授权解析、策略继承、会话吊销、密码学、审计完整性和迁移。

- 先写验收条件和失败测试。
- 核心分支覆盖率不低于 90%。
- 必须包含集成或协议测试，并由人工逐行审核。

### 黄类

管理 API、CRM 导入、事件消费者、SDK 和策略 UI。

- 必须有集成测试和契约评审。

### 绿类

展示组件、只读页面、文档和生成代码。

- 通过格式、类型、单元和构建门禁后进行常规走查。

禁止提交 `.only`、跳过的关键测试、无工单长期 Mock 或用降低断言强度掩盖失败。

## 8. GitHub、环境与发布

- 本地通过分支和 PR 提交 GitHub；测试、生产禁止直接追随浮动 `main`。
- GitHub 按 Commit SHA 构建一次不可变 GHCR 镜像。
- 测试验收后创建 Release，生产部署同一镜像 Digest，禁止生产现场重新构建。
- 真实 `.env`、密钥和员工数据不进入 Git；只提交模板和虚构测试数据。
- 测试与生产使用不同数据库、密钥、域名、Client 和管理员。
- 当前生产为单服务器且 COS 未启用；禁止声称已具备节点高可用或严格 RPO/RTO。

## 9. 完成定义与汇报

任务完成前必须：

1. 实现与验收条件对应的行为，不扩大范围。
2. 同步更新测试、契约、生成产物、文档和 `module.yaml`。
3. 运行受影响包的 format、lint、typecheck、unit、integration/contract 和 build。
4. 检查工作区，确认没有覆盖用户改动、真实秘密、临时文件或未解释 TODO。
5. 红类代码、迁移和生产发布保持人工批准门禁。

最终汇报包含：完成的行为、关键文件、验证命令及结果、未执行的验证及原因、已知限制和后续必要动作。不得用“应该可用”代替实际验证结果。
