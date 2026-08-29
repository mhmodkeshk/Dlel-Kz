/* ===== Supabase Authentication - Email + Password ===== */

function renderAccount() {
  const el = document.getElementById('account-content');

  if (!backendReady) {
    el.innerHTML = `
      <div class="auth-screen">
        <div class="auth-logo">
          <div class="logo">🔌</div>
          <h2>توصيل قاعدة البيانات مطلوب</h2>
          <p>أضف بيانات Supabase في js/config.js لتفعيل الحسابات الحقيقية.</p>
        </div>
      </div>
    `;
    return;
  }

  if (!currentUser) {
    el.innerHTML = `
      <div class="auth-screen">
        <div class="auth-logo">
          <div class="logo">🗺️</div>
          <h2>أهلاً بك في الدليل</h2>
          <p>حساب آمن متصل بقاعدة البيانات</p>
        </div>

        <div class="auth-tabs">
          <button
            class="auth-tab active"
            id="login-tab"
            onclick="showAuthTab('login')"
          >
            تسجيل الدخول
          </button>

          <button
            class="auth-tab"
            id="register-tab"
            onclick="showAuthTab('register')"
          >
            حساب جديد
          </button>
        </div>

        <div id="login-form">
          <label class="flabel">البريد الإلكتروني</label>
          <input
            type="email"
            id="login-email"
            class="finput"
            placeholder="example@email.com"
            autocomplete="email"
          >

          <label class="flabel">كلمة المرور</label>
          <div class="pass-wrap">
            <input
              type="password"
              id="login-pass"
              class="finput"
              placeholder="كلمة المرور"
              autocomplete="current-password"
            >
            <button
              class="eye-btn"
              onclick="togglePass('login-pass',this)"
              type="button"
            >
              👁️
            </button>
          </div>

          <button
            class="main-btn"
            style="margin-top:14px;"
            onclick="doLogin()"
          >
            تسجيل الدخول
          </button>
        </div>

        <div id="register-form" style="display:none;">
          <label class="flabel">الاسم *</label>
          <input
            type="text"
            id="reg-name"
            class="finput"
            placeholder="اكتب اسمك"
            maxlength="80"
          >

          <label class="flabel">رقم الموبايل *</label>
          <input
            type="tel"
            id="reg-phone"
            class="finput"
            placeholder="01xxxxxxxxx"
            maxlength="11"
            inputmode="numeric"
          >

          <label class="flabel">البريد الإلكتروني *</label>
          <input
            type="email"
            id="reg-email"
            class="finput"
            placeholder="example@email.com"
            autocomplete="email"
          >

          <label class="flabel">كلمة المرور *</label>
          <div class="pass-wrap">
            <input
              type="password"
              id="reg-pass"
              class="finput"
              placeholder="8 أحرف على الأقل"
              autocomplete="new-password"
            >
            <button
              class="eye-btn"
              onclick="togglePass('reg-pass',this)"
              type="button"
            >
              👁️
            </button>
          </div>

          <button
            class="main-btn"
            onclick="doRegister()"
          >
            إنشاء الحساب
          </button>
        </div>
      </div>
    `;
  } else {
    const favCount = getFavorites().length;

    el.innerHTML = `
      <div class="acc-header">
        <div class="acc-avatar">👤</div>

        <div style="font-size:18px;font-weight:900;">
          ${escapeHTML(currentUser.name)}
        </div>

        <div style="font-size:13px;opacity:.85;">
          ${escapeHTML(currentUser.phone || '')}
        </div>

        <div style="font-size:13px;opacity:.85;margin-top:4px;">
          💰 رصيد: ${Number(currentUser.balance || 0).toFixed(2)} جنيه
        </div>
      </div>

      <div class="acc-card">
        <div class="acc-item" onclick="switchTab('wallet')">
          <div class="acc-ico">💰</div>
          <span>محفظتي</span>
          <span style="margin-right:auto;">‹</span>
        </div>

        <div class="acc-item" onclick="switchTab('myproducts')">
          <div class="acc-ico">🛒</div>
          <span>منتجاتي للبيع</span>
          <span style="margin-right:auto;">‹</span>
        </div>

        ${
          currentUser.role === 'admin'
            ? `
              <div class="acc-item" onclick="location.href='admin.html'">
                <div class="acc-ico">🛡️</div>
                <span>لوحة الإدارة</span>
                <span style="margin-right:auto;">‹</span>
              </div>
            `
            : ''
        }
      </div>

      <div class="acc-card">
        <div class="acc-item" onclick="showFavoritesFromAccount()">
          <div class="acc-ico">❤️</div>
          <span>مفضلتي (${favCount})</span>
        </div>

        <div class="acc-item" onclick="doLogout()">
          <div class="acc-ico">🚪</div>
          <span style="color:#dc2626;">تسجيل الخروج</span>
        </div>
      </div>
    `;
  }
}

