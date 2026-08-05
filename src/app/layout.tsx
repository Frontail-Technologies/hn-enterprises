import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { QueryProvider } from '@/components/providers/QueryProvider'
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
    <html lang="en" data-scroll-behavior="smooth" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>
            <TooltipProvider>
              {children}
              <Toaster position="top-right" richColors closeButton duration={3500} />
            </TooltipProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
