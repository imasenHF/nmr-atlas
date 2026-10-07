const gammaH=42.57747892;
const MHZ_MIN=0.1;
const MHZ_MAX=2000;
const mediaOrder=['CDCl3','acetone-d6','DMSO-d6','CD3CN','CD3OD','D2O'];
const aliases={
  'MIBK':'methyl isobutyl ketone','DMPU':'1,3-dimethyl-3,4,5,6-tetrahydro-2(1H)-pyrimidinone',
  'MTBE':'methyl tert-butyl ether','ETBE':'ethyl tert-butyl ether','TAME':'tert-amyl methyl ether',
  'CPME':'cyclopentyl methyl ether','2-MeTHF':'2-methyltetrahydrofuran','L-ethyl lactate':'ethyl L-lactate',
  'iso-propanol':'isopropanol','iso-butanol':'isobutanol','iso-amyl alcohol':'isoamyl alcohol',
  'iso-amyl acetate':'isoamyl acetate','iso-butyl acetate':'isobutyl acetate','iso-propyl acetate':'isopropyl acetate',
  'ethyl benzene':'ethylbenzene','dimethyl sulfoxide':'dimethyl sulfoxide','methyl ethyl ketone':'2-butanone',
  'p-cymene':'p-cymene','xylenes':'xylene'
};
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const state={field:9.39464,pins:[],filter:'all',query:'',solventIndex:0,solventNucleus:'1H',impurityNucleus:'1H'};
let elements=[],solventData=[],impurityData=[];
const presets=[5,20,43,60,80,100,300,400,500,600,800,1000,1200];
const fmt=(v,n=2)=>Number(v).toFixed(n);
const sup=n=>String(n).replace(/\d/g,d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]);
const nuclideLabel=(mass,symbol)=>mass?`${sup(mass)}${symbol}`:symbol;
const frequencyMhz=g=>g===''||g==null||Number.isNaN(Number(g))?null:Math.abs(Number(g))*state.field;
const frequencyText=mhz=>{
  if(mhz==null||Number.isNaN(mhz))return '—';
  if(mhz>=1000)return `${(mhz/1000).toFixed(mhz>=10000?2:3)} GHz`;
  if(mhz>=1)return `${mhz.toFixed(mhz>=100?2:3)} MHz`;
  if(mhz>=0.001)return `${(mhz*1000).toFixed(mhz>=0.1?1:2)} kHz`;
  return `${(mhz*1e6).toFixed(1)} Hz`;
};
const mhzToSlider=mhz=>Math.round((Math.log10(mhz)-Math.log10(MHZ_MIN))/(Math.log10(MHZ_MAX)-Math.log10(MHZ_MIN))*1000);
const sliderToMhz=v=>10**(Math.log10(MHZ_MIN)+(Number(v)/1000)*(Math.log10(MHZ_MAX)-Math.log10(MHZ_MIN)));
const parseShift=s=>{const m=String(s||'').match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):null};
const structureName=name=>aliases[name]||name;
const pubchemUrl=name=>`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(structureName(name))}/PNG?record_type=2d&image_size=small`;

async function loadData(){
  try{
    const res=await fetch('data/nmr-data.json.gz.b64');
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    let text;
    if('DecompressionStream' in window){
      const b64=(await res.text()).trim();
      const bin=atob(b64);
      const bytes=new Uint8Array(bin.length);
      for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
      const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      text=await new Response(stream).text();
    }else{
      throw new Error('Browser lacks DecompressionStream support');
    }
    const data=JSON.parse(text);elements=data.isotopes;solventData=data.solvents;impurityData=data.impurities;
  }catch(err){
    document.querySelector('main').innerHTML=`<section class="container loading"><h1>NMR Atlas</h1><p>数据加载失败：${String(err.message||err)}</p><p>请使用现代浏览器并通过 HTTP/HTTPS 打开页面。</p></section>`;
    throw err;
  }
}

