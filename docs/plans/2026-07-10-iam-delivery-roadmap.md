# IAM M0-M4 交付路线图

> 状态：待项目负责人审阅
>
> 日期：2026-07-10
>
> 上游依据：`项目立项书-V2.0.md`、`docs/specs/2026-07-10-iam-platform-design.md`
>
> 资源基线：1 名全栈开发者 + Agent 辅助，无独立测试/运维团队

---

## 1. 路线图目的

本路线图把首版 IAM 管理平台 MVP 拆成 M0–M4 五个可独立验证的阶段。它只定义阶段边界、依赖、交付物和晋级条件；每个阶段开始前另写逐任务实施计划。

执行原则：

- 使用 trunk-based 开发和短生命分支，阶段不是长期分支。
- 每个阶段都必须可部署到测试服务器并形成可演示结果。
- 未通过当前阶段出口标准，不开始依赖它的下一阶段业务功能。
- 红类安全代码、数据库迁移和生产发布始终保留人工批准门禁。
- 不用“后续补测试、后续补文档”换取阶段完成状态。
- 测试服务器验收和生产使用同一镜像 Digest，生产不重新构建。

---

## 2. 总体节奏

| 阶段 | 建议周期 | 主要结果 | 版本建议 |
|---|---:|---|---|
| M0 工程底座 | 3–4 周 | 可重复开发、测试、构建和部署的空业务平台 | `0.1.0` |
| M1 身份认证 | 7–9 周 | 员工身份、OIDC、TOTP、会话和策略闭环 | `0.2.0` |
| M2 应用权限 | 6–8 周 | Application、Manifest、Role、数据范围和即时收权 | `0.3.0` |
| M3 平台闭环 | 5–7 周 | 八中心界面、审计、SDK、事件和参考应用闭环 | `0.4.0` |
| M4 上线验证 | 3–4 周 | CRM 试接入、安全/故障/迁移验证和生产晋级 | `1.0.0` |

总建议周期：24–32 周。周期以一名全职开发者能够持续投入为前提，不包含企业微信实际登录、短信/邮箱、COS 备份、多节点高可用和新增业务系统深度改造。

---

## 3. M0：工程底座

### 3.1 目标

建立后续 Agent 可以安全迭代的工程地基。M0 不交付员工、角色、登录或权限业务，只证明架构、契约、基础设施、测试和发布链路可工作。

### 3.2 范围

- 初始化 Git/GitHub 关联和最小根目录。
- pnpm Workspace + Turborepo + TypeScript + ESLint/Prettier。
- 前后端物理分区、领域包边界和机器可读 `module.yaml`。
- `auth-runtime`、`control-runtime`、`worker-runtime` 三个薄入口。
- React/Vite/Ant Design/ProComponents 单一前端壳。
- Config、Observability、Main/Audit Database、Outbox/RabbitMQ 基础包。
- PostgreSQL Main、PostgreSQL Audit、Valkey、RabbitMQ、Nginx 和基础监控 Compose。
- Zod -> OpenAPI/Event Schema -> SDK Client 的生成链。
- Vitest、Testcontainers、Playwright 和架构边界检查。
- GitHub PR CI、不可变镜像构建、测试部署和生产晋级框架。
- 开发说明、初始 ADR、环境和发布 Runbook。

### 3.3 明确不做

- 不创建 Account、Role、Session 等业务表。
- 不实现真实登录、OIDC 授权码、TOTP 或权限判断。
- 不实现正式审计事件、CRM 导入和策略 UI。
- 不接入 COS，不承诺生产 RPO/RTO。
- 不为了展示效果写临时 Mock 业务页面。

### 3.4 出口标准

- 新机器按 README 可在 30 分钟内启动本地环境。
- 三个 Runtime 和 Web 可独立构建、启动和通过健康检查。
- Main/Audit PostgreSQL、Valkey、RabbitMQ 的 Readiness 可验证。
- Outbox 探针事件可从 Main DB 可靠投递并被测试消费者幂等处理。
- 修改契约后可生成 OpenAPI、事件 Schema 和 SDK；生成漂移会使 CI 失败。
- 前端导入后端包、跨模块深层导入或 Runtime 写领域逻辑会被自动门禁阻止。
- PR 快速门和 Main 集成门全部通过。
- GitHub 只构建一次后端/前端不可变镜像；测试服务器能按 Digest 部署。
- 生产发布工作流存在人工批准和同 Digest 校验，不要求 M0 实际部署生产。

详细任务见 `docs/plans/2026-07-10-m0-foundation-implementation-plan.md`。

---

## 4. M1：身份、认证、会话与基础安全

### 4.1 目标

完成“员工进入统一身份库并安全登录、刷新、退出和管理设备”的端到端闭环，同时建立有类型策略中心。

