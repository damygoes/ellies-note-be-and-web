import { AppConstants } from "@/lib/constants";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Terms & Conditions • ${AppConstants.APP_NAME}`,
  description: `${AppConstants.APP_NAME} Terms & Conditions describing rules, responsibilities, and limitations of liability.`,
};

export default function TermsAndConditionsPage() {
  const {
    APP_NAME,
    EFFECTIVE_DATE,
    SUPPORT_EMAIL: CONTACT_EMAIL,
    DEVELOPER_NAME,
  } = AppConstants;

  return (
    <section className="relative py-14 sm:py-20">
      <header className="rounded-t-3xl border-b border-border/70 bg-gradient-to-b from-card/80 to-card/50 px-6 py-8 sm:px-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/25 px-3 py-1 text-xs text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-accent" />
          Legal
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Terms &amp; Conditions
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          <strong className="font-semibold text-foreground">{APP_NAME}</strong>{" "}
          • Effective date: {EFFECTIVE_DATE}
        </p>

        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          These Terms &amp; Conditions (“Terms”) govern your access to and use
          of {APP_NAME} (the “Service”). By accessing or using the Service, you
          agree to be bound by these Terms. If you do not agree, do not use the
          Service.
        </p>
      </header>

      <div className="px-6 py-8 sm:px-10">
        <Section>
          <H2>1. Who We Are</H2>
          <P>
            The Service is operated by{" "}
            <strong className="font-semibold text-foreground">
              {DEVELOPER_NAME}
            </strong>{" "}
            (“we”, “us”, “our”).
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>2. Eligibility</H2>
          <P>
            You must be at least 13 years old (or the minimum age required in
            your jurisdiction) to use the Service. By using the Service, you
            represent that you meet this requirement.
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>3. Account Registration and Security</H2>
          <Ul>
            <Li>
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities that occur under your
              account.
            </Li>
            <Li>
              You agree to provide accurate and complete information when you
              create an account and to keep it updated.
            </Li>
            <Li>
              If you believe your account has been compromised, contact us
              immediately at{" "}
              <Link
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                {CONTACT_EMAIL}
              </Link>
              .
            </Li>
          </Ul>
        </Section>

        <Divider />

        <Section>
          <H2>4. Using the Service</H2>

          <H3>4.1 Intended Use</H3>
          <P>
            {APP_NAME} helps you track personal check-ins (for example energy,
            pain, tags, and notes) and view trends. The Service is provided for
            informational and self-reflection purposes only.
          </P>

          <H3>4.2 No Medical Advice</H3>
          <P>
            The Service does not provide medical advice, diagnosis, or
            treatment. Always seek the advice of a qualified health provider
            with any questions you may have regarding a medical condition. Never
            disregard professional medical advice or delay seeking it because of
            something you read in the Service.
          </P>

          <H3>4.3 Prohibited Conduct</H3>
          <P>You agree not to:</P>
          <Ul>
            <Li>
              Use the Service for illegal, harmful, or abusive activities.
            </Li>
            <Li>
              Attempt to access or probe non-public areas of the Service,
              systems, or networks.
            </Li>
            <Li>
              Interfere with or disrupt the integrity or performance of the
              Service.
            </Li>
            <Li>
              Reverse engineer, decompile, or attempt to extract source code
              (except to the extent permitted by applicable law).
            </Li>
            <Li>
              Upload or transmit malware, harmful code, or content intended to
              compromise security.
            </Li>
          </Ul>
        </Section>

        <Divider />

        <Section>
          <H2>5. Your Content</H2>

          <H3>5.1 Ownership</H3>
          <P>
            You retain ownership of the content you enter into the Service
            (including check-ins, notes, tags, and related data) (“User
            Content”).
          </P>

          <H3>5.2 License to Operate the Service</H3>
          <P>
            You grant us a limited, non-exclusive, worldwide license to host,
            store, process, and display your User Content solely to provide,
            maintain, and improve the Service, including generating analytics
            and trends for you.
          </P>

          <H3>5.3 Responsibility</H3>
          <P>
            You are responsible for your User Content and any consequences of
            submitting it. Please avoid entering sensitive information you do
            not want stored in the Service.
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>6. Privacy</H2>
          <P>
            Our{" "}
            <Link
              href="/privacy"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>{" "}
            explains how we collect, use, and share information. By using the
            Service, you agree to our privacy practices as described there.
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>7. Notifications and Communications</H2>
          <P>
            If you enable notifications, the Service may send you reminders and
            service-related messages. You can control notifications in the app
            and in your device settings. Service messages relating to security
            or legal updates may still be provided where appropriate.
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>8. Subscriptions and Purchases (If Applicable)</H2>
          <P>
            If we introduce paid features, subscriptions and purchases may be
            processed through Apple In-App Purchases or another payment
            processor. Prices, billing cycles, and renewal terms will be
            presented at checkout and/or in the relevant purchase flow.
          </P>
          <Ul>
            <Li>
              Subscriptions may automatically renew unless canceled through your
              Apple account settings (or the relevant platform settings).
            </Li>
            <Li>
              Refunds are handled by the platform or processor according to
              their policies.
            </Li>
          </Ul>
        </Section>

        <Divider />

        <Section>
          <H2>9. Availability, Changes, and Termination</H2>

          <H3>9.1 Service Changes</H3>
          <P>
            We may modify, suspend, or discontinue the Service (in whole or in
            part) at any time. We will try to provide reasonable notice where
            practical, but we are not required to do so.
          </P>

          <H3>9.2 Termination by You</H3>
          <P>
            You may stop using the Service at any time. You may request account
            deletion by contacting{" "}
            <Link
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              {CONTACT_EMAIL}
            </Link>
            .
          </P>

          <H3>9.3 Termination by Us</H3>
          <P>
            We may suspend or terminate access to the Service if we reasonably
            believe you have violated these Terms, used the Service unlawfully,
            or created risk or harm to others or the Service.
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>10. Disclaimer of Warranties</H2>
          <P>
            THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM
            EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR
            IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
            FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT
            THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>11. Limitation of Liability</H2>
          <P>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL WE BE
            LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
            PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING
            FROM OR RELATED TO YOUR USE OF (OR INABILITY TO USE) THE SERVICE.
          </P>
          <P>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR ALL
            CLAIMS ARISING OUT OF OR RELATING TO THE SERVICE SHALL NOT EXCEED
            THE AMOUNT YOU PAID US (IF ANY) FOR THE SERVICE IN THE 12 MONTHS
            BEFORE THE EVENT GIVING RISE TO THE CLAIM.
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>12. Indemnification</H2>
          <P>
            You agree to indemnify and hold harmless {DEVELOPER_NAME} from and
            against any claims, liabilities, damages, losses, and expenses
            (including reasonable attorneys’ fees) arising out of or related to
            your use of the Service, your User Content, or your violation of
            these Terms.
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>13. Governing Law</H2>
          <P>
            These Terms are governed by the laws of the jurisdiction in which
            the Service operator is based, without regard to conflict of law
            principles. If you want to specify a particular country/state, add
            it here.
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>14. Changes to These Terms</H2>
          <P>
            We may update these Terms from time to time. If we make material
            changes, we will update the effective date above and may provide
            additional notice through the Service.
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>15. Contact Us</H2>
          <P>If you have questions about these Terms, contact:</P>
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
