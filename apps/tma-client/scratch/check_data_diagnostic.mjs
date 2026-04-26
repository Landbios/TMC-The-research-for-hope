
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkData() {
  const { data: chars, error } = await supabase.from('tma_characters').select('id, tma_name, image_url, sprite_idle_url').limit(5);
  if (error) console.error(error);
  else console.log('TMA Characters:', JSON.stringify(chars, null, 2));

  const { data: messages, error: err2 } = await supabase.from('tma_messages').select('id, content, sender_tma_id').limit(1);
  if (err2) console.error(err2);
  else console.log('Message sample:', JSON.stringify(messages, null, 2));
}

checkData();
