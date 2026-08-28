/* ===== المفضلة ===== */
function getFavorites() {
  return safeJsonParse(localStorage.getItem('kz_favorites') || '[]', []);
}

function toggleFavorite(name, icon, phone, category) {
  let favs = getFavorites();
  const idx = favs.findIndex(f => f.name === name && f.phone === phone);
  if (idx > -1) {
    favs.splice(idx, 1);
    showToast('💔 تم إزالتها من المفضلة');
  } else {
    favs.push({ name, icon, phone, category });
    showToast('❤️ أضيفت للمفضلة');
  }
  localStorage.setItem('kz_favorites', JSON.stringify(favs));
  renderFavSection();
  updateFavHearts(name, phone);
  return idx === -1;
}

function isFavorite(name, phone) {
  return getFavorites().some(f => f.name === name && f.phone === phone);
}

function updateFavHearts(name, phone) {
  const isFav = isFavorite(name, phone);
  document.querySelectorAll(`.fav-heart-btn[data-name="${name}"][data-phone="${phone}"]`).forEach(el => {
    el.classList.toggle('active', isFav);
    el.querySelector('.heart').textContent = isFav ? '❤️' : '🤍';
  });
  document.querySelectorAll(`.fav-action[data-name="${name}"][data-phone="${phone}"]`).forEach(el => {
    el.classList.toggle('active', isFav);
    el.innerHTML = isFav ? '❤️ في المفضلة' : '🤍 أضف للمفضلة';
  });
}

function renderFavSection() {
  const el = document.getElementById('fav-section-home');
  const favs = getFavorites();
  if (!favs.length) { el.classList.remove('show'); el.innerHTML = ''; return; }
  el.classList.add('show');
  el.innerHTML = `
    <div class="fav-sh-title">❤️ مفضلاتي (${favs.length})</div>
    ${favs.map(f => `
      <div class="fav-sh-item" onclick="showServiceDetail('${escapeHTML(f.name)}','${escapeHTML(f.icon)}','${f.phone}','${f.category}')">
        <div class="fav-sh-icon">${escapeHTML(f.icon)}</div>
        <div class="fav-sh-name">${escapeHTML(f.name)}</div>
        <div class="fav-sh-wa" onclick="event.stopPropagation();openWA('${f.phone}')">💬</div>
      </div>`).join('')}`;
}

/* ===== عمليات البحث الأخيرة ===== */
function getRecentSearches() {
  return safeJsonParse(localStorage.getItem('kz_recent_searches') || '[]', []);
}

function addRecentSearch(q) {
  let searches = getRecentSearches().filter(s => s !== q);
  searches.unshift(q);
  if (searches.length > 5) searches = searches.slice(0, 5);
  localStorage.setItem('kz_recent_searches', JSON.stringify(searches));
  renderRecentSearches();
}

function removeRecentSearch(q) {
  let searches = getRecentSearches().filter(s => s !== q);
  localStorage.setItem('kz_recent_searches', JSON.stringify(searches));
  renderRecentSearches();
}

function renderRecentSearches() {
  const area = document.getElementById('recent-search-area');
  const searches = getRecentSearches();
  const input = document.getElementById('search-input');
  const shouldShow = searches.length && document.activeElement === input && !input.value.trim();
  area.classList.toggle('show', shouldShow);
  area.replaceChildren();
  if (!shouldShow) return;

  const wrap = document.createElement('div');
  wrap.className = 'recent-pills';
  searches.forEach(search => {
    const pill = document.createElement('span');
    pill.className = 'recent-pill';
    pill.append(document.createTextNode(`🔄 ${search} `));
    pill.addEventListener('click', () => {
      handleSearch(search);
      input.value = search;
      renderRecentSearches();
    });
    const del = document.createElement('span');
    del.className = 'rp-del';
    del.textContent = '✕';
    del.addEventListener('click', e => { e.stopPropagation(); removeRecentSearch(search); });
    pill.appendChild(del);
    wrap.appendChild(pill);
  });
  area.appendChild(wrap);
}

function onSearchFocus() { setTimeout(renderRecentSearches, 100); }
function onSearchBlur() { setTimeout(() => document.getElementById('recent-search-area').classList.remove('show'), 200); }

/* ===== ضغط الصور ===== */
function compressImage(file, maxW, quality) {
  maxW = maxW || 800;
  quality = quality || 0.7;
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxW) { h = h * maxW / w; w = maxW; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

let currentImgBase64 = null;

async function handleProductImage(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) { showToast('⚠️ الصورة كبيرة جداً — اختار أقل من 10MB'); return; }
  try {
    currentImgBase64 = await compressImage(file, 800, 0.7);
    const wrap = document.getElementById('img-preview-wrap');
    const area = document.getElementById('img-upload-area');
    wrap.innerHTML = `
      <img src="${currentImgBase64}" style="width:100%;max-height:180px;object-fit:contain;border-radius:8px;margin-bottom:8px;">
      <div style="font-size:11px;color:var(--primary);font-weight:700;">✅ تم اختيار الصورة — اضغط لتغييرها</div>`;
    area.style.borderColor = 'var(--primary)';
    area.style.background = 'var(--primary-light)';
  } catch(e) {
    showToast('⚠️ فشل في معالجة الصورة');
  }
}

