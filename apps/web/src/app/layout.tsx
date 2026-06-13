import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Smart Guesthouse | 成田空港前泊',
  description: '成田空港から10分。和モダン×スマートテックのゲストハウス。LCC利用者・ビジネス旅行者・外国人個人旅行者に最適。',
  keywords: ['成田', 'ゲストハウス', '前泊', '空港', 'LCC', 'スマートロック'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans bg-stone-50 text-stone-800`}>
        {children}
      </body>
    </html>
  )
}
