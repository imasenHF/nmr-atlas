import{$,$$,state,elements,gammaH,MHZ_MIN,MHZ_MAX,groupMapSP,fmt,displayNumber,compactNumber,frequencyMhz,currentTableUnit,frequencyInUnit,frequencyText,mhzToSlider,sliderToMhz,nuclideLabel,parseNumber}from'./core.js?v=20261008-palette4';

const presets=[1,5,20,43,60,80,100,300,400,500,600,800,1000,1200];
const fullPosition=e=>{const col=Math.round(Number(e.x)/2.618)+1,y=Number(e.y);let row;if(y>-14)row=Math.round(-y/2.618)+2;else if(y>-17.5)row=9;else row=10;return{col,row,period:row-1}};
const layoutMode=()=>innerWidth>=1550?'full':innerWidth>=760?'split':'sectioned';
const spinClass=i=>i.spin==='1/2'?'half':i.spin?'other':'unknown';
const keyFor=(e,i)=>`${i.mass}${e.symbol}`;
let hoverOpenTimer=null,hoverCloseTimer=null,lastAnchor=null;

export function initPresets(){
  const w=$('#presetButtons');w.innerHTML='';
  presets.forEach(m=>{const b=document.createElement('button');b.textContent=m>=1000?`${(m/1000).toFixed(1)}G`:String(m);b.dataset.mhz=m;b.onclick=()=>setProton(m);w.appendChild(b)});
}

export function setField(v){
  const minT=MHZ_MIN/gammaH,maxT=MHZ_MAX/gammaH;
  v=Math.max(minT,Math.min(maxT,Number(v)||state.field));state.field=v;
  const h=v*gammaH;
  $('#fieldInput').value=fmt(v,v<.1?6:5);
  $('#protonInput').value=fmt(h,h<10?3:2);
  $('#fieldSlider').value=mhzToSlider(h);
  $('#nominalField').textContent=frequencyText(h);
  $('#fieldExact').textContent=`${fmt(v,v<.1?6:5)} T`;
  $$('#presetButtons button').forEach(b=>b.classList.toggle('active',Math.abs(Number(b.dataset.mhz)-h)<.01));
  renderFrequencies();renderComparison();renderInspector();updateUrl();
}
export const setProton=mhz=>setField(Math.max(MHZ_MIN,Math.min(MHZ_MAX,Number(mhz)||state.field*gammaH))/gammaH);

function abundanceValue(i){const n=parseNumber(i.abundance);return n==null?-Infinity:n}
function matchesSpin(i){const cls=spinClass(i);return state.filter==='all'?cls!=='unknown':cls===state.filter}
function primaryIsotope(e){
  const eligible=e.isotopes.filter(i=>i.spin&&i.gamma!==''&&matchesSpin(i));
  return [...eligible].sort((a,b)=>abundanceValue(b)-abundanceValue(a))[0]||null;
}
function togglePin(e,i){
  if(!i)return;
  const k=keyFor(e,i),idx=state.pins.findIndex(p=>p.key===k);
  if(idx>=0)state.pins.splice(idx,1);
  else state.pins.push({key:k,symbol:e.symbol,name:e.name,...i});
  renderFrequencies();renderComparison();renderInspector();updateUrl();
}
function bindHover(node,e,active=null){
  node.addEventListener('mouseenter',()=>scheduleInspector(e,node,active));
  node.addEventListener('mouseleave',scheduleInspectorClose);
}
function scheduleInspector(e,anchor,active=null){
  clearTimeout(hoverCloseTimer);clearTimeout(hoverOpenTimer);
  lastAnchor=anchor;
  hoverOpenTimer=setTimeout(()=>{
    state.inspector={element:e,active:active?keyFor(e,active):null};
    renderInspector();
    positionInspector(anchor);
    $('#isotopeInspector').hidden=false;
  },340);
}
function scheduleInspectorClose(){
  clearTimeout(hoverOpenTimer);clearTimeout(hoverCloseTimer);
  hoverCloseTimer=setTimeout(closeInspector,170);
}
function positionInspector(anchor){
  const panel=$('#isotopeInspector');if(!panel||!anchor)return;
  const r=anchor.getBoundingClientRect(),w=Math.min(540,innerWidth-28),h=Math.min(panel.scrollHeight||360,innerHeight*.68);
  let left=r.right+12,top=r.top;
  if(left+w>innerWidth-14)left=r.left-w-12;
  if(left<14)left=Math.max(14,Math.min(innerWidth-w-14,r.left));
  if(top+h>innerHeight-14)top=innerHeight-h-14;
  if(top<14)top=14;
  panel.style.left=`${left}px`;panel.style.top=`${top}px`;
}

