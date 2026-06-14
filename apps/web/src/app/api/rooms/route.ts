import { NextResponse } from 'next/server'
import { createClient, rooms, eq, asc } from '@smart-guesthouse/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = createClient()
    const data = await db
      .select({
        id: rooms.id,
        name: rooms.name,
        description: rooms.description,
        capacity: rooms.capacity,
        pricePerNight: rooms.pricePerNight,
      })
      .from(rooms)
      .where(eq(rooms.isActive, true))
      .orderBy(asc(rooms.name))

    return NextResponse.json(data)
  } catch (err) {
    console.error('Rooms fetch error:', err)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
