# HerSpace 3.0 基线审计

审计日期：2026-11-09；当前唯一提交8c1dea5。工作区已有大量未提交/未跟踪的岛屿、AI、人物库、页脚等工作。未重置、清理或提交。改动前diff与status保存于/tmp/herspace3-before.*；人物JSON、岛屿SVG、环境文件和人格提示词校验值保存于/tmp/herspace3-protected.sha（不复制密钥内容）。

## 技术与数据地图

Next.js16.4.5、React19、严格TS6，Vitest/Playwright。根布局包含全站页脚和全局Sunny面板。统一业务入口src/app/[[...slug]]/page.tsx、src/components/community-app.tsx；独立/ai、/women、/women/[slug]、/api/ai/chat。

帖子16条、社群6条与分类来自src/data/index.ts；本地新增帖子/评论/收藏/加入保存在localStorage herspace-demo，src/features/store.ts解析。评论只有postId/text，回复仅预填@，不是回复树。固定演示身份，不是真实共享数据库。

女性人物：src/features/women/candidates.json，共102，无重复slug，10 published、92 verified。schema验证事实来源、日期、图片授权字段。仅10人有公开详情，其余92人目录可见、详情404；不伪造肖像或名言。NPC、每日岛主只用published。

AI：src/app/api/ai/chat/route.ts → features/ai/service.ts → OllamaProvider；配置.env.local，实际本机Ollama0.40.15，qwen3:4b。无付费云端回退。输入64KB、单消息4000字、上下文16条/16000字、90秒超时、Origin校验及20次/分钟单进程限流。无并发上限；流式关闭。人格sunny-persona.ts；Explore使用公开结构化事实白名单。

岛屿：features/island/island-home.tsx、config.ts、npc.ts、daily-host.ts、sunny-sun.tsx；地图public/island/map.svg；上海日期岛主，6个NPC，太阳25秒轮换，地图失败保留导航。保持视觉资产不变。

## 能力分类

已实现：原真实路由导航；本地发帖、评论、收藏、加入退出、个人列表；帖子搜索分类；人物目录组合筛选与公开详情；岛屿六区、拖拽缩放/重置/键盘、NPC卡片、岛主、太阳；AI三个模式界面、服务端本地调用、取消/重试与错误。

部分实现：回复是文本@预填；社群成员/个人资料为固定演示；账号界面无认证；未知统一路由显示不存在但HTTP200；聊天状态按组件内存、切模式清空；存储损坏仅提示但后续仍可能覆盖；收藏/社群跨页依赖重读localStorage；搜索未保持；无帖子草稿；流式未实现。真实模型存在不完整回复/超时，不能以Mock证明可用。

未实现：真实账号与权限、跨用户共享数据库、帖子编辑删除授权、真实私聊/通知/审核/活动报名、跨设备同步、评论线程。当前架构不安全支持这些功能，本轮不伪造。

无法验证：所有外部来源当前可访问性（本轮不重新采编）；真人肖像授权（现用占位图）；公网生产限流与权限；真实模型全部模式稳定性。

## 改动前测试

lint通过（原生img警告1条）；typecheck通过；105项单测通过；生产build通过。全套E2E已启动，含真实模型，尚未结束；既有前次结果为12项非模型通过、真实模型审计失败。此次实际结果结束后补录，不能将历史结果当成本轮基线。

## 已确认问题与最小修复范围

P0：本地读取失败/未ready时写入覆盖风险；不同页面过期快照覆盖；AI无请求并发上限、读取慢请求取消不足。以写入保护、冲突检测、storage监听与服务端资源限制修复，不迁移用户数据。

P1：帖子草稿和输入校验/重复提交、搜索状态保持、移动菜单关闭、合法深链404；共享内存聊天状态且按模式隔离、清空确认、Write草稿经确认进入编辑器。保留聊天不持久化到磁盘，保留模型/人格/岛屿原图。

P2：只补加载、错误和键盘反馈，不重做视觉。真实身份和数据库迁移不在授权范围。

基线最终结果：全套Playwright15项，12通过、2失败、1跳过，耗时3.8分钟。失败为local-model-audit及recovery桌面；后者串行导致移动真实模型未运行。逐模式真实基线Companion503、Explore200、Write503；不得称全部通过。至此基线审计结束，开始上述最小修复。
