/* ===== الطقس ===== */
const WEATHER_URL='/api/weather';
const wIcons={'01':'☀️','02':'⛅','03':'☁️','04':'☁️','09':'🌧️','10':'🌦️','11':'⛈️','13':'❄️','50':'🌫️'};
async function fetchWeather() {
  try {
    const r=await fetch(WEATHER_URL); if(!r.ok) throw new Error();
    const d=await r.json();
    const icon=wIcons[d.weather[0].icon.slice(0,2)]||'🌤️';
    document.getElementById('w-temp').textContent=`${icon} ${Math.round(d.main.temp)}°م — ${d.weather[0].description}`;
  } catch(e) { document.getElementById('w-temp').textContent='🌤️ كفر الزيات'; }
}

/* ===== مشاركة ===== */
function openWA(phone) { window.open(`https://wa.me/2${phone.replace(/\D/g,'')}`, '_blank'); }
function openWAMsg(phone,msg) { window.open(`https://wa.me/2${phone.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank'); }
function shareApp() {
  const txt='دليل كفر الزيات و القري المجاوره 🗺️\nكل خدمات المدينة في مكان واحد!\nصيدليات، مطاعم، دليفري، وأكتر 👇 https://kafrelzayatdlel.netlify.app';
  if (navigator.share) { navigator.share({title:'دليل كفر الزيات',text:txt}); }
  else { window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`,'_blank'); }
}

function showToast(msg) {
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2200);
}

/* ===== كاروسيل الإعلانات ===== */
let adTimer; let adNow=0; let adTouch=0;
const adLabels=['HunkyPunky','قرمشه','صيدليه كشك ','MOLO','بيع واشتري','اعلانك مجانا'];
function initAdCarousel(){
  const t=document.getElementById('adTrack');
  const d=document.getElementById('adDots');
  const l=document.getElementById('adLabel');
  if(!t||!d) return;
  d.innerHTML='';
  for(var i=0;i<6;i++){
    var dot=document.createElement('span'); dot.className='ad-dot';
    if(i===0) dot.classList.add('active');
    dot.onclick=function(n){return function(){moveAd(n);};}(i);
    d.appendChild(dot);
  }
  l.textContent=adLabels[0];
  adRun();
  t.addEventListener('touchstart',function(e){adTouch=e.touches[0].clientX;adStop();},{passive:true});
  t.addEventListener('touchend',function(e){
    var diff=adTouch-e.changedTouches[0].clientX;
    if(Math.abs(diff)>40){if(diff>0)nextAd();else prevAd();}
    adRun();
  },{passive:true});
}
function adRun(){adStop();adTimer=setInterval(nextAd,5000);}
function adStop(){clearInterval(adTimer);}
function moveAd(i){
  var s=document.getElementById('adTrack').children;
  if(i<0)i=s.length-1;if(i>=s.length)i=0;
  adNow=i;
  document.getElementById('adTrack').style.transform='translateX(-'+(adNow*100)+'%)';
  var dots=document.getElementById('adDots').children;
  for(var j=0;j<dots.length;j++)dots[j].className='ad-dot'+(j===adNow?' active':'');
  document.getElementById('adLabel').textContent=adLabels[adNow]||'';
}
function nextAd(){moveAd(adNow+1);}
function prevAd(){moveAd(adNow-1);}
