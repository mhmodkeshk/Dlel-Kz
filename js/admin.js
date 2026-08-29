let adminProfile = null;
let adminCategories = [];
let adminBusinesses = [];

/* =========================================================
   INIT
========================================================= */

async function adminInit() {
  const status =
    document.getElementById('admin-status');

  try {
    if (!await initBackend()) {
      throw new Error('CONFIG');
    }

    if (
      !currentUser ||
      currentUser.role !== 'admin'
    ) {
      throw new Error('DENIED');
    }

    adminProfile = currentUser;

    status.hidden = true;

    document
      .getElementById('admin-app')
      .hidden = false;

    bindTabs();

    await loadAdminCategories();

    await refreshAdmin();

  } catch (e) {
    console.error(
      'Admin init error:',
      e
    );

    status.classList.add('error');

    status.textContent =
      e.message === 'CONFIG'
        ? 'Supabase غير متصل. أضف الإعدادات في js/config.js'
        : 'غير مصرح لك بفتح لوحة الإدارة. سجل الدخول بحساب Admin.';
  }
}

/* =========================================================
   TABS
========================================================= */

function bindTabs() {
  document
    .querySelectorAll('.admin-tab')
    .forEach(button => {

      button.onclick = async () => {

        document
          .querySelectorAll('.admin-tab')
          .forEach(x =>
            x.classList.remove('active')
          );

        button.classList.add('active');

        const tab =
          button.dataset.tab;

        document
          .getElementById('admin-products')
          .hidden =
            tab !== 'products';

        document
          .getElementById('admin-businesses')
          .hidden =
            tab !== 'businesses';

        document
          .getElementById('admin-charges')
          .hidden =
            tab !== 'charges';

        if (tab === 'businesses') {
          await loadBusinessesForAdmin();
        }
      };
    });
}

/* =========================================================
   REFRESH
========================================================= */

async function refreshAdmin() {
  const [
    productsResult,
    chargesResult,
    usersResult,
    pendingBusinessResult
  ] = await Promise.all([

    db
      .from('products')
      .select('*')
      .eq('status', 'pending')
      .order('created_at'),

    db
      .from('charge_requests')
      .select(
        '*,profiles:user_id(name,phone)'
      )
      .eq('status', 'pending')
      .order('created_at'),

    db
      .from('profiles')
      .select(
        '*',
        {
          count: 'exact',
          head: true
        }
      ),

    db
      .from('businesses')
      .select('id')
      .eq('status', 'pending')
  ]);

  const products =
    productsResult.data || [];

  const charges =
    chargesResult.data || [];

  const users =
    usersResult.count || 0;

  const pendingBusinesses =
    pendingBusinessResult.data || [];

  renderStats(
    products,
    charges,
    users,
    pendingBusinesses.length
  );

  renderPendingProducts(
    products
  );

  await renderCharges(
    charges
  );
}

/* =========================================================
   STATS
========================================================= */

function renderStats(
  products,
  charges,
  users,
  businessPending
) {
  document
    .getElementById('admin-stats')
    .innerHTML = `

      <div class="stat">
        <span>مستخدمون</span>
        <b>${users}</b>
      </div>

      <div class="stat">
        <span>منتجات معلقة</span>
        <b>${products.length}</b>
      </div>

      <div class="stat">
        <span>محلات معلقة</span>
        <b>${businessPending}</b>
      </div>

      <div class="stat">
        <span>طلبات شحن</span>
        <b>${charges.length}</b>
      </div>

    `;
}

/* =========================================================
   PRODUCTS
========================================================= */

function renderPendingProducts(list) {
  const el =
    document.getElementById(
      'admin-products'
    );

  el.innerHTML =
    list.map(p => `

      <article class="admin-card">

        <div class="admin-row">

          <div>

            <b>
              ${escapeHTML(p.name)}
            </b>

            <div class="admin-meta">
              ${escapeHTML(p.seller_name)}
              •
              ${Number(p.price).toLocaleString()}
              جنيه
              •
              ${escapeHTML(p.phone)}
            </div>

            <div class="admin-meta">
              ${escapeHTML(
                p.description ||
                'بدون وصف'
              )}
            </div>

          </div>

          <div class="admin-actions">

            <button
              class="admin-btn ok"
              onclick="
                reviewProduct(
                  '${p.id}',
                  'active'
                )
              "
            >
              قبول
            </button>

            <button
              class="admin-btn no"
              onclick="
                reviewProduct(
                  '${p.id}',
                  'rejected'
                )
              "
            >
              رفض
            </button>

          </div>

        </div>

      </article>

    `).join('')
    ||
    `
      <div class="admin-card">
        لا توجد منتجات معلقة.
      </div>
    `;
}

