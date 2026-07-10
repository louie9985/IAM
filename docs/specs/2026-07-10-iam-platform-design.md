# IAM 统一身份与访问管理平台详细设计规格

> 状态：已完成逐节讨论，待项目负责人审阅文档定稿
>
> 日期：2026-07-10
>
> 上游依据：`项目立项书-V2.0.md`
>
> 适用阶段：M0–M4 首版 IAM 管理平台 MVP

---

## 1. 设计目标

本规格将已确认的产品和技术决策转换为可实施的系统边界。实现必须同时满足：

1. 八大中心均有可操作的 React 界面和最小业务闭环。
2. IAM 控制台只供总管理员使用；应用管理员在各自应用中管理本应用权限。
3. 用户、员工、任职和角色分开建模，用户表不得携带角色字段。
4. Web、移动端、桌面端、第三方和机器身份共用标准 OAuth 2.1/OIDC 内核。
5. 普通业务请求本地验签和鉴权，IAM 不进入所有应用请求的同步关键路径。
6. 权限撤销和会话吊销对内部应用在数秒内生效。
7. 登录、安全和会话规则有类型、可版本化、可继承、可预览和可审计。
8. 认证进程与管理、后台任务隔离，但保持单仓库、单版本、模块化单体。
9. 审计故障不阻塞认证，关键审计事实最终不丢失。
10. 目录、契约、依赖和测试门禁适合一名开发者长期使用 Agent 迭代。

### 1.1 非目标

首版不实现多租户管理、第三方目录同步、短信/邮箱认证、机器学习风控、逐记录策略语言、八中心微服务、Kubernetes、多节点高可用和 COS 实际备份。

---

## 2. 系统上下文

```text
员工浏览器 ────────────────┐
移动/桌面客户端 ───────────┤
第三方 OIDC 应用 ──────────┼──> Nginx ──> auth-runtime
IAM React Web ──────────────┤             control-runtime
应用管理员所在业务系统 ────┘             worker-runtime
                                              │
              ┌───────────────────────────────┼─────────────────────┐
              │                               │                     │
       PostgreSQL Main                PostgreSQL Audit           Valkey
              │                               │                     │
              └──────── Outbox ──> worker ──> RabbitMQ ────────────┘
                                                │
                                      内部应用队列 / 外部 Webhook
```

系统内存在三类管理者和主体：

- **IAM 总管理员**：进入 IAM `/admin`，进行公司级身份与访问治理。
- **应用管理员**：不进入 IAM 控制台，在 CRM/OA 等本应用界面管理应用角色和分配。
- **普通员工**：使用 `/auth` 完成认证，使用 `/account` 管理个人密码、MFA 和设备。
- **Service Principal**：机器身份，不属于员工，不进入 Account/Employee 模型。

---

## 3. 运行时设计

### 3.1 `auth-runtime`

职责：

- OIDC Discovery、Authorize、Token、UserInfo、JWKS、Revocation 和 Logout。
- 登录交互、密码校验、TOTP、授权确认和 Step-up。
- IAM Web 服务端会话 Cookie 的创建与校验。
- Refresh Token 轮换、复用检测和会话吊销。
- 认证相关健康检查、限流和指标。

禁止：

- 权限管理列表、审计检索和报表导出。
- CRM 导入、Manifest 审核等管理用例。
- 后台事件投递和归档任务。

### 3.2 `control-runtime`

职责：

- `/api/v1/admin/**` 全局管理 API。
- `/api/v1/applications/{applicationId}/management/**` 应用级管理 API。
- `/api/v1/runtime/**` 授权快照、版本和必要的 Introspection 辅助 API。
- `/api/v1/open/**` 文档、事件订阅和接入管理 API。
- 审计只读检索和异步导出任务创建。

IAM Web 使用同源 `__Host-iam_session` Cookie。`control-runtime` 通过共享 Session 模块验证服务端会话，不要求浏览器保存 OAuth Token。

### 3.3 `worker-runtime`

职责：

- Main DB Outbox 扫描、认领、投递、重试和死信处理。
- RabbitMQ 消费、Webhook 投递和人工重放。
- Audit Intent 加工和独立审计库写入。
- 在线活动批量落库、导入、导出、归档和完整性校验。
- 权限版本、会话吊销和策略发布事件。

