import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Runtime check: log whether the required env vars are present (do not log secrets)
try {
	// eslint-disable-next-line no-console
	console.debug("Supabase config present:", {
		VITE_SUPABASE_URL: !!supabaseUrl,
		VITE_SUPABASE_ANON_KEY: !!supabaseAnonKey,
	});
} catch (e) {}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
