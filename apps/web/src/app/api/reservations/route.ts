import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@smart-guesthouse/db'
import { createCheckoutSession } from '@smart-guesthouse/stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      roomId,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      numGuests,
      totalPrice,
    } = body

    if (!roomId || !guestName || !guestEmail || !checkIn || !checkOut) {
      return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 })
    }

    const supabase = createClient()

    // Check room availability
    const { data: conflicts } = await supabase
      .from('reservations')
      .select('id')
      .eq('room_id', roomId)
      .in('status', ['pending', 'confirmed', 'checked_in'])
      .lt('check_in', checkOut)
      .gt('check_out', checkIn)

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ error: 'この日程はすでに予約されています' }, { status: 409 })
    }

    // Get room info
    const { data: room } = await supabase
      .from('rooms')
      .select('name, price_per_night')
      .eq('id', roomId)
      .single()

    if (!room) {
      return NextResponse.json({ error: 'お部屋が見つかりません' }, { status: 404 })
    }

    // Create pending reservation
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        room_id: roomId,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone || null,
        check_in: checkIn,
        check_out: checkOut,
        num_guests: numGuests ?? 1,
        total_price: totalPrice,
        status: 'pending',
      })
      .select()
      .single()

    if (reservationError || !reservation) {
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
    await supabase
      .from('reservations')
      .update({ stripe_session_id: session.id })
      .eq('id', reservation.id)

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (err) {
    console.error('Reservation error:', err)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
