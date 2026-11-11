# Sunny / Ollama 稳定性诊断

诊断日期：2026-11-10（Asia/Shanghai）。本报告记录修复前证据。使用合成请求；未读取或发送真实用户聊天。**本阶段没有修改应用代码、Ollama 配置、模型或人物资料。**

## 结论摘要

当前 Ollama 服务和 `qwen3:4b` 均可用。主要故障不是 Ollama 无法连接，而是当前 Ollama/model 的 thinking 能力声明与代码请求不匹配：`/api/show` 对该模型返回 `thinking.values: [true]`、`default: true`，当前集成仍传 `think: false` 与 `/no_think`，但模型实际把内部推理草稿写入普通 `message.content`。它持续生成至 `num_predict: 768`，以 `done_reason: length` 结束；服务端检测到草稿前缀后返回 `503 INCOMPLETE`。这稳定影响 Companion 和 Write。

Explore 行为不同：它只让模型挑选资料事实 ID，最终文字和来源由服务端从公开人物记录生成。本次实际 Next API 调用在 23.7 秒返回 200，且格蕾丝·霍珀的耶鲁来源与原始人物记录完全对应。

原全套 Playwright 使用 5 个 worker，真实模型审计和真实恢复测试跨文件并行。受限于本地 GPU，两条同时生成的 Companion/Write 请求耗时分别约 22.5 秒和 44.6 秒。并行负载会增加延迟。此前 Playwright 等待 100 秒仍未见响应的现象未能在串行 API 复现；并发、浏览器取消和测试成功条件共同影响它的可能性较高，但尚不能把 100 秒个案完全归因于某一个因素。

## Ollama 与模型状态

- Ollama：`0.40.15`，`127.0.0.1:11434` 本地 API 可用，`/api/tags`、`/api/ps`、`/api/show` 均有响应。
- 模型：`qwen3:4b`，ID `359d7dd4bcda`，Q4_K_M，磁盘模型约 2.5 GB。
- 实际 runner：llama.cpp，100% GPU，`/api/ps` 显示约 3.18 GB VRAM、运行 context 4096；`/api/show` 架构元信息标出的最大 context 为 262144。这不是系统总内存读数。因当前权限限制，系统进程级 RSS 未能读取。
- 诊断开始时模型已驻留，因此以下结果属于预热模型结果；没有卸载正在运行的模型来测冷启动，也没有改 keep-alive。
- 仓库 `.env.local` 的既有配置仍指向本地 Ollama 和 `qwen3:4b`；没有修改、打印其他环境值或将配置发到浏览器。

## 三模式真实 API 测量

经 `POST http://127.0.0.1:3000/api/ai/chat` 串行调用。接口当前为非流式；表中的“首响应”是客户端收到 HTTP 响应头的时间，“完整”是读完 JSON 的时间，因此二者几乎相同。

| 模式 | 首响应 | 完整响应 | HTTP / 错误 | 结果 |
| --- | ---: | ---: | --- | --- |
| Companion | 22.333 s | 22.335 s | 503 `INCOMPLETE` | 用户收到安全的可重试提示；模型最终文本未通过推理草稿过滤。 |
| Explore | 23.743 s | 23.744 s | 200 | 服务端以公开事实记录生成回答和引用。格蕾丝·霍珀的 1934 年耶鲁博士事实及 Yale URL 与 `candidates.json` 的事实—来源映射一致。此处只校验与本地记录相符，未重新联网验证外部网页现时可达性。 |
| Write | 22.334 s | 22.334 s | 503 `INCOMPLETE` | 与 Companion 相同，生成达到输出 token 上限后被安全过滤器拒绝。 |

另以 Ollama 原生流式接口、保持相同人格/请求参数检查 Companion 和 Write 的底层生成：首个 `message.content` 分别约 0.199 s、0.153 s 到达；完整生成约 22.235 s、22.169 s；两者均生成 768 tokens、`done_reason: length`，输出以推理草稿开头。**这些流式片段不是可安全展示给用户的答案**，当前不能直接把原始流转发到聊天 UI。

