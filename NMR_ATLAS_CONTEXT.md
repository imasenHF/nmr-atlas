# NMR Atlas — 当前需求与实现约束

更新日期：2026-10-08

本文件记录 NMR Atlas 当前有效需求、设计决定、数据边界和待检查事项。后续修改应同步更新本文件；只保留仍然有效的约束，不把已经放弃的方案继续当作要求。

## 1. 项目定位

NMR Atlas 是 plastocyanin Workshop 下的独立 NMR 交互参考工具。

公开署名：hyphoon  
公开联系邮箱：wuhaifeng@ustc.edu.cn

独立仓库：`imasenHF/nmr-atlas`

页面品牌区显示：

- `plastocyanin.`
- `NMR Atlas`

主站导航继续保留 Home / Workshop / Notebook / About / CV。Breadcrumb 可保留 `WORKSHOP / NMR ATLAS`，表示项目层级。

首页主体仍以 NMR 周期表为核心，化学位移参考位于页面下部。

## 2. NMR 周期表

### 2.1 信息保留

周期表保留原 `table400.tex` 中的主要科学信息，但把信息分为“方格常驻信息”和“悬浮信息”。

元素/核素方格常驻显示：

- 元素原子序数、元素符号、元素名、常见 chemical-shift range；
- 核素质量数；
- 天然丰度；
- 当前磁场下的 Larmor frequency；
- relative sensitivity / receptivity。

`I` 与 `γ/2π` 不再常驻方格，放在周期表外图例、hover inspector 和 Nuclei Comparison 中。信息仍保留，只调整显示层级。

### 2.2 数值精度和单位

周期表中的数值用于快速浏览：

- abundance 最多保留 2 位小数；
- γ/2π 保留 2 位小数；
- frequency 保留 2 位小数；
- frequency 单位不在每个核素格重复显示，在周期表上方统一标识；
- 根据当前场强统一使用 MHz / kHz / Hz，低场时不能因为固定 MHz 两位小数而失去有效信息；
- 核种比较区也采用两位小数作为主要显示精度。

### 2.3 几何和视觉

延续原 LaTeX 周期表的几何特征：

- 每个元素单元保持接近正方形；
- 元素主区和核素区采用黄金分割关系，约 38.2% : 61.8%；
- 多核素在右侧 61.8% 区域内纵向均分；
- 不通过持续压小字号解决屏幕变窄；
- 元素符号区不使用大面积深色块，改为与 plastocyanin 主题一致的低饱和蓝灰/青灰；
- I = 1/2 使用低饱和金色系；
- I > 1/2 使用浅蓝灰系；
- selected / hover 继续使用主题蓝和主题金。

宽屏不铺满 100vw。周期表应有最大宽度，并保留适当左右留白。

### 2.4 响应式布局

采用“重排周期表区块”而非“不断缩小单元格”的响应式思路，参考 ptable.com 的布局行为。

建议行为：

- 宽屏：标准 18 group 完整周期表；
- 中等宽度：保持单元可读尺寸，d block 独立下移；
- 更窄：s/p、d、f block 分段排布；
- 手机：分段周期表，可局部横向滚动；
- 各模式尽量保持元素单元黄金分割结构；
- 宽屏完整显示时仍保留页面两侧留白。

### 2.5 自旋筛选

Spin filter 必须作用于核素级：

- `I = 1/2` 仅显示符合条件的 isotope；
- `I > 1/2` 仅显示符合条件的 isotope；
- 同一元素同时含两类核素时，不得把另一类核素继续显示；
- 元素只要存在符合条件的核素，元素符号区域保持正常；
- 完全没有符合条件核素的元素整体弱化；
- 无有效核自旋数据的占位项不混入 `I > 1/2`。

### 2.6 元素/核素局部信息

元素或核素 hover 约 300–400 ms 后显示局部 inspector，不放大整张周期表；离开元素和 inspector 后短延迟关闭。

Inspector 清晰显示该元素所有可用核素的：