async function reviewProduct(
  id,
  status
) {
  const { error } =
    await db
      .from('products')
      .update({
        status
      })
      .eq('id', id);

  if (error) {
    console.error(
      'Review product error:',
      error
    );

    return alert(
      'تعذر تنفيذ العملية'
    );
  }

  await refreshAdmin();
}

/* =========================================================
   CATEGORIES
========================================================= */

async function loadAdminCategories() {
  const {
    data,
    error
  } =
    await db
      .from('categories')
      .select(
        'id,name,icon,sort_order'
      )
      .order(
        'sort_order',
        {
          ascending: true
        }
      );

  if (error) {
    console.error(
      'Admin categories error:',
      error
    );

    return;
  }

  adminCategories =
    data || [];

  const select =
    document.getElementById(
      'business-category'
    );

  if (!select) return;

  select.innerHTML =
    `
      <option value="">
        اختر التصنيف
      </option>
    `
    +
    adminCategories.map(c => `

      <option value="${c.id}">
        ${escapeHTML(c.icon || '📍')}
        ${escapeHTML(c.name)}
      </option>

    `).join('');
}

/* =========================================================
   CREATE BUSINESS DIRECTLY AS ADMIN
========================================================= */

async function createBusinessFromAdmin() {

  const message =
    document.getElementById(
      'business-form-message'
    );

  message.textContent = '';

  const categoryId =
    Number(
      document
        .getElementById(
          'business-category'
        )
        .value
    );

  const name =
    clampText(
      document
        .getElementById(
          'business-name'
        )
        .value,
      120
    );

  const phone =
    document
      .getElementById(
        'business-phone'
      )
      .value
      .trim();

  const whatsapp =
    document
      .getElementById(
        'business-whatsapp'
      )
      .value
      .trim();

  const village =
    clampText(
      document
        .getElementById(
          'business-village'
        )
        .value,
      100
    );

  const address =
    clampText(
      document
        .getElementById(
          'business-address'
        )
        .value,
      300
    );

  const description =
    clampText(
      document
        .getElementById(
          'business-description'
        )
        .value,
      1500
    );

  const mapsUrl =
    document
      .getElementById(
        'business-maps'
      )
      .value
      .trim();

  const verified =
    document
      .getElementById(
        'business-verified'
      )
      .checked;

  const featured =
    document
      .getElementById(
        'business-featured'
      )
      .checked;

  if (
    !categoryId ||
    !name ||
    !/^01\d{9}$/.test(phone)
  ) {
    message.style.color =
      '#dc2626';

    message.textContent =
      '⚠️ اختر التصنيف واكتب اسم النشاط ورقم موبايل صحيح.';

    return;
  }

  if (
    whatsapp &&
    !/^01\d{9}$/.test(whatsapp)
  ) {
    message.style.color =
      '#dc2626';

    message.textContent =
      '⚠️ رقم واتساب غير صحيح.';

    return;
  }

  try {

    const {
      data,
      error
    } =
      await db.rpc(
        'admin_create_business',
        {
          p_category_id:
            categoryId,

          p_name:
            name,

          p_phone:
            phone,

          p_whatsapp:
            whatsapp || null,

          p_address:
            address || null,

          p_village:
            village ||
            'كفر الزيات',

          p_description:
            description || null,

          p_maps_url:
            mapsUrl || null,

          p_verified:
            verified,

          p_featured:
            featured,

          p_sort_order:
            0
        }
      );

    if (error) {
      console.error(
        'Create business error:',
        error
      );

      throw error;
    }

    console.log(
      'Business created:',
      data
    );

    message.style.color =
      '#16a34a';

    message.textContent =
      '✅ تم إضافة النشاط ونشره مباشرة في الدليل.';

    clearBusinessForm();

    await loadBusinessesForAdmin();

    await refreshAdmin();

  } catch (e) {

    console.error(
      'Business create failed:',
      e
    );

    message.style.color =
      '#dc2626';

    message.textContent =
      '❌ تعذر إضافة النشاط: ' +
      (
        e.message ||
        'خطأ غير معروف'
      );
  }
}

function clearBusinessForm() {

  document
    .getElementById(
      'business-category'
    )
    .value = '';

  document
    .getElementById(
      'business-name'
    )
    .value = '';

  document
    .getElementById(
      'business-phone'
    )
    .value = '';

  document
    .getElementById(
      'business-whatsapp'
    )
    .value = '';

  document
    .getElementById(
      'business-village'
    )
    .value =
      'كفر الزيات';

  document
    .getElementById(
      'business-address'
    )
    .value = '';

  document
    .getElementById(
      'business-description'
    )
    .value = '';

  document
    .getElementById(
      'business-maps'
    )
    .value = '';

  document
    .getElementById(
      'business-verified'
    )
    .checked = false;

  document
    .getElementById(
      'business-featured'
    )
    .checked = false;
}

