'use client'

import { useEffect, useState, type KeyboardEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  EyeIcon as Eye,
  EyeSlashIcon as EyeSlash,
  LockSimpleIcon as LockSimple,
  UserIcon as User,
  WarningCircleIcon as WarningCircle,
} from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { loginSchema, LoginFormValues } from '@/features/auth/schemas/login.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const fieldClass =
  'h-11 rounded-lg pl-10 text-[15px] md:text-[15px] placeholder:text-muted-foreground/70'

export function LoginForm() {
  const { isAuthenticated, isLoading, login } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null)
    try {
      await login(data)
      router.replace('/dashboard')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    }
  }

  const trackCapsLock = (event: KeyboardEvent<HTMLInputElement>) => setCapsLock(event.getModifierState('CapsLock'))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && (
        <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-destructive/25 bg-danger-soft px-3 py-2.5 text-sm text-destructive">
          <WarningCircle size={18} weight="fill" className="mt-px shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="username" className="text-sm font-medium text-foreground">
          Username
        </Label>
        <div className="relative">
          <User size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="username"
            type="text"
            placeholder="Enter your username"
            autoComplete="username"
            autoFocus
            aria-invalid={errors.username ? true : undefined}
            {...register('username')}
            className={fieldClass}
          />
        </div>
        {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </Label>
        <div className="relative">
          <LockSimple size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            autoComplete="current-password"
            aria-invalid={errors.password ? true : undefined}
            onKeyUp={trackCapsLock}
            onKeyDown={trackCapsLock}
            {...register('password')}
            className={cn(fieldClass, 'pr-11')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password ? (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        ) : capsLock ? (
          <p className="text-xs text-warning-foreground">Caps Lock is on.</p>
        ) : null}
      </div>

      <Button type="submit" disabled={isSubmitting} id="btn-login" className="h-11 w-full text-[15px] font-semibold">
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
            Signing in...
          </span>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  )
}