- isotope；
- spin；
- natural abundance；
- γ/2π；
- current frequency；
- relative sensitivity。

点击 isotope 直接加入/移出 Nuclei Comparison；点击元素主体添加当前自旋筛选条件下天然丰度最高的可用 NMR isotope。

## 3. Nuclei Comparison

核种比较区应同时显示：

- nucleus；
- spin；
- abundance；
- γ/2π；
- current frequency；
- relative sensitivity，明确基准为 13C = 1；
- ppm → Hz 结果。

原独立 ppm / Hz converter 合并到 Nuclei Comparison。

比较区只保留一个公共 `Δδ / ppm` 输入，默认值为 1；同一 Δδ 对所有已选核种计算 Δν：

`Δν / Hz = Δδ / ppm × ν0 / MHz`

核种只通过周期表点击加入比较；比较区不再提供 Add nucleus 下拉框或 Add 按钮。

## 4. 磁场与频率范围

B0 与 1H frequency 双向联动。

范围覆盖低场至高场：

- 1H frequency 最低至少到 1 kHz；
- 最高到 2.0 GHz；
- 对数滑块；
- 快捷预设包含低场和常规高场值；
- 低场显示自动使用 kHz / Hz，不丢失有效位数。

## 5. Solvent Signals

Solvent Signals 与 Impurity Signals 分开。

### 5.1 溶剂选择区

氘代溶剂数量较少：

- 左侧选择区改为两列；
- 尽量不依赖内部滚动；
- 选择区和右侧谱图区域保持清晰比例。

### 5.2 结构和分子信息

选中溶剂后显示：

- deuterated solvent name；
- molecular formula；
- chemical structure；
- residual protonated isotopologue / residual protonated species 说明；
- 1H / 13C residual signals；
- HOD（来源有数据时）。

结构图：

- 无边框；
- 无卡片底色；
- 尺寸比当前版本略大；
- 不显示无意义的 `structure` placeholder 方框。

页面文字需明确：Residual 1H signal 来自含质子的 isotopologue 或相关含质子物种，不能把它表达成理想完全氘代分子自身的 1H 信号。

例如 Acetone-d6 应明确 residual 1H 对应 proton-containing isotopologue（如 acetone-d5H）。只有资料或化学计量能可靠确定时才写具体 isotopologue；不确定时写 `Residual protonated isotopologue`，不猜具体结构。

### 5.3 谱图

Solvent Signals 保留：

- 1H / 13C 切换；
- chemical-shift axis；
- 棒状图；
- 峰位文本；
- HOD 标记。

## 6. Impurity Signals

采用单层 cross-solvent matrix，不保留下拉展开详情。

### 6.1 结构

每种 impurity 占一行：

`Compound | CDCl3 | acetone-d6 | DMSO-d6 | CD3CN | CD3OD | D2O`

同一种杂质在六种氘代介质中的数据横向比较。

### 6.2 每个 solvent cell

直接显示全部可用：

- shift；
- assignment/site；
- multiplicity；
- J（来源 multiplicity 字符串中已有时原样保留）。

删除：

- `+N signals` 摘要；
- `click for assignments`；
- resonance 数量说明；
- 展开箭头；
- 展开详情区域。

每个 cell 内按高 ppm → 低 ppm 排序。

不需要在每一条峰位前重复写 δ；区域标题或表头统一说明 chemical shift / ppm。

### 6.3 Compound 列

Compound 单元显示：

- 结构图；
- compound name；
- molecular formula；
- CAS 可用时显示。

结构图无边框、无背景。

不得同时显示真实结构图和额外的 `structure` placeholder。

### 6.4 表格尺寸

不通过缩小正文把 7 列硬塞进窗口。

- Compound 列约 230–260 px；
- 各 solvent 列设置合理最小宽度；
- 屏幕不足时矩阵整体横向滚动；
- 表头 sticky；
- 第一列 sticky；
- 行高由该 impurity 实际信号数量决定；
- 正文字号约 12–13 px，不使用当前过小的 9–10 px 主文本。

