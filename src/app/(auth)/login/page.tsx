import type { Metadata } from 'next'
import Image from 'next/image'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your HN Enterprises account to manage CGD and construction projects.',
}

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm shadow-xl mx-auto border-border">
      <CardHeader className="space-y-4 flex flex-col items-center">
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-xl bg-background">
          <Image
            src="/logo.png"
            alt="HN Enterprises"
            width={64}
            height={64}
            priority
            className="h-14 w-14 object-contain"
          />
        </div>
        <div className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">HN Enterprises</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  )
}
