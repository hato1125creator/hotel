import { resend, FROM_EMAIL } from './resend'

interface BookingConfirmationData {
  to: string
  guestName: string
  roomName: string
  checkIn: string
  checkOut: string
  numGuests: number
  totalPrice: number
  reservationId: string
  sesamePIN?: string
}

export async function sendBookingConfirmation(data: BookingConfirmationData) {
  const checkInDate = new Date(data.checkIn).toLocaleDateString('ja-JP')
  const checkOutDate = new Date(data.checkOut).toLocaleDateString('ja-JP')

  return resend.emails.send({
    from: FROM_EMAIL,
    to: data.to,
    subject: `【予約確認】Smart Guesthouse - ${checkInDate}〜${checkOutDate}`,
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>予約確認</title>
</head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #1a1a2e; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: #e8d5b7; margin: 0; font-size: 24px;">Smart Guesthouse</h1>
    <p style="color: #a0956e; margin: 8px 0 0 0; font-size: 14px;">成田空港前泊特化 和モダン×スマートテック</p>
  </div>

  <div style="background: #fff; border: 1px solid #e8d5b7; border-top: none; padding: 32px; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1a1a2e; border-bottom: 2px solid #e8d5b7; padding-bottom: 12px;">ご予約確認</h2>

    <p>${data.guestName} 様</p>
    <p>この度はSmart Guesthouseをご予約いただき、誠にありがとうございます。<br>以下の内容でご予約を承りました。</p>

    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
      <tr style="border-bottom: 1px solid #f0e8d8;">
        <td style="padding: 12px; color: #666; width: 40%;">予約番号</td>
        <td style="padding: 12px; font-weight: bold;">${data.reservationId}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0e8d8;">
        <td style="padding: 12px; color: #666;">お部屋</td>
        <td style="padding: 12px;">${data.roomName}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0e8d8;">
        <td style="padding: 12px; color: #666;">チェックイン</td>
        <td style="padding: 12px;">${checkInDate} 15:00〜</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0e8d8;">
        <td style="padding: 12px; color: #666;">チェックアウト</td>
        <td style="padding: 12px;">${checkOutDate} 〜11:00</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0e8d8;">
        <td style="padding: 12px; color: #666;">ご人数</td>
        <td style="padding: 12px;">${data.numGuests}名</td>
      </tr>
      <tr>
        <td style="padding: 12px; color: #666;">合計金額</td>
        <td style="padding: 12px; font-weight: bold; font-size: 18px; color: #1a1a2e;">¥${data.totalPrice.toLocaleString()}</td>
      </tr>
    </table>

    ${data.sesamePIN ? `
    <div style="background: #f8f4ee; border-left: 4px solid #e8d5b7; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 8px 0; color: #1a1a2e; font-size: 16px;">🔑 スマートロック暗証番号</h3>
      <p style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 8px; color: #1a1a2e;">${data.sesamePIN}</p>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">チェックイン当日のみ有効です。他者と共有しないでください。</p>
    </div>
    ` : ''}

    <div style="background: #f0f7ff; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <h3 style="margin: 0 0 12px 0; color: #1a1a2e; font-size: 16px;">アクセス</h3>
      <p style="margin: 0; font-size: 14px; line-height: 1.8;">
        〒289-0000 千葉県成田市 ×××<br>
        成田空港第1ターミナルより車で約10分<br>
        無料送迎バスあり（チェックイン時要連絡）
      </p>
    </div>

    <p style="color: #666; font-size: 13px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee;">
      ご不明な点がございましたらお気軽にお問い合わせください。<br>
      Smart Guesthouse カスタマーサポート
    </p>
  </div>
</body>
</html>
    `.trim(),
  })
}
