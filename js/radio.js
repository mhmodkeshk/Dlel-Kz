/* ===== راديو Phase 1 ===== */

let radioOn = false;
let hlsInstance = null;

const RADIO_SRC =
  'https://live.eu-north-1a.cf.dmcdn.net/sec2(p4GrIkudlkIEQFI2_40q6xDeCm_9u3nGLo7tUkFZ3j4mqie2PPlqxVvC5FIWunaNaHycnW4QCKxXk8ZD-rony2jx4ZJtsWQHX4FVDFYCtcfHKBK4HJ14WgWHDC2i7k2o)/dm/3/x84wyku/s/live-480.m3u8';

let radioAudio = null;

function getRadioAudio() {
  if (radioAudio) return radioAudio;

  radioAudio = document.createElement('audio');
  radioAudio.id = 'radioAudio';
  radioAudio.preload = 'none';
  radioAudio.setAttribute('playsinline', '');
  radioAudio.style.display = 'none';

  document.body.appendChild(radioAudio);

  radioAudio.addEventListener('play', () => {
    setRadioUI(true);
  });

  radioAudio.addEventListener('pause', () => {
    setRadioUI(false);
  });

  radioAudio.addEventListener('ended', () => {
    setRadioUI(false);
  });

  radioAudio.addEventListener('error', () => {
    console.error('Radio playback error:', radioAudio.error);
    setRadioUI(false);

    if (typeof showToast === 'function') {
      showToast('⚠️ تعذر تشغيل الراديو حالياً');
    }
  });

  setupMediaSession();

  return radioAudio;
}


function setRadioUI(playing) {
  const dot = document.getElementById('radio-dot');
  const btn = document.getElementById('radio-ctrl-btn');
  const sub = document.getElementById('radio-status');

  radioOn = playing;

  if (dot) {
    dot.classList.toggle('on', playing);
  }

  if (btn) {
    btn.textContent = playing ? '⏸️' : '▶️';
    btn.classList.toggle('playing', playing);
  }

  if (sub) {
    sub.textContent =
      playing
        ? '🔴 يبث الآن'
        : 'اضغط لتشغيل البث';
  }
}


function toggleRadioBar() {
  const bar = document.getElementById('radio-bar');

  if (!bar) return;

  bar.style.display =
    bar.style.display === 'none'
      ? 'flex'
      : 'none';
}


async function toggleRadio() {
  const audio = getRadioAudio();

  if (!radioOn) {
    try {
      await startRadio();
    } catch (e) {
      console.error('Radio start failed:', e);

      if (typeof showToast === 'function') {
        showToast('⚠️ تعذر تشغيل الراديو');
      }
    }
  } else {
    audio.pause();
  }
}


async function startRadio() {
  const audio = getRadioAudio();

  if (audio.canPlayType('application/vnd.apple.mpegurl')) {
    audio.src = RADIO_SRC;
    await audio.play();
    return;
  }

  if (window.Hls && window.Hls.isSupported()) {
    if (hlsInstance) {
      hlsInstance.destroy();
    }

    hlsInstance = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hlsInstance.loadSource(RADIO_SRC);
    hlsInstance.attachMedia(audio);

    await new Promise((resolve, reject) => {
      hlsInstance.on(
        window.Hls.Events.MANIFEST_PARSED,
        resolve
      );

      hlsInstance.on(
        window.Hls.Events.ERROR,
        (_event, data) => {
          if (data.fatal) reject(data);
        }
      );
    });

    await audio.play();
    return;
  }

  throw new Error('HLS_NOT_SUPPORTED');
}


function stopRadio() {
  const audio = getRadioAudio();

  audio.pause();
  audio.removeAttribute('src');
  audio.load();

  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }

  setRadioUI(false);
}


function setupMediaSession() {
  if (!('mediaSession' in navigator)) {
    return;
  }

  try {
    navigator.mediaSession.metadata =
      new MediaMetadata({
        title: 'إذاعة القرآن الكريم',
        artist: 'دليل كفر الزيات',
        album: 'البث المباشر'
      });

    navigator.mediaSession.setActionHandler(
      'play',
      async () => {
        try {
          await startRadio();
        } catch (_) {}
      }
    );

    navigator.mediaSession.setActionHandler(
      'pause',
      () => {
        getRadioAudio().pause();
      }
    );

    navigator.mediaSession.setActionHandler(
      'stop',
      () => {
        stopRadio();
      }
    );

  } catch (e) {
    console.warn(
      'Media Session unavailable:',
      e
    );
  }
}


window.addEventListener('load', () => {
  getRadioAudio();
  setRadioUI(false);
});
