interface CleaningNotification {
  roomName: string
  checkOut: string
  nextCheckIn?: string
}

export async function sendCleaningNotification(data: CleaningNotification) {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!channelAccessToken) throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not set')

  const checkOutDate = new Date(data.checkOut).toLocaleDateString('ja-JP', {
    month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const message = [
    `🧹 清掃依頼`,
    ``,
    `【部屋】${data.roomName}`,
    `【チェックアウト】${checkOutDate}`,
    data.nextCheckIn ? `【次のチェックイン】${new Date(data.nextCheckIn).toLocaleDateString('ja-JP')}` : '',
    ``,
    `清掃完了後、アプリで完了報告をお願いします。`,
  ].filter(Boolean).join('\n')

  const res = await fetch('https://api.line.me/v2/bot/message/broadcast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({
      messages: [{ type: 'text', text: message }],
    }),
  })

  if (!res.ok) throw new Error(`LINE API error: ${res.status}`)
  return res.json()
}