禁止提供面向公网的业务 API，仅暴露内部健康和指标端点。

### 3.4 进程和镜像

三个后端运行时构建同一镜像：

```text
APP_ROLE=auth
APP_ROLE=control
APP_ROLE=worker
```

每个入口拥有独立连接池、并发限制、CPU/内存限制和健康检查。版本必须一致，不支持长期混跑不同版本。

---

## 4. Monorepo 蓝图

```text
project-root/
├─ AGENTS.md
├─ README.md
├─ apps/
│  ├─ frontend/
│  │  ├─ AGENTS.md
│  │  └─ web/
│  └─ backend/
│     ├─ AGENTS.md
│     ├─ auth-runtime/
│     ├─ control-runtime/
│     └─ worker-runtime/
├─ packages/
│  ├─ backend/
│  │  ├─ modules/
│  │  │  ├─ identity/
│  │  │  ├─ authentication/
│  │  │  ├─ session/
│  │  │  ├─ security/
│  │  │  ├─ authorization/
│  │  │  ├─ applications/
│  │  │  └─ audit/
│  │  └─ platform/
│  │     ├─ config/
│  │     ├─ database-main/
│  │     ├─ database-audit/
│  │     ├─ events/
│  │     ├─ crypto/
│  │     ├─ observability/
│  │     └─ testing/
│  ├─ contracts/
│  └─ sdk/
│     ├─ core/
│     ├─ nestjs/
│     ├─ react/
│     └─ manifest/
├─ examples/reference-app/
├─ docs/
├─ ops/
├─ tools/
├─ tests/
└─ .github/
```

根目录只保留 `AGENTS.md`、`README.md` 和工程配置，架构、开发、决策与安全文档进入 `docs` 或 `.github`。

### 4.1 后端模块内部结构

```text
packages/backend/modules/<module>/
├─ src/
│  ├─ domain/
│  ├─ application/
│  ├─ infrastructure/
│  ├─ presentation/
│  └─ index.ts
├─ test/
│  ├─ integration/
│  └─ contract/
├─ module.yaml
├─ README.md
├─ AGENTS.md          # 仅红类/特殊模块
└─ package.json
```

依赖方向：

```text
presentation -> application -> domain
infrastructure -> application/domain
domain -> 纯 TypeScript
```

`domain` 禁止依赖 NestJS、Prisma、HTTP、Valkey 和 RabbitMQ。`index.ts` 是跨包唯一公共入口。

### 4.2 前端模块内部结构

```text
apps/frontend/web/src/
├─ app/
├─ routes/
├─ modules/
│  └─ <domain>/
│     ├─ pages/
│     ├─ components/
│     ├─ queries/
│     ├─ forms/
│     ├─ schemas/
│     ├─ tests/
│     └─ index.ts
├─ ui/
└─ platform/
```

禁止根级 `services`、`hooks`、`pages` 大目录。请求和 Mutation 跟随领域放置，底层统一使用 SDK Client。`ui` 仅放无业务语义组件，不能发请求或判断角色。

### 4.3 机器可读边界

每个模块的 `module.yaml` 至少声明：

```yaml
name: authorization
risk: red
owns_tables:
  - roles
  - role_permissions
  - role_assignments
  - authorization_versions
allowed_dependencies:
  - contracts
  - platform-events
  - identity-public
emits:
  - iam.authorization.subject.changed.v1
consumes:
  - iam.identity.employment.changed.v1
```

CI 检查：

- 包依赖和深层导入。
- 表所有权和 Prisma 跨模块访问。
- Controller 鉴权分类。
- 权限代码与 Manifest 一致性。
- 事件生产、消费和 Schema 一致性。
- 红类包的测试与人工审核要求。

---

## 5. 模块职责与同步依赖