/* =========================================================
   BUSINESSES
========================================================= */

async function loadBusinessesForAdmin() {

  const {
    data,
    error
  } =
    await db
      .from('businesses')
      .select(`
        id,
        owner_id,
        category_id,
        name,
        phone,
        whatsapp,
        address,
        village,
        description,
        maps_url,
        verified,
        featured,
        sort_order,
        status,
        created_at,
        categories:category_id(
          name,
          icon
        )
      `)
      .order(
        'created_at',
        {
          ascending: false
        }
      );

  if (error) {

    console.error(
      'Admin businesses error:',
      error
    );

    return;
  }

  adminBusinesses =
    data || [];

  renderPendingBusinesses();

  renderAllBusinesses();
}

function renderPendingBusinesses() {

  const el =
    document.getElementById(
      'admin-business-pending'
    );

  const pending =
    adminBusinesses.filter(
      b => b.status === 'pending'
    );

  el.innerHTML =
    pending.map(
      business =>
        businessCard(
          business,
          true
        )
    ).join('')
    ||
    `
      <div class="admin-card">
        لا توجد طلبات إضافة معلقة.
      </div>
    `;
}

function renderAllBusinesses() {

  const el =
    document.getElementById(
      'admin-business-list'
    );

  el.innerHTML =
    adminBusinesses.map(
      business =>
        businessCard(
          business,
          false
        )
    ).join('')
    ||
    `
      <div class="admin-card">
        لا توجد محلات أو خدمات.
      </div>
    `;
}

function businessCard(
  b,
  pendingMode
) {

  const category =
    b.categories?.name ||
    'بدون تصنيف';

  const icon =
    b.categories?.icon ||
    '📍';

  const statusLabels = {
    pending:
      '⏳ معلق',

    active:
      '✅ نشط',

    rejected:
      '❌ مرفوض',

    suspended:
      '⛔ موقوف'
  };

  return `

    <article class="admin-card">

      <div class="admin-row">

        <div style="flex:1;">

          <b>
            ${escapeHTML(icon)}
            ${escapeHTML(b.name)}
          </b>

          <div class="admin-meta">
            ${escapeHTML(category)}
            •
            ${escapeHTML(b.phone)}
          </div>

          ${
            b.address
              ? `
                <div class="admin-meta">
                  📍
                  ${escapeHTML(b.address)}
                </div>
              `
              : ''
          }

          <div class="admin-meta">
            ${
              statusLabels[
                b.status
              ] ||
              escapeHTML(b.status)
            }

            ${
              b.verified
                ? ' • ✅ موثّق'
                : ''
            }

            ${
              b.featured
                ? ' • ⭐ مميز'
                : ''
            }
          </div>

        </div>

        <div class="admin-actions">

          ${
            pendingMode
              ? `
                <button
                  class="admin-btn ok"
                  onclick="
                    reviewBusiness(
                      '${b.id}',
                      'active'
                    )
                  "
                >
                  قبول
                </button>

                <button
                  class="admin-btn no"
                  onclick="
                    reviewBusiness(
                      '${b.id}',
                      'rejected'
                    )
                  "
                >
                  رفض
                </button>
              `
              : ''
          }

          ${
            b.status === 'active'
              ? `
                <button
                  class="admin-btn no"
                  onclick="
                    reviewBusiness(
                      '${b.id}',
                      'suspended'
                    )
                  "
                >
                  إيقاف
                </button>
              `
              : ''
          }

          ${
            b.status === 'suspended' ||
            b.status === 'rejected'
              ? `
                <button
                  class="admin-btn ok"
                  onclick="
                    reviewBusiness(
                      '${b.id}',
                      'active'
                    )
                  "
                >
                  تفعيل
                </button>
              `
              : ''
          }

          <button
            class="admin-btn view"
            onclick="
              toggleBusinessVerified(
                '${b.id}',
                ${!b.verified}
              )
            "
          >
            ${
              b.verified
                ? 'إلغاء التوثيق'
                : 'توثيق'
            }
          </button>

          <button
            class="admin-btn view"
            onclick="
              toggleBusinessFeatured(
                '${b.id}',
                ${!b.featured}
              )
            "
          >
            ${
              b.featured
                ? 'إلغاء التمييز'
                : '⭐ تمييز'
            }
          </button>

          <button
            class="admin-btn no"
            onclick="
              deleteBusiness(
                '${b.id}'
              )
            "
          >
            حذف
          </button>

        </div>

      </div>

    </article>
  `;
}

