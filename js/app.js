window.addEventListener('load', async () => {

  /* =====================================================
     INIT BACKEND
  ===================================================== */

  try {
    await initBackend();
  } catch (e) {
    console.error(
      'Backend init error:',
      e
    );
  }


  /* =====================================================
     LOAD DIRECTORY DATA
  ===================================================== */

  if (backendReady) {
    try {
      await loadDirectoryData();
    } catch (e) {
      console.error(
        'Directory load error:',
        e
      );
    }
  }


  /* =====================================================
     RENDER MAIN DATA
  ===================================================== */

  try {
    renderCats();
  } catch (e) {
    console.error(
      'Render categories error:',
      e
    );
  }


  try {
    renderFavSection();
  } catch (e) {
    console.error(
      'Render favorites error:',
      e
    );
  }


  try {
    fetchWeather();
  } catch (e) {
    console.error(
      'Weather render error:',
      e
    );
  }


  /* =====================================================
     LOAD MARKETPLACE PRODUCTS
  ===================================================== */

  if (backendReady) {
    try {
      await loadProducts();
    } catch (e) {
      console.error(
        'Products load error:',
        e
      );
    }
  }


  /* =====================================================
     INIT ADS CAROUSEL
  ===================================================== */

  try {
    initAdCarousel();
  } catch (e) {
    console.error(
      'Ad carousel error:',
      e
    );
  }


  /* =====================================================
     SPLASH SCREEN
     الصورة الجديدة تظهر حوالي 1.9 ثانية
  ===================================================== */

  setTimeout(() => {

    const splash =
      document.getElementById(
        'splash'
      );

    const app =
      document.getElementById(
        'app'
      );


    /*
      لو عنصر Splash مش موجود لأي سبب،
      نظهر التطبيق مباشرة.
    */

    if (!splash) {

      if (app) {
        app.style.display =
          'block';
      }

      return;
    }


    /*
      بدء الاختفاء التدريجي
    */

    splash.style.opacity =
      '0';


    /*
      بعد انتهاء Fade
      نخفي Splash ونظهر التطبيق
    */

    setTimeout(() => {

      splash.style.display =
        'none';


      if (app) {
        app.style.display =
          'block';
      }

    }, 450);


  }, 1900);

});