| 模块 | 拥有的职责 | 允许的同步协作 |
|---|---|---|
| Identity | Account、Employee、组织、岗位、任职、用户组和导入映射 | 暴露主体状态和组织快照查询 |
| Authentication | OIDC 交互、凭据认证和认证强度 | 调用 Identity、Security、Applications、Session 公共 Facade |
| Session | Session、设备、Refresh 家族和吊销 | 接收稳定主体/Client ID，不读取权限表 |
| Security | 策略解析、密码/TOTP规则、登录限流、风险和 IP 名单 | 接收类型化评估上下文，不读取其他模块表 |
| Authorization | Permission、Manifest、Role、Assignment、DataScope、授权版本 | 通过 Identity 公共查询验证主体；消费身份事件 |
| Applications | Application、OAuthClient、ResourceServer、Scope、ServicePrincipal | 向 Authentication/Security 提供 Client 策略 |
| Audit | 审计摄取、查询、导出、归档和完整性 | 消费契约事件，不反向调用认证主链路 |

模块间同步调用只允许通过公开 Application Facade。禁止跨模块直接注入 Repository、Prisma Model 或数据库表。

---

## 6. 身份数据模型

### 6.1 核心实体

| 实体 | 关键字段/约束 |
|---|---|
| Tenant | UUIDv7；首版仅隐藏默认租户 |
| Account | tenant_id、username、status、security_version；租户内用户名唯一 |
| Credential | account_id、password_hash、version、temporary_expires_at、changed_at |
| Employee | account_id、employee_no、name、work contacts；Account 1:1 |
| OrganizationUnit | type=COMPANY/DEPARTMENT、parent_id、path/depth、status |
| Position | code、name、status；租户内代码唯一 |
| Employment | employee_id、org_unit_id、position_id、valid_from/to、status |
| UserGroup | code、name、status、version |
| UserGroupMember | group_id、account_id、valid_from/to |
| IdentitySource | type=LOCAL/CRM/CONNECTOR、field ownership policy |
| ExternalIdentityMapping | source_id、external_id、entity_type、internal_id；幂等唯一 |

Account 和 Employee 禁止出现角色字段。首版通过部分唯一索引保证每名 Employee 只有一条有效 Employment。

### 6.2 状态与历史

```text
PENDING -> ACTIVE -> LOCKED / SUSPENDED -> DISABLED
```

- 锁定不等于停用，过期或人工解锁后可恢复。
- 离职使用 `DISABLED`，保留账号和全部历史引用。
- 调岗关闭旧 Employment，并新建有效 Employment。
- 审计保存操作时 Employee、组织、岗位快照，不用当前数据反推过去。

### 6.3 CRM 导入

导入对象：`ImportBatch`、`ImportRow`、`ImportConflict`。

流程：

```text
上传/读取 -> Schema 校验 -> 映射 -> 差异预检
-> 人工确认 -> 分批事务执行 -> 结果报告
```

要求：

- 使用 `(source_system, external_id)` 幂等。
- 同一批次可重试，成功行不得重复创建。
- 展示新增、更新、冲突、跳过和无效数量。
- 外部托管字段和本地字段必须有明确所有权，禁止静默覆盖。
- 切换完成后 IAM 为权威主档，CRM 不再反向覆盖。

---

## 7. 应用和 OAuth Client 模型

| 实体 | 说明 |
|---|---|
| Application | 逻辑业务系统和权限命名空间 |
| OAuthClient | 具体 Web/Mobile/Desktop/Service 客户端 |
| RedirectUri | 精确回调地址，不支持通配符生产配置 |
| ResourceServer | API Audience 和 Scope |
| ServicePrincipal | 机器身份，与员工隔离 |
| ClientSecretVersion | Secret 哈希、创建、过期、轮换和吊销状态 |
| SigningKeyVersion | 当前、下一把、退休和紧急吊销 |

OAuthClient 必须声明：

- `client_type`：PUBLIC 或 CONFIDENTIAL。
- `channel`：WEB、MOBILE、DESKTOP、SERVICE。
- 允许 Grant、Redirect URI、Logout URI、Audience 和 Scope。
- Token/Session 策略覆盖和 MFA/ACR 要求。

Client Secret 只显示一次，数据库仅保存哈希。支持新旧 Secret 的短轮换重叠窗口和紧急吊销。

---

## 8. OIDC、Token 和 Web 会话

### 8.1 协议原则

