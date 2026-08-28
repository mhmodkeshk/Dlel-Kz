window.addEventListener('load', async ()=>{
  try { await initBackend(); } catch(e) { console.error(e); }
  renderCats(); renderFavSection(); fetchWeather();
  if (backendReady) await loadProducts();
  try{initAdCarousel();}catch(e){}
  setTimeout(()=>{const s=document.getElementById('splash');s.style.opacity='0';setTimeout(()=>{s.style.display='none';document.getElementById('app').style.display='block';},300);},900);
});