function showAuthTab(tab) {
  document.getElementById('login-form').style.display =
    tab === 'login' ? 'block' : 'none';

  document.getElementById('register-form').style.display =
    tab === 'register' ? 'block' : 'none';

  document
    .getElementById('login-tab')
    .classList.toggle('active', tab === 'login');

  document
    .getElementById('register-tab')
    .classList.toggle('active', tab === 'register');
}

function togglePass(id, btn) {
  const i = document.getElementById(id);

  i.type = i.type === 'password'
    ? 'text'
    : 'password';

  btn.textContent =
    i.type === 'password'
      ? '👁️'
      : '🙈';
}

async function doLogin() {
  try {
    const email = document
      .getElementById('login-email')
      .value
      .trim()
      .toLowerCase();

    const password =
      document.getElementById('login-pass').value;

    if (!email || !password) {
      return showToast('⚠️ اكتب الإيميل وكلمة المرور');
    }

    const { error } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login error:', error);
      throw error;
    }

    showToast('✅ تم تسجيل الدخول');

  } catch (e) {
    console.error('Login failed:', e);
    showToast('❌ تعذر تسجيل الدخول');
  }
}

async function doRegister() {
  try {
    const name = clampText(
      document.getElementById('reg-name').value,
      80
    );

    const phone = document
      .getElementById('reg-phone')
      .value
      .trim();

    const email = document
      .getElementById('reg-email')
      .value
      .trim()
      .toLowerCase();

    const password =
      document.getElementById('reg-pass').value;

    if (!name) {
      return showToast('⚠️ اكتب الاسم');
    }

    if (!/^01\d{9}$/.test(phone)) {
      return showToast('⚠️ رقم الموبايل غير صحيح');
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return showToast('⚠️ البريد الإلكتروني غير صحيح');
    }

    if (password.length < 8) {
      return showToast('⚠️ كلمة المرور لازم 8 أحرف على الأقل');
    }

    const { data, error } = await db.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone
        }
      }
    });

    if (error) {
      console.error('Signup error:', error);
      throw error;
    }

    if (data?.user && !data?.session) {
      showToast('✅ تم إنشاء الحساب — راجع بريدك لتأكيد الإيميل');
    } else {
      showToast('✅ تم إنشاء الحساب');
    }

  } catch (e) {
    console.error('Signup failed:', e);
    showToast('❌ تعذر إنشاء الحساب');
  }
}

async function doLogout() {
  await db.auth.signOut();
  currentUser = null;
  renderAccount();
  showToast('👋 تم تسجيل الخروج');
}

function showFavoritesFromAccount() {
  const f = getFavorites();

  if (!f.length) {
    return showToast('💔 لا توجد خدمات في المفضلة');
  }

  switchTab('home');

  document
    .getElementById('fav-section-home')
    .scrollIntoView({
      behavior: 'smooth'
    });
}

/* ===== استرجاع كلمة المرور ===== */

function showForgotForm() {
  const email = prompt(
    'اكتب البريد الإلكتروني المسجل لاسترجاع كلمة المرور'
  );

  if (!email) return;

  sendPasswordReset(email.trim().toLowerCase());
}

async function sendPasswordReset(email) {
  try {
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return showToast('⚠️ البريد الإلكتروني غير صحيح');
    }

    const { error } =
      await db.auth.resetPasswordForEmail(email, {
        redirectTo:
          window.location.origin + '/'
      });

    if (error) {
      console.error(
        'Password reset error:',
        error
      );
      throw error;
    }

    showToast('📧 تم إرسال رابط استرجاع كلمة المرور');

  } catch (e) {
    console.error(
      'Password reset failed:',
      e
    );

    showToast('❌ تعذر إرسال رابط الاسترجاع');
  }
}

function doResetPass() {
  showForgotForm();
}

/* ===== التنقل ===== */

function switchTab(tab) {
  document
    .querySelectorAll('.screen')
    .forEach(s =>
      s.classList.remove('active')
    );

  document
    .querySelectorAll('.nbtn')
    .forEach(b =>
      b.classList.remove('active')
    );

  document.getElementById(
    'search-input'
  ).value = '';

  const screen =
    document.getElementById(
      'screen-' + tab
    );

  if (screen) {
    screen.classList.add('active');
  }

  const nav =
    document.getElementById(
      'nav-' + tab
    );

  if (nav) {
    nav.classList.add('active');
  }

  if (tab === 'sell') {
    loadProducts().then(() => {
      renderProducts();
      showSellTab('browse');
    });
  }

  if (tab === 'wallet') {
    renderWallet();
  }

  if (tab === 'account') {
    renderAccount();
  }

  if (tab === 'myproducts') {
    renderMyProducts();
  }

  if (tab === 'home') {
    renderFavSection();
  }
}
