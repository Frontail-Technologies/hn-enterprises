import type { Metadata } from 'next'
import { HouseIcon as House } from '@phosphor-icons/react/dist/ssr'
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
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-2">
          <House size={24} weight="fill" className="text-primary-foreground" />
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
