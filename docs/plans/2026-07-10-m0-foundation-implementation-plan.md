# IAM M0 工程底座实施计划

> 状态：已批准，执行中（Task 0.1–0.3 已完成）
>
> 日期：2026-07-10
>
> 目标版本：`0.1.0`
>
> 上游依据：`项目立项书-V2.0.md`、`docs/specs/2026-07-10-iam-platform-design.md`、`docs/plans/2026-07-10-iam-delivery-roadmap.md`

---

## 1. M0 目标

M0 只建设可重复、可验证、可发布的工程底座，不实现 IAM 业务。完成后应具备：

- 前后端物理分区的 pnpm/Turborepo Monorepo。
- 三个薄后端 Runtime 和一个 React Web。
- Main/Audit PostgreSQL、Valkey、RabbitMQ、Nginx 的本地 Compose。
- Config、日志、指标、健康检查、Main DB Outbox 和事件探针。
- Zod/Controller -> OpenAPI -> SDK 的确定性生成链。
- 架构边界、单元、集成、E2E、安全扫描和构建门禁。
- GitHub 构建不可变镜像、测试服务器部署和同 Digest 晋级框架。
- 足够的 README、ADR 和 Runbook，使新 Agent 不依赖聊天记录工作。

M0 完成不代表可以登录，也不允许用 Mock 假装完成账号、角色、会话或权限功能。

---

## 2. 执行前置条件

### 2.1 本地可直接开始

- Windows 开发机可使用 Node 24、Corepack/pnpm、Git 和 Docker Desktop。
- `D:\IAM` 当前不是 Git 仓库，现有文档必须作为初始历史保留。
- 版本初始化时重新执行一次 npm Peer Dependency、Node Engine 和镜像 Tag 兼容检查。

### 2.2 外部配置任务开始前需要项目负责人提供

- GitHub 仓库 URL，或明确授权创建仓库及仓库可见性。
- GHCR 包权限与 GitHub Actions 权限设置。
- 测试服务器域名/IP、SSH 用户、公钥部署方式和目标目录。
- 测试环境域名与 TLS 方案。
- GitHub Environment `test`/`production` 的审批人和 Secrets。
- 生产部署工作流可先搭框架；M0 不要求实际登录生产服务器。

真实值不得写入计划、Issue、日志或 Git。仓库只保存变量名和配置模板。

---

## 3. 标准任务循环

每个任务按以下顺序执行：

1. 读取根/局部 `AGENTS.md`、相关规格和目标模块边界。
2. 先添加能失败的测试或架构检查；纯配置任务先写可执行验证脚本。
3. 实现满足当前任务的最小代码，不提前做后续业务。
4. 运行任务级验证，再运行受影响包的 Lint、Typecheck、Test 和 Build。
5. 检查生成漂移、未跟踪文件、Secret、TODO 和用户已有改动。
6. 使用建议提交边界提交；若任务尚未闭环，不制造“半通过”提交。

所有命令最终从根 `package.json` 暴露。文档可以说明用途，但不得复制形成第二套命令事实源。

---

## 4. Wave 0：仓库与工具链

### Task 0.1：初始化 Git 历史并保存已批准设计

**目的**：让现有设计文档成为可追溯的项目起点。

**M0 将修改/创建**：

- `.gitattributes`
- 扩充 `.gitignore`
- 初始化 `.git/`
- 配置远程 `origin`（有仓库 URL 时）

**步骤**：

1. 确认 `D:\IAM` 内现有文件清单和摘要，不移动或改写 V1.0。
2. `git init -b main`。
3. `.gitattributes` 固定文本 LF、Markdown UTF-8 约定和二进制类型。
4. `.gitignore` 增加 Node、构建、测试、环境、IDE、Compose Volume 和本地 Brainstorm 产物。
5. 运行 Secret 扫描，确认文档不含真实凭据。
6. 创建初始文档提交；取得 URL 后添加 `origin` 并 Push。

**验证**：

```text
git status --short
git diff --check
gitleaks detect --no-git
```

期望：提交后工作区干净；V1/V2、设计、计划和 AGENTS 均在历史中。

**建议提交**：`docs: establish IAM platform design baseline`

---

### Task 0.2：锁定 Node、pnpm 和根 Workspace

**目的**：所有机器和 CI 使用同一工具链及根命令。

**修改/创建**：

