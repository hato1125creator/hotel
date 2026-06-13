import { createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr'
import type { Database } from './database.types'

export function createServerClient(
  cookieStore: {
    get: (name: string) => { value: string } | undefined
    set: (name: string, value: string, options: CookieOptions) => void
    delete: (name: string, options: CookieOptions) => void
  }
) {
  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete(name, options)
        },
      },
    }
  )
}
