import { AppConstants } from "@/lib/constants";

export const metadata = {
  title: "Privacy Policy • Checkly",
  description:
    "Checkly Privacy Policy describing how we collect, use, and protect information.",
};

export default function PrivacyPolicyPage() {
  const {
    APP_NAME,
    EFFECTIVE_DATE,
    SUPPORT_EMAIL: CONTACT_EMAIL,
    DEVELOPER_NAME,
  } = AppConstants;
  return (
    <main style={styles.page}>
      <article style={styles.card}>
        <header style={styles.header}>
          <h1 style={styles.h1}>Privacy Policy</h1>
          <p style={styles.meta}>
            <strong>{APP_NAME}</strong> • Effective date: {EFFECTIVE_DATE}
          </p>
          <p style={styles.p}>
            This Privacy Policy explains how {APP_NAME} (“we”, “us”, “our”)
            collects, uses, and shares information when you use our mobile
            application and related services (collectively, the “Service”).
          </p>
        </header>

        <section style={styles.section}>
          <h2 style={styles.h2}>1. Scope</h2>
          <p style={styles.p}>
            This Privacy Policy applies to the Service, including the {APP_NAME}{" "}
            mobile app, our websites that link to this policy, and the backend
            services that support the app (such as authentication and data
            storage). If you do not agree with this Privacy Policy, do not use
            the Service.
          </p>
        </section>

        <hr style={styles.hr} />

        <section style={styles.section}>
          <h2 style={styles.h2}>2. Summary (Plain Language)</h2>
          <ul style={styles.ul}>
            <li style={styles.li}>
              We collect information you provide to create an account and use
              the app (including check-ins you choose to log).
            </li>
            <li style={styles.li}>
              We use your check-in entries to show you trends and analytics.
            </li>
            <li style={styles.li}>We do not sell personal information.</li>
            <li style={styles.li}>
              We do not use your data for targeted advertising.
            </li>
            <li style={styles.li}>
              You can request deletion of your account and associated data.
            </li>
          </ul>
        </section>

        <hr style={styles.hr} />

        <section style={styles.section}>
          <h2 style={styles.h2}>3. Information We Collect</h2>

          <h3 style={styles.h3}>3.1 Account and Authentication Data</h3>
          <p style={styles.p}>
            We use <strong>Clerk</strong> to provide authentication and account
            management. When you sign up or sign in, Clerk processes information
            required to authenticate you (such as your email address and/or
            social sign-in details, depending on the method you choose). We
            receive a unique identifier for your account (for example, a Clerk
            user ID) and may receive basic profile information you choose to
            share through the sign-in method (for example, name).
          </p>
          <p style={styles.p}>
            We do not receive your password when you use social sign-in. If you
            sign in with email and password via Clerk, Clerk handles password
            processing securely; we do not store your password.
          </p>

          <h3 style={styles.h3}>3.2 Check-In Data You Enter</h3>
          <p style={styles.p}>
            The Service allows you to log check-ins. Depending on what you
            choose to enter, we collect and store:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}>
              <strong>Energy level</strong> (e.g., 1–10)
            </li>
            <li style={styles.li}>
              <strong>Pain level</strong> (if you use this feature)
            </li>
            <li style={styles.li}>
              <strong>Tags</strong> you select (optional)
            </li>
            <li style={styles.li}>
              <strong>Notes</strong> you type (optional)
            </li>
            <li style={styles.li}>
              <strong>Timestamps</strong> of entries to power
              daily/weekly/monthly analytics
            </li>
          </ul>
          <p style={styles.p}>
            Your notes may contain sensitive personal information if you choose
            to include it. Please avoid entering information you do not want
            stored in the Service.
          </p>

          <h3 style={styles.h3}>3.3 Notification Preferences</h3>
          <p style={styles.p}>
            If you enable reminders, we store your notification preferences,
            which may include whether reminders are enabled, custom reminder
            times, and related settings (e.g., sound/vibration toggles). These
            preferences are used to schedule reminders.
          </p>

          <h3 style={styles.h3}>3.4 Device and Technical Data</h3>
          <p style={styles.p}>
            We may collect limited technical data to operate, maintain, and
            secure the Service, such as app version, device/OS information, and
            diagnostic logs (including crash or error logs). We do not
            intentionally collect precise location data unless we introduce a
            feature that requires it and request permission where required.
          </p>

          <h3 style={styles.h3}>3.5 Payment Data (If Applicable)</h3>
          <p style={styles.p}>
            If paid features are introduced, purchases may be processed by Apple
            (in-app purchases) or another payment processor. We do not receive
            or store full payment card numbers.
          </p>
        </section>

        <hr style={styles.hr} />

        <section style={styles.section}>
          <h2 style={styles.h2}>4. How We Use Information</h2>
          <p style={styles.p}>We use information to:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>
              Provide and operate the Service (account access, check-ins,
              analytics, reminders).
            </li>
            <li style={styles.li}>
              Generate insights and trends (daily, weekly, monthly, yearly) from
              your entries.
            </li>
            <li style={styles.li}>
              Maintain safety and integrity of the Service (fraud prevention,
              abuse detection, security monitoring).
            </li>
            <li style={styles.li}>
              Improve reliability and performance (debugging, diagnostics).
            </li>
            <li style={styles.li}>
              Communicate with you about important service-related updates (for
              example, security notices or policy changes).
            </li>
          </ul>
          <p style={styles.p}>
            We do not use your information for targeted advertising. We do not
            sell personal information.
          </p>
        </section>

        <hr style={styles.hr} />

        <section style={styles.section}>
          <h2 style={styles.h2}>5. How We Share Information</h2>

          <h3 style={styles.h3}>5.1 Service Providers</h3>
          <p style={styles.p}>
            We use third-party vendors to help operate the Service. These
            vendors may process information on our behalf, subject to
            contractual obligations consistent with this policy. Examples
            include:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}>
              <strong>Clerk</strong> for authentication and account management
            </li>
            <li style={styles.li}>
              <strong>Neon (Postgres)</strong> for database hosting
            </li>
            <li style={styles.li}>
              <strong>Hosting/Infrastructure</strong> providers for running our
              backend and serving pages
            </li>
          </ul>

          <h3 style={styles.h3}>5.2 Legal, Safety, and Compliance</h3>
          <p style={styles.p}>
            We may disclose information if required by law or if we reasonably
            believe disclosure is necessary to comply with legal obligations,
            protect our rights, investigate fraud/security issues, or protect
            the safety of users and the public.
          </p>

          <h3 style={styles.h3}>5.3 Business Transfers</h3>
          <p style={styles.p}>
            If we are involved in a merger, acquisition, financing, or sale of
            assets, information may be transferred as part of that transaction.
            We will provide notice if your information becomes subject to a
            materially different privacy policy.
          </p>

          <h3 style={styles.h3}>5.4 No Sale of Personal Information</h3>
          <p style={styles.p}>We do not sell personal information.</p>
        </section>

        <hr style={styles.hr} />

        <section style={styles.section}>
          <h2 style={styles.h2}>6. Tracking and Advertising</h2>
          <p style={styles.p}>
            We do not use your data to track you across third-party apps and
            websites for advertising purposes. We do not serve behavioral or
            targeted ads in the Service. If our practices change, we will update
            this policy and, where required, request any necessary permissions.
          </p>
        </section>

        <hr style={styles.hr} />

        <section style={styles.section}>
          <h2 style={styles.h2}>7. Your Choices and Controls</h2>

          <h3 style={styles.h3}>7.1 Account Access and Updates</h3>
          <p style={styles.p}>
            You can access and update certain account information through the
            Service and/or your authentication provider.
          </p>

          <h3 style={styles.h3}>7.2 Notifications</h3>
          <p style={styles.p}>
            You can enable or disable reminders within the app and through your
            device settings. If notifications are disabled, the app may not be
            able to send reminder prompts.
          </p>

          <h3 style={styles.h3}>7.3 Data Deletion</h3>
          <p style={styles.p}>
            You may request deletion of your account and associated data by
            contacting us. We will take reasonable steps to delete your
            information from our active systems, subject to legal requirements
            and legitimate business needs (e.g., security, fraud prevention, and
            compliance).
          </p>
        </section>

        <hr style={styles.hr} />

        <section style={styles.section}>
          <h2 style={styles.h2}>8. Data Retention</h2>
          <p style={styles.p}>
            We retain information for as long as necessary to provide the
            Service, comply with legal obligations, resolve disputes, and
            enforce agreements. You may request deletion as described above.
          </p>
        </section>

        <hr style={styles.hr} />

        <section style={styles.section}>
          <h2 style={styles.h2}>9. Security</h2>
          <p style={styles.p}>
            We implement reasonable administrative, technical, and
            organizational safeguards designed to protect information. However,
            no method of transmission or storage is 100% secure, and we cannot
            guarantee absolute security.
          </p>
        </section>

        <hr style={styles.hr} />

        <section style={styles.section}>
          <h2 style={styles.h2}>10. Children’s Privacy</h2>
          <p style={styles.p}>
            The Service is not directed to children under 13 (or the minimum age
            required in your jurisdiction), and we do not knowingly collect
            personal information from children. If you believe a child has
            provided personal information, please contact us so we can take
            appropriate action.
          </p>
        </section>

        <hr style={styles.hr} />

        <section style={styles.section}>
          <h2 style={styles.h2}>11. International Transfers</h2>
          <p style={styles.p}>
            Your information may be processed in countries other than your own,
            depending on where our service providers operate. We take steps
            designed to ensure appropriate safeguards are in place consistent
            with applicable law.
          </p>
        </section>

        <hr style={styles.hr} />

        <section style={styles.section}>
          <h2 style={styles.h2}>12. Changes to This Policy</h2>
          <p style={styles.p}>
            We may update this Privacy Policy from time to time. If we make
            material changes, we will update the effective date above and may
            provide additional notice through the Service.
          </p>
        </section>

        <hr style={styles.hr} />

        <section style={styles.section}>
          <h2 style={styles.h2}>13. Contact Us</h2>
          <p style={styles.p}>
            If you have questions or requests regarding this Privacy Policy,
            contact:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}>
              Email: <strong>{CONTACT_EMAIL}</strong>
            </li>
            <li style={styles.li}>
              Developer: <strong>{DEVELOPER_NAME}</strong>
            </li>
          </ul>
        </section>
      </article>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "48px 16px",
    background: "#0E1A14",
    display: "flex",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: 920,
    background: "#F3F6F3",
    borderRadius: 18,
    padding: "28px 22px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
    border: "1px solid rgba(0,0,0,0.06)",
  },
  header: { marginBottom: 14 },
  h1: { margin: 0, fontSize: 34, lineHeight: 1.2, color: "#0E1A14" },
  meta: { marginTop: 10, marginBottom: 12, color: "#4B6357" },
  section: { marginTop: 18, marginBottom: 18 },
  h2: { margin: "0 0 10px 0", fontSize: 18, color: "#0E1A14" },
  h3: { margin: "14px 0 8px 0", fontSize: 14, color: "#1B2A22" },
  p: { margin: "8px 0", color: "#1B2A22", lineHeight: 1.6, fontSize: 14 },
  ul: { margin: "8px 0 0 18px", color: "#1B2A22" },
  li: { margin: "6px 0", lineHeight: 1.5, fontSize: 14 },
  hr: { border: "none", borderTop: "1px solid #D7E0DA", margin: "18px 0" },
  footer: { marginTop: 22, paddingTop: 12, borderTop: "1px solid #D7E0DA" },
  footerText: { margin: 0, fontSize: 12, color: "#4B6357", lineHeight: 1.5 },
};
