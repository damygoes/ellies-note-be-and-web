"use client";

import { AppleGlyph, ArrowRight, OwlMark } from "@/components/icons";
import { IOS_APP_STORE_URL } from "@/lib/constants";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <Screenshots />
      <FAQ />
      <FinalCTA />
    </>
  );
}

/* ------------------------------ Hero ------------------------------ */
function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative py-14 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-accent" />
            Now on iOS • Android coming later
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            Meet <span className="text-foreground">ElliesNote</span> — the small
            daily note that turns into big clarity.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Quick check-ins for energy, pain, and context—so you can spot
            patterns over time and make calmer, smarter adjustments. Built with
            love for Ellen. Guided by an owl with a pen.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href={IOS_APP_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm shadow-foreground/10 transition hover:bg-primary/90"
            >
              <AppleGlyph className="h-4 w-4" />
              Download now (iOS)
            </Link>

            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border/70 bg-card/50 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/40"
            >
              See how it works
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <Pill>30-second check-ins</Pill>
            <Pill>Weekly trends</Pill>
            <Pill>Gentle reminders</Pill>
            <Pill>Privacy-first</Pill>
          </div>
        </div>

        <div className="relative">
          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 22 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-card/80 to-card/40 p-6 shadow-2xl shadow-foreground/10"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">Today’s check-in</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Energy + pain + a tiny note. That’s it.
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-card/60 ring-1 ring-border/60">
                <OwlMark className="h-6 w-6 text-foreground" />
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <MiniCard label="Energy" value="🙂 7/10" />
              <MiniCard label="Pain" value="🫧 3/10" />
              <MiniCard
                label="Note"
                value="“Good sleep + short walk. Less tension.”"
              />
            </div>

            <div className="mt-6 rounded-2xl border border-border/70 bg-muted/30 p-4">
              <div className="text-xs font-semibold text-foreground">
                Insight of the week
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Your better days often follow{" "}
                <span className="font-semibold text-foreground">
                  sleep + a walk
                </span>
                . Consider repeating that pairing.
              </div>
            </div>

            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-secondary/15 blur-3xl" />
          </motion.div>

          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-6 grid grid-cols-3 gap-3"
          >
            <StatCard title="Streak" value="5 days" />
            <StatCard title="Avg energy" value="6.8" />
            <StatCard title="Avg pain" value="3.1" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-card/60 px-4 py-3">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-1 text-base font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border/70 bg-card/60 px-3 py-1">
      {children}
    </span>
  );
}

/* ------------------------------ Social Proof ------------------------------ */
function SocialProof() {
  return (
    <section className="py-8 sm:py-10">
      <div className="grid gap-4 rounded-3xl border border-border/70 bg-card/60 p-6 sm:grid-cols-3">
        <ProofItem
          title="Designed for consistency"
          body="Short, friendly flows that don’t require motivation."
        />
        <ProofItem
          title="Built for clarity"
          body="Trends and gentle insights, not overwhelming dashboards."
        />
        <ProofItem
          title="Made with care"
          body="Inspired by Ellen. Focused on real life, not vanity metrics."
        />
      </div>
    </section>
  );
}

function ProofItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/25 p-4">
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{body}</div>
    </div>
  );
}

