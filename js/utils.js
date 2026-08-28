/* Kafr El-Zayat Guide V5 — shared safety helpers */
(function () {
  'use strict';

  window.escapeHTML = function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
    }[ch]));
  };

  window.safePhone = function safePhone(value) {
    return String(value ?? '').replace(/\D/g, '').slice(0, 15);
  };

  window.safeImageSrc = function safeImageSrc(value) {
    const v = String(value ?? '');
    if (/^data:image\/(?:png|jpe?g|webp);base64,[a-z0-9+/=]+$/i.test(v)) return v;
    if (/^https:\/\//i.test(v)) { try { const u=new URL(v); return u.protocol==='https:' ? v : ''; } catch(_) { return ''; } }
    if (/^[\w\-./%\u0600-\u06FF ]+\.(?:png|jpe?g|webp)$/i.test(v)) return v;
    return '';
  };

  window.safeJsonParse = function safeJsonParse(raw, fallback) {
    try { return JSON.parse(raw); } catch (_) { return fallback; }
  };

  window.clampText = function clampText(value, maxLength) {
    return String(value ?? '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLength || 500);
  };
})();
