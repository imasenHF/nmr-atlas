import{$,state,loadData}from'./core.js?v=20261008-palettepicker3';
import{initPresets,renderPeriodic,initFilters,initComparison,initPeriodicEvents,initPalette,restoreUrl,setField,renderComparison}from'./periodic.js?v=20261009-all-isotopes1';
import{initSolvents,initImpurities}from'./references.js?v=20261008-palettepicker3';
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
  document.querySelector('main').innerHTML=`<section class="container" style="padding:70px 0"><h1>NMR Atlas</h1><p>页面初始化失败：${String(err.message||err)}</p><p>请刷新页面；若问题持续存在，可查看浏览器控制台中的详细错误。</p></section>`;
  console.error(err);
}