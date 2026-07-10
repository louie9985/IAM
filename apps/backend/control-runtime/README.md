# @iam/control-runtime

IAM 管理面和开放 API 的薄运行入口。后续装配身份、权限、应用、安全、会话与审计查询能力。

当前只登记包清单，不包含源码或业务实现。Task 3.1 才会创建启动入口、Composition Root 和平台信息端点。

禁止实现 OIDC 协议状态机、Outbox Dispatcher 或领域 Repository；所有业务行为来自领域包公共入口。
