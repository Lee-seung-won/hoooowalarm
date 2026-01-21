import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '스마트 폐활량 알람 시계 컨트롤러',
  description: 'Web Serial API를 통한 아두이노 제어 웹앱',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="dark">
      <body>{children}</body>
    </html>
  )
}
