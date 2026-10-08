# NMR Atlas — 当前需求与实现约束

更新日期：2026-10-08

本文件保存当前有效的功能、设计决定、数据边界与待检查事项。实际代码和部署检查决定当前实现状态；已废止的方案由 Git 历史追溯，不继续追加多轮修订记录。

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

- 采用约 38.2% : 61.8% 的元素主区与核素区比例；多核素在右侧横向分列，保留 table400.tex 的几何关系。
- 方格接近正方形，最大宽度受页面容器约束，不把周期表直接铺满 viewport。
- 核素字号随同一元素核素数量调整：1 个约 10px，2 个约 9px，3 个及以上约 7.8px。
- 周期表有独立的配色选择器，颜色只作用于周期表数据区，不改变主站品牌色。详细选项见第 8 节。

### 2.4 响应式布局

按现有 `assets/periodic.js` 的阈值分段：
- `innerWidth >= 1550`：18 group 完整 Full 周期表。
- `760 <= innerWidth < 1550`：Split，s/p、d、f 分区。
- `innerWidth < 760`：Sectioned，分段周期表，可局部横向滚动。
- Full 版主表 grid row 2–7，row 8 留约半个 cell 间隙，lanthanides / actinides 位于 row 9 / 10；分段布局保持相近的分区间隔。

### 2.5 自旋筛选

Spin filter 必须作用于核素级：

- `I = 1/2` 仅显示符合条件的 isotope；
- `I > 1/2` 仅显示符合条件的 isotope；
- 同一元素同时含两类核素时，不得把另一类核素继续显示；
- 元素只要存在符合条件的核素，元素符号区域保持正常；
- 完全没有符合条件核素的元素整体弱化；
- 无有效核自旋数据的占位项不混入 `I > 1/2`。

### 2.6 元素/核素局部信息

元素或核素 hover 约 300–400 ms 后显示局部 inspector，不放大整张周期表；离开元素和 inspector 后短延迟关闭。核素格不使用浏览器原生 `title` 提示，保留可访问名称（`aria-label`），悬浮时只显示自定义 inspector。

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

- 采用单层 cross-solvent matrix，一个 impurity 一行；列为 `Compound | CDCl3 | acetone-d6 | DMSO-d6 | CD3CN | CD3OD | D2O`。
- 各 solvent cell 直接列出全部可靠的 shift、assignment/site、multiplicity 与来源给出的 J，不显示 `+N signals`、展开箭头、`click for assignments` 或额外详情区域；每格按高 ppm 到低 ppm 排序。
- 每条 resonance 使用两行：第一行 `δ / ppm | assignment`，第二行 `multiplicity, J / Hz` 并占满宽度；不强制三列同排造成溢出。
- 图例集中标明 `δ / ppm | assignment | multiplicity, J / Hz`，峰位前不重复写 δ。
- Compound 列展示结构、名称、formula、可用时的 CAS；图片无框、不展示空 `structure` 占位。未取得的数据不补造。
- Compound 列约 230–260 px；溶剂列给出可读宽度，整体可水平滚动；表头与第一列 sticky，字号不通过压缩至 9–10px 来硬塞七列。

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

## 8. 当前界面与品牌约束

- 正式网页入口：<https://plastocyanin.org/nmr-atlas/>；公开署名 hyphoon，联系邮箱 wuhaifeng@ustc.edu.cn。主站 Workshop 已以 `_projects/nmr-atlas.md` 收录，分类 reference / Reference Tool，不作为首页 featured 项目。
- 当前代码将页面逻辑分为 `assets/core.js`、`assets/periodic.js`、`assets/references.js`、`assets/app.js`，由 `index.html` 加载；保持内部 ES module 引用版本与入口脚本一致，以免浏览器旧缓存导致页面初始化失败。
- 独立工具页头不复用主站整行导航：`plastocyanin.` 链接主站，`NMR Atlas` 链接工具主页；`WORKSHOP / NMR ATLAS` breadcrumb 返回 Workshop。页尾品牌分别可点击。
- 共用品牌默认深蓝灰 `#203139`，hover / active / focus 使用 `#355c7d` 与细下划线；`plastocyanin.` 的金色 o 和末尾圆点始终采用 `#b68c37`。NMR Atlas 字样整体为深蓝灰，无额外金色字母。详见主仓库 `docs/SITE_STYLE_GUIDE.md`。
- 一般 `.container` 最大宽度 1440px，宽幅 `.atlas-wide` 最大宽度 1680px；周期表的背景使用站点统一 `--bg`，分隔线宽度对齐对应内容容器。
- 周期表配色通过一个带当前名称、三色预览和展开箭头的 palette picker 切换；点击外部或 Escape 关闭，通过 `localStorage` 保存。正式方案为：Reference / Wave；Scientific / JACS、Muted、Grayscale；Prism / Pastel、Classic；Matplotlib / Set2；Continuous / Cividis。
- Wave 使用 table400.tex 的配色：元素底色 `#2E58A4`、文字 `#FFFFFF`，I = 1/2 底色 `#FFC000`、文字 `#002060`，I > 1/2 底色 `#E3DED4`、文字 `#002060`，轮廓 `#002060`。JACS 采用 `#DCE8F0 / #E9D8AF / #E5E7E8`、Muted 采用 `#DCE5EC / #E8DDD2 / #DFE6E1` 等适合高密度文字阅读的浅色映射；其余实际色值以代码为准。Atlas / Mineral / Mono 等旧方案已停用。
- Solvent Signals：两列选择器、无框结构图、formula 与 residual protonated isotopologue/species 说明，¹H/¹³C 棒状图支持滚轮围绕指针缩放和双击重置；不保留没有信息含量的底部 DATA NOTES。
- Impurity Signals：长列表不再折叠；每条信号按上一节的两行格式展示。保留 sticky header / first column、可读字号与水平滚动。

## 9. 现有数据与检查边界

- 周期表与核种比较保留来自 `table400.tex` 的核种数据；¹H 频率范围为 1 kHz–2.0 GHz，B₀ 与频率双向联动，公共 `Δδ / ppm` 默认为 1，`Δν / Hz = Δδ / ppm × ν₀ / MHz`。
- Solvent Signals 数据依据 Cambridge Isotope Laboratories, *NMR Solvent Data Chart*；Impurity Signals 的位移依据 Babij, N. R. et al., *Org. Process Res. Dev.* **2016**, 20, 661–667，DOI: `10.1021/acs.oprd.5b00417` 及其补充资料。结构、formula、CAS 或 SMILES 如采用 PubChem 等外部元数据，不得与论文实测数据混为同一来源。
- 静态页面通过 `.github/workflows/pages.yml` 进行 `node --check`、`$()` 误用 `.forEach` 的检查与 Pages 发布；各 JS 模块必须具有一致的查询版本。Actions 成功与实际页面加载、科学数值核验应分别记录。
- 待核对：部分 deuterated formula / residual isotopologue 的精确归属、杂质 formula/CAS/结构来源；核素数据的数值精度与低场单位；至少 1920 / 1440 / 1024 / 手机宽度下的布局；实际浏览器的 palette picker、hover inspector、标签筛选、核种比较与谱图缩放；Pages 最新提交及公开页面加载。
