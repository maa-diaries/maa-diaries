import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env file directly
let envUrl = '';
let envKey = '';

try {
  const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8');
  for (const line of envContent.split('\n')) {
    const matchUrl = line.match(/^VITE_SUPABASE_URL\s*=\s*(.*)$/);
    if (matchUrl) envUrl = matchUrl[1].trim();
    const matchKey = line.match(/^VITE_SUPABASE_ANON_KEY\s*=\s*(.*)$/);
    if (matchKey) envKey = matchKey[1].trim();
  }
} catch (e) {
  console.log('Could not read .env file, using fallback credentials');
}

const supabaseUrl = envUrl || process.env.VITE_SUPABASE_URL || 'https://jqoshsfdzsfsvvbbwxiw.supabase.co';
const supabaseAnonKey = envKey || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_5-IRVPaYUowxqSdDu6bXew_qUN292Zh';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateStocks() {
  console.log('Connecting to Supabase at:', supabaseUrl);
  
  // Fetch all products first to verify
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('id, name, stock');
    
  if (fetchError) {
    console.error('Error fetching products:', fetchError);
    process.exit(1);
  }

  console.log(`Found ${products?.length || 0} products in database.`);

  // Update all products in products table to stock = 10
  const { error } = await supabase
    .from('products')
    .update({ stock: 10 })
    .neq('id', 'non-existent-id'); // updates all rows

  if (error) {
    console.error('Error updating product stocks:', error);
    process.exit(1);
  } else {
    console.log('Successfully set stock = 10 for all products in database!');
    process.exit(0);
  }
}

updateStocks();