- `.node-version`
- `.npmrc`
- `.editorconfig`
- `package.json`
- `pnpm-workspace.yaml`
- `pnpm-lock.yaml`
- `turbo.json`
- `tsconfig.base.json`
- `prettier.config.mjs`
- `eslint.config.mjs`

**步骤**：

1. 复核并精确锁定 Node 24 LTS、pnpm、TypeScript、Turbo、ESLint 和 Prettier 版本。
2. `.npmrc` 开启 `save-exact=true`、严格 Peer Dependency 和锁文件一致性。
3. 根 `package.json` 只负责全仓命令，不放运行依赖。
4. 建立标准脚本：`format:check`、`lint`、`typecheck`、`test`、`test:integration`、`test:e2e`、`contracts:check`、`architecture:check`、`build`。
5. Turbo 声明输入、输出、缓存与 Persistent Dev Task。
6. TypeScript 开启严格模式、`noUncheckedIndexedAccess` 和一致大小写检查。

**验证**：

```text
corepack pnpm --version
pnpm install --frozen-lockfile
pnpm format:check
pnpm typecheck
```

期望：空 Workspace 命令可重复运行，第二次 Install 不改变 Lockfile。

**建议提交**：`chore(repo): pin workspace toolchain`

---

### Task 0.3：创建前后端 Workspace 和所有权元数据

**目的**：先建立物理边界，再添加代码。

**修改/创建**：

```text
apps/frontend/AGENTS.md
apps/frontend/web/package.json
apps/backend/AGENTS.md
apps/backend/{auth,control,worker}-runtime/package.json
packages/backend/modules/{identity,authentication,session,security,authorization,applications,audit}/
packages/backend/platform/{config,database-main,database-audit,events,crypto,observability,testing}/
packages/contracts/
packages/sdk/{core,nestjs,react,manifest}/
examples/reference-app/
```

**步骤**：

1. 为每个 Workspace 分配稳定包名和 `private/publishConfig`。
2. 领域包只创建真实的 `package.json`、`src/index.ts`、`module.yaml` 和职责 README；不创建空的层级目录。
3. Runtime 先只建立 Manifest，不添加业务模块。
4. Contracts 与 SDK 明确 Publishable/Private 边界。
5. 前端和后端局部 `AGENTS.md` 只补充根规则，不复制全文。
6. 建立包命名规范：内部领域包使用 `@iam/module-*`，内部平台包使用
   `@iam/platform-*`；公开 SDK 沿用立项书和详细设计确定的 `@iam/core`、
   `@iam/nestjs`、`@iam/react`、`@iam/manifest`。

**验证**：

```text
pnpm list -r --depth -1
pnpm typecheck
```

期望：Workspace 全部被识别，包名唯一，无循环依赖。

**建议提交**：`chore(repo): establish frontend backend workspace boundaries`

---

## 5. Wave 1：自动边界与公共平台

### Task 1.1：实现机器可读架构检查

**目的**：让 Agent 越界在本地和 CI 直接失败。

**修改/创建**：

- `tools/architecture-checks/`
- 各领域 `module.yaml`
- `eslint.config.mjs`
- 根 `package.json` 的 `architecture:check`

**先写失败用例**：

- 前端 Fixture 导入 `packages/backend/**` 应失败。
- Runtime Fixture 出现 `domain/` 或业务 Service 应失败。
- Module A 深层导入 Module B 内部文件应失败。
- Domain 导入 NestJS/Prisma/amqplib 应失败。
- 两个模块声明拥有同一张表应失败。
- 未在 `allowed_dependencies` 中的包依赖应失败。

**实现**：

1. 解析 Workspace Package、源码 Import 和 `module.yaml`。
2. 检查允许依赖、表所有权、唯一公共入口和禁止层依赖。
3. 使用 ESLint Restricted Import 提供编辑期错误，架构脚本做全仓最终检查。
4. 错误输出包含源文件、违规规则和修复方向。

**验证**：

```text
pnpm --filter @iam/architecture-checks test
pnpm architecture:check
pnpm lint
```

期望：违规 Fixture 全部按预期失败，真实源码通过。

**建议提交**：`feat(tooling): enforce module ownership boundaries`

---

### Task 1.2：实现类型化环境配置

**目的**：所有 Runtime 启动前校验配置，避免运行中才发现缺失或环境串用。

**修改/创建**：

- `packages/backend/platform/config/`
- `.env.example`
- `ops/env/local.env.example`
- `ops/env/test.env.example`
- `ops/env/prod.env.example`

