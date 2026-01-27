
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://katiahjdknmftdbxwspm.supabase.co';
const supabaseKey = 'sb_publishable_N4is6A9zycKcVGiINDt2TA_vlnRTR9r';

export const supabase = createClient(supabaseUrl, supabaseKey);
