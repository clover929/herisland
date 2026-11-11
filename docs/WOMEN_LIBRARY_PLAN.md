# HerSpace 人物资料库整理与验证

范围确认：2026-11-09，用户确认以现有102位目录为准。增量整理，不初始化、不接入生产数据库，不删除论坛、社群和4篇明确标注的虚构故事。

## 实施顺序

1. 核对102条记录、11批研究证据与状态，保留唯一ID、slug和来源。
2. 为全部记录补齐核实日期、内容审核日期、带来源时间线及图片出处、作者和署名要求。年份不确定的事实不补造时间线。
3. 本轮只重读首批10位核心机构正文，核对至少两项事实，完成内容审核后设为published，精选8位；其余92位保持verified，后续按每批最多10位继续内容复核。
4. `/women`展示已核实人物的基本目录，支持搜索、领域、国家地区与分页；未审核正文不出现在列表或详情。candidate、researching不进入公开目录。
5. `/women/[slug]`仅开放published记录，展示事实、故事、时间线、来源、编辑说明、图片许可与相关推荐；首页精选上限10位。缺失或加载失败图片回退占位图。
6. 实际运行lint、typecheck、unit test、build及Playwright，覆盖102条唯一记录、真实组合筛选、首批详情、其余92位404和原有社区。报告事实核实与内容发布的差别。

## 字段对照与约束

保留现有字段，避免复制维护两套同义资料：category对应fields，nationality需求以regions（国家或地区，非国籍断言）表达，shortBio对应summary，fullStory对应story，sourceUrls保存在sources与逐项facts中，verificationStatus对应status，imageUrl/imageCredit/imageLicense对应image对象。

新增lastVerifiedAt、reviewedAt、timeline、editorialNotes，以及image.sourceUrl、image.author、image.attributionRequired。timeline每项包含year、description、sourceUrls。未确定事件年份时允许空时间线。核实日期不使用页面更新时间替代，内容发布必须具有不早于核实日期的审核日期。

四种状态：candidate（候选）、researching（研究中）、verified（事实已核实、内容待审核）、published（已审核发布）。featured仅允许published。审核状态不是用户认证，也不引入登录或localStorage权限判断。

当前102条人物与来源来自此前分批研究。全量结构校验不等于本轮重新读过102人的外部资料；本轮来源重读仅10人，保留原有92人的核实日期，不伪称完成新一轮全量事实复核。

## 后续批次

首批：原始目录前10位。后续从尚无reviewedAt的92位中每批取最多10人，重读核心事实来源、整理故事和编辑边界，再决定发布；每批独立保存review证据与失败记录。图片许可不明时始终使用原创占位图，禁止从搜索引擎直接搬用人物照片。