**先写测试**：

- 缺少数据库 URL 时启动配置解析失败。
- 测试/生产 Issuer、Cookie Secure、调试开关不合法时失败。
- Auth、Control、Worker 只接收各自需要的配置。
- Secret 值的错误信息不得回显原值。

**实现**：

- Common、Auth、Control、Worker、Web Build Config 分 Schema。
- 环境变量使用明确单位后缀，例如 `_SECONDS`、`_BYTES`。
- 环境配置只存部署值；登录阈值等业务规则不进入 `.env`，留给 Policy Center。
- 输出经过 Redact 的有效配置摘要供启动日志使用。

**验证**：

```text
pnpm --filter @iam/platform-config test
pnpm --filter @iam/platform-config typecheck
```

**建议提交**：`feat(platform): add fail-fast runtime configuration`

---

### Task 1.3：建立日志、Trace、指标和健康契约

**目的**：从第一天统一诊断信息，不让每个 Runtime 自行打印日志。

**修改/创建**：

- `packages/backend/platform/observability/`
- `packages/contracts/src/api/platform-health.ts`
- `packages/contracts/src/observability/`

**先写测试**：

- 传入/生成 `X-Request-ID` 并返回。
- 日志包含 runtime、version、trace_id/request_id。
- password/token/secret/authorization/cookie 字段被 Redact。
- Liveness 不访问下游；Readiness 返回每项依赖状态。
- Prometheus 指标标签不包含 account_id、IP 等高基数或敏感值。

**实现**：

- Pino 结构化日志和 Nest Interceptor/Middleware。
- `/health/live`、`/health/ready`、内部 `/metrics` 的公共 Contract。
- 标准 Error -> Problem Details 映射基础，业务错误留后续模块定义。

**验证**：

```text
pnpm --filter @iam/platform-observability test
pnpm --filter @iam/contracts test
```

**建议提交**：`feat(platform): standardize observability and health contracts`

---

## 6. Wave 2：契约、数据库和事件

### Task 2.1：打通契约生成链

**目的**：验证 Schema、Controller Metadata、OpenAPI 和 SDK 类型不会漂移。

**修改/创建**：

- `packages/contracts/src/api/`
- `packages/contracts/src/events/`
- `packages/contracts/generated/`
- `packages/sdk/core/src/generated/`
- `tools/codegen/`

**先写检查**：

- 同一输入两次生成的文件 Byte-for-Byte 相同。
- 手改 Generated 文件后 `contracts:check` 失败。
- OpenAPI 可通过 Validator。
- 事件 Probe Payload 违反 Zod Schema 时失败。
- SDK TypeScript 编译消费健康响应。

**实现**：

1. 使用 Contracts 中的 Zod Schema 和 Nest Controller Metadata 生成 OpenAPI 3.1。
2. 使用 `openapi-typescript/openapi-fetch` 生成 Core SDK 类型/Client。
3. 从事件 Zod Schema 生成 JSON Schema。
4. 所有生成文件写标准头、固定排序和固定换行。
5. `contracts:generate` 负责生成，`contracts:check` 负责生成后执行 Git Diff。

**验证**：

```text
pnpm contracts:generate
pnpm contracts:check
pnpm --filter @iam/core typecheck
```

**建议提交**：`feat(contracts): establish deterministic contract codegen`

---

### Task 2.2：建立 Main/Audit PostgreSQL 连接和迁移工作流

**目的**：证明两个数据库完全隔离，并建立后续迁移纪律。

**修改/创建**：

- `packages/backend/platform/database-main/`
- `packages/backend/platform/database-audit/`
- `ops/compose/compose.yaml`
- `ops/compose/compose.local.yaml`
- `tools/migration-checks/`
- `docs/backend/database.md`（当前不存在，由本任务在数据库实现可验证后创建）

**M0 允许的表**：

- Main DB：平台拥有的 `outbox_events` 和必要的 Dispatcher Lease/Delivery 元数据。
- Audit DB：不创建正式审计业务表；只验证连接、独立迁移目录和数据库权限。

**先写测试**：

- Main Client 不能连接 Audit URL，反之亦然。
- Outbox 必须在业务传入的 Prisma Transaction 中写入。
- Migration Checker 发现直接 Drop、危险 Not Null 或无并发索引提示时失败/要求豁免。
- 生产环境禁止自动 `migrate dev`。

**实现**：

