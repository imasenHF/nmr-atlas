export const gammaH=42.57747892, MHZ_MIN=0.001, MHZ_MAX=2000;
export const mediaOrder=['CDCl3','acetone-d6','DMSO-d6','CD3CN','CD3OD','D2O'];
export const groupMapSP=new Map([[1,1],[2,2],[13,3],[14,4],[15,5],[16,6],[17,7],[18,8]]);
export const aliases={
'MIBK':'methyl isobutyl ketone','DMPU':'1,3-dimethyl-3,4,5,6-tetrahydro-2(1H)-pyrimidinone','MTBE':'methyl tert-butyl ether','ETBE':'ethyl tert-butyl ether','TAME':'tert-amyl methyl ether','CPME':'cyclopentyl methyl ether','2-MeTHF':'2-methyltetrahydrofuran','L-ethyl lactate':'ethyl L-lactate','iso-propanol':'isopropanol','iso-butanol':'isobutanol','iso-amyl alcohol':'isoamyl alcohol','iso-amyl acetate':'isoamyl acetate','iso-butyl acetate':'isobutyl acetate','iso-propyl acetate':'isopropyl acetate','ethyl benzene':'ethylbenzene','methyl ethyl ketone':'2-butanone','xylenes':'xylene'};
export const impurityFormula={
'2-MeTHF':'C5H10O','CPME':'C6H12O','DMPU':'C6H12N2O','ETBE':'C6H14O','L-ethyl lactate':'C5H10O3','MIBK':'C6H12O','MTBE':'C5H12O','TAME':'C6H14O','acetic acid':'C2H4O2','acetic anhydride':'C4H6O3','acetone':'C3H6O','acetonitrile':'C2H3N','anisole':'C7H8O','benzyl alcohol':'C7H8O','chlorobenzene':'C6H5Cl','cyclohexane':'C6H12','cyclohexanone':'C6H10O','dichloromethane':'CH2Cl2','dimethyl carbonate':'C3H6O3','dimethyl sulfoxide':'C2H6OS','ethanol':'C2H6O','ethyl acetate':'C4H8O2','ethylbenzene':'C8H10','ethylene glycol':'C2H6O2','formic acid':'CH2O2','glycol diacetate':'C6H10O4','iso-amyl acetate':'C7H14O2','iso-amyl alcohol':'C5H12O','iso-butanol':'C4H10O','iso-butyl acetate':'C6H12O2','iso-propanol':'C3H8O','iso-propyl acetate':'C5H10O2','m-xylene':'C8H10','methanol':'CH4O','methyl acetate':'C3H6O2','methyl cyclohexane':'C7H14','methyl ethyl ketone':'C4H8O','n-butanol':'C4H10O','n-butyl acetate':'C6H12O2','n-heptane':'C7H16','o-xylene':'C8H10','p-cymene':'C10H14','p-xylene':'C8H10','pyridine':'C5H5N','sulfolane':'C4H8O2S','tert-butanol':'C4H10O','tetrahydrofuran':'C4H8O','toluene':'C7H8'};
export const solventMeta={
'Acetic Acid-d4':{formula:'C2D4O2',structure:'acetic acid-d4',residual:'Residual protonated isotopologue / exchangeable H-containing species'},
'Acetone-d6':{formula:'C3D6O',structure:'acetone-d6',residual:'Residual isotopologue: acetone-d5H · C3HD5O'},
'Acetonitrile-d3':{formula:'C2D3N',structure:'acetonitrile-d3',residual:'Residual isotopologue: acetonitrile-d2H · C2HD2N'},
'Benzene-d6':{formula:'C6D6',structure:'benzene-d6',residual:'Residual isotopologue: benzene-d5H · C6HD5'},
'Chloroform-d':{formula:'CDCl3',structure:'chloroform-d',residual:'Residual protonated species: CHCl3'},
'Cyclohexane-d12':{formula:'C6D12',structure:'cyclohexane-d12',residual:'Residual protonated isotopologue · C6HD11'},
'Deuterium Oxide':{formula:'D2O',structure:'deuterium oxide',residual:'Residual protonated species: HOD'},
'N,N-Dimethylformamide-d7':{formula:'C3D7NO',structure:'N,N-dimethylformamide-d7',residual:'Residual protonated isotopologue'},
'Dimethyl Sulfoxide-d6':{formula:'C2D6OS',structure:'dimethyl sulfoxide-d6',residual:'Residual isotopologue: DMSO-d5H · C2HD5OS'},
'1,4-Dioxane-d8':{formula:'C4D8O2',structure:'1,4-dioxane-d8',residual:'Residual protonated isotopologue · C4HD7O2'},
'Ethanol-d6':{formula:'C2D6O',structure:'ethanol-d6',residual:'Residual protonated isotopologue / exchangeable H-containing species'},
'Methanol-d4':{formula:'CD4O',structure:'methanol-d4',residual:'Residual protonated isotopologue / exchangeable H-containing species'},
'Methylene Chloride-d2':{formula:'CD2Cl2',structure:'dichloromethane-d2',residual:'Residual isotopologue: CHDCl2'},
'Pyridine-d5':{formula:'C5D5N',structure:'pyridine-d5',residual:'Residual isotopologue: pyridine-d4H · C5HD4N'},
'1,1,2,2-Tetrachloroethane-d2':{formula:'C2D2Cl4',structure:'1,1,2,2-tetrachloroethane-d2',residual:'Residual protonated isotopologue · C2HDCl4'},
'Tetrahydrofuran-d8':{formula:'C4D8O',structure:'tetrahydrofuran-d8',residual:'Residual isotopologue: THF-d7H · C4HD7O'},
'Toluene-d8':{formula:'C7D8',structure:'toluene-d8',residual:'Residual protonated isotopologue · C7HD7'},
'Trifluoroacetic Acid-d':{formula:'C2DF3O2',structure:'trifluoroacetic acid-d',residual:'Residual protonated species: CF3COOH'},
'Trifluoroethanol-d3':{formula:'C2D3F3O',structure:'2,2,2-trifluoroethanol-d3',residual:'Residual protonated isotopologue / exchangeable H-containing species'}};
export const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
export const state={field:9.39464,pins:[],filter:'all',query:'',solventIndex:0,solventNucleus:'1H',impurityNucleus:'1H',layout:null,inspector:null};
export let elements=[],solventData=[],impurityData=[];
export function setData(d){elements=d.isotopes;solventData=d.solvents;impurityData=d.impurities}
export const fmt=(v,n=2)=>Number(v).toFixed(n);
export const sup=n=>String(n).replace(/\d/g,d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]);
export const nuclideLabel=(mass,symbol)=>mass?`${sup(mass)}${symbol}`:symbol;
export const parseNumber=x=>{const n=Number(String(x??'').replace(/,/g,''));return Number.isFinite(n)?n:null};
export const displayNumber=(x,d=2)=>{const n=parseNumber(x);return n==null?String(x||'—'):n.toFixed(d)};
export const compactNumber=x=>{const n=parseNumber(x);if(n==null)return String(x||'—');if(Math.abs(n)>=1000)return n.toFixed(0);if(Math.abs(n)>=100)return n.toFixed(1);return n.toFixed(2)};
export const frequencyMhz=g=>g===''||g==null||Number.isNaN(Number(g))?null:Math.abs(Number(g))*state.field;
export const currentTableUnit=()=>{const h=state.field*gammaH;return h>=1?'MHz':h>=0.001?'kHz':'Hz'};
export const frequencyInUnit=mhz=>{const u=currentTableUnit();if(mhz==null)return null;return u==='MHz'?mhz:u==='kHz'?mhz*1000:mhz*1e6};
export const frequencyText=mhz=>{if(mhz==null||Number.isNaN(mhz))return '—';if(mhz>=1000)return `${(mhz/1000).toFixed(2)} GHz`;if(mhz>=1)return `${mhz.toFixed(2)} MHz`;if(mhz>=0.001)return `${(mhz*1000).toFixed(2)} kHz`;return `${(mhz*1e6).toFixed(2)} Hz`};
export const mhzToSlider=mhz=>Math.round((Math.log10(mhz)-Math.log10(MHZ_MIN))/(Math.log10(MHZ_MAX)-Math.log10(MHZ_MIN))*1000);
export const sliderToMhz=v=>10**(Math.log10(MHZ_MIN)+(Number(v)/1000)*(Math.log10(MHZ_MAX)-Math.log10(MHZ_MIN)));
export const parseShift=s=>{const m=String(s||'').match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):null};
export const structureName=name=>aliases[name]||name;
export const pubchemImage=name=>`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(structureName(name))}/PNG?record_type=2d&image_size=large`;
export async function loadData(){const parts=await Promise.all([1,2,3,4].map(async n=>{const r=await fetch(`data/nmr-data.part${n}`);if(!r.ok)throw new Error(`data part ${n}: HTTP ${r.status}`);return r.text()}));if(!('DecompressionStream' in window))throw new Error('Browser lacks DecompressionStream support');const bin=atob(parts.join('').trim()),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));setData(JSON.parse(await new Response(stream).text()))}