function initPresets(){
  const w=$('#presetButtons');
  presets.forEach(m=>{const b=document.createElement('button');b.textContent=m>=1000?`${(m/1000).toFixed(1)}G`:String(m);b.dataset.mhz=m;b.onclick=()=>setProton(m);w.appendChild(b)});
}
function setField(v){
  const minT=MHZ_MIN/gammaH,maxT=MHZ_MAX/gammaH;
  v=Math.max(minT,Math.min(maxT,Number(v)||state.field));state.field=v;
  const h=v*gammaH;
  $('#fieldInput').value=fmt(v,v<0.1?6:5);$('#protonInput').value=fmt(h,h<10?3:2);$('#fieldSlider').value=mhzToSlider(h);
  $('#nominalField').textContent=frequencyText(h);$('#fieldExact').textContent=`${fmt(v,v<0.1?6:5)} T`;
  $$('#presetButtons button').forEach(b=>b.classList.toggle('active',Math.abs(Number(b.dataset.mhz)-h)<0.01));
  renderFrequencies();renderSelected();renderConverter();updateUrl();
}
function setProton(mhz){const value=Math.max(MHZ_MIN,Math.min(MHZ_MAX,Number(mhz)||state.field*gammaH));setField(value/gammaH)}

function elementGridPosition(e){
  const col=Math.round(Number(e.x)/2.618)+1;
  const y=Number(e.y);
  let row;
  if(y>-14)row=Math.round(-y/2.618)+2;
  else if(y>-17.5)row=9;
  else row=10;
  return {col,row};
}
function isotopeButton(e,i){
  const d=document.createElement('button');
  const spinClass=i.spin==='1/2'?'half':'other';
  d.className=`isotope-cell ${spinClass}`;d.dataset.spinClass=spinClass;d.dataset.symbol=e.symbol;d.dataset.mass=i.mass;d.dataset.gamma=i.gamma;
  d.dataset.search=`${i.mass}${e.symbol} ${e.name} ${e.symbol}`.toLowerCase();
  d.innerHTML=`<span class="mass"><sup>${i.mass||''}</sup>${e.symbol}</span><span class="meta">I = ${i.spin||'—'}</span><span class="meta">${i.abundance||'—'}%</span><span class="meta gamma">γ ${i.gamma||'—'}</span><span class="freq">${i.gamma?frequencyText(frequencyMhz(i.gamma)):'—'}</span>`;
  d.title=`${i.mass}${e.symbol}: I=${i.spin||'n/a'}, abundance ${i.abundance||'n/a'}%, γ/2π ${i.gamma||'n/a'} MHz/T`;
  d.onclick=()=>togglePin(e,i);return d;
}
function renderPeriodic(){
  const root=$('#periodicTable');root.innerHTML='';
  for(let g=1;g<=18;g++){const n=document.createElement('div');n.className='group-number';n.style.gridColumn=g;n.textContent=g;root.appendChild(n)}
  elements.forEach(e=>{
    const b=document.createElement('div');b.className='element-block';b.dataset.element=e.symbol;b.dataset.search=`${e.symbol} ${e.name} ${e.atomic_number}`.toLowerCase();
    const {col,row}=elementGridPosition(e);b.style.gridColumn=col;b.style.gridRow=row;
    const main=document.createElement('div');main.className='element-main';main.innerHTML=`<span class="z">${e.atomic_number}</span><span class="symbol">${e.symbol}</span><span class="name">${e.name}</span><span class="range">${e.shift_range||''}</span>`;b.appendChild(main);
    e.isotopes.forEach(i=>b.appendChild(isotopeButton(e,i)));root.appendChild(b);
  });applyFilter();
}
function renderFrequencies(){
  $$('.isotope-cell').forEach(d=>{const f=d.querySelector('.freq'),g=d.dataset.gamma;f.textContent=g?frequencyText(frequencyMhz(g)):'—';const key=d.dataset.mass+d.dataset.symbol;d.classList.toggle('pinned',state.pins.some(p=>p.key===key))});
}
function togglePin(e,i){const key=i.mass+e.symbol,idx=state.pins.findIndex(p=>p.key===key);if(idx>=0)state.pins.splice(idx,1);else state.pins.push({key,symbol:e.symbol,name:e.name,...i});renderFrequencies();renderSelected();renderConverter();updateUrl()}
function renderSelected(){
  const root=$('#selectedNuclei'),bars=$('#frequencyBars');root.innerHTML='';bars.innerHTML='';$('#selectedEmpty').hidden=state.pins.length>0;
  const max=Math.max(1,...state.pins.map(p=>frequencyMhz(p.gamma)||0));
  state.pins.forEach((p,idx)=>{const r=document.createElement('div');r.className='selected-row';const f=frequencyMhz(p.gamma);r.innerHTML=`<div class="nuclide">${nuclideLabel(p.mass,p.symbol)}</div><div><strong>${p.name}</strong><div class="details">I = ${p.spin||'—'} · abundance ${p.abundance||'—'}% · R = ${p.receptivity||'—'}</div></div><div class="selected-freq">${frequencyText(f)}</div><div class="gamma-value">γ/2π ${p.gamma||'—'}</div><button class="remove-pin" aria-label="remove ${p.key}">×</button>`;r.querySelector('button').onclick=()=>{state.pins.splice(idx,1);renderFrequencies();renderSelected();renderConverter();updateUrl()};root.appendChild(r);
    if(f){const br=document.createElement('div');br.className='bar-row';br.innerHTML=`<b>${nuclideLabel(p.mass,p.symbol)}</b><div class="bar-track"><div class="bar-fill" style="width:${(f/max)*100}%"></div></div><span>${frequencyText(f)}</span>`;bars.appendChild(br)}
  });
}
function applyFilter(){
  const q=state.query.trim().toLowerCase();
  $$('.element-block').forEach(b=>{
    const elementText=b.dataset.search;let visibleCount=0;let queryHit=!q||elementText.includes(q);
    b.querySelectorAll('.isotope-cell').forEach(c=>{
      const spinPass=state.filter==='all'||c.dataset.spinClass===state.filter;
      let queryPass=true;
      if(q&&/\d/.test(q))queryPass=c.dataset.search.includes(q);
      else if(q)queryPass=elementText.includes(q)||c.dataset.search.includes(q);
      const show=spinPass&&queryPass;c.classList.toggle('filtered-out',!show);if(show){visibleCount++;queryHit=true}
    });
    const noMatch=visibleCount===0;b.classList.toggle('no-match',noMatch);b.classList.toggle('query-match',!!q&&queryHit&&!noMatch);b.classList.toggle('query-no-match',!!q&&!queryHit);
  });
}
function initFilters(){
  $$('#spinFilters button').forEach(b=>b.onclick=()=>{$$('#spinFilters button').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.filter=b.dataset.filter;applyFilter()});
  $('#nucleusSearch').addEventListener('input',e=>{state.query=e.target.value;applyFilter()});
}
function renderConverter(){
  const sel=$('#converterNucleus'),current=sel.value;sel.innerHTML='';
  const fallback=['1H','13C','19F','31P'];
  const choices=state.pins.length?state.pins:elements.flatMap(e=>e.isotopes.map(i=>({symbol:e.symbol,...i,key:i.mass+e.symbol}))).filter(x=>fallback.includes(x.key));
  choices.forEach(p=>{const o=document.createElement('option');o.value=p.key;o.textContent=nuclideLabel(p.mass,p.symbol);sel.appendChild(o)});if([...sel.options].some(o=>o.value===current))sel.value=current;
  const p=choices.find(x=>x.key===sel.value)||choices[0],freq=p?frequencyMhz(p.gamma):null,ppm=Number($('#ppmInput').value)||0;
  $('#hzOutput').textContent=freq?`${fmt(ppm*freq,3)} Hz`:'—';$('#converterFrequency').textContent=freq?`${frequencyText(freq)} @ ${fmt(state.field,state.field<.1?6:5)} T`:'No frequency';
}

