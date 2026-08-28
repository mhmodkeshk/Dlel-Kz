/* ===== Backend / Supabase ===== */
let db = null;
let backendReady = false;
let authUser = null;

function isBackendConfigured() {
  const c = window.APP_CONFIG || {};
  return Boolean(c.SUPABASE_URL && c.SUPABASE_ANON_KEY && window.supabase?.createClient);
}

async function initBackend() {
  if (!isBackendConfigured()) return false;
  db = window.supabase.createClient(window.APP_CONFIG.SUPABASE_URL, window.APP_CONFIG.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  backendReady = true;
  const { data: { session } } = await db.auth.getSession();
  await syncCurrentUser(session?.user || null);
  db.auth.onAuthStateChange(async (_event, session) => {
    await syncCurrentUser(session?.user || null);
    try { renderAccount(); } catch (_) {}
  });
  return true;
}

async function syncCurrentUser(user) {
  authUser = user;
  if (!user) { currentUser = null; return; }
  const { data, error } = await db.from('profiles').select('id,name,phone,role').eq('id', user.id).maybeSingle();
  if (error) throw error;
  let balance = 0;
  const { data: wallet } = await db.from('wallets').select('balance').eq('user_id', user.id).maybeSingle();
  if (wallet) balance = Number(wallet.balance || 0);
  currentUser = data ? { ...data, balance } : { id:user.id, name:user.user_metadata?.name || 'مستخدم', phone:user.phone || '', role:'user', balance };
}

async function uploadToBucket(bucket, file, folder) {
  if (!backendReady || !authUser) throw new Error('AUTH_REQUIRED');
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');
  const path = `${folder}/${authUser.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await db.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  return path;
}

function productPublicUrl(path) {
  if (!path || !db) return '';
  return db.storage.from('product-images').getPublicUrl(path).data.publicUrl || '';
}
