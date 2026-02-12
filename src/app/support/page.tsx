import { AppConstants } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Support • ${AppConstants.APP_NAME}`,
  description: `Support and contact information for ${AppConstants.APP_NAME}.`,
};

function Section({
  title,
  children,
  id,
}: {
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="rounded-xl border bg-card text-card-foreground shadow-sm"
    >
      <div className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
      <div className="w-44 shrink-0 text-sm font-medium text-muted-foreground">
        {label}
      </div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

export default function SupportPage() {
  const mailtoSupport = `mailto:${AppConstants.SUPPORT_EMAIL}?subject=${encodeURIComponent(
    `${AppConstants.APP_NAME} Support (v${AppConstants.VERSION})`,
  )}`;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground shadow-xs">
          <span className="h-2 w-2 rounded-full bg-primary" />
          App Support
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          {AppConstants.APP_NAME} Support
        </h1>

        <p className="mt-3 text-base text-muted-foreground">
          Contact support, report issues, and request features. Current app
          version: <span className="font-medium">v{AppConstants.VERSION}</span>.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={mailtoSupport}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
          >
            Email Support
          </a>

          <a
            href="#frequent-support-questions"
            className="inline-flex items-center justify-center rounded-lg border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:opacity-95"
          >
            Frequent Support Questions
          </a>
        </div>
      </header>

      <div className="grid gap-6">
        <Section title="Contact Support" id="contact">
          <div className="space-y-4">
            <Row
              label="Support Email"
              value={
                <a
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  href={`mailto:${AppConstants.SUPPORT_EMAIL}`}
                >
                  {AppConstants.SUPPORT_EMAIL}
                </a>
              }
            />

            <Row label="Typical Response Time" value="1–3 business days" />

            <div className="rounded-lg border bg-background px-4 py-3 text-sm">
              <div className="font-medium">What to include</div>
              <ul className="mt-2 list-disc pl-5 text-muted-foreground">
                <li>Your device model and iOS version</li>
                <li>App version (v{AppConstants.VERSION})</li>
                <li>Steps to reproduce (if it’s a bug)</li>
                <li>Screenshots (optional)</li>
              </ul>
            </div>
          </div>
        </Section>

        <Section title="Legal & Regulatory Contact" id="legal">
          <div className="space-y-3 text-sm">
            <Row label="Developer" value={AppConstants.DEVELOPER_NAME} />

            <Row label="Effective Date" value={AppConstants.EFFECTIVE_DATE} />

            <div className="rounded-lg border bg-background px-4 py-3">
              <div className="font-medium">Contact method</div>
              <p className="mt-1 text-muted-foreground">
                For support requests, legal inquiries, and feedback related to{" "}
                {AppConstants.APP_NAME}, please contact us via email at{" "}
                <a
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  href={mailtoSupport}
                >
                  {AppConstants.SUPPORT_EMAIL}
                </a>
                .
              </p>
              <p className="mt-2 text-muted-foreground">
                At this time, we do not provide phone support. If you require a
                written correspondence address for a specific legal purpose,
                contact us by email and we will provide appropriate instructions
                where applicable.
              </p>
            </div>
          </div>
        </Section>

        <Section
          title="Frequent Support Questions"
          id="frequent-support-questions"
        >
          <div className="space-y-4 text-sm">
            <div>
              <div className="font-medium">How do I report a bug?</div>
              <p className="mt-1 text-muted-foreground">
                Email us with steps to reproduce, what you expected to happen,
                and what happened instead. Screenshots help.
              </p>
            </div>

            <div>
              <div className="font-medium">How do I request a feature?</div>
              <p className="mt-1 text-muted-foreground">
                Email us with the feature idea and the problem it solves. We
                review requests and prioritize based on impact and feasibility.
              </p>
            </div>

            {/* <div>
              <div className="font-medium">I need help with purchases.</div>
              <p className="mt-1 text-muted-foreground">
                If purchases are handled by Apple, subscription and refund
                options are typically managed via your Apple ID settings. If
                something looks wrong, email support and include any relevant
                receipt information you have.
              </p>
            </div> */}

            <div>
              <div className="font-medium">
                How do I delete my account and data?
              </div>
              <p className="mt-1 text-muted-foreground">
                You can delete your account directly inside the app:
              </p>

              <ul className="mt-2 list-disc pl-5 text-muted-foreground">
                <li>
                  Open <span className="font-medium">Settings</span>
                </li>
                <li>
                  Go to <span className="font-medium">Account</span>
                </li>
                <li>
                  Tap{" "}
                  <span className="font-medium text-destructive">
                    Delete account
                  </span>
                </li>
              </ul>

              <p className="mt-2 text-muted-foreground">
                When you delete your account, all associated personal data
                stored on our servers is permanently removed. This action cannot
                be undone.
              </p>

              <p className="mt-2 text-muted-foreground">
                If you are unable to access your account, you may request
                deletion by emailing{" "}
                <a
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  href={`mailto:${AppConstants.SUPPORT_EMAIL}?subject=Account%20Deletion%20Request`}
                >
                  {AppConstants.SUPPORT_EMAIL}
                </a>
                .
              </p>
            </div>
          </div>
        </Section>
      </div>
    </main>
  );
}
