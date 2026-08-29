/* =========================================================
   دليل كفر الزيات — الخدمات والتصنيفات
========================================================= */


/* =========================================================
   HELPERS
========================================================= */

function findServiceById(id) {
  for (const [categoryName, category] of Object.entries(data)) {
    const service = category.services.find(
      item => String(item.id) === String(id)
    );

    if (service) {
      return {
        service,
        categoryName,
        icon: category.icon
      };
    }
  }

  return null;
}


function getServiceWhatsApp(service) {
  return service.whatsapp || service.phone || '';
}


function isSafeMapsUrl(url) {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch (_) {
    return false;
  }
}


/* =========================================================
   رندر التصنيفات
========================================================= */

function renderCats() {

  const catsCount =
    document.getElementById('cats-count');

  const catsGrid =
    document.getElementById('cats-grid');

  if (catsCount) {
    catsCount.textContent =
      `${totalCats} تصنيف`;
  }

  if (!catsGrid) return;


  catsGrid.innerHTML =
    Object.entries(data)
      .map(([name, cat]) => `

        <div
          class="cat-card"
          data-category="${escapeHTML(name)}"
        >

          <span class="cat-emoji">
            ${escapeHTML(cat.icon)}
          </span>

          <div class="cat-name">
            ${escapeHTML(name)}
          </div>

          <div class="cat-count">
            ${cat.services.length} خدمة
          </div>

        </div>

      `)
      .join('');


  catsGrid
    .querySelectorAll('.cat-card')
    .forEach(card => {

      card.addEventListener(
        'click',
        () => {
          showCategory(
            card.dataset.category
          );
        }
      );

    });
}


/* =========================================================
   عرض التصنيف
========================================================= */

function showCategory(name) {

  const cat = data[name];

  if (!cat) {
    return showToast(
      '⚠️ التصنيف غير موجود'
    );
  }


  const title =
    document.getElementById(
      'cat-screen-title'
    );

  const list =
    document.getElementById(
      'services-list'
    );


  title.innerHTML =
    `${escapeHTML(cat.icon)} ${escapeHTML(name)}`;


  /*
    الأنشطة المميزة تظهر أولاً.
  */

  const services =
    [...cat.services].sort(
      (a, b) =>
        Number(Boolean(b.featured)) -
        Number(Boolean(a.featured))
    );


  list.innerHTML =
    services.length
      ? services.map(s => {

          const isFav =
            isFavorite(
              s.name,
              s.phone
            );

          const whatsapp =
            getServiceWhatsApp(s);

          const logo =
            safeImageSrc(
              s.logo_url || ''
            );

          return `

            <div
              class="
                service-card
                ${s.featured ? 'service-featured' : ''}
              "
              onclick="
                showServiceDetailById(
                  '${s.id}'
                )
              "
            >

              <div class="service-avatar">

                ${
                  logo
                    ? `
                      <img
                        src="${logo}"
                        alt="${escapeHTML(s.name)}"
                        style="
                          width:100%;
                          height:100%;
                          object-fit:cover;
                          border-radius:12px;
                        "
                      >
                    `
                    : escapeHTML(cat.icon)
                }

              </div>


              <div style="flex:1;min-width:0;">

                <div class="service-name">

                  ${escapeHTML(s.name)}

                  ${
                    s.verified
                      ? `
                        <span
                          title="نشاط موثّق"
                          style="
                            color:#2563eb;
                            margin-right:3px;
                          "
                        >
                          ✅
                        </span>
                      `
                      : ''
                  }

                  ${
                    s.featured
                      ? `
                        <span
                          title="نشاط مميز"
                          style="
                            color:#f59e0b;
                            margin-right:3px;
                          "
                        >
                          ⭐
                        </span>
                      `
                      : ''
                  }

                </div>


                <div class="service-phone">
                  📞 ${escapeHTML(s.phone)}
                </div>


                ${
                  s.village
                    ? `
                      <div
                        style="
                          font-size:10px;
                          color:var(--muted);
                          margin-top:2px;
                        "
                      >
                        📍 ${escapeHTML(s.village)}
                      </div>
                    `
                    : ''
                }

              </div>


              <div class="service-actions">

                <button
                  class="
                    fav-heart-btn
                    ${isFav ? 'active' : ''}
                  "
                  onclick="
                    event.stopPropagation();
                    toggleServiceFavorite(
                      '${s.id}'
                    )
                  "
                >

                  <span class="heart">
                    ${isFav ? '❤️' : '🤍'}
                  </span>

                </button>


                <a
                  class="svc-call-btn"
                  href="tel:${safePhone(s.phone)}"
                  onclick="
                    event.stopPropagation();
                  "
                >
                  📞
                </a>


                <div
                  class="svc-wa-btn"
                  onclick="
                    event.stopPropagation();
                    openWA(
                      '${safePhone(whatsapp)}'
                    )
                  "
                >
                  💬
                </div>

              </div>

            </div>

          `;

        }).join('')

      : `

        <div
          style="
            text-align:center;
            padding:50px 20px;
            color:var(--muted);
          "
        >
          لا توجد خدمات في هذا التصنيف حالياً
        </div>

      `;


  switchToScreen(
    'screen-category'
  );
}


