/* ===== راديو ===== */
let radioOn = false;
const RADIO_SRC = 'https://www.maspero.eg/stream/7';

function setRadioUI(playing) {
  const dot = document.getElementById('radio-dot');
  const btn = document.getElementById('radio-ctrl-btn');
  const sub = document.getElementById('radio-status');
  const frame = document.getElementById('radioFrame');
  radioOn = playing;
  if (playing) {
    dot.classList.add('on');
    btn.textContent = '⏸️';
    btn.classList.add('playing');
    sub.textContent = '🔴 يبث الآن';
    frame.style.display = 'block';
  } else {
    dot.classList.remove('on');
    btn.textContent = '▶️';
    btn.classList.remove('playing');
    sub.textContent = 'اضغط لتشغيل البث';
    frame.style.display = 'none';
  }
}

function toggleRadioBar() {
  const bar = document.getElementById('radio-bar');
  bar.style.display = bar.style.display === 'none' ? 'flex' : 'none';
}

function toggleRadio() {
  const frame = document.getElementById('radioFrame');
  if (!radioOn) {
    frame.src = RADIO_SRC;
    setRadioUI(true);
  } else {
    frame.src = '';
    setRadioUI(false);
  }
}

