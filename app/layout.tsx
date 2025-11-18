import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: {
    default: 'HIMATEKIA 2025',
    template: '%s | HIMATEKIA 2025',
  },
  description:
    'Sistem Pemilihan Ketua BPH & Senator Himpunan Mahasiswa Teknik Kimia 2025. Voting online yang aman, terpercaya, dan transparan untuk mahasiswa Teknik Kimia.',
  generator: 'v0.app',
  keywords: [
    'HIMATEKIA',
    'Himpunan Mahasiswa Teknik Kimia',
    'PEMIRA HIMATEKIA',
    'Pemilihan Ketua BPH',
    'Pemilihan Senator',
    'Pemira 2025',
    'Voting online',
    'Institut Teknologi Sumatera',
  ],
  authors: [{ name: 'Himpunan Mahasiswa Teknik Kimia' }],
  applicationName: 'PEMIRA HIMATEKIA 2025',
  openGraph: {
    title: 'HIMATEKIA 2025 - Pemilihan Ketua BPH & Senator',
    description:
      'Ikuti PEMIRA HIMATEKIA 2025 untuk memilih Ketua BPH dan Senator. Sistem pemilihan online yang aman, mudah digunakan, dan transparan.',
    url: '/',
    siteName: 'PEMIRA HIMATEKIA 2025',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PEMIRA HIMATEKIA 2025',
    description:
      'Sistem Pemilihan Ketua BPH & Senator Himpunan Mahasiswa Teknik Kimia 2025 secara online, aman, dan transparan.',
  },
  verification: {
    google: 'wzOeWwFfOv4PKkU9LWjn4qDB9xLOp9Uji6MKYKygvSA',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="wzOeWwFfOv4PKkU9LWjn4qDB9xLOp9Uji6MKYKygvSA"
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
