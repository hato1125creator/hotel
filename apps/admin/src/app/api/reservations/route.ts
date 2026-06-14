import { NextResponse } from 'next/server'
import { createClient, reservations, rooms, eq, desc } from '@smart-guesthouse/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = createClient()

    const data = await db
      .select({
        id: reservations.id,
        guestName: reservations.guestName,
        guestEmail: reservations.guestEmail,
        guestPhone: reservations.guestPhone,
        checkIn: reservations.checkIn,
        checkOut: reservations.checkOut,
        numGuests: reservations.numGuests,
        totalPrice: reservations.totalPrice,
        status: reservations.status,
        notes: reservations.notes,
        createdAt: reservations.createdAt,
        roomName: rooms.name,
      })
      .from(reservations)
      .leftJoin(rooms, eq(reservations.roomId, rooms.id))
      .orderBy(desc(reservations.createdAt))

    return NextResponse.json(data)
  } catch (err) {
    console.error('Admin reservations error:', err)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
