import { AppConstants } from "@/lib/constants";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Privacy Policy • ${AppConstants.APP_NAME}`,
  description: `${AppConstants.APP_NAME} Privacy Policy describing how we collect, use, and protect information.`,
};

export default function PrivacyPolicyPage() {
  const {
    APP_NAME,
    EFFECTIVE_DATE,
    SUPPORT_EMAIL: CONTACT_EMAIL,
    DEVELOPER_NAME,
  } = AppConstants;

  return (
    <section className="relative py-14 sm:py-20">
      <header className="border-b border-border/70 bg-gradient-to-b from-card/80 to-card/50 px-6 py-8 sm:px-10 rounded-t-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/25 px-3 py-1 text-xs text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-accent" />
          Policy
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Privacy Policy
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          <strong className="font-semibold text-foreground">{APP_NAME}</strong>{" "}
          • Effective date: {EFFECTIVE_DATE}
        </p>

        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          This Privacy Policy explains how {APP_NAME} (“we”, “us”, “our”)
          collects, uses, and shares information when you use our mobile
          application and related services (collectively, the “Service”).
        </p>
      </header>

      <div className="px-6 py-8 sm:px-10">
        <Section>
          <H2>1. Scope</H2>
          <P>
            This Privacy Policy applies to the Service, including the {APP_NAME}{" "}
            mobile app, our websites that link to this policy, and the backend
            services that support the app (such as authentication and data
            storage). If you do not agree with this Privacy Policy, do not use
            the Service.
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>2. Summary (Plain Language)</H2>
          <Ul>
            <Li>
              We collect information you provide to create an account and use
              the app (including check-ins you choose to log).
            </Li>
            <Li>
              We use your check-in entries to show you trends and analytics.
            </Li>
            <Li>We do not sell personal information.</Li>
            <Li>We do not use your data for targeted advertising.</Li>
            <Li>
              You can request deletion of your account and associated data.
            </Li>
          </Ul>
        </Section>

        <Divider />

        <Section>
          <H2>3. Information We Collect</H2>

          <H3>3.1 Account and Authentication Data</H3>
          <P>
            We use{" "}
            <strong className="font-semibold text-foreground">Clerk</strong> to
            provide authentication and account management. When you sign up or
            sign in, Clerk processes information required to authenticate you
            (such as your email address and/or social sign-in details, depending
            on the method you choose). We receive a unique identifier for your
            account (for example, a Clerk user ID) and may receive basic profile
            information you choose to share through the sign-in method (for
            example, name).
          </P>
          <P>
            We do not receive your password when you use social sign-in. If you
            sign in with email and password via Clerk, Clerk handles password
            processing securely; we do not store your password.
          </P>

          <H3>3.2 Check-In Data You Enter</H3>
          <P>
            The Service allows you to log check-ins. Depending on what you
            choose to enter, we collect and store:
          </P>
          <Ul>
            <Li>
              <strong className="font-semibold text-foreground">
                Energy level
              </strong>{" "}
              (e.g., 1–10)
            </Li>
            <Li>
              <strong className="font-semibold text-foreground">
                Pain level
              </strong>{" "}
              (if you use this feature)
            </Li>
            <Li>
              <strong className="font-semibold text-foreground">Tags</strong>{" "}
              you select (optional)
            </Li>
            <Li>
              <strong className="font-semibold text-foreground">Notes</strong>{" "}
              you type (optional)
            </Li>
            <Li>
              <strong className="font-semibold text-foreground">
                Timestamps
              </strong>{" "}
              of entries to power daily/weekly/monthly analytics
            </Li>
          </Ul>
          <P>
            Your notes may contain sensitive personal information if you choose
            to include it. Please avoid entering information you do not want
            stored in the Service.
          </P>

          <H3>3.3 Notification Preferences</H3>
          <P>
            If you enable reminders, we store your notification preferences,
            which may include whether reminders are enabled, custom reminder
            times, and related settings (e.g., sound/vibration toggles). These
            preferences are used to schedule reminders.
          </P>

          <H3>3.4 Device and Technical Data</H3>
          <P>
            We may collect limited technical data to operate, maintain, and
            secure the Service, such as app version, device/OS information, and
            diagnostic logs (including crash or error logs). We do not
            intentionally collect precise location data unless we introduce a
            feature that requires it and request permission where required.
          </P>

          <H3>3.5 Payment Data (If Applicable)</H3>
          <P>
            If paid features are introduced, purchases may be processed by Apple
            (in-app purchases) or another payment processor. We do not receive
            or store full payment card numbers.
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>4. How We Use Information</H2>
          <P>We use information to:</P>
          <Ul>
            <Li>
              Provide and operate the Service (account access, check-ins,
              analytics, reminders).
            </Li>
            <Li>
              Generate insights and trends (daily, weekly, monthly, yearly) from
              your entries.
            </Li>
            <Li>
              Maintain safety and integrity of the Service (fraud prevention,
              abuse detection, security monitoring).
            </Li>
            <Li>
              Improve reliability and performance (debugging, diagnostics).
            </Li>
            <Li>
              Communicate with you about important service-related updates (for
              example, security notices or policy changes).
            </Li>
          </Ul>
          <P>
            We do not use your information for targeted advertising. We do not
            sell personal information.
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>5. How We Share Information</H2>

          <H3>5.1 Service Providers</H3>
          <P>
            We use third-party vendors to help operate the Service. These
            vendors may process information on our behalf, subject to
            contractual obligations consistent with this policy. Examples
            include:
          </P>
          <Ul>
            <Li>
              <strong className="font-semibold text-foreground">Clerk</strong>{" "}
              for authentication and account management
            </Li>
            <Li>
              <strong className="font-semibold text-foreground">
                Neon (Postgres)
              </strong>{" "}
              for database hosting
            </Li>
            <Li>
              <strong className="font-semibold text-foreground">
                Hosting/Infrastructure
              </strong>{" "}
              providers for running our backend and serving pages
            </Li>
          </Ul>

          <H3>5.2 Legal, Safety, and Compliance</H3>
          <P>
            We may disclose information if required by law or if we reasonably
            believe disclosure is necessary to comply with legal obligations,
            protect our rights, investigate fraud/security issues, or protect
            the safety of users and the public.
          </P>

          <H3>5.3 Business Transfers</H3>
          <P>
            If we are involved in a merger, acquisition, financing, or sale of
            assets, information may be transferred as part of that transaction.
            We will provide notice if your information becomes subject to a
            materially different privacy policy.
          </P>

          <H3>5.4 No Sale of Personal Information</H3>
          <P>We do not sell personal information.</P>
        </Section>

        <Divider />

        <Section>
          <H2>6. Tracking and Advertising</H2>
          <P>
            We do not use your data to track you across third-party apps and
            websites for advertising purposes. We do not serve behavioral or
            targeted ads in the Service. If our practices change, we will update
            this policy and, where required, request any necessary permissions.
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>7. Your Choices and Controls</H2>

          <H3>7.1 Account Access and Updates</H3>
          <P>
            You can access and update certain account information through the
            Service and/or your authentication provider.
          </P>

          <H3>7.2 Notifications</H3>
          <P>
            You can enable or disable reminders within the app and through your
            device settings. If notifications are disabled, the app may not be
            able to send reminder prompts.
          </P>

          <H3>7.3 Data Deletion</H3>
          <P>
            You may request deletion of your account and associated data by
            contacting us. We will take reasonable steps to delete your
            information from our active systems, subject to legal requirements
            and legitimate business needs (e.g., security, fraud prevention, and
            compliance).
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>8. Data Retention</H2>
          <P>
            We retain information for as long as necessary to provide the
            Service, comply with legal obligations, resolve disputes, and
            enforce agreements. You may request deletion as described above.
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>9. Security</H2>
          <P>
            We implement reasonable administrative, technical, and
            organizational safeguards designed to protect information. However,
            no method of transmission or storage is 100% secure, and we cannot
            guarantee absolute security.
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>10. Children’s Privacy</H2>
          <P>
            The Service is not directed to children under 13 (or the minimum age
            required in your jurisdiction), and we do not knowingly collect
            personal information from children. If you believe a child has
            provided personal information, please contact us so we can take
            appropriate action.
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>11. International Transfers</H2>
          <P>
            Your information may be processed in countries other than your own,
            depending on where our service providers operate. We take steps
            designed to ensure appropriate safeguards are in place consistent
            with applicable law.
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>12. Changes to This Policy</H2>
          <P>
            We may update this Privacy Policy from time to time. If we make
            material changes, we will update the effective date above and may
            provide additional notice through the Service.
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>13. Contact Us</H2>
          <P>
            If you have questions or requests regarding this Privacy Policy,
            contact:
          </P>
          <Ul>
            <Li>
              Email:{" "}
              <Link
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                {CONTACT_EMAIL}
              </Link>
            </Li>
            <Li>
              Developer:{" "}
              <strong className="font-semibold text-foreground">
                {DEVELOPER_NAME}
              </strong>
            </Li>
          </Ul>
        </Section>

        <footer className="mt-10 rounded-2xl border border-border/70 bg-muted/20 p-4 text-xs leading-relaxed text-muted-foreground">
          <p className="m-0">
            Tip: If you reached this page from the app, you can return to the
            main site at{" "}
            <Link
              href="/"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              {APP_NAME}
            </Link>
            .
          </p>
        </footer>
      </div>
    </section>
  );
}

/* ------------------------------ Small UI helpers ------------------------------ */

function Section({ children }: { children: React.ReactNode }) {
  return <section className="py-2">{children}</section>;
}

function Divider() {
  return <hr className="my-8 border-0 border-t border-border/70" />;
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-lg font-semibold text-foreground">{children}</h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 mt-6 text-sm font-semibold text-foreground">
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="my-2 text-sm leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
      {children}
    </ul>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return <li className="leading-relaxed">{children}</li>;
}
