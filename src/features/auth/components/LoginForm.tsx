'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeSlash, Warning } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { loginSchema, LoginFormValues } from '@/features/auth/schemas/login.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null)
    try {
      await login(data)
      router.replace('/dashboard')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && (
        <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
          <Warning size={16} className="text-destructive" />
          <AlertDescription className="text-sm text-destructive">{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Username */}
      <div className="space-y-1.5">
        <Label htmlFor="username" className="text-sm font-medium text-foreground">
          Username
        </Label>
        <Input
          id="username"
          type="text"
          placeholder="Enter your username"
          autoComplete="username"
          {...register('username')}
          className={errors.username ? 'border-destructive focus-visible:ring-destructive/30' : ''}
        />
        {errors.username && (
          <p className="text-xs text-destructive">{errors.username.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            autoComplete="current-password"
            {...register('password')}
            className={errors.password ? 'border-destructive focus-visible:ring-destructive/30 pr-10' : 'pr-10'}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        id="btn-login"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 transition-colors"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
            Signing in...
          </span>
        ) : (
          'Sign In'
        )}
      </Button>

      {/* Dev hint */}
      <p className="text-center text-xs text-muted-foreground">
        Demo: <span className="font-mono text-foreground">admin</span> / <span className="font-mono text-foreground">admin123</span>
      </p>
    </form>
  )
}