/* ------------------------------ Features ------------------------------ */
function Features() {
  const features = [
    {
      title: "30-second check-ins",
      desc: "Energy, pain, tags, and a quick note—captured without friction.",
      icon: "⏱️",
    },
    {
      title: "Weekly patterns",
      desc: "See how your week moves. Small shifts become obvious over time.",
      icon: "📈",
    },
    {
      title: "Gentle reminders",
      desc: "Set your custom times. Nudge, don’t nag.",
      icon: "🔔",
    },
    {
      title: "Tags that matter",
      desc: "Walk, sleep, stress, meds—whatever helps explain your day.",
      icon: "🏷️",
    },
    {
      title: "Calm insights",
      desc: "Helpful observations that suggest a next step, not a lecture.",
      icon: "🧠",
    },
    {
      title: "Privacy-first",
      desc: "Your notes are yours. We keep it simple and respectful.",
      icon: "🛡️",
    },
  ];

  return (
    <section id="features" className="py-14 sm:py-20">
      <SectionHeading
        eyebrow="Features"
        title="Everything you need—nothing you don’t."
        subtitle="ElliesNote is intentionally lightweight: easy to keep up with, powerful enough to reveal patterns."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -80px 0px" }}
            transition={{ duration: 0.45 }}
            className="rounded-3xl border border-border/70 bg-card/60 p-6"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-card/70 ring-1 ring-border/60">
                <span className="text-lg">{f.icon}</span>
              </div>
              <div>
                <div className="text-base font-semibold text-foreground">
                  {f.title}
                </div>
                <div className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ How it works ------------------------------ */
function HowItWorks() {
  const steps = [
    {
      title: "Check in",
      body: "Pick your energy and pain, add optional tags, jot a quick note.",
    },
    {
      title: "Stay consistent",
      body: "Set reminders at times you actually live by. Two a day is enough.",
    },
    {
      title: "Spot patterns",
      body: "Weekly trends and gentle insights help you repeat what works.",
    },
  ];

  return (
    <section id="how-it-works" className="py-14 sm:py-20">
      <SectionHeading
        eyebrow="How it works"
        title="A tiny habit that adds up."
        subtitle="The goal isn’t perfection. It’s a small, repeatable signal that becomes clarity over time."
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -120px 0px" }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
            className="rounded-3xl border border-border/70 bg-gradient-to-b from-card/80 to-card/40 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-foreground">
                {s.title}
              </div>
              <div className="rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs text-muted-foreground">
                Step {i + 1}
              </div>
            </div>
            <div className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {s.body}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-3xl border border-border/70 bg-muted/25 p-6 sm:flex-row sm:items-center">
        <div>
          <div className="text-sm font-semibold text-foreground">
            Available on iOS
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Android support is planned for a future release.
          </div>
        </div>
        <Link
          href={IOS_APP_STORE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm shadow-foreground/10 transition hover:bg-primary/90"
        >
          <AppleGlyph className="h-4 w-4" />
          Download now
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------ Screenshots ------------------------------ */
function Screenshots() {
  const cards = [
    { title: "Check-in in seconds", label: "Energy • Pain • Tags • Note" },
    { title: "Weekly snapshot", label: "Trends at a glance" },
    { title: "Gentle reminders", label: "Custom times" },
  ];

  return (
    <section className="py-14 sm:py-20">
      <SectionHeading
        eyebrow="Preview"
        title="Calm, friendly screens."
        subtitle="Designed to feel like a small notebook you’ll actually use."
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -120px 0px" }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/60 p-6"
          >
            <div className="text-sm font-semibold text-foreground">
              {c.title}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{c.label}</div>

            <div className="mt-6 aspect-[9/16] w-full rounded-2xl border border-border/70 bg-gradient-to-b from-muted/30 to-card/40 p-4">
              <div className="flex h-full w-full flex-col justify-between rounded-xl border border-border/70 bg-card/60 p-4">
                <div className="text-xs text-muted-foreground">
                  Screenshot placeholder
                </div>
                <div className="text-xs text-muted-foreground">
                  Replace with real app screenshots later.
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ Privacy ------------------------------ */
// function Privacy() {
//   return (
//     <section id="privacy" className="py-14 sm:py-20">
//       <SectionHeading
//         eyebrow="Privacy"
//         title="Your data is safe."
//         subtitle="ElliesNote is built to be respectful: minimal collection, clear intent, no creepiness."
//       />

//       <div className="mt-10 grid gap-4 lg:grid-cols-3">
//         <InfoCard
//           title="Minimal by design"
//           body="We keep the experience focused on your check-ins and trends—without turning your life into ad-targeting."
//         />
//         <InfoCard
//           title="Clear controls"
//           body="Notifications can be enabled or paused anytime in settings. You stay in charge."
//         />
//         <InfoCard
//           title="Simple, transparent"
//           body="If something changes, you can explain it clearly in your privacy policy and keep trust intact."
//         />
//       </div>
//     </section>
//   );
// }

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-card/60 p-6">
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {body}
      </div>
    </div>
  );
}

/* ------------------------------ FAQ ------------------------------ */
function FAQ() {
  const items = [
    {
      q: "Is ElliesNote only for pain tracking?",
      a: "No. It works for anything you want to monitor with context—energy, stress, sleep quality, routines, symptoms, and more.",
    },
    {
      q: "How often should I check in?",
      a: "Two times a day is typically enough to spot patterns without fatigue. But you can do more or less—whatever is sustainable.",
    },
    {
      q: "Is Android supported?",
      a: "Not yet. ElliesNote is iOS-first for now; Android support is planned for a future release.",
    },
    {
      q: "Do I need to write long notes?",
      a: "No. One line is plenty. Tags + a short note tends to be the perfect signal.",
    },
  ];

  return (
    <section id="faq" className="py-14 sm:py-20">
      <SectionHeading
        eyebrow="FAQ"
        title="Questions, answered."
        subtitle="If you want to add a contact section later, drop it right below the FAQ."
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <motion.div
            key={item.q}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -120px 0px" }}
            transition={{ duration: 0.45 }}
            className="rounded-3xl border border-border/70 bg-card/60 p-6"
          >
            <div className="text-sm font-semibold text-foreground">
              {item.q}
            </div>
            <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {item.a}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ Final CTA ------------------------------ */
function FinalCTA() {
  return (
    <section className="py-14 sm:py-20">
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-card/80 to-card/40 p-8 sm:p-10">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ready when you are
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Start with one check-in today.
          </div>
          <div className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            ElliesNote is intentionally simple: a small daily habit that helps
            you notice what helps, what hurts, and what changes.
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={IOS_APP_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm shadow-foreground/10 transition hover:bg-primary/90"
            >
              <AppleGlyph className="h-4 w-4" />
              Download now (iOS)
            </Link>
            <div className="text-xs text-muted-foreground">
              Android coming later • No pressure • Just progress
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
      </div>
    </section>
  );
}

/* ------------------------------ Shared UI ------------------------------ */
function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="max-w-2xl">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {eyebrow}
      </div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {subtitle}
      </p>
    </div>
  );
}
