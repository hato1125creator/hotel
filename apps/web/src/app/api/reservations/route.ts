import { NextRequest, NextResponse } from 'next/server'
import { createClient, rooms, reservations, eq, and, lt, gt, inArray } from '@smart-guesthouse/db'
import { createCheckoutSession } from '@smart-guesthouse/stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { roomId, guestName, guestEmail, guestPhone, checkIn, checkOut, numGuests, totalPrice } = body

    if (!roomId || !guestName || !guestEmail || !checkIn || !checkOut) {
      return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 })
    }

    const db = createClient()

    // Check room availability
    const conflicts = await db
      .select({ id: reservations.id })
      .from(reservations)
      .where(
        and(
          eq(reservations.roomId, roomId),
          inArray(reservations.status, ['pending', 'confirmed', 'checked_in']),
          lt(reservations.checkIn, checkOut),
          gt(reservations.checkOut, checkIn),
        )
      )

    if (conflicts.length > 0) {
      return NextResponse.json({ error: 'この日程はすでに予約されています' }, { status: 409 })
    }

    // Get room info
    const [room] = await db
      .select({ name: rooms.name, pricePerNight: rooms.pricePerNight })
      .from(rooms)
      .where(eq(rooms.id, roomId))

    if (!room) {
      return NextResponse.json({ error: 'お部屋が見つかりません' }, { status: 404 })
    }

    // Create pending reservation
    const [reservation] = await db
      .insert(reservations)
      .values({
        roomId,
        guestName,
        guestEmail,
        guestPhone: guestPhone || null,
        checkIn,
        checkOut,
        numGuests: numGuests ?? 1,
        totalPrice,
        status: 'pending',
      })
      .returning()

    if (!reservation) {
      return NextResponse.json({ error: '予約の作成に失敗しました' }, { status: 500 })
    }

    // Create Stripe checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const session = await createCheckoutSession({
      reservationId: reservation.id,
      roomName: room.name,
      guestEmail,
      totalPrice,
      checkIn,
      checkOut,
      successUrl: `${appUrl}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/book/cancel`,
    })

    // Update reservation with session ID
    await db
      .update(reservations)
      .set({ stripeSessionId: session.id })
      .where(eq(reservations.id, reservation.id))

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (err) {
    console.error('Reservation error:', err)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
