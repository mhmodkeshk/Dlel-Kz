/* ===== Marketplace - Supabase ===== */

let products = [];
let currentProductFile = null;

async function handleProductImage(input) {
  const f = input.files[0];
  if (!f) return;

  if (
    !/^image\/(png|jpe?g|webp)$/i.test(f.type) ||
    f.size > 5 * 1024 * 1024
  ) {
    input.value = '';
    return showToast('⚠️ صورة JPG/PNG/WEBP أقل من 5MB');
  }

  currentProductFile = f;

  const url = URL.createObjectURL(f);

  document.getElementById('img-preview-wrap').innerHTML = `
    <img
      src="${url}"
      style="width:100%;max-height:180px;object-fit:contain;border-radius:8px"
    >
    <div style="font-size:11px;color:var(--primary);font-weight:700;">
      ✅ تم اختيار الصورة
    </div>
  `;
}

async function loadProducts() {
  if (!backendReady) {
    products = [];
    console.warn('Marketplace: backend is not ready yet');
    return;
  }

  const { data, error } = await db
    .from('products')
    .select(
      'id,name,description,price,phone,image_url,views,status,created_at,seller_id,seller_name'
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase products error:', error);
    showToast('⚠️ تعذر تحميل المنتجات');
    return;
  }

  console.log('Products loaded successfully:', data);

  products = (data || []).map(p => ({
    ...p,
    desc: p.description,
    img: p.image_url ? productPublicUrl(p.image_url) : '',
    seller: p.seller_name || 'مستخدم'
  }));
}

function showSellTab(tab) {
  const b = tab === 'browse';

  document.getElementById('products-list').style.display =
    b ? 'block' : 'none';

  document.getElementById('add-product-form').style.display =
    b ? 'none' : 'block';
}

function renderProducts() {
  const el = document.getElementById('products-list');

  el.innerHTML = products.length
    ? products.map(p => `
      <div
        class="product-card"
        onclick="showProductDetail('${p.id}')"
      >
        <div class="product-img">
          ${
            p.img
              ? `
                <img
                  src="${safeImageSrc(p.img)}"
                  style="width:100%;height:100%;object-fit:cover;border-radius:12px"
                >
              `
              : '📦'
          }
        </div>

        <div style="flex:1">
          <div class="product-name">
            ${escapeHTML(p.name)}
          </div>

          <div class="product-price">
            ${Number(p.price).toLocaleString()} جنيه
          </div>

          <div class="product-seller">
            البائع: ${escapeHTML(p.seller)}
          </div>

          <div class="my-prod-views">
            👁️ ${Number(p.views || 0)} مشاهدة
          </div>
        </div>
      </div>
    `).join('')
    : `
      <div style="text-align:center;padding:40px;color:var(--muted)">
        لا توجد منتجات حالياً
      </div>
    `;
}

async function addProduct() {
  if (!currentUser) {
    return showToast('⚠️ سجل دخولك الأول');
  }

  const name = clampText(
    document.getElementById('prod-name').value,
    120
  );

  const price = Number(
    document.getElementById('prod-price').value
  );

  const description = clampText(
    document.getElementById('prod-desc').value,
    1200
  );

  const phone = document
    .getElementById('prod-phone')
    .value
    .trim();

  if (
    !name ||
    price <= 0 ||
    !/^01\d{9}$/.test(phone)
  ) {
    return showToast('⚠️ راجع البيانات');
  }

  try {
    let image_url = null;

    if (currentProductFile) {
      image_url = await uploadToBucket(
        'product-images',
        currentProductFile,
        'products'
      );
    }

    const { error } = await db
      .from('products')
      .insert({
        seller_id: currentUser.id,
        seller_name: currentUser.name,
        name,
        description,
        price,
        phone,
        image_url,
        status: 'pending'
      });

    if (error) {
      console.error('Supabase add product error:', error);
      throw error;
    }

    currentProductFile = null;

    showToast('✅ تم الإرسال للمراجعة');

    await loadProducts();
    renderProducts();
    showSellTab('browse');

  } catch (e) {
    console.error('Add product failed:', e);
    showToast('❌ تعذر نشر المنتج');
  }
}

async function showProductDetail(id) {
  const p = products.find(x => x.id === id);

  if (!p) return;

  db
    .rpc('increment_product_views', {
      p_product_id: id
    })
    .then(({ error }) => {
      if (error) {
        console.error(
          'Increment product views error:',
          error
        );
      }
    });

  document.getElementById(
    'product-detail-content'
  ).innerHTML = `
    <div style="padding:0 16px 16px">

      ${
        p.img
          ? `
            <img
              src="${safeImageSrc(p.img)}"
              class="prod-detail-img"
            >
          `
          : `
            <div class="prod-detail-placeholder">
              📦
            </div>
          `
      }

      <div style="font-size:20px;font-weight:900">
        ${escapeHTML(p.name)}
      </div>

      <div class="product-price">
        ${Number(p.price).toLocaleString()} جنيه
      </div>

      <div style="font-size:12px;color:var(--muted);margin:8px 0">
        البائع: ${escapeHTML(p.seller)}
      </div>

      ${
        p.desc
          ? `
            <div
              style="
                background:var(--bg);
                padding:12px;
                border-radius:12px
              "
            >
              ${escapeHTML(p.desc)}
            </div>
          `
          : ''
      }

      <div style="display:flex;gap:10px;margin-top:14px">

        <button
          class="main-btn green"
          onclick="openWA('${p.phone}')"
        >
          💬 واتساب
        </button>

        <a
          class="main-btn"
          href="tel:${p.phone}"
          style="
            text-decoration:none;
            text-align:center;
            background:#2563eb
          "
        >
          📞 اتصال
        </a>

      </div>
    </div>
  `;

  switchToScreen('screen-product-detail');
}

async function renderMyProducts() {
  const el = document.getElementById(
    'myproducts-list'
  );

  if (!currentUser) {
    el.innerHTML = `
      <div style="padding:40px;text-align:center">
        سجل دخولك الأول
      </div>
    `;
    return;
  }

  const { data, error } = await db
    .from('products')
    .select('*')
    .eq('seller_id', currentUser.id)
    .neq('status', 'deleted')
    .order('created_at', {
      ascending: false
    });

  if (error) {
    console.error(
      'Supabase my products error:',
      error
    );

    showToast('⚠️ تعذر تحميل منتجاتك');
    return;
  }

  el.innerHTML = (data || [])
    .map(p => `
      <div class="my-prod-card">

        <div style="flex:1">

          <div class="product-name">
            ${escapeHTML(p.name)}
          </div>

          <div class="product-price">
            ${Number(p.price).toLocaleString()} جنيه
          </div>

          <div class="my-prod-views">
            الحالة: ${escapeHTML(p.status)}
          </div>

        </div>

        <button
          class="del-btn"
          onclick="deleteProduct('${p.id}')"
        >
          حذف
        </button>

      </div>
    `)
    .join('')
    || `
      <div style="padding:40px;text-align:center">
        لا توجد منتجات
      </div>
    `;
}

async function deleteProduct(id) {
  if (!confirm('هتحذف المنتج ده؟')) {
    return;
  }

  const { error } = await db
    .from('products')
    .update({
      status: 'deleted'
    })
    .eq('id', id);

  if (error) {
    console.error(
      'Supabase delete product error:',
      error
    );

    return showToast('❌ تعذر الحذف');
  }

  showToast('🗑️ تم الحذف');

  renderMyProducts();
}
