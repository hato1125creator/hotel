import { NextResponse } from 'next/server'
import { createClient } from '@smart-guesthouse/db'

export async function GET() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('rooms')
    .select('id, name, description, capacity, price_per_night')
    .eq('is_active', true)
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
