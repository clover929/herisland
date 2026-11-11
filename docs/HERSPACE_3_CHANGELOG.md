# HerSpace 3.0 变更记录

## 阶段1：基线与保护

读取AGENTS/README/docs，保存Git状态和patch，校验人物JSON、地图SVG、环境文件和人格文件。基线105单测通过，15项E2E中12通过、2模型失败、1跳过。未提交的旧工作保留。

## P0：本地状态与资源控制

- 新增src/features/use-demo-state.ts：初始读取与损坏写入保护、保存失败不清空输入、过期快照检测、跨页面storage刷新。
- 新增src/features/ai/request-body.ts：受取消控制的大小受限JSON读取、可释放的并发门。
- 修改src/app/api/ai/chat/route.ts：并发2、严格JSON类型、统一错误；保留超时/限流。
- 修改features/ai/origin.ts拒绝跨站浏览器元数据；provider.ts仅将模型缺失错误改为不暴露配置的通用提示，地址、模型和供应商配置不变。
- 验证：新增并发释放、取消、超大/非法请求、Origin与输入校验单测。

## P1：核心交互

- 新增src/features/posts/post-editor.tsx：标题/正文/分类/模式校验、本地草稿、重复提交锁、失败保留；Write草稿待用户采用。
- 新增src/features/use-list-filters.ts：URL与同标签列表条件恢复。
- 修改community-app.tsx：使用受保护状态、发帖编辑器、评论提交保护、载入前禁用持久化操作、移动菜单关闭与aria-expanded。原回复行为、示例数据和演示身份不变。
- 新增features/ai/chat-store.ts并修改components/sunny.tsx：共享内存、模式隔离、同步发送锁、取消/超时、清空确认、Write转交；站内引用使用Next Link。
- 新增features/women/return-link.ts，修改women-cards及人物列表/详情：安全返回原筛选列表，不改人物记录。
- 修改统一路由入口，新增app/not-found.tsx和app/error.tsx：真实未知路由404与返回岛屿/重试。
- 测试旧AI用例仅补充对清空确认框的显式接受，不更改真实模型200验收标准。

## P2：窄屏反馈

- herisland-theme.css仅追加360px以下顶部按钮/字标尺寸，修复320px横向溢出，未重设计主题。
- 地图、NPC、每日岛主、太阳和原SVG均未改动。

## 测试与文档

新增tests/herspace3-security.test.ts、tests/e2e/herspace3.spec.ts。包含实际浏览器流程、明确标记的Mock聊天、取消/超时、草稿确认、本地损坏与过期快照保护、390/320业务页、跨页storage事件。测试结果见HERSPACE_3_TEST_REPORT.md。

范围外：数据库、认证、权限、帖子编辑删除、真实跨用户同步、流式改造；未自动部署或提交。

## 最终验收

113项单测、严格TS、生产构建通过；lint保留原1条img提示。最终28项非模型浏览器验收全部通过，覆盖桌面/390/320、前进后退、Console、XSS纯文本、API拒绝非法输入与跨站请求。真实模型审计仍为Companion503/Explore200/Write503，recovery桌面失败、移动串行跳过。详情见测试报告。不将这部分失败隐藏为Mock通过。人物/地图/环境/人格SHA校验与基线一致。
