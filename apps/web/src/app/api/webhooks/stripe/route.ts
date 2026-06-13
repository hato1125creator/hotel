import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@smart-guesthouse/stripe'
import { createClient } from '@smart-guesthouse/db'
import { sendBookingConfirmation } from '@smart-guesthouse/email'

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event
  try {
    event = constructWebhookEvent(payload, signature)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const reservationId = session.metadata?.reservationId

      if (!reservationId) break

      const { data: reservation } = await supabase
        .from('reservations')
        .update({
          status: 'confirmed',
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq('id', reservationId)
        .select('*, rooms(name)')
        .single()

      if (reservation) {
        const roomData = reservation as typeof reservation & { rooms: { name: string } | null }
        await sendBookingConfirmation({
          to: reservation.guest_email,
          guestName: reservation.guest_name,
          roomName: roomData.rooms?.name ?? '客室',
          checkIn: reservation.check_in,
          checkOut: reservation.check_out,
          numGuests: reservation.num_guests,
          totalPrice: reservation.total_price,
          reservationId: reservation.id,
          sesamePIN: reservation.sesame_pin ?? undefined,
        })
      }
      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object
      const reservationId = session.metadata?.reservationId
      if (reservationId) {
        await supabase
          .from('reservations')
          .update({ status: 'cancelled' })
          .eq('id', reservationId)
          .eq('status', 'pending')
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