- Prisma 7 配置、多文件 Main Schema、独立 Audit Schema/Client。
- Migration 命令分 `dev`、`deploy`、`status` 和 `check`。
- 连接池按 Runtime 分配，Auth 默认最小且独立。
- 所有时间使用 UTC `timestamptz`，主键基线 UUIDv7。

**验证**：

```text
pnpm infra:up postgres-main postgres-audit
pnpm db:main:migrate:dev
pnpm db:audit:migrate:dev
pnpm --filter @iam/platform-database-main test:integration
pnpm migration:check
```

**建议提交**：`feat(platform): establish isolated database foundations`

---

### Task 2.3：实现 Outbox 与 RabbitMQ 探针链路

**目的**：在业务开发前验证“事务事实源 + 至少一次投递 + 幂等消费”。

**修改/创建**：

- `packages/backend/platform/events/`
- `packages/contracts/src/events/platform-probe.ts`
- `packages/contracts/generated/events/`
- `apps/backend/worker-runtime/` 的初始 Composition

**先写集成测试**：

- 业务事务回滚时 Outbox 不存在。
- 事务提交时 Probe Event 存在。
- Worker 认领使用 `FOR UPDATE SKIP LOCKED` 或等价安全机制。
- RabbitMQ 发布确认前不能标记 Delivered。
- 发布失败按退避重试，超过阈值进入可观察失败状态。
- 同一 `event_id` 投递两次，Probe Consumer 只产生一次效果。
- RabbitMQ 离线时 Main 事务仍成功，恢复后补投。

**实现**：

- CloudEvents 1.0 Envelope。
- Transactional Outbox Writer、Dispatcher、Publisher Confirm 和 Retry。
- Exchange/Queue/DLQ 命名包含环境与契约版本。
- Probe Consumer 仅用于平台集成测试，不进入产品 UI。

**验证**：

```text
pnpm infra:up postgres-main rabbitmq
pnpm --filter @iam/platform-events test:integration
pnpm contracts:check
```

**建议提交**：`feat(platform): prove transactional outbox delivery`

---

## 7. Wave 3：运行时与前端

### Task 3.1：实现三个薄 NestJS Runtime

**目的**：证明三个进程可独立启动、隔离连接和复用平台能力。

**修改/创建**：

```text
apps/backend/auth-runtime/src/{main.ts,app.module.ts,composition-root.ts}
apps/backend/control-runtime/src/{main.ts,app.module.ts,composition-root.ts}
apps/backend/worker-runtime/src/{main.ts,app.module.ts,composition-root.ts}
```

**先写测试**：

- 每个 Runtime Config 缺失时启动失败。
- Auth/Control 提供 Live/Ready，Worker 只在内部端口提供 Live/Ready/Metrics。
- Auth Runtime 不加载 Audit DB、导出和 Worker Provider。
- Control Runtime 不启动 Outbox Dispatcher。
- Worker Runtime 不注册公网 Controller。
- Runtime 源码出现非允许目录/业务 Service 时架构检查失败。

**实现**：

- 共用 Bootstrap Helper，但每个 Composition Root 显式列出模块。
- 优雅关闭、启动超时、Readiness 和版本信息。
- Control 提供 M0 `/api/v1/platform/info` 与健康 API，响应使用 Contracts Schema。
- Auth 只提供 OIDC 预留 Router Boundary 和健康端点，不实现协议。

**验证**：

```text
pnpm --filter @iam/auth-runtime test
pnpm --filter @iam/control-runtime test
pnpm --filter @iam/worker-runtime test
pnpm architecture:check
pnpm build
```

**建议提交**：`feat(runtime): compose isolated auth control worker processes`

---

### Task 3.2：建立 React 管理端壳

**目的**：打通前端技术栈和前后端契约，不制造业务 Mock。

**修改/创建**：

```text
apps/frontend/web/src/app/
apps/frontend/web/src/routes/
apps/frontend/web/src/modules/platform/
apps/frontend/web/src/ui/
apps/frontend/web/src/platform/
```

**先写测试**：

- `/auth/*` 使用公开认证布局。
- `/account/*` 和 `/admin/*` 使用各自 Layout Boundary。
- M0 `/admin/overview` 只显示真实 Runtime/Dependency 健康状态。
- API 故障展示可重试 Error 和 trace_id，不显示假数据。
- 前端导入后端包或手拼 API URL 时 Lint/Architecture Check 失败。
- 关键页面通过键盘导航和基础可访问性检查。

