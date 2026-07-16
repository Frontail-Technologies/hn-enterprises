import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { TooltipProvider } from '@/components/ui/tooltip'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'HN Enterprises — CGD & Construction Management',
    template: '%s | HN Enterprises',
  },
  description:
    'HN Enterprises is a comprehensive CGD and construction operations management system for projects, surveys, GC, JMR, billing and more.',
  keywords: ['CGD', 'construction management', 'project management', 'GC', 'JMR'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={inter.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