## 7. 数据和来源

核素数据：

- 原始 `table400.tex`。

氘代溶剂：

- Cambridge Isotope Laboratories, NMR Solvent Data Chart。

杂质：

- Babij, N. R. et al. Org. Process Res. Dev. 2016, 20, 661–667；
- DOI 10.1021/acs.oprd.5b00417；
- Supporting Information。

来源数据的 shift、assignment、multiplicity 不自行改写或补造。

结构、formula、CAS/SMILES 属于额外元数据。通过 PubChem 等来源获取时，应与文献峰数据区分；网页加载失败时不得出现误导性的结构占位内容。

## 8. 当前实施目标

本轮需要全部落实：

1. 更新本文件并作为当前设计记录；
2. 周期表重新实现黄金分割元素单元；
3. 优化字体和数值精度，不删除现有科学信息；
4. 周期表响应式改为 Full / Split / Sectioned 布局；
5. 调整元素和核素配色；
6. 增加 isotope inspector；
7. 修正 Spin filter；
8. Nuclei Comparison 增加 abundance、relative sensitivity，并合并 ppm/Hz；
9. Solvent selector 两列；
10. Solvent structure 无框、增加 formula 和 residual isotopologue 说明；
11. Impurity matrix 改为单层完整 assignment；
12. 去除 impurity 的展开逻辑和 structure placeholder；
13. 品牌副标题使用 NMR Atlas；
14. 检查 GitHub Pages 构建和线上预览状态。

## 9. 本轮实现状态

已实施：

- 页面品牌副标题已改为 NMR Atlas，plastocyanin. 与 NMR Atlas 使用独立链接；
- 周期表保留原有核素参数，元素区/核素区按约 38.2% : 61.8% 布局；
- 宽屏采用完整 18 group，较窄屏将 s/p、d、f 区块拆分显示；
- 周期表数值精度统一，frequency 单位移到表外；
- Spin filter 按核素筛选；
- 增加元素/核素 inspector；
- Nuclei Comparison 已加入 abundance、γ/2π、frequency、relative sensitivity 和公共 Δδ→Δν；
- 独立 ppm/Hz 区域已移除；
- Solvent selector 改为两列，增加 formula 和 residual protonated isotopologue/species 说明；
- Solvent structure 改为无框显示；
- Impurity Signals 改为单层矩阵，六种介质直接显示完整 shift、assignment 和 multiplicity；
- Impurity 展开详情、+N signals、click for assignments 和 structure placeholder 已移除；
- Impurity 主表增加 sticky header / first column 和较大的正文尺寸；
- 代码拆分为 core / periodic / references 模块；
- GitHub Pages workflow 已启用并可触发部署。


## 11. 2026-10-08 第二轮界面修订

以下要求覆盖前文与之冲突的旧表述：

### 周期表单元

- 元素/核素方格继续保留 abundance、当前 frequency、relative sensitivity。
- 方格内部移除 `I` 与 `γ/2π` 数值；这两项保留在 hover inspector / comparison 中。
- 周期表外设置明确图例，说明方格各行数值含义与统一单位。
- 元素符号与 isotope 字号略微降低，避免多核素元素溢出。
- f block 与主表的垂直间距约为一个元素方格边长的 1/2。
- 提供多个周期表配色方案并可即时切换；必须包含 Wave 方案。配色切换只作用于周期表数据区，不改变主站整体品牌色。

### 周期表交互

- 元素/核素详细信息改为 hover 触发，不再依赖点击打开。
- hover 使用短延迟，目标约 300–400 ms，避免指针经过时频繁弹出。
- 离开元素和 inspector 后短延迟关闭。
- 点击 isotope 直接加入/移出 Nuclei Comparison。
- 点击元素主体时添加该元素最主要的可用 NMR isotope（按天然丰度优先）。
- inspector 为只读详情，显示 I、abundance、γ/2π、frequency、relative sensitivity。

