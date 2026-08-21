import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How HN Enterprises collects, uses, and protects information in the HN Enterprises mobile application.",
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="pt-1 text-sm font-semibold text-foreground">{children}</h3>;
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

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
      <header className="mb-12 space-y-3 border-b border-border/70 pb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Legal</p>
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">
          Effective Date: 21 August 2026 &nbsp;·&nbsp; Last Updated: 21 August 2026
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          HN Enterprises (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) provides a mobile
          application for authorized employees, supervisors, and field teams to manage customers,
          attendance, field work, work planning, Daily Progress Reports (DPR), expenses, complaints,
          documents, and other operational activities.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This Privacy Policy explains what information may be collected through the HN Enterprises
          mobile application, how it is used, and how it is protected.
        </p>
      </header>

      <nav aria-label="Table of contents" className="mb-12 rounded-lg border border-border/70 bg-card p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">On this page</p>
        <ol className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm text-primary sm:grid-cols-2">
          {[
            ["information-we-collect", "1. Information We Collect"],
            ["how-we-use-information", "2. How We Use Information"],
            ["how-information-is-shared", "3. How Information Is Shared"],
            ["data-security", "4. Data Security"],
            ["data-retention", "5. Data Retention"],
            ["account-and-data-deletion", "6. Account and Data Deletion"],
            ["permissions", "7. Permissions"],
            ["childrens-privacy", "8. Children's Privacy"],
            ["third-party-services", "9. Third-Party Services"],
            ["changes-to-this-privacy-policy", "10. Changes to This Privacy Policy"],
            ["contact-us", "11. Contact Us"],
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
        <Section id="information-we-collect" title="1. Information We Collect">
          <p>
            Depending on the features you use, the application may collect or process the following
            information.
          </p>

          <SubHeading>Account and Profile Information</SubHeading>
          <p>We may process information associated with your authorized HN Enterprises account, including:</p>
          <List
            items={[
              "Name",
              "Username",
              "Email address",
              "Mobile number",
              "Employee or user identifier",
              "Role, such as supervisor or staff member",
              "Authentication and session information",
            ]}
          />
          <p>
            This information is used to authenticate users and provide access according to assigned roles
            and permissions.
          </p>

          <SubHeading>Attendance and Location Information</SubHeading>
          <p>
            When you use attendance features such as Check In or Check Out, the application may collect
            your device location.
          </p>
          <p>Location information may include:</p>
          <List items={["Latitude and longitude", "Time of capture", "Attendance-related location information"]} />
          <p>Location is used for attendance verification and related operational purposes.</p>
          <p>The application does not use location for advertising purposes.</p>

          <SubHeading>Customer and Field Operations Data</SubHeading>
          <p>Authorized users may access, create, or update business information including:</p>
          <List
            items={[
              "Customer names and contact details",
              "BP/TR numbers",
              "Customer addresses",
              "Project and site information",
              "Survey information",
              "Work progress information",
              "Installation and commissioning information",
              "Work Planning",
              "Daily Progress Reports (DPR)",
              "Billing and work completion information",
              "Operational remarks and status information",
            ]}
          />
          <p>This information is processed only for legitimate business and field-operation activities.</p>

          <SubHeading>Expense Information</SubHeading>
          <p>The application may process business expense information such as:</p>
          <List
            items={[
              "Expense amount",
              "Expense category",
              "Payment mode",
              "Paid-to information",
              "Purpose",
              "Date",
              "Related project, site, plumber, employee, or operational information",
              "Supporting evidence where provided",
            ]}
          />
          <p>
            The application is not intended to collect consumer banking passwords or payment-card
            credentials.
          </p>

          <SubHeading>Complaints and Activity Information</SubHeading>
          <p>The application may process:</p>
          <List
            items={[
              "Customer complaints",
              "Complaint status",
              "Complaint remarks",
              "Follow-up information",
              "Work activity and progress information",
              "Operational history",
            ]}
          />
          <p>This information helps authorized teams manage and resolve field operations.</p>

          <SubHeading>Photos, Documents, and Evidence</SubHeading>
          <p>Users may upload photos, documents, PDFs, or other evidence relating to customer work or operational activities.</p>
          <p>Depending on the feature being used, the application may request access to:</p>
          <List items={["Camera", "Photos or media selected by the user", "Files or documents selected by the user"]} />
          <p>We only use this content for the business purpose for which it was uploaded.</p>

          <SubHeading>Device and Notification Information</SubHeading>
          <p>If notifications are enabled, we may process technical information necessary to deliver notifications, such as:</p>
          <List
            items={[
              "Push notification token",
              "Device or app installation identifier",
              "Basic device/platform information required for notification delivery",
            ]}
          />
          <p>We do not use this information for advertising.</p>
        </Section>

        <Section id="how-we-use-information" title="2. How We Use Information">
          <p>Information collected through the HN Enterprises application may be used to:</p>
          <List
            items={[
              "Authenticate authorized users",
              "Manage user roles and permissions",
              "Record and verify attendance",
              "Manage customers and field activities",
              "Create and maintain Work Planning and DPR records",
              "Track work progress and completion",
              "Record business expenses",
              "Manage complaints and follow-ups",
              "Store operational photos, documents, and evidence",
              "Provide dashboards, statistics, and reports",
              "Send operational notifications",
              "Maintain application security",
              "Diagnose technical problems",
              "Protect against unauthorized access or misuse",
              "Meet legitimate business, contractual, or legal requirements",
            ]}
          />
          <p className="font-medium text-foreground">We do not sell personal information.</p>
        </Section>

        <Section id="how-information-is-shared" title="3. How Information Is Shared">
          <p>
            Information may be accessible to authorized HN Enterprises personnel according to their
            assigned roles and permissions.
          </p>
          <p>We may also use service providers that help operate the application, such as providers for:</p>
          <List
            items={[
              "Cloud hosting",
              "Database hosting",
              "File storage",
              "Application infrastructure",
              "Push notifications",
              "Technical monitoring or maintenance",
            ]}
          />
          <p>Such providers may process information only as necessary to provide their services.</p>
          <p>
            We may disclose information where required by applicable law, regulation, court order, or
            lawful government request.
          </p>
          <p>We do not share personal information with advertisers for targeted advertising.</p>
        </Section>

        <Section id="data-security" title="4. Data Security">
          <p>
            We take reasonable technical and organizational measures to protect information against
            unauthorized access, alteration, disclosure, or loss.
          </p>
          <p>These measures may include:</p>
          <List
            items={[
              "Authentication controls",
              "Role-based access controls",
              "Secure API communication",
              "Encrypted network connections",
              "Restricted access to business information",
              "Server-side authorization checks",
            ]}
          />
          <p>However, no electronic system can guarantee absolute security.</p>
          <p>
            Users are responsible for keeping their login credentials confidential and should not share
            their account credentials with unauthorized persons.
          </p>
        </Section>

        <Section id="data-retention" title="5. Data Retention">
          <p>We retain business and user information only for as long as reasonably necessary for:</p>
          <List
            items={[
              "Operational requirements",
              "Employment or company administration",
              "Customer and project records",
              "Financial or accounting requirements",
              "Legal or regulatory obligations",
              "Security and audit purposes",
            ]}
          />
          <p>Retention periods may vary depending on the type of information and business requirements.</p>
          <p>
            When information is no longer required, it may be deleted, anonymized, or securely archived
            in accordance with applicable requirements.
          </p>
        </Section>

        <Section id="account-and-data-deletion" title="6. Account and Data Deletion">
          <p>
            HN Enterprises accounts are generally created and managed for authorized company users rather
            than through public self-registration.
          </p>
          <p>
            Users who want to request deletion or correction of their account information may contact HN
            Enterprises using the contact information below.
          </p>
          <p>
            Where an account is managed by an employer or organization, certain records may need to be
            retained for legitimate operational, financial, contractual, audit, or legal purposes even
            after access to the account is removed.
          </p>
          <p>Requests will be handled in accordance with applicable laws and legitimate retention requirements.</p>
        </Section>

        <Section id="permissions" title="7. Permissions">
          <p>The application may request permissions only when required for relevant functionality.</p>

          <SubHeading>Location</SubHeading>
          <p>Used for attendance and field-related verification where applicable.</p>

          <SubHeading>Camera</SubHeading>
          <p>Used when a user chooses to capture operational photos or evidence.</p>

          <SubHeading>Photos / Media / Files</SubHeading>
          <p>Used when a user chooses to upload existing photos, documents, PDFs, or evidence.</p>

          <SubHeading>Notifications</SubHeading>
          <p>Used to provide relevant operational alerts and updates.</p>

          <p>Permission availability and behavior may depend on the user&apos;s device and Android version.</p>
          <p>Users can manage permissions through their device settings.</p>
        </Section>

        <Section id="childrens-privacy" title="8. Children's Privacy">
          <p>HN Enterprises is a business and workforce application and is not intended for children.</p>
          <p>
            We do not knowingly design the application to collect personal information from children for
            consumer use.
          </p>
        </Section>

        <Section id="third-party-services" title="9. Third-Party Services">
          <p>
            The application may rely on third-party infrastructure or software services required for
            technical operation, hosting, storage, notifications, or application functionality.
          </p>
          <p>
            Third-party providers may process limited information in accordance with their respective
            agreements and privacy practices.
          </p>
          <p>We do not permit third-party providers to use HN Enterprises operational data for unrelated advertising purposes.</p>
        </Section>

        <Section id="changes-to-this-privacy-policy" title="10. Changes to This Privacy Policy">
          <p>We may update this Privacy Policy from time to time to reflect:</p>
          <List
            items={[
              "Changes to the application",
              "New features",
              "Changes in data-processing practices",
              "Legal or regulatory requirements",
            ]}
          />
          <p>
            When changes are made, the &ldquo;Last Updated&rdquo; date at the top of this policy will be
            revised.
          </p>
          <p>Users are encouraged to review this Privacy Policy periodically.</p>
        </Section>

        <Section id="contact-us" title="11. Contact Us">
          <p>
            For questions, privacy concerns, access requests, correction requests, or deletion requests,
            contact:
          </p>
          <div className="rounded-lg border border-border/70 bg-card p-4 text-sm not-italic text-foreground">
            <p className="font-semibold">HN Enterprises</p>
            <p>
              Email:{" "}
              <a href="mailto:frontailtechnology@gmail.com" className="text-primary hover:underline">
                frontailtechnology@gmail.com
              </a>
            </p>
            <p>Address: Ramgarh Morh, Jaipur, Rajasthan, India</p>
          </div>
          <p>
            If you are an employee or authorized company user, you may also contact your administrator or
            supervisor for account-related requests.
          </p>
        </Section>
      </div>
    </main>
  );
}
