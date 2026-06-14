'use client'

import { useState, useEffect, useCallback } from 'react'

type Status = 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out'

interface Reservation {
  id: string
  guestName: string
  guestEmail: string
  guestPhone: string | null
  checkIn: string
  checkOut: string
  numGuests: number
  totalPrice: number
  status: Status
  roomName: string | null
  notes: string | null
  createdAt: string
}

const STATUS_LABELS: Record<Status, string> = {
  pending: '保留中',
  confirmed: '確認済み',
  cancelled: 'キャンセル',
  checked_in: '滞在中',
  checked_out: 'チェックアウト済み',
}

const STATUS_COLORS: Record<Status, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  checked_in: 'bg-green-100 text-green-800',
  checked_out: 'bg-stone-100 text-stone-600',
}

const NEXT_STATUS: Partial<Record<Status, Status>> = {
  pending: 'confirmed',
  confirmed: 'checked_in',
  checked_in: 'checked_out',
}

const NEXT_LABEL: Partial<Record<Status, string>> = {
  pending: '確認済みにする',
  confirmed: 'チェックイン',
  checked_in: 'チェックアウト',
}

export default function AdminPage() {
  const [all, setAll] = useState<Reservation[]>([])
  const [filter, setFilter] = useState<Status | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reservations')
      const data = await res.json()
      setAll(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const updateStatus = async (id: string, status: Status) => {
    setUpdating(id)
    await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await fetchAll()
    setUpdating(null)
  }

  const cancel = async (id: string) => {
    if (!confirm('この予約をキャンセルしますか？')) return
    await updateStatus(id, 'cancelled')
  }

  const displayed = filter === 'all' ? all : all.filter(r => r.status === filter)

  const counts = {
    pending: all.filter(r => r.status === 'pending').length,
    confirmed: all.filter(r => r.status === 'confirmed').length,
    checked_in: all.filter(r => r.status === 'checked_in').length,
    checked_out: all.filter(r => r.status === 'checked_out').length,
    cancelled: all.filter(r => r.status === 'cancelled').length,
  }

  const revenue = all
    .filter(r => r.status !== 'cancelled')
    .reduce((sum, r) => sum + r.totalPrice, 0)

  const tabs: Array<{ label: string; value: Status | 'all' }> = [
    { label: `全て (${all.length})`, value: 'all' },
    { label: `保留中 (${counts.pending})`, value: 'pending' },
    { label: `確認済み (${counts.confirmed})`, value: 'confirmed' },
    { label: `滞在中 (${counts.checked_in})`, value: 'checked_in' },
    { label: `チェックアウト済み (${counts.checked_out})`, value: 'checked_out' },
    { label: `キャンセル (${counts.cancelled})`, value: 'cancelled' },
  ]

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-[#1a1a2e] text-amber-50 py-4 px-6 flex items-center justify-between">
        <h1 className="text-lg font-bold">Smart Guesthouse 管理画面</h1>
        <button
          onClick={fetchAll}
          className="text-amber-200 text-sm hover:text-amber-100"
        >
          更新
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: '保留中', value: counts.pending, color: 'text-yellow-600' },
            { label: '確認済み', value: counts.confirmed, color: 'text-blue-600' },
            { label: '滞在中', value: counts.checked_in, color: 'text-green-600' },
            { label: '合計売上', value: `¥${revenue.toLocaleString()}`, color: 'text-stone-800' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
              <p className="text-stone-500 text-sm">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={[
                'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                filter === tab.value
                  ? 'bg-stone-800 text-amber-50'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-stone-400">読み込み中...</div>
          ) : displayed.length === 0 ? (
            <div className="p-16 text-center text-stone-400">予約はありません</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    {['ゲスト', '客室', 'チェックイン', 'チェックアウト', '人数', '金額', 'ステータス', '操作'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-stone-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {displayed.map(r => {
                    const next = NEXT_STATUS[r.status]
                    const isUpdating = updating === r.id
                    return (
                      <tr key={r.id} className="hover:bg-stone-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-stone-800">{r.guestName}</div>
                          <div className="text-stone-400 text-xs mt-0.5">{r.guestEmail}</div>
                          {r.guestPhone && (
                            <div className="text-stone-400 text-xs">{r.guestPhone}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-stone-600">{r.roomName ?? '—'}</td>
                        <td className="px-4 py-3 text-stone-600">{r.checkIn}</td>
                        <td className="px-4 py-3 text-stone-600">{r.checkOut}</td>
                        <td className="px-4 py-3 text-stone-600 text-center">{r.numGuests}名</td>
                        <td className="px-4 py-3 text-stone-800 font-medium">
                          ¥{r.totalPrice.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[r.status]}`}>
                            {STATUS_LABELS[r.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 flex-wrap">
                            {next && (
                              <button
                                onClick={() => updateStatus(r.id, next)}
                                disabled={isUpdating}
                                className="px-3 py-1 bg-stone-800 text-amber-50 rounded-lg text-xs hover:bg-stone-700 disabled:opacity-50 transition-colors"
                              >
                                {isUpdating ? '...' : NEXT_LABEL[r.status]}
                              </button>
                            )}
                            {r.status !== 'cancelled' && r.status !== 'checked_out' && (
                              <button
                                onClick={() => cancel(r.id)}
                                disabled={isUpdating}
                                className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs hover:bg-red-100 disabled:opacity-50 transition-colors"
                              >
                                キャンセル
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
