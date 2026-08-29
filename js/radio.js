/* =========================================================
   دليل كفر الزيات
   Radio Player — Phase 1
========================================================= */

let radioOn = false;

let radioAudio = null;

let hlsInstance = null;


/*
  ملاحظة:
  رابط Dailymotion الحالي رابط مؤقت.
  نستخدمه الآن لاختبار تشغيل الخلفية.
*/

const RADIO_SRC =
  'https://live.eu-north-1a.cf.dmcdn.net/sec2(p4GrIkudlkIEQFI2_40q6xDeCm_9u3nGLo7tUkFZ3j4mqie2PPlqxVvC5FIWunaNaHycnW4QCKxXk8ZD-rony2jx4ZJtsWQHX4FVDFYCtcfHKBK4HJ14WgWHDC2i7k2o)/dm/3/x84wyku/s/live-480.m3u8';


/* =========================================================
   CREATE AUDIO
========================================================= */

function getRadioAudio() {

  if (radioAudio) {
    return radioAudio;
  }


  radioAudio =
    document.createElement(
      'audio'
    );


  radioAudio.id =
    'radioAudio';


  radioAudio.preload =
    'none';


  radioAudio.setAttribute(
    'playsinline',
    ''
  );


  /*
    مهم للموبايل.
    نخلي عنصر الصوت نفسه موجود
    طوال فترة فتح التطبيق.
  */

  radioAudio.style.position =
    'fixed';

  radioAudio.style.width =
    '1px';

  radioAudio.style.height =
    '1px';

  radioAudio.style.opacity =
    '0';

  radioAudio.style.pointerEvents =
    'none';


  document.body.appendChild(
    radioAudio
  );


  /* =========================
     AUDIO EVENTS
  ========================== */

  radioAudio.addEventListener(
    'playing',
    () => {

      setRadioUI(true);

      updateMediaSessionState(
        'playing'
      );

    }
  );


  radioAudio.addEventListener(
    'play',
    () => {

      setRadioUI(true);

      updateMediaSessionState(
        'playing'
      );

    }
  );


  radioAudio.addEventListener(
    'pause',
    () => {

      setRadioUI(false);

      updateMediaSessionState(
        'paused'
      );

    }
  );


  radioAudio.addEventListener(
    'ended',
    () => {

      setRadioUI(false);

      updateMediaSessionState(
        'none'
      );

    }
  );


  radioAudio.addEventListener(
    'waiting',
    () => {

      const status =
        document.getElementById(
          'radio-status'
        );

      if (
        status &&
        radioOn
      ) {

        status.textContent =
          '⏳ جاري إعادة الاتصال بالبث...';

      }

    }
  );


  radioAudio.addEventListener(
    'error',
    () => {

      console.error(
        'Radio audio error:',
        radioAudio.error
      );


      setRadioUI(false);


      if (
        typeof showToast ===
        'function'
      ) {

        showToast(
          '⚠️ تعذر تشغيل الراديو حالياً'
        );

      }

    }
  );


  setupMediaSession();


  return radioAudio;
}


/* =========================================================
   UI
========================================================= */

function setRadioUI(playing) {

  radioOn =
    Boolean(playing);


  const dot =
    document.getElementById(
      'radio-dot'
    );


  const button =
    document.getElementById(
      'radio-ctrl-btn'
    );


  const status =
    document.getElementById(
      'radio-status'
    );


  if (dot) {

    dot.classList.toggle(
      'on',
      radioOn
    );

  }


  if (button) {

    button.textContent =
      radioOn
        ? '⏸️'
        : '▶️';


    button.classList.toggle(
      'playing',
      radioOn
    );

  }


  if (status) {

    status.textContent =
      radioOn
        ? '🔴 يبث الآن'
        : 'اضغط لتشغيل البث';

  }

}


/* =========================================================
   RADIO BAR
========================================================= */

function toggleRadioBar() {

  const bar =
    document.getElementById(
      'radio-bar'
    );


  if (!bar) return;


  /*
    إخفاء الشريط لا يوقف الصوت.
  */

  if (
    bar.style.display ===
    'none'
  ) {

    bar.style.display =
      'flex';

  } else {

    bar.style.display =
      'none';

  }

}


/* =========================================================
   TOGGLE
========================================================= */

async function toggleRadio() {

  const audio =
    getRadioAudio();


  if (
    audio.paused ||
    !radioOn
  ) {

    try {

      await startRadio();

    } catch (error) {

      console.error(
        'Radio start error:',
        error
      );


      setRadioUI(false);


      if (
        typeof showToast ===
        'function'
      ) {

        showToast(
          '⚠️ تعذر تشغيل الراديو'
        );

      }

    }

  } else {

    pauseRadio();

  }

}


/* =========================================================
   START
========================================================= */

