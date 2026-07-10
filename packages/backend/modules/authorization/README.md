# @iam/module-authorization

Permissions, manifests, roles, assignments, data scopes, and authorization versions.

当前处于 M0 边界阶段，公共入口尚未导出领域行为，也未创建空的分层目录。实现首个真实用例时再按 `domain/application/infrastructure/presentation` 建立必要目录。

## 职责

- Application 内 Permission、Manifest、Role、RoleTemplate 和 DataScope。
- 只通过 RoleAssignment 向账号、用户组或岗位产生授权。
- 维护主体授权版本并发布数秒级收权事件。

## 非职责

- 禁止把权限直接授予 Account，禁止在 Account/Employee 上增加角色字段。
- 不访问业务应用数据库，也不替业务系统拼接数据查询 SQL。

## 公共边界

跨包只能从 `src/index.ts` 导入。表所有权、允许依赖和事件边界以 `module.yaml` 为准；任何变化必须与代码和测试同一提交更新。

## 验证

- `corepack pnpm --filter @iam/module-authorization lint`
- `corepack pnpm --filter @iam/module-authorization typecheck`
