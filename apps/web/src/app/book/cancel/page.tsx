import Link from 'next/link'

export default function BookingCancelPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">❌</div>
        <h1 className="text-2xl font-bold text-stone-800 mb-4">予約をキャンセルしました</h1>
        <p className="text-stone-500 mb-8">
          決済がキャンセルされました。もう一度お試しいただくか、お問い合わせください。
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/book"
            className="inline-block bg-stone-800 text-amber-50 px-6 py-3 rounded-lg font-medium hover:bg-stone-700 transition-colors"
          >
            もう一度予約する
          </Link>
          <Link
            href="/"
            className="inline-block bg-white border border-stone-200 text-stone-700 px-6 py-3 rounded-lg font-medium hover:bg-stone-50 transition-colors"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
