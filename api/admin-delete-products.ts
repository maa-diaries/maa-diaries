import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { id, all } = req.body || {};

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase service role key is missing.' });
    }

    if (all) {
      const { error } = await supabaseAdmin.from('products').delete().neq('id', 'non_existent_placeholder_id');
      if (error) throw error;
      return res.status(200).json({ success: true, message: 'All products deleted successfully.' });
    }

    if (id) {
      const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true, message: `Product ${id} deleted successfully.` });
    }

    return res.status(400).json({ error: 'Missing parameters.' });
  } catch (error: any) {
    console.error('Error deleting product via admin API:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
