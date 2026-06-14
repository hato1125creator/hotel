import Link from 'next/link'

export default function BookingSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-2xl font-bold text-stone-800 mb-4">ご予約ありがとうございます！</h1>
        <p className="text-stone-500 mb-2">
          確認メールをご登録のメールアドレスに送信しました。
        </p>
        <p className="text-stone-500 mb-8">
          スマートロックの暗証番号はメールに記載しています。チェックイン当日にご利用ください。
        </p>
        <Link
          href="/"
          className="inline-block bg-stone-800 text-amber-50 px-8 py-3 rounded-lg font-medium hover:bg-stone-700 transition-colors"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}