function setupStructure(img,fallback,name){
  fallback.textContent='structure';fallback.hidden=false;img.hidden=false;img.src=pubchemUrl(name);
  img.onload=()=>{fallback.hidden=true};img.onerror=()=>{img.hidden=true;fallback.hidden=false;fallback.textContent=structureName(name)};
}
function renderSolventList(){
  const root=$('#solventList');root.innerHTML='';solventData.forEach((s,idx)=>{const b=document.createElement('button');b.className=`solvent-choice${idx===state.solventIndex?' active':''}`;b.textContent=s.name;b.onclick=()=>{state.solventIndex=idx;renderSolventList();renderSolventViewer()};root.appendChild(b)})
}
function makeStickPlot(signals,hod,nucleus){
  const root=$('#solventStickPlot');root.innerHTML='';const max=nucleus==='1H'?12:220;
  for(let i=0;i<=10;i++){const t=document.createElement('span');t.className='axis-tick';t.style.left=`${i*10}%`;t.textContent=(max*(1-i/10)).toFixed(nucleus==='1H'?1:0);root.appendChild(t)}
  signals.forEach((raw,idx)=>{const v=parseShift(raw);if(v==null)return;const x=(max-v)/max*100;const line=document.createElement('i');line.className='stick';line.style.left=`${Math.max(0,Math.min(100,x))}%`;line.style.height=`${55+(idx%4)*18}%`;line.dataset.label=String(v);line.title=raw;root.appendChild(line)});
  if(nucleus==='1H'&&hod){const v=parseShift(hod);if(v!=null){const x=(max-v)/max*100;const line=document.createElement('i');line.className='stick hod';line.style.left=`${Math.max(0,Math.min(100,x))}%`;line.style.height='38%';line.dataset.label='HOD';line.title=`HOD ${hod}`;root.appendChild(line)}}
}
function renderSolventViewer(){
  const s=solventData[state.solventIndex];if(!s)return;$('#solventName').textContent=s.name;$('#solventNote').textContent=state.solventNucleus==='1H'?'Residual ¹H and HOD reference':'Residual ¹³C reference';
  setupStructure($('#solventStructure'),$('#solventStructureFallback'),s.name);const signals=state.solventNucleus==='1H'?s.h1:s.c13;$('#solventPlotNucleus').textContent=state.solventNucleus==='1H'?'¹H':'¹³C';makeStickPlot(signals,s.hod,state.solventNucleus);
  const list=$('#solventSignalList');list.innerHTML='';signals.forEach((v,idx)=>{const p=document.createElement('span');p.className='signal-pill';let j=state.solventNucleus==='1H'?(s.j_hz||[])[idx]:(s.jc_hz||[])[idx];p.textContent=`δ ${v}${j&&j!=='NA'?` · J ${j} Hz`:''}`;list.appendChild(p)});if(state.solventNucleus==='1H'&&s.hod){const p=document.createElement('span');p.className='signal-pill';p.textContent=`HOD δ ${s.hod}`;list.appendChild(p)}
}
function initSolvents(){
  renderSolventList();renderSolventViewer();$$('#solventNucleusToggle button').forEach(b=>b.onclick=()=>{$$('#solventNucleusToggle button').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.solventNucleus=b.dataset.nucleus;renderSolventViewer()})
}

