const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oiwxjmvalaspjimdqtob.supabase.co';
const supabaseKey = 'sb_publishable_5Nw2QtSsMxKPWy5s6RFBTw_GfGPvOVo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const ch1 = supabase.channel('live_intel_global');
  ch1.on('postgres_changes', { event: '*', schema: 'public', table: 'tma_characters' }, () => {});
  ch1.subscribe();

  await supabase.removeChannel(ch1);
  
  const ch2 = supabase.channel('live_intel_global');
  console.log('ch2 is undefined?', ch2 === undefined);
  if (ch2) {
      console.log('ch2 has .on?', typeof ch2.on === 'function');
  }
}

test();