function makeElement(e,p={}){
  const b=document.createElement('div');b.className='element-block';b.dataset.element=e.symbol;b.dataset.search=`${e.symbol} ${e.name} ${e.atomic_number}`.toLowerCase();
  if(p.col)b.style.gridColumn=p.col;if(p.row)b.style.gridRow=p.row;
  const m=document.createElement('button');m.className='element-main';
  m.innerHTML=`<span class="z">${e.atomic_number}</span><span class="symbol">${e.symbol}</span><span class="name">${e.name}</span><span class="range">${e.shift_range||''}</span>`;
  bindHover(m,e);
  m.onclick=()=>togglePin(e,primaryIsotope(e));
  b.appendChild(m);
  const stack=document.createElement('div');stack.className='isotope-stack';
  e.isotopes.forEach(i=>{
    const c=document.createElement('button'),cls=spinClass(i),f=frequencyInUnit(frequencyMhz(i.gamma));
    c.className=`isotope-cell ${cls}`;c.dataset.spinClass=cls;c.dataset.symbol=e.symbol;c.dataset.mass=i.mass;c.dataset.gamma=i.gamma;
    c.dataset.search=`${i.mass}${e.symbol} ${e.name} ${e.symbol}`.toLowerCase();
    c.innerHTML=`<span class="mass"><sup>${i.mass||''}</sup>${e.symbol}</span><span class="line abundance">${displayNumber(i.abundance,2)}</span><span class="line freq">${f==null?'—':Number(f).toFixed(2)}</span><span class="line recept">${compactNumber(i.receptivity)}</span>`;
    c.title=`${i.mass}${e.symbol} · abundance ${displayNumber(i.abundance,2)}% · ${frequencyText(frequencyMhz(i.gamma))} · R ${compactNumber(i.receptivity)}`;
    if(cls==='unknown')c.disabled=true;
    else{
      bindHover(c,e,i);
      c.onclick=ev=>{ev.stopPropagation();togglePin(e,i)};
    }
    stack.appendChild(c);
  });
  b.appendChild(stack);return b;
}