async function startRadio() {

  const audio =
    getRadioAudio();


  /*
    Safari / iPhone
    عنده دعم HLS Native.
  */

  if (
    audio.canPlayType(
      'application/vnd.apple.mpegurl'
    )
  ) {

    if (
      audio.src !==
      RADIO_SRC
    ) {

      audio.src =
        RADIO_SRC;

    }


    await audio.play();


    return;

  }


  /*
    Chrome / Edge / Android
    نستخدم hls.js.
  */

  if (
    window.Hls &&
    window.Hls.isSupported()
  ) {

    if (!hlsInstance) {

      hlsInstance =
        new window.Hls({

          enableWorker:
            true,

          lowLatencyMode:
            true,

          backBufferLength:
            30

        });


      hlsInstance.loadSource(
        RADIO_SRC
      );


      hlsInstance.attachMedia(
        audio
      );


      hlsInstance.on(
        window.Hls.Events.ERROR,
        (
          event,
          data
        ) => {

          console.warn(
            'HLS radio event:',
            data
          );


          if (
            !data.fatal
          ) {
            return;
          }


          switch (
            data.type
          ) {

            case window.Hls
              .ErrorTypes
              .NETWORK_ERROR:

              /*
                نحاول الاتصال من جديد.
              */

              try {

                hlsInstance
                  .startLoad();

              } catch (_) {}

              break;


            case window.Hls
              .ErrorTypes
              .MEDIA_ERROR:

              try {

                hlsInstance
                  .recoverMediaError();

              } catch (_) {}

              break;


            default:

              try {

                hlsInstance
                  .destroy();

              } catch (_) {}


              hlsInstance =
                null;


              setRadioUI(
                false
              );

              break;

          }

        }
      );


      await new Promise(
        (
          resolve,
          reject
        ) => {

          let finished =
            false;


          hlsInstance.on(
            window.Hls.Events
              .MANIFEST_PARSED,
            () => {

              if (
                finished
              ) {
                return;
              }

              finished =
                true;

              resolve();

            }
          );


          setTimeout(
            () => {

              if (
                finished
              ) {
                return;
              }

              finished =
                true;

              reject(
                new Error(
                  'RADIO_MANIFEST_TIMEOUT'
                )
              );

            },
            10000
          );

        }
      );

    }


    await audio.play();


    return;

  }


  throw new Error(
    'HLS_NOT_SUPPORTED'
  );
}


/* =========================================================
   PAUSE
========================================================= */

function pauseRadio() {

  const audio =
    getRadioAudio();


  audio.pause();


  /*
    لا نحذف src هنا.
    وبالتالي لو المستخدم ضغط Play
    يرجع يكمل بسرعة.
  */

  setRadioUI(
    false
  );

}


/* =========================================================
   STOP COMPLETELY
========================================================= */

function stopRadio() {

  const audio =
    getRadioAudio();


  try {

    audio.pause();

  } catch (_) {}


  try {

    audio.removeAttribute(
      'src'
    );


    audio.load();

  } catch (_) {}


  if (
    hlsInstance
  ) {

    try {

      hlsInstance.destroy();

    } catch (_) {}


    hlsInstance =
      null;

  }


  setRadioUI(
    false
  );


  updateMediaSessionState(
    'none'
  );

}


/* =========================================================
   MEDIA SESSION
========================================================= */

function setupMediaSession() {

  if (
    !(
      'mediaSession'
      in navigator
    )
  ) {

    return;

  }


  try {

    navigator
      .mediaSession
      .metadata =
        new MediaMetadata({

          title:
            'إذاعة القرآن الكريم',

          artist:
            'دليل كفر الزيات',

          album:
            'البث المباشر'

        });


    navigator
      .mediaSession
      .setActionHandler(
        'play',
        async () => {

          try {

            await startRadio();

          } catch (
            error
          ) {

            console.error(
              error
            );

          }

        }
      );


    navigator
      .mediaSession
      .setActionHandler(
        'pause',
        () => {

          pauseRadio();

        }
      );


    navigator
      .mediaSession
      .setActionHandler(
        'stop',
        () => {

          stopRadio();

        }
      );


  } catch (
    error
  ) {

    console.warn(
      'Media Session error:',
      error
    );

  }

}


/* =========================================================
   MEDIA SESSION STATE
========================================================= */

function updateMediaSessionState(
  state
) {

  if (
    !(
      'mediaSession'
      in navigator
    )
  ) {

    return;

  }


  try {

    navigator
      .mediaSession
      .playbackState =
        state;

  } catch (_) {}

}


/* =========================================================
   PAGE VISIBILITY
========================================================= */

/*
  مهم:
  لما المستخدم يخرج من التطبيق
  أو الشاشة تتقفل،
  إحنا لا نعمل Pause أبداً.

  نظام التشغيل هو الذي يقرر
  هل يسمح باستمرار الصوت.
*/

document.addEventListener(
  'visibilitychange',
  () => {

    if (
      document.hidden &&
      radioOn
    ) {

      console.log(
        'Radio continues in background'
      );

    }

  }
);


/* =========================================================
   PREVENT ACCIDENTAL STOP
========================================================= */

/*
  التنقل داخل الموقع يتم Screens
  وليس Page Reload،
  لذلك عنصر audio سيظل موجود.
*/


/* =========================================================
   INIT
========================================================= */

window.addEventListener(
  'load',
  () => {

    getRadioAudio();

    setRadioUI(
      false
    );

  }
);
