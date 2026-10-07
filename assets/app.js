import{$,state,loadData}from'./core.js';
import{initPresets,renderPeriodic,initFilters,initComparison,initPeriodicEvents,restoreUrl,setField,renderComparison}from'./periodic.js';
import{initSolvents,initImpurities}from'./references.js';
try{
  await loadData();
  restoreUrl();
  initPresets();
  renderPeriodic();
  initFilters();
  initComparison();
  initSolvents();
  initImpurities();
  initPeriodicEvents();
  $('#currentYear').textContent=new Date().getFullYear();
  setField(state.field);
  renderComparison();
}catch(err){
  document.querySelector('main').innerHTML=`<section class="container" style="padding:70px 0"><h1>NMR Atlas</h1><p>数据加载失败：${String(err.message||err)}</p><p>请使用支持 DecompressionStream 的现代浏览器并通过 HTTP/HTTPS 打开页面。</p></section>`;
  console.error(err);
}