/* =========================================================
   المفضلة
========================================================= */

function toggleServiceFavorite(id) {

  const result =
    findServiceById(id);

  if (!result) return;


  const {
    service,
    categoryName,
    icon
  } = result;


  toggleFavorite(
    service.name,
    icon,
    service.phone,
    categoryName
  );


  /*
    إعادة رسم الشاشة لو المستخدم
    داخل التصنيف.
  */

  const categoryScreen =
    document.getElementById(
      'screen-category'
    );

  if (
    categoryScreen &&
    categoryScreen.classList.contains(
      'active'
    )
  ) {
    showCategory(
      categoryName
    );
  }
}


/* =========================================================
   تفاصيل النشاط
========================================================= */

let serviceDetailPrevScreen =
  'home';

let svcDetailSearchQuery =
  '';


function showServiceDetailById(id) {

  const result =
    findServiceById(id);

  if (!result) {
    return showToast(
      '⚠️ تعذر العثور على النشاط'
    );
  }


  const {
    service,
    categoryName,
    icon
  } = result;


  showServiceDetail(
    service,
    icon,
    categoryName
  );
}


function showServiceDetail(
  service,
  icon,
  category
) {

  const phone =
    service.phone || '';

  const whatsapp =
    getServiceWhatsApp(
      service
    );

  const isFav =
    isFavorite(
      service.name,
      phone
    );


  const logo =
    safeImageSrc(
      service.logo_url || ''
    );


  const mapsUrl =
    isSafeMapsUrl(
      service.maps_url
    )
      ? service.maps_url
      : '';


  svcDetailSearchQuery =
    document.getElementById(
      'search-input'
    )?.value || '';


  const content =
    document.getElementById(
      'service-detail-content'
    );


  content.innerHTML = `

    <div class="svc-detail-wrap">


      <!-- رأس النشاط -->

      <div class="svc-detail-header">

        <div class="svc-detail-icon">

          ${
            logo
              ? `
                <img
                  src="${logo}"
                  alt="${escapeHTML(service.name)}"
                  style="
                    width:100%;
                    height:100%;
                    object-fit:cover;
                    border-radius:14px;
                  "
                >
              `
              : escapeHTML(icon)
          }

        </div>


        <div style="flex:1;">

          <div class="svc-detail-name">

            ${escapeHTML(service.name)}

          </div>


          <div
            style="
              display:flex;
              gap:6px;
              flex-wrap:wrap;
              margin-top:5px;
            "
          >

            ${
              service.verified
                ? `
                  <span
                    style="
                      background:#eff6ff;
                      color:#2563eb;
                      border-radius:20px;
                      padding:3px 8px;
                      font-size:10px;
                      font-weight:700;
                    "
                  >
                    ✅ نشاط موثّق
                  </span>
                `
                : ''
            }


            ${
              service.featured
                ? `
                  <span
                    style="
                      background:#fff7ed;
                      color:#d97706;
                      border-radius:20px;
                      padding:3px 8px;
                      font-size:10px;
                      font-weight:700;
                    "
                  >
                    ⭐ نشاط مميز
                  </span>
                `
                : ''
            }

          </div>


          <div class="svc-detail-cat">

            ${escapeHTML(category)}

          </div>


          <div class="svc-detail-phone">

            📞 ${escapeHTML(phone)}

          </div>

        </div>

      </div>


      <!-- أزرار التواصل -->

      <div class="svc-actions">

        <button
          class="svc-action-btn wa"
          onclick="
            openWA(
              '${safePhone(whatsapp)}'
            )
          "
        >
          💬 واتساب
        </button>


        <a
          class="svc-action-btn call"
          href="tel:${safePhone(phone)}"
        >
          📞 اتصال
        </a>

      </div>


      <!-- العنوان -->

      ${
        service.address ||
        service.village
          ? `

            <div
              style="
                background:var(--bg);
                border-radius:14px;
                padding:14px;
                margin-bottom:12px;
              "
            >

              <div
                style="
                  font-size:12px;
                  font-weight:700;
                  margin-bottom:5px;
                "
              >
                📍 العنوان
              </div>


              ${
                service.address
                  ? `
                    <div
                      style="
                        font-size:13px;
                        line-height:1.7;
                      "
                    >
                      ${escapeHTML(service.address)}
                    </div>
                  `
                  : ''
              }


              ${
                service.village
                  ? `
                    <div
                      style="
                        font-size:11px;
                        color:var(--muted);
                        margin-top:3px;
                      "
                    >
                      ${escapeHTML(service.village)}
                    </div>
                  `
                  : ''
              }

            </div>

          `
          : ''
      }


      <!-- الوصف -->

      ${
        service.description
          ? `

            <div
              style="
                background:var(--bg);
                border-radius:14px;
                padding:14px;
                margin-bottom:12px;
              "
            >

              <div
                style="
                  font-size:12px;
                  font-weight:700;
                  margin-bottom:6px;
                "
              >
                ℹ️ عن النشاط
              </div>

              <div
                style="
                  font-size:12px;
                  line-height:1.8;
                  color:var(--text);
                "
              >
                ${escapeHTML(service.description)}
              </div>

            </div>

          `
          : ''
      }


      <!-- الخريطة -->

      ${
        mapsUrl
          ? `

            <a
              href="${escapeHTML(mapsUrl)}"
              target="_blank"
              rel="noopener noreferrer"
              class="main-btn outline"
              style="
                display:block;
                text-align:center;
                text-decoration:none;
                margin-bottom:12px;
              "
            >
              🗺️ افتح الموقع على Google Maps
            </a>

          `
          : ''
      }


      <!-- مشاركة ومفضلة -->

      <div class="svc-actions">

        <button
          class="svc-action-btn share"
          onclick="
            shareServiceById(
              '${service.id}'
            )
          "
        >
          📤 مشاركة
        </button>


        <button
          class="
            svc-action-btn
            fav-action
            ${isFav ? 'active' : ''}
          "
          onclick="
            toggleServiceFavoriteFromDetail(
              '${service.id}'
            )
          "
        >

          ${
            isFav
              ? '❤️ في المفضلة'
              : '🤍 أضف للمفضلة'
          }

        </button>

      </div>


    </div>
  `;


  const screens =
    [
      'category',
      'search',
      'home'
    ];


  const active =
    screens.find(
      tab =>
        document
          .getElementById(
            'screen-' + tab
          )
          ?.classList
          .contains('active')
    );


  serviceDetailPrevScreen =
    active || 'home';


  switchToScreen(
    'screen-service-detail'
  );
}


