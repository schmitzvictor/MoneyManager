import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing accounts...');
  const res1 = await supabase.from('accounts').select('*').limit(1);
  console.log('Accounts:', res1.error || 'OK');

  console.log('Testing categories...');
  const res2 = await supabase.from('categories').select('*').limit(1);
  console.log('Categories:', res2.error || 'OK');

  console.log('Testing transactions...');
  const res3 = await supabase.from('transactions').select('*').limit(1);
  console.log('Transactions:', res3.error || 'OK');
}

test().catch(console.error);
