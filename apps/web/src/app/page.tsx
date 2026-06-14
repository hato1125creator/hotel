import Link from 'next/link'
import { createClient, rooms as roomsTable, eq, asc } from '@smart-guesthouse/db'

async function getRooms() {
  if (!process.env.DATABASE_URL) return []
  const db = createClient()
  return db.select().from(roomsTable).where(eq(roomsTable.isActive, true)).orderBy(asc(roomsTable.name))
}

export default async function HomePage() {
  const rooms = await getRooms()

  return (
    <main>
      {/* Hero */}
      <section className="relative bg-[#1a1a2e] text-amber-50 py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/pattern-wa.svg')] bg-repeat" />
        <div className="relative max-w-3xl mx-auto">
          <p className="text-amber-300 text-sm tracking-widest mb-4 uppercase">Smart Guesthouse</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            成田空港から<br />
            <span className="text-amber-200">10分。</span>
          </h1>
          <p className="text-lg text-amber-100/80 mb-8 max-w-xl mx-auto leading-relaxed">
            和モダンの空間×スマートテクノロジー。<br />
            チェックインはセルフ、鍵はスマートロック。<br />
            早朝フライトも深夜着も、安心してお過ごしください。
          </p>
          <Link
            href="/book"
            className="inline-block bg-amber-200 text-stone-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-amber-100 transition-colors"
          >
            空室を確認して予約する
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-stone-800 mb-12">
          旅人のための <span className="text-amber-700">スマートな宿</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '🔑',
              title: 'スマートロック',
              desc: '暗証番号でセルフチェックイン。スタッフ不在でも安心。深夜・早朝も対応。',
            },
            {
              icon: '✈️',
              title: '成田空港近く',
              desc: '第1・第2ターミナルから車で約10分。無料送迎バスあり（要予約）。',
            },
            {
              icon: '📱',
              title: '24時間サポート',
              desc: 'AIチャットボットで多言語対応。日本語・英語・中国語・韓国語。',
            },
            {
              icon: '🛁',
              title: '共用シャワー×2',
              desc: '清潔な共用シャワーブース。深夜でも利用可能。無料ランドリーあり。',
            },
            {
              icon: '🌐',
              title: '高速Wi-Fi',
              desc: '全室Wi-Fi完備。リモートワーク・動画視聴も快適。',
            },
            {
              icon: '💳',
              title: 'キャッシュレス決済',
              desc: 'クレジットカード・デビットカード完全対応。事前決済で安心。',
            },
          ].map((f) => (
            <div key={f.title} className="text-center p-6">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-stone-800 mb-2">{f.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rooms preview */}
      {rooms.length > 0 && (
        <section className="bg-amber-50/50 py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">客室</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div key={room.id} className="bg-white rounded-xl border border-amber-100 p-6 shadow-sm">
                  <h3 className="font-bold text-stone-800 mb-2">{room.name}</h3>
                  <p className="text-stone-500 text-sm mb-4">{room.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-stone-800">
                      ¥{room.pricePerNight.toLocaleString()}
                      <span className="text-sm font-normal text-stone-500">/泊</span>
                    </span>
                    <Link
                      href={`/book?room=${room.id}`}
                      className="bg-stone-800 text-amber-50 px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
                    >
                      予約する
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-[#1a1a2e] text-amber-50 py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">ご予約・お問い合わせ</h2>
          <p className="text-amber-100/70 mb-8">成田近辺での宿泊をお探しなら、ぜひご検討ください。</p>
          <Link
            href="/book"
            className="inline-block bg-amber-200 text-stone-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-amber-100 transition-colors"
          >
            今すぐ予約する
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-8 px-4 text-center text-sm">
        <p>© 2025 Smart Guesthouse. All rights reserved.</p>
        <p className="mt-1">〒289-0000 千葉県成田市 | info@smart-guesthouse.jp</p>
      </footer>
    </main>
  )
}
