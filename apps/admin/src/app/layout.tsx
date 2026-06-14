import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Smart Guesthouse - 管理画面',
  description: '管理者向けダッシュボード',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-stone-50 text-stone-800">
        {children}
      </body>
    </html>
  )
}