- 使用 `oidc-provider` 实现标准状态机，禁止自行实现授权码、PKCE 或 Token 端点。
- Provider Adapter 使用 PostgreSQL 持久化协议 Artifact。
- 交互页面使用 IAM React Web；提交回认证运行时完成交互。
- OIDC 标准端点返回标准 OAuth/OIDC 错误，不包装内部响应格式。
- 禁止 Implicit 和 Resource Owner Password Credentials Grant。

### 8.2 IAM Web 服务端会话

浏览器保存：

```text
__Host-iam_session=<opaque random value>
Secure; HttpOnly; SameSite=Lax; Path=/
```

数据库只保存 Cookie Token 哈希和会话状态，Valkey 保存短期查询缓存。`auth-runtime` 和 `control-runtime` 共享 Session 验证组件。CSRF 使用 SameSite、Origin/Referer 校验和每次写操作 CSRF Token 共同防护。

### 8.3 JWT 声明

允许的 Access Token 声明：

```text
iss sub aud exp iat nbf jti
client_id sid tenant_id
auth_time amr acr authz_version
```

禁止放入密码学材料、手机号、部门名称、完整角色列表、菜单和数据范围。

### 8.4 Refresh Token 家族

实体：`RefreshTokenFamily`、`RefreshTokenRecord`。

- Token 明文只在签发时返回，数据库保存带 Pepper 的哈希。
- 每次使用旧 Record 标记为 ROTATED，并创建下一条 Record。
- 已 ROTATED Token 再次使用触发 REUSE_DETECTED。
- 复用攻击吊销家族、Session 和关联设备，并生成高风险事件。
- 管理员强制下线、密码重置、账号停用和重大安全变更吊销相关家族。

---

## 9. 策略配置设计

### 9.1 策略目录

策略定义由 `packages/contracts/src/policies` 维护，示例：

```ts
definePolicy({
  key: 'authentication.failed_attempts.lock_threshold',
  type: 'integer',
  unit: 'attempts',
  defaultValue: 10,
  min: 3,
  max: 50,
  overrideScopes: ['GLOBAL', 'APPLICATION', 'CHANNEL', 'CLIENT'],
  affectsExistingSessions: false,
  requiresStepUpToChange: true,
});
```

生成 `policy-catalog.json` 供控制台表单和文档使用。不能在数据库中创建代码未登记的 Policy Key。

### 9.2 数据模型

| 实体 | 说明 |
|---|---|
| PolicySet | 作用域、目标、状态和当前发布版本 |
| PolicyVersion | 不可变版本、Schema 版本、创建/发布信息 |
| PolicyValue | key、类型化 value、来源和覆盖理由 |
| PolicyException | 账号例外、原因、到期时间 |
| PolicyEvaluationTrace | 仅按需生成的有效值解释，不作为永久业务表 |

### 9.3 解析顺序

```text
代码安全默认值
< GLOBAL
< APPLICATION
< CHANNEL
< CLIENT
< ACCOUNT_EXCEPTION
```

更具体层级覆盖更一般层级，但只能在目录允许的层级覆盖。每次解析返回：

```json
{
  "key": "session.concurrent_limit",
  "value": 1,
  "source_scope": "CHANNEL",
  "source_id": "WEB",
  "policy_version": 18,
  "effective_at": "..."
}
```

发布前必须执行 Schema 校验、安全上下限校验、影响人数计算和现有会话影响预览。

### 9.4 安全不变量

以下规则不进入可关闭策略：租户范围、PKCE、回调精确匹配、密码哈希最低强度、后端鉴权、审计不可删除、Secret 不回显、敏感字段不进日志。

---

## 10. 登录限制与分通道并发

### 10.1 登录失败

计数维度至少包括：账号、IP、Client。计数窗口和阈值由策略决定。

默认行为：

- 前 5 次失败进行渐进延迟。
- 10 次失败后账号临时锁定 30 分钟。
- 用户名不存在与密码错误使用相同外部响应。
- 成功登录按策略清理或衰减失败计数。
- 总管理员和高敏感 Client 可采用更严格规则。

Valkey 用于高频计数，但权威锁定状态和重要风险事件写入 PostgreSQL。Valkey 故障时退化为数据库状态校验和进程内保守限流，不无条件放行。

### 10.2 并发会话键

并发限制键：

```text
(tenant_id, account_id, application_id, channel)
```

