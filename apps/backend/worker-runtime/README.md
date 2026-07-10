# @iam/worker-runtime

异步处理的薄运行入口。后续装配 Outbox 投递、RabbitMQ 消费、审计写入、导入导出和归档任务。

当前只登记包清单，不包含源码或业务实现。Task 2.3 和 Task 3.1 才会建立 Composition Root 与事件探针。

禁止注册公网业务 Controller，也不得成为认证事务的同步依赖。
