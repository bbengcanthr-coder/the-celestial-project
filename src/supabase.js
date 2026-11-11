import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabaseReady = Boolean(url && key)
export const supabase = supabaseReady ? createClient(url, key) : null

// UI accepts username + password. Supabase Auth uses a private synthetic email identifier.
// Never put the Supabase service_role key in this browser app.
export const usernameToAuthEmail = (username) =>
  `${username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '')}@members.celestial.invalid`