**实现**：

- React、Vite、Ant Design 5、ProComponents、React Router、TanStack Query。
- 中文 Locale、全局 Error Boundary、Query 默认重试和 Problem Details 解析。
- 按任务分组的导航壳；未实现领域入口明确标记为未启用，不展示假统计。
- `/admin/overview` 调用生成 SDK Client 显示真实健康数据。
- MSW 仅在测试中使用。

**验证**：

```text
pnpm --filter @iam/web test
pnpm --filter @iam/web typecheck
pnpm --filter @iam/web build
pnpm architecture:check
```

**建议提交**：`feat(web): establish typed IAM console shell`

---

### Task 3.3：建立本地 Docker Compose 与 Nginx 路由

**目的**：一条命令启动与生产拓扑一致的本地环境。

**修改/创建**：

```text
ops/compose/compose.yaml
ops/compose/compose.local.yaml
ops/docker/backend.Dockerfile
ops/docker/web.Dockerfile
ops/nginx/nginx.conf
ops/scripts/dev-up.*
ops/scripts/dev-down.*
```

**实现**：

- Main PostgreSQL、Audit PostgreSQL、Valkey、RabbitMQ。
- Auth、Control、Worker 使用同一 Backend Image 和不同 `APP_ROLE`。
- Web 独立不可变静态镜像。
- Nginx 路由 OIDC/Auth、Admin/Open API 和静态资源。
- Dependency Healthcheck、非 Root Container、只读文件系统（可行处）、资源限制和命名 Volume。
- 本地覆盖开放必要开发端口；Test/Prod 默认不暴露数据库和 RabbitMQ 管理端口。

**先写/运行验证**：

- `docker compose config` 成功。
- Nginx 路由到正确 Runtime。
- 停止 Worker 后 Auth Live 仍成功。
- 停止 Audit DB 后 Auth Ready 不应因未依赖它而失败；Control 的相关依赖状态可见。
- 镜像中没有源码 Secret 或开发依赖。

**验证**：

```text
pnpm compose:config
pnpm compose:up
pnpm smoke
pnpm compose:down
```

**建议提交**：`feat(ops): add local production-shaped compose stack`

---

## 8. Wave 4：测试、CI 与供应链

### Task 4.1：建立统一测试 Harness

**目的**：测试与模块所有权一致，并提供真实基础设施验证。

**修改/创建**：

- `packages/backend/platform/testing/`
- `tests/e2e/`
- `tests/failure-injection/`
- `tests/conformance/` 的 M0 Harness
- Playwright/Vitest/Testcontainers Config

**实现**：

- 确定性 UUID/Clock/Fixture Builder。
- Testcontainers 的 PostgreSQL、Valkey、RabbitMQ Helper。
- 禁止测试连接本地/测试/生产真实数据库的安全断言。
- Playwright 启动完整 Compose，验证 Web -> Nginx -> Control Runtime。
- M0 故障测试：Worker/RabbitMQ/Audit DB 停止不影响 Auth Liveness。

**验证**：

```text
pnpm test
pnpm test:integration
pnpm test:e2e
```

期望：命令从干净环境可重复运行，结束后不遗留 Container/Volume。

**建议提交**：`test(platform): add deterministic integration and e2e harness`

---

### Task 4.2：建立 PR 和 Main GitHub Actions

**目的**：任何合并都经过同一自动门禁。

**修改/创建**：

```text
.github/workflows/ci.yml
.github/workflows/integration.yml
.github/pull_request_template.md
.github/ISSUE_TEMPLATE/agent-task.yml
.github/ISSUE_TEMPLATE/bug-report.yml
.github/CODEOWNERS
.github/dependabot.yml
.github/SECURITY.md
```

**实现**：

- PR 快速门：Frozen Install、Format、Lint、Architecture、Typecheck、Unit、Contract Drift、Gitleaks、OSV。
- Main 完整门：Testcontainers、Compose E2E、Playwright、Trivy。
- Actions 使用最小 Permissions，第三方 Action 固定到完整 Commit SHA。
- CODEOWNERS 对红类模块、Contracts、Migration、Ops 和 GitHub Workflow 要求人工审核。
- Dependabot 只创建精确升级 PR，禁止自动合并。
- 上传测试报告和镜像扫描结果，但不上传 `.env` 或含 Secret 日志。

**验证**：

