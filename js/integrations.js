/* ===== الطقس ===== */

const WEATHER_URL = '/api/weather';

const wIcons = {
  '01': '☀️',
  '02': '⛅',
  '03': '☁️',
  '04': '☁️',
  '09': '🌧️',
  '10': '🌦️',
  '11': '⛈️',
  '13': '❄️',
  '50': '🌫️'
};

async function fetchWeather() {
  try {
    const r = await fetch(WEATHER_URL);

    if (!r.ok) {
      throw new Error('WEATHER_REQUEST_FAILED');
    }

    const d = await r.json();

    const weatherIcon =
      d?.weather?.[0]?.icon || '';

    const icon =
      wIcons[
        weatherIcon.slice(0, 2)
      ] || '🌤️';

    const temp =
      Number(
        d?.main?.temp
      );

    const description =
      d?.weather?.[0]?.description ||
      '';

    const weatherEl =
      document.getElementById(
        'w-temp'
      );

    if (!weatherEl) return;

    if (
      Number.isFinite(temp)
    ) {
      weatherEl.textContent =
        `${icon} ${Math.round(temp)}°م` +
        (
          description
            ? ` — ${description}`
            : ''
        );
    } else {
      weatherEl.textContent =
        '🌤️ كفر الزيات';
    }

  } catch (e) {
    console.warn(
      'Weather unavailable:',
      e
    );

    const weatherEl =
      document.getElementById(
        'w-temp'
      );

    if (weatherEl) {
      weatherEl.textContent =
        '🌤️ كفر الزيات';
    }
  }
}


/* ===== واتساب ===== */

function normalizeEgyptPhone(phone) {
  const digits =
    String(phone || '')
      .replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  if (
    digits.startsWith('20')
  ) {
    return digits;
  }

  if (
    digits.startsWith('0')
  ) {
    return '2' + digits;
  }

  return digits;
}


function openWA(phone) {
  const normalized =
    normalizeEgyptPhone(phone);

  if (!normalized) {
    return showToast(
      '⚠️ رقم واتساب غير صحيح'
    );
  }

  window.open(
    `https://wa.me/${normalized}`,
    '_blank'
  );
}


function openWAMsg(
  phone,
  msg
) {
  const normalized =
    normalizeEgyptPhone(phone);

  if (!normalized) {
    return showToast(
      '⚠️ رقم واتساب غير صحيح'
    );
  }

  const message =
    String(msg || '');

  window.open(
    `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`,
    '_blank'
  );
}


/* ===== مشاركة الدليل ===== */

function shareApp() {

  const txt =
    '🗺️ دليل كفر الزيات والقرى المجاورة\n\n' +
    '🛒 بيع واشتري أي حاجة بسهولة، واعرف كل خدمات منطقتك في مكان واحد!\n\n' +
    '💊 صيدليات • 🍽️ مطاعم • 🛵 دليفري • 🛒 بيع واشتري • وخدمات أكتر بكتير\n\n' +
    '👇 ادخل الدليل واكتشف اللي حواليك\n' +
    'https://dlel-kz.vercel.app';


  if (
    navigator.share
  ) {

    navigator
      .share({
        title:
          'دليل كفر الزيات والقرى المجاورة',

        text:
          txt
      })
      .catch(() => {});

    return;
  }


  window.open(
    `https://wa.me/?text=${encodeURIComponent(txt)}`,
    '_blank'
  );
}


/* ===== Toast ===== */

let toastTimer = null;

function showToast(msg) {

  const toast =
    document.getElementById(
      'toast'
    );

  if (!toast) {
    return;
  }

  toast.textContent =
    String(msg || '');

  toast.classList.add(
    'show'
  );


  if (
    toastTimer
  ) {
    clearTimeout(
      toastTimer
    );
  }


  toastTimer =
    setTimeout(
      () => {
        toast.classList.remove(
          'show'
        );
      },
      2200
    );
}


/* ===== كاروسيل الإعلانات ===== */

let adTimer = null;
let adNow = 0;
let adTouch = 0;


const adLabels = [
  'HunkyPunky',
  'قرمشه',
  'صيدليه كشك',
  'MOLO',
  'بيع واشتري',
  'اعلانك مجانا'
];


function initAdCarousel() {

  const track =
    document.getElementById(
      'adTrack'
    );

  const dots =
    document.getElementById(
      'adDots'
    );

  const label =
    document.getElementById(
      'adLabel'
    );


  if (
    !track ||
    !dots
  ) {
    return;
  }


  const slides =
    track.children;


  if (
    !slides.length
  ) {
    return;
  }


  dots.innerHTML =
    '';


  for (
    let i = 0;
    i < slides.length;
    i++
  ) {

    const dot =
      document.createElement(
        'span'
      );


    dot.className =
      'ad-dot';


    if (
      i === 0
    ) {
      dot.classList.add(
        'active'
      );
    }


    dot.onclick =
      () => {
        moveAd(i);
      };


    dots.appendChild(
      dot
    );
  }


  if (label) {
    label.textContent =
      adLabels[0] || '';
  }


  adRun();


  track.addEventListener(
    'touchstart',
    e => {

      if (
        !e.touches?.length
      ) {
        return;
      }

      adTouch =
        e.touches[0].clientX;

      adStop();

    },
    {
      passive: true
    }
  );


  track.addEventListener(
    'touchend',
    e => {

      if (
        !e.changedTouches?.length
      ) {
        adRun();
        return;
      }


      const diff =
        adTouch -
        e.changedTouches[0].clientX;


      if (
        Math.abs(diff) > 40
      ) {

        if (
          diff > 0
        ) {
          nextAd();
        } else {
          prevAd();
        }

      }


      adRun();

    },
    {
      passive: true
    }
  );
}


function adRun() {

  adStop();

  adTimer =
    setInterval(
      nextAd,
      5000
    );
}


function adStop() {

  if (
    adTimer
  ) {
    clearInterval(
      adTimer
    );

    adTimer =
      null;
  }
}


function moveAd(i) {

  const track =
    document.getElementById(
      'adTrack'
    );

  const dots =
    document.getElementById(
      'adDots'
    );

  const label =
    document.getElementById(
      'adLabel'
    );


  if (
    !track
  ) {
    return;
  }


  const slides =
    track.children;


  if (
    !slides.length
  ) {
    return;
  }


  if (
    i < 0
  ) {
    i =
      slides.length - 1;
  }


  if (
    i >= slides.length
  ) {
    i = 0;
  }


  adNow = i;


  track.style.transform =
    `translateX(-${adNow * 100}%)`;


  if (dots) {

    const dotItems =
      dots.children;


    for (
      let j = 0;
      j < dotItems.length;
      j++
    ) {

      dotItems[j].className =
        'ad-dot' +
        (
          j === adNow
            ? ' active'
            : ''
        );

    }
  }


  if (label) {
    label.textContent =
      adLabels[adNow] || '';
  }
}


function nextAd() {
  moveAd(
    adNow + 1
  );
}


function prevAd() {
  moveAd(
    adNow - 1
  );
}