function renderFull(root){
  const g=document.createElement('div');g.className='periodic-full-grid';
  const w=Math.min(1680,$('#periodicScroll').clientWidth||1680),cell=Math.min(92,Math.max(76,(w-68)/18));
  g.style.gridTemplateColumns=`repeat(18,${cell}px)`;
  g.style.gridTemplateRows=`16px repeat(6,${cell}px) ${cell*.5}px repeat(2,${cell}px)`;
  g.style.width=`${18*cell+68}px`;
  for(let n=1;n<=18;n++){const x=document.createElement('div');x.className='group-number';x.style.gridColumn=n;x.style.gridRow=1;x.textContent=n;g.appendChild(x)}
  elements.forEach(e=>g.appendChild(makeElement(e,fullPosition(e))));
  root.appendChild(g);$('#layoutName').textContent='Full · 18 groups';
}
function addSection(root,title,kind,items){
  const s=document.createElement('section'),h=document.createElement('p'),g=document.createElement('div');
  h.className='block-title';h.textContent=title;g.className=`periodic-grid ${kind}`;
  items.forEach(x=>g.appendChild(makeElement(x.e,{col:x.col,row:x.row})));
  s.append(h,g);root.appendChild(s);
}
function renderSectioned(root){
  const stack=document.createElement('div');stack.className='periodic-section-stack';
  const sp=[],d=[],lanth=[],act=[];
  elements.forEach(e=>{
    const p=fullPosition(e),z=Number(e.atomic_number);
    if(z>=58&&z<=71){lanth.push({e,col:z-57,row:1});return}
    if(z>=89&&p.row>=10){act.push({e,col:Math.max(1,z-89),row:1});return}
    if(p.col>=3&&p.col<=12&&p.period>=4&&p.period<=7){d.push({e,col:p.col-2,row:p.period-3});return}
    const c=groupMapSP.get(p.col);if(c)sp.push({e,col:c,row:Math.max(1,p.period)});
  });
  addSection(stack,'s / p block','sp',sp);
  addSection(stack,'d block','d',d);
  if(lanth.length)addSection(stack,'lanthanides','f',lanth);
  if(act.length)addSection(stack,'actinides','f',act);
  root.appendChild(stack);
  $('#layoutName').textContent=layoutMode()==='split'?'Split · s/p + d + f':'Sectioned · mobile';
}
export function renderPeriodic(){
  closeInspector();
  const root=$('#periodicTable');root.innerHTML='';state.layout=layoutMode();
  state.layout==='full'?renderFull(root):renderSectioned(root);
  applyFilter();renderFrequencies();
}
export function renderFrequencies(){
  const u=currentTableUnit();$('#tableFrequencyUnit').textContent=u;
  $$('.isotope-cell').forEach(c=>{
    const f=c.querySelector('.freq'),v=frequencyInUnit(frequencyMhz(c.dataset.gamma));
    if(f)f.textContent=v==null?'—':Number(v).toFixed(2);
    c.classList.toggle('pinned',state.pins.some(p=>p.key===c.dataset.mass+c.dataset.symbol));
  });
}
export function applyFilter(){
  const q=state.query.trim().toLowerCase();
  $$('.element-block').forEach(b=>{
    const et=b.dataset.search;let visible=0,valid=0,hit=!q||et.includes(q);
    b.querySelectorAll('.isotope-cell').forEach(c=>{
      const sp=state.filter==='all'||c.dataset.spinClass===state.filter;
      const qp=!q||(q.match(/\d/)?c.dataset.search.includes(q):(et.includes(q)||c.dataset.search.includes(q)));
      const show=sp&&qp;c.classList.toggle('filtered-out',!show);
      if(show){visible++;if(c.dataset.spinClass!=='unknown')valid++;hit=true}
    });
    const none=state.filter==='all'?valid===0:visible===0;
    b.classList.toggle('no-match',none);b.classList.toggle('query-match',!!q&&hit&&!none);b.classList.toggle('query-no-match',!!q&&!hit);
  });
}
export function initFilters(){
  $$('#spinFilters button').forEach(b=>b.onclick=()=>{
    $$('#spinFilters button').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.filter=b.dataset.filter;applyFilter();
  });
  $('#nucleusSearch').oninput=e=>{state.query=e.target.value;applyFilter()};
}
export function renderInspector(){
  if(!state.inspector)return;
  const{element:e,active}=state.inspector;
  const body=e.isotopes.filter(i=>i.spin).map(i=>{
    const k=keyFor(e,i),f=frequencyMhz(i.gamma),pin=state.pins.some(p=>p.key===k);
    return`<tr${active===k?' class="active"':''}><td class="nucleus">${nuclideLabel(i.mass,e.symbol)}</td><td>${i.spin||'—'}</td><td>${displayNumber(i.abundance,2)}</td><td>${displayNumber(i.gamma,2)}</td><td>${frequencyText(f)}</td><td>${compactNumber(i.receptivity)}</td><td>${pin?'●':''}</td></tr>`;
  }).join('');
  $('#inspectorContent').innerHTML=`<div class="inspector-head"><div class="inspector-symbol">${e.symbol}</div><div><h3>${e.name}</h3><p>Z = ${e.atomic_number}${e.shift_range?` · ${e.shift_range} ppm`:''}</p></div></div><table class="inspector-table"><thead><tr><th>Nucleus</th><th>I</th><th>Abund. / %</th><th>γ/2π</th><th>Frequency</th><th>R</th><th></th></tr></thead><tbody>${body}</tbody></table>`;
  if(lastAnchor)positionInspector(lastAnchor);
}
export function closeInspector(){clearTimeout(hoverOpenTimer);clearTimeout(hoverCloseTimer);state.inspector=null;const p=$('#isotopeInspector');if(p)p.hidden=true}
export function allNuclei(){return elements.flatMap(e=>e.isotopes.filter(i=>i.spin&&i.gamma!=='').map(i=>({key:keyFor(e,i),symbol:e.symbol,name:e.name,...i}))).sort((a,b)=>Number(a.mass)-Number(b.mass)||a.symbol.localeCompare(b.symbol))}
export function renderComparison(){
  const root=$('#comparisonBody'),ppm=Number($('#deltaPpmInput').value)||0;root.innerHTML='';$('#selectedEmpty').hidden=state.pins.length>0;
  state.pins.forEach((p,idx)=>{
    const f=frequencyMhz(p.gamma),tr=document.createElement('tr');
    tr.innerHTML=`<td class="nuclide">${nuclideLabel(p.mass,p.symbol)}</td><td>${p.spin||'—'}</td><td>${displayNumber(p.abundance,2)}</td><td>${displayNumber(p.gamma,2)}</td><td>${frequencyText(f)}</td><td>${compactNumber(p.receptivity)}</td><td>${f==null?'—':(ppm*f).toFixed(2)}</td><td><button class="remove-pin" aria-label="remove ${p.key}">×</button></td>`;
    tr.querySelector('button').onclick=()=>{state.pins.splice(idx,1);renderFrequencies();renderComparison();renderInspector();updateUrl()};root.appendChild(tr);
  });
}
export function initComparison(){$('#deltaPpmInput').oninput=renderComparison}
export function initPalette(){
  const allowed=new Set(['wave','jacs','muted','pastel']);
  const stored=localStorage.getItem('nmr-atlas-palette');
  const saved=allowed.has(stored)?stored:'wave';
  if(stored!==saved)localStorage.setItem('nmr-atlas-palette',saved);
  document.body.dataset.palette=saved;
  $$('#paletteSwitch button').forEach(b=>{
    b.classList.toggle('active',b.dataset.palette===saved);
    b.onclick=()=>{document.body.dataset.palette=b.dataset.palette;localStorage.setItem('nmr-atlas-palette',b.dataset.palette);$$('#paletteSwitch button').forEach(x=>x.classList.toggle('active',x===b))};
  });
}
export function updateUrl(){const p=new URLSearchParams();p.set('field',fmt(state.field,state.field<.1?6:5));if(state.pins.length)p.set('nuclei',state.pins.map(x=>x.key).join(','));history.replaceState(null,'',location.pathname+'?'+p.toString()+location.hash)}
export function restoreUrl(){const p=new URLSearchParams(location.search);if(p.has('field'))state.field=Number(p.get('field'))||state.field;const keys=(p.get('nuclei')||'1H,13C,19F,31P').split(',').filter(Boolean);state.pins=[];for(const k of keys){const n=allNuclei().find(x=>x.key===k);if(n)state.pins.push(n)}}
export function initPeriodicEvents(){
  $('#fieldInput').onchange=e=>setField(e.target.value);
  $('#protonInput').onchange=e=>setProton(e.target.value);
  $('#fieldSlider').oninput=e=>setProton(sliderToMhz(e.target.value));
  const inspector=$('#isotopeInspector');
  inspector.addEventListener('mouseenter',()=>{clearTimeout(hoverCloseTimer)});
  inspector.addEventListener('mouseleave',scheduleInspectorClose);
  let t;addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(()=>renderPeriodic(),140)});
}