一次 64-token 隔离探针在 2.015 s 完成，仍在 `message.content` 返回推理草稿并以 `length` 截断。它仅用于验证响应字段，不作为模式成功率样本。

## 超时、取消、并发与 Playwright

### API 与前端当前约束

- `src/app/api/ai/chat/route.ts`：服务端 90 秒 AbortController 超时；浏览器断开会中止下游 controller；`concurrencyGate(2)` 是每个 Next 进程最多 2 个在途请求；开发限流 20 次/分钟。
- `src/features/ai/provider.ts`：Ollama 请求 `stream:false`、`think:false`、`num_predict:768`。模型地址和名称只在服务端读取；仅允许回环地址。
- `src/features/ai/service.ts`：每条消息最多 4000 字，最多 16 条，总计 16000 字；Explore 只返回本地白名单事实和其来源。
- `src/features/ai/chat-store.ts`：单标签模块级 `active` 锁避免并行发送，界面发送按钮/输入在生成中禁用；客户端 95 秒中止。不同浏览器标签页仍可并发，服务端会允许最多两个。
- `src/components/sunny.tsx`：显示“本地模型首次加载可能较慢，最长等待约90秒”，提供取消、错误提示和重试；当前没有 token 流或真实生成进度。

### 实际取消恢复

- 对真实本地 Companion API 请求在 0.9 秒时调用 AbortController；客户端在约 0.920 秒观察到 `AbortError`。
- 紧接着发出真实 Explore 请求，27.261 秒返回 200，且包含人物来源。由此确认服务端并发槽可在取消后释放，后续请求可继续。
- 这证明请求取消链路和 API 恢复在本次单请求场景有效；没有直接测量 Ollama runner 在 abort 后多久停止实际 GPU 计算，故不声称模型计算立即归零。

### 并发实测

同时发出两条真实请求：Companion 22.485 秒、Write 44.617 秒，均返回 503 `INCOMPLETE`。第二条耗时约为单请求两倍，支持本地 GPU 竞争延迟的判断。代码内的双槽限制不是 GPU 队列或跨进程共享限流；同机多个 Next 进程也不共享该门。

### Playwright 结果与测试缺陷

- 在允许 Chromium 启动后，完整套件结果为 **29 通过、2 失败、1 未运行，3 分 54 秒**。非模型业务/岛屿/人物/Mock AI 用例通过。
- `tests/e2e/local-model-audit.spec.ts` 用 `waitForResponse(..., timeout:100000)` 并软断言每个真实模式都必须 HTTP 200；失败时等待清空按钮后继续。这没有把模型错误与浏览器网络未完成分开报告。当前后端/前端截止分别为 90/95 秒，测试窗口 100 秒只多 5 秒，不代表模型服务能力。
- `tests/e2e/recovery.spec.ts` 串行循环 Companion/Explore/Write，但每轮只等待消息 article 数变成 2，最长 100 秒；不接受 `role=alert` 错误状态，也不在失败后走重试/恢复分支。它是成功路径测试，模型返回明确错误时会白等超时。
- Playwright 配置默认 5 workers；模型审计与 recovery 位于不同 spec 文件，整个套件并未按文件串行化，真实 Ollama 调用彼此竞争。recovery 文件内部的两个视口才使用 serial。
- 本次隔离复测说明实际 API 对简单请求会在 22–27 秒返回成功或明确 503；双请求时第二个约 45 秒。因此原来的 100 秒未响应个案与当前可复现的 `INCOMPLETE` 错误不同，需修正测试观测方式后再判断是否仍有单独的网络挂起。

## 请求完成条件与流式安全

当前 Ollama adapter 请求非流式；API 等待完整模型生成及服务端检查后才返回 JSON。它没有 SSE/ReadableStream 通道。Ollama 原生流式探针确实更快给出首个字，但首段是被产品规则禁止显示的内部推理草稿，且 Qwen3 当前把该草稿放进 `message.content`，而不是单独的 `message.thinking` 字段；直接流式会泄露不应展示的内容。要安全流式，必须先确定模型能稳定隔离最终答案，或由服务端完整缓冲/过滤后再发送；后者不会改善首 token 可见时间。

