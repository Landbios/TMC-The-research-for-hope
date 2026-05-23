const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oiwxjmvalaspjimdqtob.supabase.co';
const supabaseKey = 'sb_publishable_5Nw2QtSsMxKPWy5s6RFBTw_GfGPvOVo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const ch1 = supabase.channel('live_intel_global');
  const res = ch1.on('postgres_changes', { event: '*', schema: 'public', table: 'tma_characters' }, () => {});
  console.log('first on returns undefined?', res === undefined);
}

test();
