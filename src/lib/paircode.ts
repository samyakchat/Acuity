import { supabase } from "./supabase";

export async function pairingCode(role: any, expiry: boolean) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not sigend in');

  const code = gencode();
  const { error } = await supabase.from('pairing_codes').insert({
    code: code,
    caretaker_id: role === 'caretaker' ? user.id : null,
    patient_id:   role === 'patient'   ? user.id : null,
    expires_at: expiry ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : null,
  });

  if (error) throw error;

  return code
}

function gencode(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';

  let result = '';
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * letters.length);
    result += letters[randomIndex];
  }
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * numbers.length);
    result += numbers[randomIndex];
  }
  return result;
}