Ollama `/api/show` 给出的 `thinking.values` 仅为 `[true]`。官方文档说明 `think:false` 只有在模型允许时才关闭 thinking，且应以 `/api/show` 的支持值为准；当前模型没有报告可用的 `false` 值。[Ollama Chat API](https://docs.ollama.com/api/chat) · [Ollama Thinking](https://docs.ollama.com/capabilities/thinking)

## 修复建议（尚未实施）

1. 保留人格提示词、事实检索、模型标签、服务商和安全过滤；不要直接向用户输出现有 `message.content` 流。
2. 先测试并明确 `qwen3:4b` 在当前 Ollama 版本下可用的关闭 thinking 参数/版本能力。当前 `/api/show` 声明不支持 false，单纯传 `think:false` 或追加 `/no_think` 不起作用。升级 Ollama 或改动模型模板均需单独评估，当前尚未执行。
3. 在证实模型能生成最终答案后再选择输出预算；不应仅把 768 调高来掩盖推理模式不匹配，否则会延长本地计算并可能加剧并发超时。
4. 面向本地 GPU 将并发配置为可控的单队列/单活动请求，明确排队反馈；保留跨标签页限制并与多 Next worker 行为一致。客户端继续允许取消，服务端超时应略大于客户端截止并统一错误语义，不能假装请求成功。
5. 重写真实模型 E2E 观测：分别断言 200 成功、`INCOMPLETE`/超时的用户可见错误、取消后重试，以及串行三模式；真实模型 spec 设置单 worker。将 mock 交互测试和 Ollama 健康测试分别标识。
6. 用公开人物问题验证 Explore 返回的每个事实和 URL 都来自公开记录；保持 Companion/Write 人格、社区业务、地图和用户数据不动。

## 阶段状态

第一阶段诊断已完成。第二阶段已实施安全修复并完成大部分验证；Companion 与 Explore 已真实返回 200，Write 在当前 Ollama/runtime 组合下仍被模型 thinking token 上限截断，未伪报通过。没有更换模型、改 Ollama 设置、删改人格提示词、提交或部署。

## 第二阶段：已实施修复

### 修改文件

- `src/features/ai/provider.ts`
  - 生成请求使用 Ollama 支持的 `think:true`，读取最终 `message.content`，完全忽略单独的 `message.thinking` 字段。
  - Companion/Write 最大生成预算暂设 1536 tokens；遇 `done_reason:length`、空最终内容或明显思考草稿标记时，以可理解错误拒绝展示截断文本。
  - Provider 增加按调用指定 thinking/预算/内部不完整选择策略的选项；不硬编码生产模型名或地址。
- `src/features/ai/service.ts`
  - Explore 使用 768-token 的 thinking 隔离选择调用。选取器超限或未返回完整 JSON 时，仅回退到既有公开检索结果与来源白名单；不把 `thinking` 或不完整选取内容返给用户。
  - 人物事实、链接、来源仍由服务端原记录生成，不接受模型新造事实。
- `src/app/api/ai/chat/route.ts`
  - 本地 Ollama API 并发门由 2 改为 1，避免同一 GPU 上同时做两次长生成。第二个请求获得现有 429“本地模型正处理其他请求”错误，可在 UI 重试。
- `src/components/sunny.tsx`
  - 生成提示解释本地模型只在完成后显示最终答复、中间推理不展示，最长等待约 90 秒；取消、错误与重试仍可用。
- `playwright.config.ts`
  - E2E worker 数设为 1，避免真实 Ollama spec 跨文件并行占用同一 GPU。执行时间较并行模式更长，但模型结果可解释。
- `tests/e2e/local-model-audit.spec.ts`、`tests/e2e/recovery.spec.ts`
  - 三模式真实调用按序记录状态和耗时；Explore 检查人物链接和实际来源格式。
  - 桌面真实取消后重试 Companion；390px 使用明确标记的 Mock 检查移动 UI。
- `tests/ollama-provider.test.ts`、`tests/herspace3-security.test.ts`
  - 覆盖 thinking 字段隔离、长度截断拒绝、Explore 内部选择安全回退、单模型并发槽释放。

未更改 `src/features/ai/sunny-persona.ts`、`.env.local`、Ollama 安装、qwen3:4b 权重、人物 JSON、社区数据和岛屿代码。

### 修复后实际测试

| 测试 | 实际结果 |
| --- | --- |
| `npm run lint` | 通过，0 error；仍有原有 `island-home.tsx` `<img>` 性能 warning 1 条。 |
| `npm run typecheck` | 通过。 |
| `npm test` | 21 个文件、117/117 通过。 |
| `npm run build` | Next.js production build 通过。 |
| 全套 `npm run test:e2e`（单 worker） | 31 通过、1 失败，3.1 分钟。非模型业务/岛屿/人物/Mock/mobile 流程全部通过；唯一失败为真实 Write 返回 503。 |
| 桌面真实取消→重试 | 取消后 retry 请求 200，约 35.980 秒；独立重复验收 30.278 秒。 |
| 390px Sunny UI | Mock 回复、发送和无横向溢出通过；不是模型验证。 |

本轮没有故意等待并触发真实 90 秒服务端 timeout：可控的本地模型调用在约24–46秒已返回 200 或明确 `INCOMPLETE`。已有 E2E 的 95 秒客户端截止/重试路径使用 Mock 虚拟时间验证；它不等同真实 Ollama 90 秒 timeout 实测。

完整三模式实测（均经 Next API 与本机 `qwen3:4b`，串行、预热模型）：

| 模式 | HTTP | 耗时 | 结果 |
| --- | ---: | ---: | --- |
| Companion | 200 | 28.840 秒 | 返回自然简短中文；未展示 thinking。另一轮完整验收也返回 200 / 27.310 秒。 |
| Explore | 200 | 23.582 秒 | 对公开数学人物返回站内档案和 HTTPS 来源。模型选择器达到长度限制时走本地白名单事实回退，来源与人物库记录匹配。另一轮 23.511 秒也成功。 |
| Write | 503 `INCOMPLETE` | 45.768 秒 | qwen3:4b 在 1536 tokens 用完时仍未产生可显示的最终 `content`；安全过滤拒绝输出不完整回复。另一轮 45.930 秒同样失败。 |

补充参数诊断：Write 直接使用 think:true、2048-token 预算仍因 `done_reason:length` 无最终内容（约62.2秒）；2560-token 探针耗时约393秒仍被截断；温度 0 / top_k 1 的1536-token探针约186秒仍被截断。没有把 token 上限盲目扩大到慢请求，也没有放松 90 秒服务端/95 秒客户端截止。两段 768-token thinking 续接同样没给出最终 `content`，因此没有引入多轮 thinking 续接。

Explore 回答的示例档案/来源：`/women/grace-hopper`、Yale 传记 URL。相关事实和 URL 均可在已发布人物资料记录中找到；不代表重新核验了外部网站当前可用性。

### 未解决问题与下一步

当前 Ollama `/api/show` 对 `qwen3:4b` 只声明 `thinking.values: [true]`，模板对 assistant 生成也预置 `<think>`。因此本机安装版本不能可靠按当前模型配置关闭思考。Companion 简单请求通常可在约25–33秒内完成；Write 这类短标题请求却连续消耗更多内部 thinking 预算，仍达不到 90 秒稳定完成。增加超时、暴露 thinking、把 thought 草稿当正文或用 Mock 假装成功都不是安全修复。

下一步需要你授权是否升级**本机 Ollama runtime**后重新检查 `/api/show` 和同一个 `qwen3:4b` 模型的 `think:false` 支持；升级不改项目 `.env.local` 或模型名，但会改动项目外的本机应用，且不保证模型自身支持值会变化。若不升级/当前模型仍只支持 `true`，则在“不更换模型、不改模型模板、不改人格”的限制下，不能承诺 Write 真实回复稳定成功；当前 API 会保留明确 503 和重试，不泄露思考草稿。