### 4.2 主要交付

#### 身份与组织

- 默认 Tenant Context。
- Account、Credential、Employee、OrganizationUnit、Position、Employment、UserGroup。
- 一名员工只有一条有效任职的数据库约束。
- 账号状态、调岗历史、离职停用和用户组成员关系。
- CRM 导入批次、差异预检、冲突处理、幂等重试和结果报告。
- 总管理员身份与组织管理页面。

#### Application 基础

- Application、OAuthClient、RedirectUri、ResourceServer。
- Client 类型和 `WEB/MOBILE/DESKTOP/SERVICE` 通道。
- Client Secret 一次显示、哈希存储和基础轮换。

#### 认证与 MFA

- `oidc-provider` Adapter 和交互页面。
- Authorization Code + PKCE。
- RS256、JWKS 和签名密钥轮换基础。
- Argon2id 密码、管理员重置、临时密码和首次改密。
- TOTP、恢复码和总管理员强制 MFA。
- IAM Web 的 HttpOnly 服务端会话。

#### 会话与安全

- Session、Device、Refresh Token Family、轮换和复用检测。
- 登录失败、渐进延迟、临时锁定和 IP CIDR 名单。
- Policy Catalog、版本、继承、影响预览和回滚。
- Web/Mobile/Desktop 分通道并发限制和替换最早会话。
- 在线会话、个人设备、强制下线和基础风险事件页面。

### 4.3 必须通过的红类验证

- PKCE、state、nonce、精确 Redirect URI 和授权码一次性。
- Refresh 并发轮换和复用攻击。
- 未知/退休 `kid`、JWKS 刷新和紧急轮换。
- TOTP 时间步重放、恢复码一次性和管理员强制 MFA。
- 同账号并发登录竞争不能突破通道上限。
- 密码重置、账号停用和强制下线使旧会话失效。
- Policy 安全上下限不能被数据库值绕过。

### 4.4 出口标准

参考应用可使用 Code + PKCE 完成登录；员工可查看和退出设备；总管理员可导入员工、重置密码、配置分通道并发和强制下线。M1 结束时尚不把业务权限模型塞入 Token 或伪造临时角色逻辑。

---

## 5. M2：应用、角色、权限与即时收权

### 5.1 目标

完成“应用通过代码登记权限、总管理员审核、应用管理员在本应用授权、业务 API 本地执行、撤权数秒生效”的闭环。

### 5.2 主要交付

- ServicePrincipal 和 Client Credentials。
- Permission Manifest DSL、Schema、候选提交和 Diff。
- Permission 发布、废弃、停用及影响分析。
- Role、RoleTemplate、RolePermission、RoleAssignment。
- Account/UserGroup/Position 三类分配主体。
- `SELF/ORG_UNIT/ORG_SUBTREE/CUSTOM_ORG_UNITS/ALL` 数据范围。
- SubjectAuthorizationVersion 和授权快照 API。
- Outbox -> RabbitMQ 权限失效事件。
- `@iam/core` 和 `@iam/nestjs` 的本地验签、Guard、缓存和断线恢复。
- 应用级 Management API，校验实际操作人、调用 Client 和目标 Application。
- 参考应用内的权限设置界面，不在 IAM 中给应用管理员增加入口。
- IAM 总管理员的 Manifest 审核、模板、授权追溯和紧急停用页面。

### 5.3 强约束验证

- Account/Employee Schema 无角色字段。
- 权限不能直接授予 Account。
- Role 不能引用其他 Application 的 Permission。
- 应用管理员不能管理其他 Application。
- 岗位和用户组仅通过 RoleAssignment 产生权限。
- 普通参考应用请求在 IAM 下线时仍可用本地 Token/缓存完成授权。
- 角色撤销、离组、调岗和权限停用在数秒内使旧授权版本失效。
- 重复、乱序和丢失事件可幂等处理并通过增量同步恢复。

### 5.4 出口标准

从 Manifest 提交到本地业务 API 鉴权形成完整闭环；应用管理界面可创建自定义角色和分配员工；IAM 不进入普通请求同步路径。

---

## 6. M3：管理平台、审计与开放能力闭环

### 6.1 目标

把 M1/M2 的能力完善为总管理员可持续运营的平台，并完成审计长期留痕、SDK 和事件外供。

### 6.2 主要交付

