import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Infinithoughts',
  description: 'A magazine platform powered by Supabase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