/* =========================================================
   BUSINESS REVIEW
========================================================= */

async function reviewBusiness(
  id,
  action
) {

  const {
    error
  } =
    await db.rpc(
      'admin_review_business',
      {
        p_business_id:
          id,

        p_action:
          action
      }
    );

  if (error) {

    console.error(
      'Review business error:',
      error
    );

    return alert(
      'تعذر تنفيذ العملية: ' +
      error.message
    );
  }

  await loadBusinessesForAdmin();

  await refreshAdmin();
}

/* =========================================================
   VERIFIED
========================================================= */

async function toggleBusinessVerified(
  id,
  verified
) {

  const {
    error
  } =
    await db.rpc(
      'admin_set_business_verified',
      {
        p_business_id:
          id,

        p_verified:
          verified
      }
    );

  if (error) {

    console.error(
      'Verify business error:',
      error
    );

    return alert(
      'تعذر تنفيذ العملية'
    );
  }

  await loadBusinessesForAdmin();
}

/* =========================================================
   FEATURED
========================================================= */

async function toggleBusinessFeatured(
  id,
  featured
) {

  const {
    error
  } =
    await db.rpc(
      'admin_set_business_featured',
      {
        p_business_id:
          id,

        p_featured:
          featured,

        p_sort_order:
          0
      }
    );

  if (error) {

    console.error(
      'Featured business error:',
      error
    );

    return alert(
      'تعذر تنفيذ العملية'
    );
  }

  await loadBusinessesForAdmin();
}

/* =========================================================
   DELETE BUSINESS
========================================================= */

async function deleteBusiness(id) {

  if (
    !confirm(
      'هل أنت متأكد من حذف النشاط نهائياً؟'
    )
  ) {
    return;
  }

  const {
    error
  } =
    await db
      .from('businesses')
      .delete()
      .eq('id', id);

  if (error) {

    console.error(
      'Delete business error:',
      error
    );

    return alert(
      'تعذر حذف النشاط'
    );
  }

  await loadBusinessesForAdmin();

  await refreshAdmin();
}

/* =========================================================
   CHARGES
========================================================= */

async function renderCharges(list) {

  const el =
    document.getElementById(
      'admin-charges'
    );

  const blocks = [];

  for (const r of list) {

    let url = '';

    const { data } =
      await db.storage
        .from('receipts')
        .createSignedUrl(
          r.receipt_url,
          300
        );

    url =
      data?.signedUrl ||
      '';

    blocks.push(`

      <article class="admin-card">

        <div class="admin-row">

          <div>

            <b>
              ${escapeHTML(
                r.profiles?.name ||
                'مستخدم'
              )}
              —
              ${Number(
                r.amount
              ).toLocaleString()}
              جنيه
            </b>

            <div class="admin-meta">

              ${escapeHTML(
                r.profiles?.phone ||
                ''
              )}

              •

              ${new Date(
                r.created_at
              ).toLocaleString(
                'ar-EG'
              )}

            </div>

            ${
              url
                ? `
                  <a
                    href="${url}"
                    target="_blank"
                    class="admin-btn view"
                  >
                    فتح الإيصال
                  </a>

                  <br>

                  <img
                    class="receipt-img"
                    src="${url}"
                    alt="إيصال"
                  >
                `
                : ''
            }

          </div>

          <div class="admin-actions">

            <button
              class="admin-btn ok"
              onclick="
                reviewCharge(
                  '${r.id}',
                  true
                )
              "
            >
              اعتماد وإضافة الرصيد
            </button>

            <button
              class="admin-btn no"
              onclick="
                reviewCharge(
                  '${r.id}',
                  false
                )
              "
            >
              رفض
            </button>

          </div>

        </div>

      </article>

    `);
  }

  el.innerHTML =
    blocks.join('')
    ||
    `
      <div class="admin-card">
        لا توجد طلبات شحن معلقة.
      </div>
    `;
}

async function reviewCharge(
  id,
  approve
) {

  if (
    !confirm(
      approve
        ? 'تأكيد اعتماد الشحن وإضافة الرصيد؟'
        : 'تأكيد رفض الطلب؟'
    )
  ) {
    return;
  }

  const {
    error
  } =
    await db.rpc(
      'admin_review_charge',
      {
        p_request_id:
          id,

        p_approve:
          approve
      }
    );

  if (error) {

    console.error(
      'Review charge error:',
      error
    );

    return alert(
      'تعذر تنفيذ العملية: ' +
      error.message
    );
  }

  await refreshAdmin();
}

/* =========================================================
   START
========================================================= */

window.addEventListener(
  'load',
  adminInit
);