function impurityGroups(){
  const q=$('#impuritySearch').value.trim().toLowerCase(),map=new Map();
  impurityData.filter(r=>r.nucleus===state.impurityNucleus).forEach(r=>{if(q&&!`${r.compound} ${aliases[r.compound]||''}`.toLowerCase().includes(q))return;if(!map.has(r.compound))map.set(r.compound,[]);map.get(r.compound).push(r)});return [...map.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
}
function compactSignals(rows){
  const vals=rows.map(r=>r.shift).filter(Boolean);if(!vals.length)return '<span class="empty">—</span>';const shown=vals.slice(0,4);return `${shown.map(v=>`δ ${v}`).join('<br>')}${vals.length>4?`<br><span class="more">+${vals.length-4} signals</span>`:''}`;
}
function renderImpurities(){
  const root=$('#impurityGroups');root.innerHTML='';const groups=impurityGroups();
  groups.forEach(([name,rows])=>{
    const group=document.createElement('article');group.className='impurity-group';const summary=document.createElement('button');summary.className='impurity-summary';summary.type='button';summary.setAttribute('aria-expanded','false');
    const compound=document.createElement('span');compound.className='compound-cell';const img=document.createElement('img');img.className='compound-thumb';img.loading='lazy';img.alt='';const fallback=document.createElement('span');fallback.className='compound-thumb-fallback';fallback.textContent='structure';const label=document.createElement('span');label.innerHTML=`<strong>${name}</strong><small>${rows.length} ${state.impurityNucleus} resonances · click for assignments</small>`;compound.append(img,fallback,label);setupStructure(img,fallback,name);summary.appendChild(compound);
    mediaOrder.forEach(m=>{const cell=document.createElement('span');const rs=rows.filter(r=>r.medium===m);cell.className=`medium-cell${rs.length?'':' empty'}`;cell.innerHTML=compactSignals(rs);summary.appendChild(cell)});
    const detail=document.createElement('div');detail.className='impurity-detail';const grid=document.createElement('div');grid.className='detail-grid';mediaOrder.forEach(m=>{const box=document.createElement('div');box.className='detail-medium';const rs=rows.filter(r=>r.medium===m);box.innerHTML=`<h4>${m}</h4>${rs.length?`<table><tbody>${rs.map(r=>`<tr><td>${r.shift}</td><td>${r.site||'—'}${r.multiplicity?`<br>${r.multiplicity}`:''}</td></tr>`).join('')}</tbody></table>`:'<span class="reference-note">No reported signal</span>'}`;grid.appendChild(box)});detail.appendChild(grid);
    summary.onclick=()=>{group.classList.toggle('open');summary.setAttribute('aria-expanded',group.classList.contains('open')?'true':'false')};group.append(summary,detail);root.appendChild(group);
  });
  if(!groups.length)root.innerHTML='<div class="empty-state">未找到匹配杂质。</div>';
}
function initImpurities(){
  renderImpurities();$('#impuritySearch').oninput=renderImpurities;$$('#impurityNucleusToggle button').forEach(b=>b.onclick=()=>{$$('#impurityNucleusToggle button').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.impurityNucleus=b.dataset.nucleus;renderImpurities()})
}
function updateUrl(){const p=new URLSearchParams();p.set('field',fmt(state.field,state.field<.1?6:5));if(state.pins.length)p.set('nuclei',state.pins.map(x=>x.key).join(','));history.replaceState(null,'',location.pathname+'?'+p.toString()+location.hash)}
function restoreUrl(){const p=new URLSearchParams(location.search);if(p.has('field'))state.field=Number(p.get('field'))||state.field;const keys=(p.get('nuclei')||'1H,13C,19F,31P').split(',').filter(Boolean);state.pins=[];for(const key of keys){for(const e of elements){const iso=e.isotopes.find(i=>i.mass+e.symbol===key);if(iso){state.pins.push({key,symbol:e.symbol,name:e.name,...iso});break}}}}

await loadData();restoreUrl();initPresets();renderPeriodic();initFilters();initSolvents();initImpurities();
$('#fieldInput').addEventListener('change',e=>setField(e.target.value));$('#protonInput').addEventListener('change',e=>setProton(e.target.value));$('#fieldSlider').addEventListener('input',e=>setProton(sliderToMhz(e.target.value)));$('#clearPins').onclick=()=>{state.pins=[];renderFrequencies();renderSelected();renderConverter();updateUrl()};$('#converterNucleus').onchange=renderConverter;$('#ppmInput').oninput=renderConverter;$('#currentYear').textContent=new Date().getFullYear();setField(state.field);renderSelected();renderConverter();
