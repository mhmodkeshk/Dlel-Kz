exports.handler = async function () {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) {
    return { statusCode: 503, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Weather service is not configured' }) };
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?q=Kafr+el-Zayat,EG&appid=${encodeURIComponent(key)}&units=metric&lang=ar`;
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'kafr-el-zayat-guide/5.0' } });
    const body = await response.text();
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300'
      },
      body
    };
  } catch (_) {
    return { statusCode: 502, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Weather provider unavailable' }) };
  }
};