- 管理端运行概览和七组任务导航的完整页面。
- 审计 Intent、独立 Audit DB 摄取、月分区和查询。
- 审计异步导出、加密文件、Merkle Root 和签名清单。
- 本地归档 Storage Driver 和 COS Driver 接口，不启用 COS。
- 安全策略有效值解释、版本差异和策略模拟器。
- Webhook 签名、时间戳、防重放、重试、DLQ 和人工重放。
- `@iam/react` 和 `@iam/manifest`。
- SDK 版本兼容矩阵、Changesets 和参考应用文档。
- 指标、Grafana Dashboard、告警规则和关键 Runbook。
- 八大中心的 Loading、Empty、Error、Disabled、批量和异步任务状态。

### 6.3 出口标准

- 总管理员可在 IAM 完成身份、安全、权限、应用和审计治理。
- 应用管理员仍只在应用自身界面操作。
- Audit DB、Worker 或 RabbitMQ 故障不阻塞认证主链路，恢复后可补偿。
- 审计导出可验证签名和完整性，且不包含密码/Token/Secret。
- NestJS/React SDK 和 RabbitMQ/Webhook 接入均由参考应用持续验证。

---

## 7. M4：试接入与生产上线

### 7.1 目标

将已完成的平台用于真实 CRM 试接入，通过协议、安全、故障、迁移和运维验证后发布 `1.0.0`。

### 7.2 主要交付

- CRM 账号和组织迁移演练、差异报告和切换 Runbook。
- CRM 登录改为 IAM OIDC，撤除或冻结旧认证入口。
- CRM 应用内角色管理接入 IAM Management API。
- CRM API 使用 NestJS SDK 本地鉴权和数据范围。
- OIDC Conformance、OWASP ZAP、Gitleaks、OSV 和 Trivy 全量结果。
- Valkey、RabbitMQ、Worker、Audit DB 和 Main DB 故障演练记录。
- 数据库迁移、备份/恢复和版本回滚演练。
- 容量基线、限流参数和观察期 Dashboard。
- `0.4.x` 测试镜像按同一 Digest 晋级生产并创建 `1.0.0` Release。

### 7.3 上线门

- 所有立项书验收链路通过。
- 没有未关闭的高危/严重安全问题。
- 红类变更、迁移和生产发布必须保留人工审核记录。
- 生产域名、TLS、密钥、Client 和管理员与测试完全隔离。
- 明确记录单服务器、未启用 COS 和非正式 SLA 的残余风险。
- 具备回滚到上一镜像和恢复数据库的可执行 Runbook。

### 7.4 上线后观察

建议设置 7–14 天观察期，重点监测：登录成功率、P95/P99 延迟、Refresh 失败、锁定异常、权限版本拒绝、Outbox 积压、审计摄取延迟和 CRM 业务错误。观察期只修复阻断与高风险问题，不引入新功能。

---

## 8. 跨阶段工作流

### 8.1 Git 和发布

```text
feature branch -> PR -> CI -> main
-> GHCR image@sha256:digest
-> test deployment -> acceptance
-> GitHub Release -> production approval
-> same image digest -> production
```

生产服务器不从 `main` 现场构建。Release Tag 记录后端、前端镜像 Digest、数据库 Schema 版本和兼容 SDK 范围。

### 8.2 规格和 ADR

以下变更必须先更新规格或新增 ADR：

- 改变三运行时边界或新增独立服务。
- 改变 OIDC Grant、Token 格式、签名算法或会话事实源。
- 允许权限直授用户、角色跨应用或把角色写入 Account。
- 改变策略继承、安全不变量或分通道并发键。
- 改变审计事实生成、事件事实源或权限本地执行原则。
- 引入新数据库、消息系统、状态管理或部署平台。

### 8.3 阶段完成定义

每阶段必须同时具备：

- 已实现的验收行为。
- 单元、集成、契约和 E2E 测试。
- 更新后的 API、事件、策略和权限生成产物。
- 对应管理界面完整状态。
- 架构/产品/Runbook 文档。
- 测试服务器部署和演示记录。
- 已知限制及下一阶段依赖。

---

## 9. 资源和范围控制

单人团队的最大风险不是编码速度，而是并行维护过多未闭环模块。执行时遵循：

- 同一时间只允许一个阶段处于开发状态。
- 每个 PR 尽量在 1–2 天内完成并合并。
- 先完成纵向可运行闭环，再扩展同中心的高级能力。
- 不提前实现首版排除项。
- 不为可能的十万用户规模做分布式改造。
- 不把测试服务器上的临时配置当作生产设计。
- 任何阶段延期优先削减该中心深度，不削减认证安全、后端鉴权、审计事实和自动门禁。

---

## 10. 下一步

批准本路线图及 M0 详细实施计划后，执行 M0 第一个任务：初始化 Git 仓库和 GitHub 关联前置检查。创建 GitHub 远程仓库、配置 GHCR/GitHub Environments 和服务器部署凭据属于外部状态变更，执行前由项目负责人提供仓库地址或明确授权创建。
