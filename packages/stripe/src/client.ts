import Stripe from 'stripe'

let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  }
  return _stripe
}

interface CreateCheckoutSessionParams {
  reservationId: string
  roomName: string
  guestEmail: string
  totalPrice: number
  checkIn: string
  checkOut: string
  successUrl: string
  cancelUrl: string
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: params.guestEmail,
    line_items: [
      {
        price_data: {
          currency: 'jpy',
          product_data: {
            name: `${params.roomName} - Smart Guesthouse`,
            description: `チェックイン: ${new Date(params.checkIn).toLocaleDateString('ja-JP')} / チェックアウト: ${new Date(params.checkOut).toLocaleDateString('ja-JP')}`,
          },
          unit_amount: params.totalPrice,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      reservationId: params.reservationId,
    },
    locale: 'ja',
  })

  return session
}

export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  return getStripe().webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
