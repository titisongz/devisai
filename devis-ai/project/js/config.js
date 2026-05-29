const SUPABASE_URL = 'https://sweskgpcmryjedvmfecd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-4E4HmtGLcYUrSCSTS0RkQ_vOmMTzwE';

function getSupabaseClient(token = null) {
  const options = token ? {
    global: {
      headers: { Authorization: 'Bearer ' + token }
    }
  } : {};
  return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, options);
}