默认：

```text
WEB = 1
MOBILE = 1
DESKTOP = 1
SERVICE = 不按用户设备计数
```

登录通道由 OAuth Client 注册信息决定，不根据 User-Agent 推断。

### 10.3 达到上限

默认流程：

1. 凭据和 MFA 校验成功。
2. 在事务/锁保护下查询同键有效设备会话。
3. 达到上限时返回可替换会话的脱敏摘要。
4. 用户确认后吊销最早会话。
5. 创建新会话并写入 Outbox。
6. Worker 发布 `session.revoked`。

策略可改为拒绝新登录、自动替换最早会话或下线同通道全部其他会话。并发检查必须防止两个同时登录都越过上限，使用 PostgreSQL Advisory Lock 或等价的账户通道级互斥实现。

---

## 11. 权限模型

### 11.1 实体

| 实体 | 说明 |
|---|---|
| Permission | Application 内稳定权限代码和风险元数据 |
| PermissionManifest | 候选/已发布不可变版本 |
| ManifestDiff | 新增、修改、废弃和影响分析 |
| Role | Application 内权限集合 |
| RoleTemplate | 全局或应用模板及不可变版本 |
| RolePermission | Role 与 Permission 关系 |
| RoleAssignment | Role 分配给 User、Group 或 Position |
| DataScopeGrant | Role 针对业务资源的数据范围 |
| SubjectAuthorizationVersion | 主体在应用内的单调版本 |

### 11.2 强约束

- Role 必须属于一个 Application。
- RolePermission 只能引用同 Application Permission。
- 权限不能直接分配给 Account。
- RoleAssignment 是产生权限的唯一入口。
- 首版无嵌套 Role、无显式 Deny。
- 系统级停用优先于所有 Allow。
- IAM 治理角色不自动授予业务系统数据权限。

### 11.3 分配主体

RoleAssignment 的主体类型可为：

```text
ACCOUNT
USER_GROUP
POSITION
```

授权计算把有效分配展开为角色集合，再对功能权限和同资源数据范围分别取并集。离组、调岗、角色停用和模板升级都必须触发相关主体版本更新。

### 11.4 Manifest 生命周期

```text
DRAFT_CANDIDATE -> REVIEWING -> PUBLISHED -> SUPERSEDED
                                      └-> 权限项 DEPRECATED -> DISABLED
```

CI 发布凭据只能提交 Candidate，不能 Publish。总管理员审核时必须看到权限、API、UI 元数据和受影响角色/用户数量。

### 11.5 数据范围

规范范围：`SELF`、`ORG_UNIT`、`ORG_SUBTREE`、`CUSTOM_ORG_UNITS`、`ALL`。

授权快照示例：

```json
{
  "subject_id": "...",
  "application_id": "...",
  "version": 42,
  "permissions": ["crm.customer.read"],
  "data_scopes": {
    "crm.customer": [
      { "type": "ORG_SUBTREE", "org_unit_ids": ["..."] }
    ]
  }
}
```

SDK 只返回类型化 AuthorizationContext。业务 Repository 必须显式消费数据范围，SDK 不自动拼业务 SQL。

---

## 12. 数秒级收权和恢复

### 12.1 正常路径

```text
授权事务
  -> SubjectAuthorizationVersion +1
  -> 同事务写 Outbox
  -> Worker 投递 RabbitMQ
  -> 应用 SDK 更新 minimumVersion / 清快照
  -> 旧 authz_version 拒绝
  -> 客户端静默刷新
```

### 12.2 SDK 本地状态

SDK 维护：

- JWKS 缓存和刷新时间。
- `(tenant, application, subject)` 最低有效授权版本。
- `sid` 吊销集合，TTL 不短于 Token 剩余寿命。
- 授权快照缓存。
- 已消费 event_id 去重记录。

普通请求不调用 IAM。遇到未知 `kid` 时刷新 JWKS；刷新失败则拒绝未知密钥 Token，不允许仅解码。

### 12.3 断线恢复

事件包含聚合版本。消费者发现版本跳跃或重启时调用增量端点：

```text
GET /api/v1/runtime/authorization-changes?application_id=...&after_cursor=...
GET /api/v1/runtime/session-revocations?application_id=...&after_cursor=...
```

