import { NextRequest, NextResponse } from 'next/server'
import { createClient, reservations, eq } from '@smart-guesthouse/db'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { status, notes } = body

    const db = createClient()

    const [updated] = await db
      .update(reservations)
      .set({
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        updatedAt: new Date(),
      })
      .where(eq(reservations.id, params.id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: '予約が見つかりません' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error('Admin update error:', err)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
