
import { createClient } from '@supabase/supabase-js';

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Static reviews as displayed on Home page
const staticReviews = [
  {
    productId: 'jhumke-01',
    userName: 'Aishwarya R.',
    rating: 5,
    comment: 'Stunning anti-tarnish payals! I was skeptical but I have been wearing them daily in the shower and there is zero change in shine. Absolutely love Maa Diaries.'
  },
  {
    productId: 'jhumke-02',
    userName: 'Megha S.',
    rating: 5,
    comment: 'The metal clutchers are so strong and hold my thick hair perfectly. The rose theme packaging felt incredibly premium and luxury. Will buy again!'
  },
  {
    productId: 'jhumke-03',
    userName: 'Kavita J.',
    rating: 5,
    comment: 'Highly recommend the Kashmiri Jhumke. Heavy details but extremely lightweight on the ears. Hypoallergenic claim is true—no itchiness at all!'
  }
];

async function migrate() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase not configured. Set environment variables.');
    process.exit(1);
  }
  for (const rev of staticReviews) {
    const id = `rev-${generateId()}`;
    const createdAt = new Date().toISOString();
    const { error } = await supabase.from('product_reviews').insert({
      id,
      product_id: rev.productId,
      user_name: rev.userName,
      rating: rev.rating,
      comment: rev.comment,
      created_at: createdAt
    });
    if (error) {
      console.error('Failed to insert review', rev, error);
    } else {
      console.log('Inserted review', id);
    }
  }
  process.exit(0);
}

migrate();
