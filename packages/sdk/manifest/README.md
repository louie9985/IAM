# @iam/manifest

Permission manifest DSL, validation, diff submission, and generated permission constants.

当前处于 M0 边界阶段，尚未发布可消费 API。发布配置默认为受限包，具体 Registry 和发布流程在 Release 任务中确定。

## 职责

- 提供 Manifest TypeScript DSL、JSON Schema 校验和权限常量生成。
- 支持 CI 提交候选版本和 Diff 预览。

## 非职责

- CI 凭据不能审核或直接发布 Manifest。
- 不连接 IAM 数据库或绕过应用、操作者和权限范围校验。

## 公共边界

跨包只能从 `src/index.ts` 导入。当前入口不导出行为；新增公开 API 时必须同步测试、README 和相关契约。

## 验证

- `corepack pnpm --filter @iam/manifest lint`
- `corepack pnpm --filter @iam/manifest typecheck`
