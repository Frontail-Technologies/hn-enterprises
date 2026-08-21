import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with the HN Enterprises mobile app - contact support, account help, and permissions guidance.",
};

const SUPPORT_EMAIL = "frontailtechnology@gmail.com";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5 marker:text-muted-foreground/60">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

function OrderedList({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="list-decimal space-y-1 pl-5 marker:text-muted-foreground/60">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ol>
  );
}

function SupportEmailLink() {
  return (
    <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
      {SUPPORT_EMAIL}
    </a>
  );
}

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
      <header className="mb-12 space-y-3 border-b border-border/70 pb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Support</p>
        <h1 className="text-3xl font-bold text-foreground">HN Enterprises App Support</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Welcome to the HN Enterprises mobile app support page.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          HN Enterprises is a field operations and workforce management application for authorized
          employees, supervisors, and field teams.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The app helps users manage daily operational work, including customer records, attendance,
          work planning, Daily Progress Reports (DPR), expenses, complaints, work progress, documents,
          and related field activities.
        </p>
      </header>

      <nav aria-label="Table of contents" className="mb-12 rounded-lg border border-border/70 bg-card p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">On this page</p>
        <ol className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm text-primary sm:grid-cols-2">
          {[
            ["need-help", "Need Help?"],
            ["login-account-support", "Login & Account Support"],
            ["app-features", "App Features"],
            ["location-permission", "Location Permission"],
            ["camera-photos-documents", "Camera, Photos & Documents"],
            ["notifications", "Notifications"],
            ["privacy", "Privacy"],
            ["data-or-account-requests", "Data or Account Requests"],
            ["about-the-app", "About the App"],
          ].map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="hover:underline">
                {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-10">
        <Section id="need-help" title="Need Help?">
          <p>If you are experiencing an issue with the HN Enterprises app, please contact our support team.</p>
          <p className="font-medium text-foreground">
            Support Email: <SupportEmailLink />
          </p>
          <p>Please include the following information when contacting support:</p>
          <List
            items={[
              "Your name",
              "Registered username or email",
              "A short description of the issue",
              "Screenshot of the issue, if available",
              "Device model and Android/iOS version, if relevant",
            ]}
          />
          <p>Please do not send your password or other login credentials by email.</p>
        </Section>

        <Section id="login-account-support" title="Login & Account Support">
          <p>HN Enterprises is intended for authorized organization users.</p>
          <p>Accounts may be created or managed by the organization or system administrator.</p>
          <p>If you:</p>
          <List
            items={[
              "cannot sign in",
              "forgot your password",
              "need access to a module",
              "believe your account information is incorrect",
              "need your account disabled or removed",
            ]}
          />
          <p>please contact the support team or your authorized administrator.</p>
        </Section>

        <Section id="app-features" title="App Features">
          <p>Support is available for features including:</p>
          <List
            items={[
              "Customer Management",
              "Attendance",
              "Work Planning",
              "Daily Progress Reports (DPR)",
              "Work Progress",
              "Expenses",
              "Complaints",
              "Customer documents and evidence",
              "Notifications",
              "Operational dashboard and statistics",
            ]}
          />
        </Section>

        <Section id="location-permission" title="Location Permission">
          <p>The app may request location permission for attendance-related functionality.</p>
          <p>If location access is required and not working:</p>
          <OrderedList
            items={[
              "Open your device Settings.",
              "Find the HN Enterprises app.",
              "Open Permissions.",
              "Enable Location permission where required.",
              "Return to the app and try again.",
            ]}
          />
        </Section>

        <Section id="camera-photos-documents" title="Camera, Photos & Documents">
          <p>
            The app may request access to your camera, photos, or files when you choose to upload
            work-related evidence or documents.
          </p>
          <p>You can manage these permissions from your device settings.</p>
        </Section>

        <Section id="notifications" title="Notifications">
          <p>If you are not receiving notifications, check:</p>
          <List
            items={[
              "Notifications are enabled for HN Enterprises in device settings.",
              "Your device has an active internet connection.",
              "Battery or background restrictions are not blocking the app.",
            ]}
          />
        </Section>

        <Section id="privacy" title="Privacy">
          <p>
            We respect the privacy of users and operational data processed through the HN Enterprises
            application.
          </p>
          <p>
            Please review our Privacy Policy for information about the data we collect, how it is used,
            and how it is protected.
          </p>
          <p className="font-medium text-foreground">
            Privacy Policy:{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              /privacy
            </Link>
          </p>
        </Section>

        <Section id="data-or-account-requests" title="Data or Account Requests">
          <p>For requests related to:</p>
          <List
            items={[
              "account information",
              "correction of personal information",
              "access to your information",
              "account or data deletion",
            ]}
          />
          <p>contact:</p>
          <div className="rounded-lg border border-border/70 bg-card p-4 text-sm not-italic text-foreground">
            <p className="font-semibold">Frontail Technologies</p>
            <p>
              Email: <SupportEmailLink />
            </p>
          </div>
          <p>
            Some operational, financial, audit, employment, or legal records may need to be retained
            where required by the organization or applicable law.
          </p>
        </Section>

        <Section id="about-the-app" title="About the App">
          <p>
            HN Enterprises mobile application is developed and maintained by{" "}
            <span className="font-medium text-foreground">Frontail Technologies</span> for HN Enterprises.
          </p>
          <div className="rounded-lg border border-border/70 bg-card p-4 text-sm not-italic text-foreground">
            <p className="font-semibold">Technical Support</p>
            <p>Frontail Technologies</p>
            <p>
              Email: <SupportEmailLink />
            </p>
          </div>
          <p>
            <span className="font-medium text-foreground">App:</span> HN Enterprises
            <br />
            <span className="font-medium text-foreground">Platform:</span> Android &amp; iOS
          </p>
        </Section>
      </div>
    </main>
  );
}