若增量游标过期，执行应用范围全量版本同步。事件投递至少一次，消费者必须幂等。

---

## 13. 审计设计

### 13.1 生成规则

关键写操作在 Main DB 事务内写 `AuditIntent` 和 Outbox。敏感读取使用同步 Audit Intent 门禁：无法持久化意图时拒绝读取。

Audit Intent 必须使用事件级白名单构造 `before/after`，禁止序列化任意领域对象。

### 13.2 记录字段

至少包括：event_id、event_type/version、occurred_at、ingested_at、tenant、application、client、actor、subject snapshot、action、target、result、reason、IP、User-Agent、auth strength、policy version、authorization version、trace_id、request_id、before/after。

禁止包含密码、Token、Secret、TOTP Seed 和恢复码。

### 13.3 Audit DB

- 独立 PostgreSQL 实例、Volume、连接池和账号。
- 月分区；Writer INSERT-only，Reader SELECT-only。
- `auth-runtime` 无审计库凭据。
- 控制台默认查询最近 24 个月在线数据。
- 大导出使用异步任务，不在 HTTP 请求内生成大文件。

### 13.4 长期归档

每日生成 `jsonl.zst + manifest.json + manifest.sig`。记录标准化后计算 Merkle Root，归档包加密。首期本地驱动只能检测篡改，不能视为异机 WORM。

Storage Port 预留 COS 实现；启用后要求对象 Hash 校验、版本控制、Object Lock、保留策略和恢复演练。

---

## 14. API 和契约

### 14.1 事实源

人工维护：

```text
packages/contracts/src/api
packages/contracts/src/events
packages/contracts/src/policies
packages/contracts/src/permissions
```

自动生成并提交：

```text
packages/contracts/generated/openapi.yaml
packages/contracts/generated/events/*.schema.json
packages/contracts/generated/policy-catalog.json
packages/sdk/core/src/generated/*
```

生成目录禁止手改。CI 重生成后必须无差异。

### 14.2 API 约定

- 管理 API 使用 `/api/v1`。
- OIDC 标准端点不加公司 API 版本前缀。
- 错误使用 RFC 9457 `application/problem+json`。
- 写操作使用 `Idempotency-Key`。
- 并发编辑使用 `ETag/If-Match`。
- `X-Request-ID` 只用于追踪，不兼任幂等键。
- 分页使用稳定 Cursor；管理端简单小集合可使用受控 Page Pagination。

### 14.3 应用级管理授权

应用 BFF 调用 IAM 时必须携带能同时表达以下信息的短时委托凭据：

- 实际操作人 `sub`。
- 调用 `client_id`。
- 目标 `managed_application_id`。
- 允许的 Management Scope。

IAM 对四者同时校验，禁止仅凭 Client Credentials 执行有人操作的角色分配。

---

## 15. React Web 设计

### 15.1 路由

```text
/auth/*       公开协议交互页
/account/*    已认证员工个人安全页
/admin/*      IAM 总管理员页
```

页面路由守卫只负责体验，所有 API 在后端重新鉴权。总管理员权限使用系统 RoleAssignment，不使用硬编码布尔字段。

### 15.2 导航

- 运行概览。
- 身份与组织。
- 访问控制。
- 安全运营。
- 平台接入。
- 开放能力。
- 审计与合规。

### 15.3 状态职责

- 服务端状态：TanStack Query。
- 筛选、分页、详情：URL。
- 当前身份、主题、环境：React Context。
- 表单：Ant Design Form/ProForm；Zod 负责边界 Schema。
- 首版不引入 Redux/Zustand。

### 15.4 关键组件

- 统一 ProTable 列表和详情 Drawer。
- Manifest、模板和策略版本差异查看器。
- 策略继承树、有效值和模拟器。
- 会话/设备列表及替换确认。
- Secret/恢复码一次性展示。
- 异步任务状态和可重试操作。
- 审计只读详情和导出状态。

复杂配置使用独立路由，简单详情使用 Drawer。高风险操作必须展示影响、填写原因并完成 Step-up。

---

## 16. SDK 设计

### 16.1 `@iam/core`

