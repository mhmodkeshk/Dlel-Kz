/* ===== رندر الكاتيجوريز ===== */
function renderCats() {
  document.getElementById('cats-count').textContent = `${totalCats} تصنيف`;
  document.getElementById('cats-grid').innerHTML = Object.entries(data).map(([name,cat])=>`
    <div class="cat-card" onclick="showCategory('${name}')">
      <span class="cat-emoji">${escapeHTML(cat.icon)}</span>
      <div class="cat-name">${escapeHTML(name)}</div>
      <div class="cat-count">${cat.services.length} خدمة</div>
    </div>`).join('');
}

/* ===== رندر الإحصائيات ===== */
/* ===== الكاتيجوري ===== */
function showCategory(name) {
  const cat = data[name];
  document.getElementById('cat-screen-title').innerHTML = `${cat.icon} ${name}`;
  document.getElementById('services-list').innerHTML = cat.services.map(s => {
    const isFav = isFavorite(s.name, s.phone);
    return `
    <div class="service-card" onclick="showServiceDetail('${s.name}','${cat.icon}','${s.phone}','${name}')">
      <div class="service-avatar">${cat.icon}</div>
      <div style="flex:1;">
        <div class="service-name">${escapeHTML(s.name)}</div>
        <div class="service-phone">📞 ${escapeHTML(s.phone)}</div>
      </div>
      <div class="service-actions">
        <button class="fav-heart-btn ${isFav?'active':''}" data-name="${s.name}" data-phone="${s.phone}" onclick="event.stopPropagation();toggleFavorite('${s.name}','${cat.icon}','${s.phone}','${name}')">
          <span class="heart">${isFav ? '❤️' : '🤍'}</span>
        </button>
        <a class="svc-call-btn" href="tel:${s.phone}" onclick="event.stopPropagation();">📞</a>
        <div class="svc-wa-btn" onclick="event.stopPropagation();openWA('${s.phone}')">💬</div>
      </div>
    </div>`;}).join('');
  switchToScreen('screen-category');
}

/* ===== تفاصيل الخدمة ===== */
let serviceDetailPrevScreen = 'home';
let svcDetailSearchQuery = '';

function showServiceDetail(name, icon, phone, category) {
  const escapedName = name.replace(/'/g, "\\'");
  const isFav = isFavorite(name, phone);
  svcDetailSearchQuery = document.getElementById('search-input').value;
  document.getElementById('service-detail-content').innerHTML = `
    <div class="svc-detail-wrap">
      <div class="svc-detail-header">
        <div class="svc-detail-icon">${icon}</div>
        <div>
          <div class="svc-detail-name">${escapeHTML(name)}</div>
          <div class="svc-detail-cat">${escapeHTML(category)}</div>
          <div class="svc-detail-phone">📞 ${escapeHTML(phone)}</div>
        </div>
      </div>
      <div class="svc-actions">
        <button class="svc-action-btn wa" onclick="openWA('${phone}')">💬 واتساب</button>
        <a class="svc-action-btn call" href="tel:${phone}">📞 اتصال</a>
      </div>
      <div class="svc-actions">
        <button class="svc-action-btn share" onclick="shareService('${escapedName}','${phone}')">📤 مشاركة</button>
        <button class="svc-action-btn fav-action ${isFav?'active':''}" data-name="${name}" data-phone="${phone}" onclick="toggleFavorite('${escapedName}','${icon}','${phone}','${category}')">
          ${isFav ? '❤️ في المفضلة' : '🤍 أضف للمفضلة'}
        </button>
      </div>
      <div style="display:flex;align-items:center;gap:10px;background:var(--bg);border-radius:12px;padding:12px 14px;font-size:12px;color:var(--muted);">
        <span>📍</span>
        <span>كفر الزيات — ${escapeHTML(category)}</span>
      </div>
    </div>`;

  const screens = ['category','search','home'];
  const active = screens.find(t => document.getElementById('screen-'+t).classList.contains('active'));
  serviceDetailPrevScreen = active || 'home';

  switchToScreen('screen-service-detail');
}

function shareService(name, phone) {
  const txt = `📍 ${name}\n📞 ${phone}\n\n🗺️ دليل كفر الزيات و القري المجاوره`;
  if (navigator.share) { navigator.share({ title: name, text: txt }); }
  else { navigator.clipboard.writeText(txt).then(() => showToast('✅ تم نسخ المعلومات')); }
}

function goBackFromServiceDetail() {
  if (serviceDetailPrevScreen === 'search') {
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById('screen-search').classList.add('active');
    document.querySelectorAll('.nbtn').forEach(b=>b.classList.remove('active'));
    document.getElementById('search-input').value = svcDetailSearchQuery;
  } else {
    switchTab(serviceDetailPrevScreen);
  }
}

function switchToScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nbtn').forEach(b => b.classList.remove('active'));
}

/* ===== البحث ===== */
function handleSearch(val) {
  const q = val.trim();
  ['screen-home','screen-category','screen-search','screen-service-detail'].forEach(id=>{
    document.getElementById(id).classList.remove('active');
  });
  if (!q) {
    document.getElementById('screen-home').classList.add('active');
    document.getElementById('nav-home').classList.add('active');
    renderRecentSearches();
    return;
  }
  addRecentSearch(q);
  document.getElementById('screen-search').classList.add('active');
  document.querySelectorAll('.nbtn').forEach(b=>b.classList.remove('active'));
  const results=[];
  for(const [catName,cat] of Object.entries(data)){
    cat.services.filter(s=>s.name.toLowerCase().includes(q.toLowerCase())||catName.includes(q)).forEach(s=>{
      results.push({...s,cat:catName,icon:cat.icon});
    });
  }
  document.getElementById('search-results-container').innerHTML = results.length
    ? `<div class="sec-title">${results.length} نتيجة لـ "${escapeHTML(q)}"</div>`+results.map(s=>{
        const isFav = isFavorite(s.name, s.phone);
        return `
        <div class="service-card" onclick="showServiceDetail('${s.name}','${s.icon}','${s.phone}','${s.cat}')">
          <div class="service-avatar">${s.icon}</div>
          <div style="flex:1;"><div class="service-name">${escapeHTML(s.name)}</div><div class="service-phone">${s.cat} — ${s.phone}</div></div>
          <div class="service-actions">
            <button class="fav-heart-btn ${isFav?'active':''}" data-name="${s.name}" data-phone="${s.phone}" onclick="event.stopPropagation();toggleFavorite('${s.name}','${s.icon}','${s.phone}','${s.cat}')">
              <span class="heart">${isFav ? '❤️' : '🤍'}</span>
            </button>
            <a class="svc-call-btn" href="tel:${s.phone}" onclick="event.stopPropagation();">📞</a>
            <div class="svc-wa-btn" onclick="event.stopPropagation();openWA('${s.phone}')">💬</div>
          </div>
        </div>`;}).join('')
    : `<div style="text-align:center;padding:60px 20px;color:var(--muted);"><div style="font-size:48px;margin-bottom:12px;">🔍</div><div style="font-size:14px;">مفيش نتائج لـ "${escapeHTML(q)}"</div></div>`;
}

