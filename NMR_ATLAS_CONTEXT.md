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

周期表不删减原 `table400.tex` 中已经展示的主要核素信息。元素单元继续包含：

- 元素原子序数、元素符号、元素名、常见 chemical-shift range；
- 核素质量数；
- 核自旋 I；
- 天然丰度；
- γ/2π；
- 当前磁场下的 Larmor frequency；
- relative sensitivity / receptivity。

不采用“为了适配窄屏而删除 γ、frequency、relative sensitivity”的方案。

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

### 2.6 元素/核素局部放大

点击元素或核素时提供局部 inspector，不放大整张周期表。

Inspector 应清晰显示该元素所有可用核素的：

- isotope；
- spin；
- natural abundance；
- γ/2π；
- current frequency；
- relative sensitivity。

可在 inspector 中添加或移除 Nuclei Comparison。

宽屏优先利用周期表上方或周期表自身的空白区域；窄屏使用独立面板或 bottom sheet。

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

比较区提供一个公共 `Δδ / ppm` 输入，同一 Δδ 对所有已选核种计算 Δν：

`Δν / Hz = Δδ / ppm × ν0 / MHz`

除周期表点击添加外，应提供可搜索/选择的 Add nucleus 控件，使更多核种可直接加入比较。

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

## 9. 待检查项

- 部分 solvent 的 deuterated formula / residual isotopologue 需要逐项确认；
- impurity formula / CAS / local structure metadata 目前不全部存在于文献数据中，需区分外部元数据；
- Pages 需确认仓库是否已启用 GitHub Actions deployment；
- 响应式布局完成后需用至少 1920、1440、1024 和手机宽度检查。