- OIDC Discovery、Authorization URL、PKCE 和 Logout 辅助。
- JWKS 缓存与严格 JWT 验证。
- 生成的类型化 API Client。
- 框架无关，不依赖 DOM 或 NestJS。

### 16.2 `@iam/nestjs`

- `@RequirePermissions`、`@CurrentIdentity`、`@AuthorizationContext`。
- Token Guard、授权版本缓存和会话吊销缓存。
- RabbitMQ 事件消费、增量恢复和幂等。
- 应用本地审计 Outbox 和 IAM 审计投递适配器。

### 16.3 `@iam/react`

- AuthProvider、useIdentity、usePermission、useDataScope。
- PermissionGate 和 RouteGuard。
- 会话过期、授权版本失效和重新认证交互。
- 无样式业务 Hook，不强制接入应用采用 IAM 控制台视觉。

### 16.4 `@iam/manifest`

- Manifest TypeScript DSL 和 JSON Schema 校验。
- 权限常量生成。
- CI Candidate 提交与 Diff 预览。
- 禁止 CI 凭据直接审核发布。

---

## 17. 错误和故障处理

| 故障 | 预期行为 |
|---|---|
| Valkey 不可用 | DB 状态校验 + 进程内保守限流；告警；降低吞吐，不无保护放行 |
| RabbitMQ 不可用 | Outbox 积压；登录和管理事务继续；恢复后补投 |
| Worker 不可用 | 登录继续；事件、在线活动、审计加工和导出延迟 |
| Audit DB 不可用 | Audit Intent 积压；一般写事务继续；敏感读取按策略失败关闭 |
| Main PostgreSQL 不可用 | 登录、Refresh、权限变更和高风险操作失败关闭 |
| IAM 整体不可用 | 业务应用用本地 Token/授权缓存继续普通操作；新认证和敏感操作停止 |
| 应用漏事件 | 聚合版本检测 + 增量同步；游标过期则全量版本同步 |
| 未知 JWT `kid` | 刷新 JWKS；仍未知则拒绝，禁止只解码 |

所有外部错误隐藏内部堆栈，返回稳定 Problem Type、可操作说明和 trace_id。

---

## 18. 安全边界

- 所有请求带 tenant context；Repository 无租户查询构建失败或审查失败。
- 管理端写操作执行 CSRF 防护、后端权限校验和审计。
- Secret、Token、密码、TOTP Seed 进入日志前统一 Redaction。
- 所有密码学参数集中在 Platform Crypto，业务模块禁止自行选择算法。
- 总管理员必须 TOTP，敏感操作 Step-up。
- 提供受控服务器恢复命令，不存在万能密码。
- 恢复命令要求离线恢复材料、强制改密和 TOTP，并写不可删除安全审计。
- 生产环境禁止通配符 Redirect URI、HTTP 回调和调试端点。

---

## 19. 测试设计

### 19.1 红类必测

- Authorization Code 一次性、PKCE、state/nonce 和回调匹配。
- Refresh 轮换、并发刷新和复用攻击。
- RS256/JWKS 正常、轮换、未知 kid 和退休密钥。
- 密码锁定、TOTP 重放、恢复码一次性。
- 用户和角色分离、跨应用角色拒绝、权限不能直授用户。
- 策略继承、安全上下限、账号例外到期和版本回滚。
- Web/Mobile 分别计数、并发登录竞争和会话替换。
- 权限事件重复、乱序、丢失、断线恢复和数秒收权。
- 租户范围、审计完整性和敏感字段 Redaction。

### 19.2 系统 E2E

1. CRM 导入 -> 员工激活 -> 登录 -> TOTP -> 访问参考应用。
2. Web=1、Mobile=1 -> 同时登录 -> 第二个 Web 替换最早 Web。
3. Manifest Candidate -> IAM 审核 -> 应用创建角色 -> 分配 -> 本地鉴权。
4. 撤销角色 -> RabbitMQ 事件 -> 参考应用数秒内拒绝旧版本。
5. 强制下线 -> Refresh 家族吊销 -> SDK 拒绝旧 sid。
6. 安全策略发布 -> 有效值预览 -> 登录行为变化 -> 审计查询。
7. RabbitMQ/Audit DB/Worker 故障 -> 主链路行为符合故障矩阵 -> 恢复补偿。
8. 测试镜像 -> Release -> 同摘要生产部署和回滚。

