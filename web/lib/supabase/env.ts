export const hasSupabaseEnv =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
export const isDemoMode = !hasSupabaseEnv;