### Nuclei Comparison

- 删除 Add nucleus 下拉框与 Add 按钮；核种添加只通过周期表点击完成。
- 控制区只保留 `Δδ / ppm` 输入，默认值为 1。
- 各行仍保留删除按钮。

### Solvent Signals

- 结构图继续无框显示，并处理 PubChem PNG 白底的视觉问题；显示尺寸增大并裁掉明显白边。
- chemical-shift 棒状图支持鼠标滚轮缩放横轴，围绕指针位置缩放。
- 双击谱图恢复完整横轴范围。
- 页面只保留必要的科学说明和操作提示，删除空泛说明文字。

### Impurity Signals

- 删除标题右侧“同一种杂质占一行……”等说明性句子。
- 删除页面中其他没有数据含义、操作含义或来源含义的类似文字。
- 每个 solvent cell 的 signal 改为更充分利用横向空间的布局：shift / assignment / multiplicity(J) 三列或等效结构，不把前两项挤在左侧后留下大面积空白。
- solvent 列适当加宽，宁可整体横向滚动。
- 表头 solvent 名称显著增大。
- compound structure 放大并通过裁剪/混合方式减少 PNG 白边和白底视觉。
- 增加矩阵图例，明确每条记录的字段：`δ / ppm | assignment | multiplicity, J / Hz`。

### 品牌链接

- 页头 plastocyanin. 与 NMR Atlas 必须是两个独立链接。
- plastocyanin. 链接主站；NMR Atlas 链接当前 NMR Atlas 首页。
- 页尾 NMR Atlas 也必须可点击。
- 页尾品牌链接增加明确 hover 文字变色效果。

## 12. 第二轮实现状态

已实施：

- 周期表方格移除 I 与 γ/2π，仅保留 isotope、abundance、frequency、relative sensitivity；
- 周期表外增加 CELL DATA 图例，I 与 γ/2π 改由 hover inspector 查看；
- 元素符号和 isotope 字号降低，避免多核素元素溢出；
- 增加 Wave / Atlas / Mineral / Mono 四套周期表配色，可即时切换并保存在浏览器；
- 元素/核素详情改为约 340 ms hover 触发，离开后短延迟关闭；
- 点击 isotope 直接加入/移出 Nuclei Comparison；点击元素主体添加当前筛选条件下天然丰度最高的可用 NMR isotope；
- Full layout 的 f block 与主表之间改为约 0.5 个方格边长的间距；分段布局各 block 也采用约 0.5 cell 的垂直节奏；
- Nuclei Comparison 移除 Add nucleus 下拉框、Add 和 Clear 控件，只保留 Δδ / ppm，默认值改为 1；
- Solvent structure 改用较大 PubChem 图并通过裁剪缩放和 multiply 混合减弱白底/白边；
- Solvent chemical-shift plot 支持滚轮围绕指针缩放，双击恢复完整范围；
- Impurity 标题区删除空泛说明；
- Impurity matrix 增加字段图例：δ / ppm、assignment、multiplicity/J；
- Impurity solvent 表头增大；
- Impurity signal 改为 shift / assignment / multiplicity 三列同行布局，扩大 solvent 列宽并取消内部固定高度滚动；
- Impurity compound structure 放大并减弱白底/白边；
- 页头 plastocyanin. 与 NMR Atlas 已拆为独立链接；
- 页尾 NMR Atlas 已增加独立链接，品牌链接增加 hover 变色；
- Pages workflow 增加 JavaScript syntax check，在部署前检查 core / periodic / references / app 四个模块。

## 13. 待检查项

- 部分 solvent 的 deuterated formula / residual isotopologue 需要逐项确认；
- impurity formula / CAS / local structure metadata 目前不全部存在于文献数据中，需区分外部元数据；
- Pages 需确认仓库是否已启用 GitHub Actions deployment；
- 响应式布局完成后需用至少 1920、1440、1024 和手机宽度检查。