### 19.3 门禁

PR 执行格式、Lint、Boundary、类型、单元、契约漂移和秘密扫描。Main 执行 Testcontainers、Compose E2E、Playwright 和镜像扫描。Release 执行 OIDC Conformance、ZAP、故障演练、迁移预检和恢复验证。

---

## 20. 环境与发布

### 20.1 环境隔离

本地、测试、生产分别使用独立数据库、密钥、域名、Client 和管理员。环境变量模板进入 Git，真实值不得提交。

### 20.2 镜像晋级

```text
GitHub Commit SHA
-> 一次构建并推送 GHCR
-> 测试服务器按 Digest 部署
-> 验收和 Release Tag
-> 生产服务器部署相同 Digest
```

禁止生产服务器 `git pull main` 后现场构建。数据库迁移作为独立、人工批准步骤运行，应用发布失败可回滚镜像，破坏性迁移必须通过 Expand–Migrate–Contract 避免阻塞回滚。

### 20.3 单服务器事实

测试和生产各一台腾讯云服务器。Compose 自动重启、健康检查和三运行时隔离不能消除整机单点。COS 驱动只预留，首期不实施，因此 RTO≤2 小时、RPO≤5 分钟和 99.9% 仅为增强目标，不作为首期严格 SLA。

---

## 21. 文档与 Agent 工作方式

### 21.1 指令层级

```text
/AGENTS.md
-> /apps/frontend/AGENTS.md 或 /apps/backend/AGENTS.md
-> 红类 module/AGENTS.md
```

局部规则只补充、不复制全局规则。Agent 开始任务前必须读取根规则、所属技术端规则、模块 README/module.yaml 和任务相关规格。

### 21.2 任务模板

每项 Agent 任务必须明确：

- 事实源和当前行为。
- 范围内、范围外和允许修改路径。
- 验收条件和失败场景。
- 风险等级和威胁点。
- API、事件、策略、权限和迁移影响。
- 必须运行的测试。
- 部署和回滚影响。

### 21.3 完成定义

实现、测试、契约、文档和生成产物在同一变更中同步。红类代码和迁移必须保留人工审核记录。不得留下未登记 Mock、TODO、禁用测试或未解释的架构绕行。

---

## 22. 实施顺序

### M0 工程底座

Monorepo、目录边界、三 Runtime、React 壳、Compose、配置校验、日志指标、Contracts 生成、CI、测试服务器镜像部署。

### M1 身份认证

Tenant 默认上下文、Identity、CRM 导入、Applications 基础、OIDC、密码/TOTP、Session、策略目录、分通道并发和个人安全页面。

### M2 应用权限

Manifest、Permission、Role/Template/Assignment、数据范围、授权版本、事件、NestJS SDK、React SDK 和机器身份。

### M3 平台闭环

八大中心管理页面、独立 Audit DB、导出、完整性、归档驱动、Webhook、参考应用和运维监控。

### M4 上线验证

CRM 试接入、完整 E2E、OIDC Conformance、安全扫描、故障演练、迁移演练、Runbook、Release 和同镜像生产晋级。

---

## 23. 设计验收检查表

- [ ] 用户、员工、任职、用户组和角色边界在 Schema 与 CI 中落实。
- [ ] Web/Mobile/Desktop 通道来自 Client 配置，分通道并发可配置。
- [ ] 所有策略 Key 有类型、范围、覆盖层级和安全边界。
- [ ] 普通业务请求不依赖 IAM 在线调用。
- [ ] 内部应用权限/会话撤销满足数秒级事件路径及断线恢复。
- [ ] RabbitMQ、Worker、Audit DB 故障不阻塞认证主链路。
- [ ] IAM Web 不把 Token 存入浏览器可读存储。
- [ ] OIDC、API、事件和策略契约各有唯一事实源。
- [ ] 前后端物理分区，Runtime 薄，领域包有机器可读边界。
- [ ] 生产使用测试通过的同一镜像 Digest。
- [ ] 单服务器与未启用 COS 的限制在验收和运维文档中如实披露。
