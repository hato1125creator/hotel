import { getResend, FROM_EMAIL } from './resend'

interface BookingCancellationData {
  to: string
  guestName: string
  roomName: string
  checkIn: string
  checkOut: string
  totalPrice: number
  reservationId: string
}

export async function sendBookingCancellation(data: BookingCancellationData) {
  const checkInDate = new Date(data.checkIn).toLocaleDateString('ja-JP')
  const checkOutDate = new Date(data.checkOut).toLocaleDateString('ja-JP')

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: data.to,
    subject: `【キャンセル確認】Smart Guesthouse - ${checkInDate}〜${checkOutDate}`,
    html: `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><title>キャンセル確認</title></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #1a1a2e; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: #e8d5b7; margin: 0; font-size: 24px;">Smart Guesthouse</h1>
  </div>
  <div style="background: #fff; border: 1px solid #e8d5b7; border-top: none; padding: 32px; border-radius: 0 0 8px 8px;">
    <h2 style="color: #c0392b;">キャンセル完了</h2>
    <p>${data.guestName} 様</p>
    <p>以下のご予約のキャンセルが完了しました。</p>
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
      <tr style="border-bottom: 1px solid #f0e8d8;">
        <td style="padding: 12px; color: #666;">予約番号</td>
        <td style="padding: 12px;">${data.reservationId}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0e8d8;">
        <td style="padding: 12px; color: #666;">お部屋</td>
        <td style="padding: 12px;">${data.roomName}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0e8d8;">
        <td style="padding: 12px; color: #666;">チェックイン</td>
        <td style="padding: 12px;">${checkInDate}</td>
      </tr>
      <tr>
        <td style="padding: 12px; color: #666;">チェックアウト</td>
        <td style="padding: 12px;">${checkOutDate}</td>
      </tr>
    </table>
    <p style="color: #666; font-size: 13px;">返金がある場合は、5〜10営業日以内にお支払い方法に返金されます。</p>
  </div>
</body>
</html>
    `.trim(),
  })
}