/* =========================================================
   مفضلة من صفحة التفاصيل
========================================================= */

function toggleServiceFavoriteFromDetail(
  id
) {

  const result =
    findServiceById(id);

  if (!result) return;


  const {
    service,
    categoryName,
    icon
  } = result;


  toggleFavorite(
    service.name,
    icon,
    service.phone,
    categoryName
  );


  /*
    إعادة رسم التفاصيل
    لتحديث شكل الزر.
  */

  showServiceDetail(
    service,
    icon,
    categoryName
  );
}


/* =========================================================
   مشاركة النشاط
========================================================= */

function shareServiceById(id) {

  const result =
    findServiceById(id);

  if (!result) return;


  const {
    service,
    categoryName
  } = result;


  let text = `📍 ${service.name}`;

  text +=
    `\n📂 ${categoryName}`;

  text +=
    `\n📞 ${service.phone}`;


  if (service.address) {
    text +=
      `\n🏠 ${service.address}`;
  }


  if (service.village) {
    text +=
      `\n📌 ${service.village}`;
  }


  if (service.maps_url) {
    text +=
      `\n🗺️ ${service.maps_url}`;
  }


  text +=
    `\n\n🗺️ دليل كفر الزيات و القري المجاوره`;


  if (navigator.share) {

    navigator.share({
      title:
        service.name,

      text
    }).catch(() => {});

  } else {

    navigator.clipboard
      .writeText(text)
      .then(() =>
        showToast(
          '✅ تم نسخ معلومات النشاط'
        )
      );

  }
}


