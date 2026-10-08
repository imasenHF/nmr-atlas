# NMR Atlas

NMR Atlas 是 plastocyanin Workshop 下的交互式 NMR 参考工具，当前包含：

- 可随磁场实时计算工作频率的 NMR 周期表；
- 低场至高场的 B0 / 1H frequency 双向换算；
- 核自旋筛选和多核比较；
- ppm / Hz 换算；
- 氘代溶剂残余 1H / 13C 与 HOD 信号；
- 常见工艺/实验杂质在六种氘代介质中的跨溶剂比较。

## Data sources

- Isotope parameters: source dataset from `table400.tex` supplied for this project.
- Hover inspector isotope list: supplementary nuclide entries from user-provided `initialize_global_variables.py`, merged with the existing NMR table (which takes precedence for overlapping values). The file is not a complete isotope database; zero-spin nuclei have no NMR frequency and unavailable sensitivity values remain blank.
- Cambridge Isotope Laboratories, *NMR Solvent Data Chart*.
- Babij, N. R. et al. *Org. Process Res. Dev.* **2016**, 20, 661–667. DOI: 10.1021/acs.oprd.5b00417, including Supporting Information.

Chemical shifts depend on experimental conditions. The reference values are intended for identification and comparison rather than as universal fixed constants.

## Development

This is a static site. Serve the repository root with an HTTP server; direct `file://` opening cannot load the compressed dataset in all browsers.

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Public identity

Author: hyphoon  
Contact: wuhaifeng@ustc.edu.cn
