import{$,state,loadData}from'./core.js?v=20261008-workshop2';
import{initPresets,renderPeriodic,initFilters,initComparison,initPeriodicEvents,initPalette,restoreUrl,setField,renderComparison}from'./periodic.js?v=20261008-workshop2';
import{initSolvents,initImpurities}from'./references.js?v=20261008-workshop2';
try{
  await loadData();
  restoreUrl();
  initPalette();
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