/*
  توافق مع أي كود قديم
  يستدعي shareService مباشرة.
*/

function shareService(
  name,
  phone
) {

  const text =
    `📍 ${name}\n` +
    `📞 ${phone}\n\n` +
    `🗺️ دليل كفر الزيات و القري المجاوره`;


  if (navigator.share) {

    navigator.share({
      title: name,
      text
    }).catch(() => {});

  } else {

    navigator.clipboard
      .writeText(text)
      .then(() =>
        showToast(
          '✅ تم نسخ المعلومات'
        )
      );

  }
}


/* =========================================================
   الرجوع من التفاصيل
========================================================= */

function goBackFromServiceDetail() {

  if (
    serviceDetailPrevScreen ===
    'search'
  ) {

    document
      .querySelectorAll(
        '.screen'
      )
      .forEach(
        s =>
          s.classList.remove(
            'active'
          )
      );


    document
      .getElementById(
        'screen-search'
      )
      .classList.add(
        'active'
      );


    document
      .querySelectorAll(
        '.nbtn'
      )
      .forEach(
        b =>
          b.classList.remove(
            'active'
          )
      );


    document
      .getElementById(
        'search-input'
      )
      .value =
        svcDetailSearchQuery;


  } else {

    switchTab(
      serviceDetailPrevScreen
    );

  }
}


/* =========================================================
   SWITCH SCREEN
========================================================= */

function switchToScreen(id) {

  document
    .querySelectorAll(
      '.screen'
    )
    .forEach(
      s =>
        s.classList.remove(
          'active'
        )
    );


  const screen =
    document.getElementById(
      id
    );


  if (screen) {
    screen.classList.add(
      'active'
    );
  }


  document
    .querySelectorAll(
      '.nbtn'
    )
    .forEach(
      b =>
        b.classList.remove(
          'active'
        )
    );
}


/* =========================================================
   البحث
========================================================= */

