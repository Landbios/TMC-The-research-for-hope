const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oiwxjmvalaspjimdqtob.supabase.co';
const supabaseKey = 'sb_publishable_5Nw2QtSsMxKPWy5s6RFBTw_GfGPvOVo';
const supabase = createClient(supabaseUrl, supabaseKey);

const ch1 = supabase.channel('my_channel');
console.log('ch1 is undefined?', ch1 === undefined);

const ch2 = supabase.channel('my_channel');
console.log('ch2 is undefined?', ch2 === undefined);