- 使用 Action Linter/YAML Parser 本地检查。
- 创建一个故意越界的临时分支，确认 PR CI 阻止。
- 删除临时分支，不把故障 Fixture 合入 Main。

**建议提交**：`ci: enforce pull request and integration quality gates`

---

### Task 4.3：构建不可变镜像和 Release Manifest

**目的**：测试与生产使用完全相同的构建产物。

**修改/创建**：

```text
.github/workflows/build-image.yml
tools/release/create-manifest.*
ops/release/manifest.schema.json
```

**实现**：

- Main 通过后构建 `iam-backend` 和 `iam-web` 两个镜像。
- 镜像标签包含 Commit SHA；部署一律引用 Digest，不引用浮动 `latest`。
- 生成 Release Manifest，记录：Commit、Backend Digest、Web Digest、Schema Version、Contract Hash、构建时间和 SBOM。
- 使用 BuildKit Cache，但验证产物不依赖 Cache 内容。
- 生成 CycloneDX/SPDX SBOM 和 Provenance；推送 GHCR。

**验证**：

- 同一 Commit 重建功能内容一致；Manifest 可通过 Schema。
- `docker inspect` 可看到 Commit/Version Label。
- 无 Git 工作区或 Node Modules 被错误打入 Runtime Layer。

**建议提交**：`ci(release): build immutable images and release manifest`

---

## 9. Wave 5：测试环境和交付闭环

### Task 5.1：建立 Test/Prod Compose Overlay

**目的**：同一基础拓扑通过环境 Overlay 部署，配置和数据完全隔离。

**修改/创建**：

```text
ops/compose/compose.test.yaml
ops/compose/compose.prod.yaml
ops/nginx/test.conf
ops/nginx/prod.conf
ops/scripts/deploy.*
ops/scripts/rollback.*
ops/scripts/health-check.*
```

**实现**：

- Test/Prod 不允许 Build，只允许 `image@sha256:digest`。
- 部署脚本读取并验证 Release Manifest 和目标环境。
- 在切换前运行 Config Check、Migration Status 和健康预检。
- 滚动顺序：Migration（如有）-> Worker -> Control -> Auth -> Web/Nginx；M0 无业务迁移。
- 回滚读取上一份 Manifest，禁止手填浮动 Tag。
- 生产 Overlay 保留人工批准，不在 M0 自动执行。

**验证**：

```text
docker compose -f base -f test config
tools/release/verify-manifest <manifest>
ops/scripts/deploy --dry-run --environment test
ops/scripts/rollback --dry-run --environment test
```

**建议提交**：`feat(ops): define digest-only environment deployment`

---

### Task 5.2：部署测试服务器

**目的**：验证 GitHub 构建的不可变镜像可在腾讯云测试服务器按 Digest 自动部署和回滚。

**前置**：GitHub 仓库、GHCR、SSH、测试域名和 Secrets 已由项目负责人提供。

**修改/创建**：

- `.github/workflows/deploy-test.yml`
- GitHub Environment `test`（仓库外配置）
- 测试服务器目标目录和系统服务（服务器外配置）

**实现**：

- Main 镜像构建成功后，使用受限 SSH 用户触发部署。
- 服务器 `git fetch` 并检出明确 Commit/Release 所需 Ops 文件；不构建应用。
- 从 GHCR 拉取 Manifest 中两个 Digest。
- 运行 Compose Deploy、Migration Status、Smoke 和回滚保护。
- 部署结果记录 Commit、Digest、操作者和时间。

**验证**：

- 从公网/指定网络访问 Test Web 和健康端点。
- 测试服务器实际运行 Digest 与 Manifest 完全一致。
- Worker 停止演练不影响 Auth Liveness。
- 回滚到上一 M0 Candidate 成功。

**建议提交**：`ci(deploy): automate verified test environment rollout`

---

### Task 5.3：建立生产晋级工作流框架

**目的**：在不实际部署生产的情况下锁定同 Digest 与人工审批规则。

**修改/创建**：

- `.github/workflows/release-production.yml`
- GitHub Environment `production`（仓库外配置）

**实现**：

- 只接受已在 Test 记录为通过的 Release Manifest。
- 验证 Backend/Web Digest 未变化。
- 要求 GitHub Environment 人工批准。
- 执行前展示 Migration、备份前置、残余风险和回滚 Manifest。
- M0 默认仅允许 Dry Run；实际生产开关需项目负责人后续明确启用。

**验证**：

