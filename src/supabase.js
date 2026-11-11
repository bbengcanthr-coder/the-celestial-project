import { createClient } from '@supabase/supabase-js'

// Vite exposes variables prefixed with VITE_ to browser code.
// A publishable key is safe for browser use when Row Level Security is enabled.
const env = import.meta.env ?? {}
const supabaseUrl = (env.VITE_SUPABASE_URL ?? '').trim()
const supabaseKey = (
  env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  env.VITE_SUPABASE_ANON_KEY ??
  ''
).trim()

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:' || parsed.hostname === 'localhost'
  } catch {
    return false
  }
}

const configProblems = []
if (!supabaseUrl) configProblems.push('VITE_SUPABASE_URL is missing.')
else if (!isValidHttpUrl(supabaseUrl)) configProblems.push('VITE_SUPABASE_URL must be a valid HTTPS URL.')
if (!supabaseKey) configProblems.push('VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) is missing.')

export const supabaseReady = configProblems.length === 0
export const supabaseConfigError = configProblems.join(' ')

if (!supabaseReady) {
  // Do not print key values. This message helps diagnose a failed GitHub Pages build.
  console.error(`[Supabase configuration] ${supabaseConfigError}`)
}

export const supabase = supabaseReady
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null

/**
 * Convert a public username into the internal identifier used by Supabase Auth.
 * Usernames must be 3–24 characters: letters, numbers, dot, underscore, hyphen.
 * This project uses synthetic email identifiers, so email confirmation must be
 * disabled unless you replace this flow with a real email/phone verification flow.
 */
export function usernameToAuthEmail(username) {
  if (typeof username !== 'string') return null

  const normalized = username.trim().toLowerCase()
  const validUsername = /^[a-z0-9][a-z0-9._-]{1,22}[a-z0-9]$/.test(normalized)

  if (!validUsername) return null

  return `${normalized}@members.celestial.invalid`
}
