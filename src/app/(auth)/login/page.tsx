import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ClipboardTextIcon, ReceiptIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your HN Enterprises account to manage CGD and construction projects.",
};

const HIGHLIGHTS = [
  { icon: UsersThreeIcon, text: "Customers, surveys and connections" },
  { icon: ClipboardTextIcon, text: "Field work, DPRs and materials" },
  { icon: ReceiptIcon, text: "Bills, payments and expenses" },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      {/* Brand panel — desktop only */}
      <aside className="relative hidden overflow-hidden lg:block">
        <Image
          src="/images/gc-trench.png"
          alt=""
          fill
          priority
          sizes="55vw"
          className="object-cover"
        />
        {/* Flat tint (no gradient, RG-033) so the copy stays readable on the photo. */}
        <div className="absolute inset-0 bg-[oklch(20%_0.05_250/0.62)]" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white xl:p-14">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center overflow-hidden rounded-xl bg-white">
              <Image src="/logo.png" alt="" width={40} height={40} className="size-9 object-contain" />
            </span>
            <div className="leading-tight">
              <p className="text-base font-semibold">HN Enterprises</p>
              <p className="text-sm text-white/70">CGD Management</p>
            </div>
          </div>

          <div className="max-w-md space-y-6">
            <h2 className="text-3xl leading-tight font-semibold tracking-tight xl:text-4xl">
              City gas projects, from survey to billing.
            </h2>
            <ul className="space-y-3">
              {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-[15px] text-white/90">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/12">
                    <Icon size={17} weight="bold" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/60">© {new Date().getFullYear()} HN Enterprises</p>
        </div>
      </aside>

      {/* Sign-in */}
      <main className="flex flex-col px-6 py-8 sm:px-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex flex-col gap-5">
              <span className="flex size-14 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card shadow-card lg:hidden">
                <Image src="/logo.png" alt="HN Enterprises" width={48} height={48} priority className="size-11 object-contain" />
              </span>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
                <p className="text-sm text-muted-foreground">Sign in to the HN Enterprises admin panel.</p>
              </div>
            </div>

            <LoginForm />

            <p className="mt-6 text-center text-[13px] text-muted-foreground">
              Trouble signing in? Contact your administrator.
            </p>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-6 text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground hover:underline">
            Privacy
          </Link>
          <Link href="/support" className="hover:text-foreground hover:underline">
            Support
          </Link>
          <span className="lg:hidden">© {new Date().getFullYear()} HN Enterprises</span>
        </footer>
      </main>
    </div>
  );
}
