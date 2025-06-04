import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function saveMessage(session_id, message, sender) {
  const { error } = await supabase.from('chat_logs').insert([
    { session_id, message, sender }
  ]);
  if (error) console.error('Error saving message:', error.message);
}

export async function getRecentMessages(session_id, limit = 3) {
  const { data, error } = await supabase
    .from('chat_logs')
    .select('message, sender')
    .eq('session_id', session_id)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error retrieving messages:', error.message);
    return [];
  }

  return data.reverse().map(msg => `${msg.sender === 'user' ? 'User' : 'Bot'}: ${msg.message}`);
}
