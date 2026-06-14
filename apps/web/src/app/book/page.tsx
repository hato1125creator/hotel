'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface Room {
  id: string
  name: string
  description: string | null
  capacity: number
  pricePerNight: number
}

function BookForm() {
  const searchParams = useSearchParams()
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState(searchParams.get('room') ?? '')
  const [form, setForm] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: '',
    checkOut: '',
    numGuests: 1,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/rooms').then(r => r.json()).then(setRooms)
  }, [])

  const selectedRoom = rooms.find(r => r.id === selectedRoomId)

  const nights = (() => {
    if (!form.checkIn || !form.checkOut) return 0
    const d = (new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / 86400000
    return Math.max(0, d)
  })()

  const totalPrice = selectedRoom ? selectedRoom.pricePerNight * nights : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoomId) return setError('お部屋を選択してください')
    if (nights < 1) return setError('チェックアウトはチェックインより後の日付にしてください')

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, roomId: selectedRoomId, totalPrice }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? '予約に失敗しました')
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予約に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-[#1a1a2e] text-amber-50 py-4 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/" className="font-bold text-lg">Smart Guesthouse</a>
          <span className="text-amber-200 text-sm">ご予約</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold text-stone-800 mb-8">ご予約フォーム</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room selection */}
          <div className="bg-white rounded-xl border border-amber-100 p-6 shadow-sm">
            <h2 className="font-bold text-stone-800 mb-4">お部屋選択</h2>
            {rooms.length === 0 ? (
              <p className="text-stone-400 text-sm">読み込み中...</p>
            ) : (
              <div className="grid gap-3">
                {rooms.map((room) => (
                  <label
                    key={room.id}
                    className={[
                      'flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors',
                      selectedRoomId === room.id
                        ? 'border-stone-800 bg-stone-50'
                        : 'border-stone-200 hover:border-stone-300',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="room"
                      value={room.id}
                      checked={selectedRoomId === room.id}
                      onChange={() => setSelectedRoomId(room.id)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-stone-800">{room.name}</div>
                      <div className="text-stone-500 text-sm">{room.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-stone-800">¥{room.pricePerNight.toLocaleString()}</div>
                      <div className="text-stone-400 text-xs">/泊</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="bg-white rounded-xl border border-amber-100 p-6 shadow-sm">
            <h2 className="font-bold text-stone-800 mb-4">宿泊日程</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-stone-500 mb-1">チェックイン</label>
                <input
                  type="date"
                  min={today}
                  value={form.checkIn}
                  onChange={e => setForm(f => ({ ...f, checkIn: e.target.value, checkOut: '' }))}
                  required
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>
              <div>
                <label className="block text-sm text-stone-500 mb-1">チェックアウト</label>
                <input
                  type="date"
                  min={form.checkIn || today}
                  value={form.checkOut}
                  onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))}
                  required
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>
            </div>
            {nights > 0 && (
              <p className="text-stone-500 text-sm mt-2">{nights}泊</p>
            )}
          </div>

          {/* Guest info */}
          <div className="bg-white rounded-xl border border-amber-100 p-6 shadow-sm">
            <h2 className="font-bold text-stone-800 mb-4">宿泊者情報</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-stone-500 mb-1">お名前 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.guestName}
                  onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))}
                  required
                  placeholder="山田 太郎"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>
              <div>
                <label className="block text-sm text-stone-500 mb-1">メールアドレス <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={form.guestEmail}
                  onChange={e => setForm(f => ({ ...f, guestEmail: e.target.value }))}
                  required
                  placeholder="example@email.com"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>
              <div>
                <label className="block text-sm text-stone-500 mb-1">電話番号</label>
                <input
                  type="tel"
                  value={form.guestPhone}
                  onChange={e => setForm(f => ({ ...f, guestPhone: e.target.value }))}
                  placeholder="090-0000-0000"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>
              <div>
                <label className="block text-sm text-stone-500 mb-1">人数 <span className="text-red-500">*</span></label>
                <select
                  value={form.numGuests}
                  onChange={e => setForm(f => ({ ...f, numGuests: Number(e.target.value) }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-400"
                >
                  {[1, 2, 3, 4].map(n => (
                    <option key={n} value={n}>{n}名</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Summary */}
          {selectedRoom && nights > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
              <h2 className="font-bold text-stone-800 mb-3">料金確認</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">{selectedRoom.name}</span>
                  <span>¥{selectedRoom.pricePerNight.toLocaleString()} × {nights}泊</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-amber-200 pt-2 mt-2">
                  <span>合計</span>
                  <span>¥{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedRoomId || nights < 1}
            className="w-full bg-stone-800 text-amber-50 py-4 rounded-xl font-bold text-lg hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '処理中...' : '決済に進む'}
          </button>

          <p className="text-center text-stone-400 text-sm">
            クレジットカード・デビットカード対応 | Stripe 安全決済
          </p>
        </form>
      </div>
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-400">読み込み中...</p>
      </div>
    }>
      <BookForm />
    </Suspense>
  )
}
