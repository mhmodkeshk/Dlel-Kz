/* ===== بيانات الدليل من Supabase ===== */

let data = {};
let totalCats = 0;
let totalServices = 0;

/*
  تحميل التصنيفات والخدمات من Supabase.

  categories:
  - نقرأ كل التصنيفات حتى لو التصنيف مفيهوش خدمات.

  public_businesses:
  - يعرض الأنشطة التي حالتها active فقط.
  - الحماية موجودة في Supabase / RLS.
*/
async function loadDirectoryData() {
  if (!backendReady || !db) {
    console.warn('Directory data: backend is not ready');
    data = {};
    totalCats = 0;
    totalServices = 0;
    return false;
  }

  try {
    /* ===== التصنيفات ===== */

    const {
      data: categories,
      error: categoriesError
    } = await db
      .from('categories')
      .select('id,name,icon,sort_order')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });

    if (categoriesError) {
      console.error(
        'Supabase categories error:',
        categoriesError
      );

      throw categoriesError;
    }

    /* ===== المحلات والخدمات Active ===== */

    const {
      data: businesses,
      error: businessesError
    } = await db
      .from('public_businesses')
      .select(`
        id,
        category_id,
        category_name,
        category_icon,
        name,
        phone,
        whatsapp,
        address,
        village,
        description,
        logo_url,
        maps_url,
        verified,
        featured,
        sort_order
      `)
      .order('featured', {
        ascending: false
      })
      .order('sort_order', {
        ascending: true
      })
      .order('name', {
        ascending: true
      });

    if (businessesError) {
      console.error(
        'Supabase businesses error:',
        businessesError
      );

      throw businessesError;
    }

    /* ===== بناء نفس شكل data القديم ===== */

    const nextData = {};

    (categories || []).forEach(category => {
      nextData[category.name] = {
        id: category.id,
        icon: category.icon || '📍',
        sort_order: Number(
          category.sort_order || 0
        ),
        services: []
      };
    });

    (businesses || []).forEach(business => {
      const categoryName =
        business.category_name;

      if (!categoryName) return;

      /*
        احتياطياً:
        لو ظهر نشاط بتصنيف غير موجود في categories
        نضيف التصنيف بدلاً من كسر الموقع.
      */
      if (!nextData[categoryName]) {
        nextData[categoryName] = {
          id: business.category_id,
          icon:
            business.category_icon ||
            '📍',
          sort_order: 999,
          services: []
        };
      }

      nextData[
        categoryName
      ].services.push({
        id: business.id,

        name:
          business.name || '',

        phone:
          business.phone || '',

        whatsapp:
          business.whatsapp ||
          business.phone ||
          '',

        address:
          business.address || '',

        village:
          business.village || '',

        description:
          business.description || '',

        logo_url:
          business.logo_url || '',

        maps_url:
          business.maps_url || '',

        verified:
          Boolean(
            business.verified
          ),

        featured:
          Boolean(
            business.featured
          ),

        category_id:
          business.category_id,

        category_name:
          categoryName
      });
    });

    data = nextData;

    totalCats =
      Object.keys(data).length;

    totalServices =
      Object.values(data)
        .reduce(
          (sum, category) =>
            sum +
            category.services.length,
          0
        );

    console.log(
      'Directory loaded successfully:',
      {
        categories: totalCats,
        services: totalServices
      }
    );

    return true;

  } catch (error) {
    console.error(
      'Directory loading failed:',
      error
    );

    data = {};
    totalCats = 0;
    totalServices = 0;

    return false;
  }
}

/* ===== المستخدم الحالي ===== */

let currentUser = null;