function handleSearch(val) {

  const q =
    val.trim();


  [
    'screen-home',
    'screen-category',
    'screen-search',
    'screen-service-detail'
  ].forEach(id => {

    const element =
      document.getElementById(id);

    if (element) {
      element.classList.remove(
        'active'
      );
    }

  });


  if (!q) {

    document
      .getElementById(
        'screen-home'
      )
      .classList.add(
        'active'
      );


    document
      .getElementById(
        'nav-home'
      )
      .classList.add(
        'active'
      );


    renderRecentSearches();

    return;
  }


  addRecentSearch(q);


  document
    .getElementById(
      'screen-search'
    )
    .classList.add(
      'active'
    );


  document
    .querySelectorAll(
      '.nbtn'
    )
    .forEach(
      b =>
        b.classList.remove(
          'active'
        )
    );


  const query =
    q.toLowerCase();


  const results = [];


  for (
    const [catName, cat]
    of Object.entries(data)
  ) {

    cat.services
      .filter(service => {

        const searchable = [

          service.name,

          catName,

          service.phone,

          service.whatsapp,

          service.address,

          service.village,

          service.description

        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();


        return searchable.includes(
          query
        );

      })
      .forEach(service => {

        results.push({
          ...service,
          cat:
            catName,
          icon:
            cat.icon
        });

      });

  }


  /*
    الأنشطة المميزة أولاً.
  */

  results.sort(
    (a, b) =>
      Number(Boolean(b.featured)) -
      Number(Boolean(a.featured))
  );


  const container =
    document.getElementById(
      'search-results-container'
    );


  container.innerHTML =
    results.length

      ? `

        <div class="sec-title">
          ${results.length}
          نتيجة لـ
          "${escapeHTML(q)}"
        </div>

        ${
          results.map(service => {

            const isFav =
              isFavorite(
                service.name,
                service.phone
              );

            const whatsapp =
              getServiceWhatsApp(
                service
              );

            return `

              <div
                class="service-card"
                onclick="
                  showServiceDetailById(
                    '${service.id}'
                  )
                "
              >

                <div class="service-avatar">
                  ${escapeHTML(service.icon)}
                </div>


                <div style="flex:1;">

                  <div class="service-name">

                    ${escapeHTML(service.name)}

                    ${
                      service.verified
                        ? ' ✅'
                        : ''
                    }

                    ${
                      service.featured
                        ? ' ⭐'
                        : ''
                    }

                  </div>


                  <div class="service-phone">

                    ${escapeHTML(service.cat)}
                    —

                    ${escapeHTML(service.phone)}

                  </div>


                  ${
                    service.village
                      ? `
                        <div
                          style="
                            font-size:10px;
                            color:var(--muted);
                            margin-top:2px;
                          "
                        >
                          📍
                          ${escapeHTML(service.village)}
                        </div>
                      `
                      : ''
                  }

                </div>


                <div class="service-actions">

                  <button
                    class="
                      fav-heart-btn
                      ${isFav ? 'active' : ''}
                    "
                    onclick="
                      event.stopPropagation();
                      toggleServiceFavorite(
                        '${service.id}'
                      )
                    "
                  >

                    <span class="heart">
                      ${isFav ? '❤️' : '🤍'}
                    </span>

                  </button>


                  <a
                    class="svc-call-btn"
                    href="tel:${safePhone(service.phone)}"
                    onclick="
                      event.stopPropagation();
                    "
                  >
                    📞
                  </a>


                  <div
                    class="svc-wa-btn"
                    onclick="
                      event.stopPropagation();
                      openWA(
                        '${safePhone(whatsapp)}'
                      )
                    "
                  >
                    💬
                  </div>

                </div>

              </div>

            `;

          }).join('')
        }

      `

      : `

        <div
          style="
            text-align:center;
            padding:60px 20px;
            color:var(--muted);
          "
        >

          <div
            style="
              font-size:48px;
              margin-bottom:12px;
            "
          >
            🔍
          </div>

          <div style="font-size:14px;">
            مفيش نتائج لـ
            "${escapeHTML(q)}"
          </div>

        </div>

      `;
}
