import "../env";
import { createClient } from '@supabase/supabase-js';

(async () => {
  try {
    const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    const page = 1;
    const pageSize = 5;
    const from = (page - 1) * pageSize;
    const to = page * pageSize - 1;
    const { data, error, count } = await supabase
      .from('patient_handoffs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    console.log('count:', count);
    console.log('rows:', data?.slice(0, 5));
    process.exit(0);
  } catch (e) {
    console.error('test failed', e);
    process.exit(1);
  }
})();
