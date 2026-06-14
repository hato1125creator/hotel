import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@smart-guesthouse/stripe'
import { createClient, rooms, reservations, eq, and } from '@smart-guesthouse/db'
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

  const db = createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const reservationId = session.metadata?.reservationId
      if (!reservationId) break

      const [reservation] = await db
        .update(reservations)
        .set({
          status: 'confirmed',
          stripePaymentIntentId: session.payment_intent as string,
        })
        .where(eq(reservations.id, reservationId))
        .returning()

      if (reservation) {
        const [room] = await db
          .select({ name: rooms.name })
          .from(rooms)
          .where(eq(rooms.id, reservation.roomId))

        await sendBookingConfirmation({
          to: reservation.guestEmail,
          guestName: reservation.guestName,
          roomName: room?.name ?? '客室',
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          numGuests: reservation.numGuests,
          totalPrice: reservation.totalPrice,
          reservationId: reservation.id,
          sesamePIN: reservation.sesamePIN ?? undefined,
        })
      }
      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object
      const reservationId = session.metadata?.reservationId
      if (reservationId) {
        await db
          .update(reservations)
          .set({ status: 'cancelled' })
          .where(
            and(
              eq(reservations.id, reservationId),
              eq(reservations.status, 'pending'),
            )
          )
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