- 修改 Digest 后晋级失败。
- 未经 Test 验收的 Manifest 失败。
- 无生产批准时 Job 停在 Environment Gate。

**建议提交**：`ci(release): gate production promotion by tested digests`

---

### Task 5.4：完成 M0 文档和验收

**目的**：让下一名 Agent 能从仓库事实源独立接手 M1。

**修改/创建**：

```text
docs/development.md
docs/architecture/overview.md
docs/architecture/modules.md
docs/architecture/adr/README.md
docs/architecture/adr/ADR-0001-modular-monolith-three-runtimes.md
docs/architecture/adr/ADR-0002-contract-generation.md
docs/architecture/adr/ADR-0003-immutable-image-promotion.md
docs/backend/architecture.md
docs/backend/database.md
docs/frontend/architecture.md
docs/frontend/ui-guidelines.md
docs/testing.md
docs/runbooks/deployment-and-rollback.md
docs/runbooks/incident-response.md
README.md
```

仅在有真实实现可记录时创建这些文件，不预先生成空模板。

**验证命令**：

```text
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm architecture:check
pnpm typecheck
pnpm test
pnpm contracts:check
pnpm test:integration
pnpm test:e2e
pnpm build
pnpm compose:config
pnpm smoke
```

**人工验收**：

- 新机器按 README 在 30 分钟内运行。
- Web 和三个 Runtime 可观察、可独立重启。
- RabbitMQ 中断时 Outbox 不丢 Probe Event。
- 审计库/Worker 故障不影响 Auth Liveness。
- 越界 Import、手改 Generated、缺少 Contract 更新均能被 CI 拦截。
- Test Server 运行的镜像 Digest 与 GitHub Manifest 一致。
- 生产 Workflow 只能晋级已测试的同 Digest，并停在人工 Gate。

**建议提交**：`docs: complete M0 operations and architecture handoff`

**M0 Release**：创建 `v0.1.0` GitHub Pre-release，附 Release Manifest、测试报告、SBOM、已知限制和 M1 前置条件。

---

## 10. 建议提交序列

```text
docs: establish IAM platform design baseline
chore(repo): pin workspace toolchain
chore(repo): establish frontend backend workspace boundaries
feat(tooling): enforce module ownership boundaries
feat(platform): add fail-fast runtime configuration
feat(platform): standardize observability and health contracts
feat(contracts): establish deterministic contract codegen
feat(platform): establish isolated database foundations
feat(platform): prove transactional outbox delivery
feat(runtime): compose isolated auth control worker processes
feat(web): establish typed IAM console shell
feat(ops): add local production-shaped compose stack
test(platform): add deterministic integration and e2e harness
ci: enforce pull request and integration quality gates
ci(release): build immutable images and release manifest
feat(ops): define digest-only environment deployment
ci(deploy): automate verified test environment rollout
ci(release): gate production promotion by tested digests
docs: complete M0 operations and architecture handoff
```

提交边界可因实现依赖小幅合并，但不得把数据库、认证协议、前端大壳和 CI 一次性混入无法审查的巨型提交。

---

## 11. M0 残余风险与停止条件

### 可接受残余风险

- 单台测试/生产服务器仍是主机单点。
- M0 没有真实 IAM 业务，OIDC Conformance 只能在 M1 完整执行。
- COS、异机备份和正式 RPO/RTO 尚未实现。
- 生产晋级默认 Dry Run，不代表已完成生产上线。

### 必须停止并重新决策

- 当前稳定版本之间出现无法解决的 Peer/Runtime 不兼容。
- `oidc-provider` 与 NestJS/Express 的挂载要求迫使改变三 Runtime 边界。
- 单服务器资源无法同时承载两套 PostgreSQL、RabbitMQ 和基础监控。
- GitHub/GHCR 使用策略不允许保存私有镜像或执行所需 Actions。
- 测试服务器无法使用 Digest 部署，只允许现场构建。
- 为通过门禁需要放宽用户/角色分离、租户、后端鉴权或 Secret 安全规则。

出现停止条件时，先提交证据和 ADR 选项，不由 Agent 静默改换技术路线。

---

## 12. M0 完成后的下一步

M0 `v0.1.0` 通过验收后，为 M1 单独编写实施计划。M1 的第一个业务切片应是：默认 Tenant Context + Account/Employee/Employment 最小模型 + 管理端创建员工，而不是立即实现完整 OIDC；先建立身份事实和审计/事件事务模式，再接认证协议。
