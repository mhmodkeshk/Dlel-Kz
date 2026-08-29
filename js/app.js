window.addEventListener('load', async () => {
  try {
    await initBackend();
  } catch (e) {
    console.error('Backend init error:', e);
  }

  if (backendReady) {
    try {
      await loadDirectoryData();
    } catch (e) {
      console.error('Directory load error:', e);
    }
  }

  renderCats();
  renderFavSection();
  fetchWeather();

  if (backendReady) {
    try {
      await loadProducts();
    } catch (e) {
      console.error('Products load error:', e);
    }
  }

  try {
    initAdCarousel();
  } catch (e) {
    console.error('Ad carousel error:', e);
  }

  setTimeout(() => {
    const s = document.getElementById('splash');

    if (s) {
      s.style.opacity = '0';

      setTimeout(() => {
        s.style.display = 'none';

        const app = document.getElementById('app');

        if (app) {
          app.style.display = 'block';
        }
      }, 300);
    }
  }, 900);
});
