import{$,$$,state,solventData,impurityData,mediaOrder,solventMeta,impurityFormula,parseShift,pubchemImage}from'./core.js';

const fullRanges={'1H':[12,0],'13C':[220,0]};
const plotRanges={'1H':[...fullRanges['1H']],'13C':[...fullRanges['13C']]};

function setupStructure(img,name){
  img.hidden=false;img.src=pubchemImage(name);
  img.onload=()=>img.hidden=false;
  img.onerror=()=>img.hidden=true;
}
function renderSolventList(){
  const root=$('#solventList');root.innerHTML='';
  solventData.forEach((s,i)=>{
    const b=document.createElement('button');b.className=`solvent-choice${i===state.solventIndex?' active':''}`;b.textContent=s.name;
    b.onclick=()=>{state.solventIndex=i;renderSolventList();renderSolventViewer()};
    root.appendChild(b);
  });
}
function makeStickPlot(signals,hod,nucleus){
  const root=$('#solventStickPlot');root.innerHTML='';
  const [high,low]=plotRanges[nucleus],span=high-low;
  for(let i=0;i<=10;i++){
    const t=document.createElement('span');t.className='axis-tick';t.style.left=`${i*10}%`;
    const value=high-span*i/10;t.textContent=value.toFixed(nucleus==='1H'?(span<4?2:1):(span<60?1:0));
    root.appendChild(t);
  }
  const addStick=(v,label,title,cls='stick',height='68%')=>{
    if(v==null||v>high||v<low)return;
    const x=(high-v)/span*100,line=document.createElement('i');line.className=cls;line.style.left=`${Math.max(0,Math.min(100,x))}%`;line.style.height=height;line.dataset.label=label;line.title=title;root.appendChild(line);
  };
  signals.forEach((raw,i)=>{const v=parseShift(raw);addStick(v,String(v),raw,'stick',`${60+(i%3)*15}%`)});
  if(nucleus==='1H'&&hod){const v=parseShift(hod);addStick(v,'HOD',`HOD ${hod}`,'stick hod','40%')}
}
function renderSolventViewer(){
  const s=solventData[state.solventIndex];if(!s)return;
  const m=solventMeta[s.name]||{formula:'',structure:s.name,residual:'Residual protonated isotopologue'};
  $('#solventName').textContent=s.name;$('#solventFormula').textContent=m.formula;$('#solventResidual').textContent=m.residual;
  setupStructure($('#solventStructure'),m.structure||s.name);
  const signals=state.solventNucleus==='1H'?s.h1:s.c13;
  $('#solventPlotNucleus').textContent=state.solventNucleus==='1H'?'¹H':'¹³C';
  makeStickPlot(signals,s.hod,state.solventNucleus);
  const list=$('#solventSignalList');list.innerHTML='';
  signals.forEach((v,i)=>{const p=document.createElement('span');p.className='signal-pill';const j=state.solventNucleus==='1H'?(s.j_hz||[])[i]:(s.jc_hz||[])[i];p.textContent=`δ ${v}${j&&j!=='NA'?` · J ${j} Hz`:''}`;list.appendChild(p)});
  if(state.solventNucleus==='1H'&&s.hod){const p=document.createElement('span');p.className='signal-pill';p.textContent=`HOD δ ${s.hod}`;list.appendChild(p)}
}
function zoomPlot(ev){
  ev.preventDefault();
  const nucleus=state.solventNucleus,root=$('#solventStickPlot'),rect=root.getBoundingClientRect(),frac=Math.max(0,Math.min(1,(ev.clientX-rect.left)/rect.width));
  const [high,low]=plotRanges[nucleus],span=high-low,full=fullRanges[nucleus][0]-fullRanges[nucleus][1],minSpan=nucleus==='1H'?.35:6;
  let next=Math.max(minSpan,Math.min(full,span*(ev.deltaY>0?1.18:.84)));
  const anchor=high-frac*span;
  let nh=anchor+frac*next,nl=anchor-(1-frac)*next;
  const max=fullRanges[nucleus][0],min=fullRanges[nucleus][1];
  if(nh>max){nl-=nh-max;nh=max}
  if(nl<min){nh+=min-nl;nl=min}
  plotRanges[nucleus]=[Math.min(max,nh),Math.max(min,nl)];
  renderSolventViewer();
}
function resetPlot(){plotRanges[state.solventNucleus]=[...fullRanges[state.solventNucleus]];renderSolventViewer()}
export function initSolvents(){
  renderSolventList();renderSolventViewer();
  $$('#solventNucleusToggle button').forEach(b=>b.onclick=()=>{
    $$('#solventNucleusToggle button').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.solventNucleus=b.dataset.nucleus;renderSolventViewer();
  });
  $('#solventStickPlot').addEventListener('wheel',zoomPlot,{passive:false});
  $('#solventStickPlot').addEventListener('dblclick',resetPlot);
}

function groups(){
  const q=$('#impuritySearch').value.trim().toLowerCase(),map=new Map();
  impurityData.filter(r=>r.nucleus===state.impurityNucleus).forEach(r=>{
    if(q&&!`${r.compound} ${impurityFormula[r.compound]||''}`.toLowerCase().includes(q))return;
    if(!map.has(r.compound))map.set(r.compound,[]);
    map.get(r.compound).push(r);
  });
  return[...map.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
}
const sorted=rows=>[...rows].sort((a,b)=>(parseShift(b.shift)??-Infinity)-(parseShift(a.shift)??-Infinity));
const sig=r=>`<div class="signal-entry"><span class="signal-shift">${r.shift}</span><span class="signal-site">${r.site||'—'}</span><span class="signal-mult">${r.multiplicity||'—'}</span></div>`;

export function renderImpurities(){
  const root=$('#impurityGroups');root.innerHTML='';const gs=groups();
  gs.forEach(([name,rows])=>{
    const row=document.createElement('article');row.className='impurity-row';
    const c=document.createElement('div');c.className='compound-cell';
    const img=document.createElement('img');img.className='compound-structure';img.loading='lazy';img.alt=`${name} structure`;setupStructure(img,name);
    const label=document.createElement('div');label.innerHTML=`<strong>${name}</strong><span class="compound-meta">${impurityFormula[name]||''}</span>`;c.append(img,label);row.appendChild(c);
    mediaOrder.forEach(m=>{const cell=document.createElement('div'),rs=sorted(rows.filter(r=>r.medium===m));cell.className=`medium-cell${rs.length?'':' empty'}`;cell.innerHTML=rs.length?rs.map(sig).join(''):'—';row.appendChild(cell)});
    root.appendChild(row);
  });
  if(!gs.length)root.innerHTML='<div class="empty-state">未找到匹配杂质。</div>';
}
export function initImpurities(){
  renderImpurities();$('#impuritySearch').oninput=renderImpurities;
  $$('#impurityNucleusToggle button').forEach(b=>b.onclick=()=>{
    $$('#impurityNucleusToggle button').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.impurityNucleus=b.dataset.nucleus;renderImpurities();
  });
}