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
      <InsightsPreview />
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
            <span className="inline-block h-2 w-2 rounded-full bg-primary/60" />
            Now on iOS · Built for chronic illness
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            Finally understand{" "}
            <span className="text-primary">what affects your energy</span> —
            day by day.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            ElliesNote is a 30-second daily check-in for people with CFS/ME,
            fibromyalgia, and other chronic conditions. Track energy, symptoms,
            crash days, and sleep — then watch the patterns that explain your
            good and bad days.
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
              Download for iOS
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
            <Pill>Symptom tracking</Pill>
            <Pill>Crash day logging</Pill>
            <Pill>Apple Health sync</Pill>
            <Pill>Privacy-first</Pill>
          </div>
        </div>

        {/* Hero preview card */}
        <div className="relative">
          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 22 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-card/80 to-card/40 p-6 shadow-2xl shadow-foreground/8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">Your 7-day snapshot</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Energy · Symptoms · Crash days
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-card/60 ring-1 ring-border/60">
                <OwlMark className="h-6 w-6 text-foreground" />
              </div>
            </div>

            {/* Streak + crash cards */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3">
                <div className="text-xs text-muted-foreground">Streak</div>
                <div className="mt-1 text-2xl font-bold text-primary">12</div>
                <div className="text-xs text-muted-foreground">day streak</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3">
                <div className="text-xs text-muted-foreground">Crash days</div>
                <div className="mt-1 text-2xl font-bold text-destructive">1</div>
                <div className="text-xs text-muted-foreground">this week</div>
              </div>
            </div>

            {/* Mini energy chart */}
            <div className="mt-5">
              <div className="text-xs font-semibold text-muted-foreground mb-2">
                Energy trend
              </div>
              <MiniChart />
            </div>

            {/* Symptom dots */}
            <div className="mt-4 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
              <div className="text-xs font-semibold text-foreground mb-2">
                Symptoms this week
              </div>
              <SymptomDotPreview label="Fatigue" dotDays={[0, 3, 4]} />
              <SymptomDotPreview label="Brain fog" dotDays={[3, 4]} />
              <SymptomDotPreview label="Poor sleep" dotDays={[2]} />
            </div>

            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-secondary/30 blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const CHART_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

type Bar = { colorClass: string; heightPct: string; crash?: true };

const CHART_BARS: Bar[] = [
  { colorClass: "bg-primary/50", heightPct: "54%" },
  { colorClass: "bg-primary/80", heightPct: "72%" },
  { colorClass: "bg-primary/80", heightPct: "72%" },
  { colorClass: "bg-primary/50", heightPct: "54%" },
  { colorClass: "bg-destructive/70", heightPct: "18%", crash: true },
  { colorClass: "bg-primary/50", heightPct: "54%" },
  { colorClass: "bg-primary/80", heightPct: "72%" },
];

/* Mini 7-bar energy chart with a crash day marker on day 4 (Thu) */
function MiniChart() {
  return (
    <div className="relative flex items-end gap-1 h-14">
      {CHART_BARS.map((bar, i) => (
        <div key={i} className="relative flex flex-1 flex-col items-center gap-1">
          {bar.crash && (
            <div className="absolute inset-x-0 inset-y-0 flex justify-center">
              <div className="w-px h-full bg-destructive/50 rounded-full" />
            </div>
          )}
          <div
            className={`w-full rounded-sm relative z-10 ${bar.colorClass}`}
            style={{ height: bar.heightPct, minHeight: "3px" }}
          />
          <div className="text-[9px] text-muted-foreground/70 relative z-10">
            {CHART_DAYS[i]}
          </div>
        </div>
      ))}
      <div className="absolute right-0 -top-4 text-[9px] text-destructive/80 font-medium">
        ↑ crash
      </div>
    </div>
  );
}

const DOT_INDICES = [0, 1, 2, 3, 4, 5, 6] as const;
const SYMPTOM_DOT_COLOR = "#A0785A";

/* Symptom dot row for the hero preview */
function SymptomDotPreview({
  label,
  dotDays,
}: {
  label: string;
  dotDays: number[];
}) {
  const dotSet = new Set(dotDays);
  return (
    <div className="flex items-center gap-2 py-0.5">
      <div className="w-16 text-[10px] text-muted-foreground shrink-0">
        {label}
      </div>
      <div className="flex flex-1 gap-1">
        {DOT_INDICES.map((i) => (
          <div key={i} className="flex flex-1 justify-center">
            <div
              className="h-2 w-2 rounded-full"
              style={
                dotSet.has(i)
                  ? { backgroundColor: SYMPTOM_DOT_COLOR }
                  : { backgroundColor: "var(--color-border)", opacity: 0.5 }
              }
            />
          </div>
        ))}
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
          icon="🕊️"
          title="Built for the hard days"
          body="30 seconds is all it takes. Even on your worst day, you can log something meaningful."
        />
        <ProofItem
          icon="🔗"
          title="Connects your whole picture"
          body="Apple Health data — sleep, HRV, steps, resting heart rate — overlaid on your energy story."
        />
        <ProofItem
          icon="🌿"
          title="Patterns, not pressure"
          body="Gentle insights that suggest what to repeat or rest — no alarms, no streaks to stress over."
        />
      </div>
    </section>
  );
}

function ProofItem({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/25 p-4">
      <div className="text-xl mb-2">{icon}</div>
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
      desc: "Energy level, symptoms, tags, and a quick note—captured without friction, even on your worst days.",
      icon: "⏱️",
    },
    {
      title: "Symptom tracking",
      desc: "Log fatigue, brain fog, muscle pain, headaches, dizziness, nausea, and more. See exactly which days each appeared.",
      icon: "🧠",
    },
    {
      title: "Crash day logging",
      desc: "Mark crash days with one tap. See how many you've had in any time window and how they relate to your activity.",
      icon: "⚠️",
    },
    {
      title: "Multi-series insights chart",
      desc: "Overlay your energy trend with sleep duration, HRV, steps, and resting heart rate on a single timeline.",
      icon: "📈",
    },
    {
      title: "Apple Health integration",
      desc: "Connect once and your sleep, activity, and heart data enrich your insights automatically — no extra logging.",
      icon: "❤️",
    },
    {
      title: "Gentle AI insights",
      desc: "After a few days of logging, ElliesNote surfaces patterns like 'Your better days often follow good sleep.'",
      icon: "💡",
    },
    {
      title: "Streak & progress",
      desc: "See your current logging streak and crash day count side by side — for any range from 7 to 30 days.",
      icon: "🔥",
    },
    {
      title: "Privacy-first",
      desc: "Your health data is yours. Minimal collection, clear intent, no ads, no third-party tracking.",
      icon: "🛡️",
    },
  ];

  return (
    <section id="features" className="py-14 sm:py-20">
      <SectionHeading
        eyebrow="Features"
        title="Everything you need — nothing that overwhelms."
        subtitle="ElliesNote is intentionally focused: easy to stay consistent with, powerful enough to reveal what's actually driving your good and bad days."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -80px 0px" }}
            transition={{ duration: 0.45 }}
            className="rounded-3xl border border-border/70 bg-card/60 p-6"
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary/60 ring-1 ring-border/60 mb-4">
              <span className="text-lg">{f.icon}</span>
            </div>
            <div className="text-sm font-semibold text-foreground">
              {f.title}
            </div>
            <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {f.desc}
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
      title: "Check in daily",
      body: "Rate your energy, log any symptoms, mark crash days, add optional tags and a short note. Takes 30 seconds.",
      icon: "✏️",
    },
    {
      title: "Connect Apple Health",
      body: "Link once — your sleep, step count, HRV, and resting heart rate appear automatically on your chart.",
      icon: "🔗",
    },
    {
      title: "Watch patterns emerge",
      body: "Trends across 7, 14, or 30 days surface which combinations of rest, activity, and sleep predict your better days.",
      icon: "🔍",
    },
  ];

  return (
    <section id="how-it-works" className="py-14 sm:py-20">
      <SectionHeading
        eyebrow="How it works"
        title="A tiny habit that adds up."
        subtitle="The goal isn't perfect data. It's a small, repeatable signal that becomes clarity over time — helping you communicate with your doctor and understand your own body."
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
            <div className="flex items-center justify-between mb-4">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary/60 ring-1 ring-border/60 text-lg">
                {s.icon}
              </div>
              <div className="rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs text-muted-foreground">
                Step {i + 1}
              </div>
            </div>
            <div className="text-sm font-semibold text-foreground">
              {s.title}
            </div>
            <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {s.body}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-3xl border border-border/70 bg-muted/25 p-6 sm:flex-row sm:items-center">
        <div>
          <div className="text-sm font-semibold text-foreground">
            Available on iOS · Free to start
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Premium unlocks 30-day trends and advanced insights. Android support is planned.
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

/* ------------------------------ Insights Preview ------------------------------ */
function InsightsPreview() {
  const seriesItems = [
    { color: "#40533F", label: "Energy" },
    { color: "#4A90C4", label: "Sleep" },
    { color: "#7B68C8", label: "HRV" },
    { color: "#E07B54", label: "Steps" },
    { color: "#B05A4A", label: "Crash day" },
  ];

  const previewCards = [
    {
      title: "Energy + health trends",
      label: "All your signals in one place",
      desc: "Overlay energy with Apple Health — sleep, steps, HRV, resting HR — to see which variables move together.",
      series: seriesItems,
    },
    {
      title: "Symptom grid",
      label: "Which days, which symptoms",
      desc: "See exactly when fatigue, brain fog, or muscle pain appeared — mapped to specific days in your range.",
      symptomRows: [
        { name: "Fatigue", days: [0, 3, 4] },
        { name: "Brain fog", days: [3, 4] },
        { name: "Muscle pain", days: [4] },
        { name: "Poor sleep", days: [1, 2] },
      ],
    },
    {
      title: "Streak + crash count",
      label: "Progress at a glance",
      desc: "Your logging streak and crash day count side by side — filtered to your selected time window.",
      stats: true,
    },
  ];

  return (
    <section className="py-14 sm:py-20">
      <SectionHeading
        eyebrow="Insights"
        title="Clarity, not complexity."
        subtitle="ElliesNote turns your daily check-ins into a picture you can actually read — and share with your care team."
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {previewCards.map((c, idx) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -120px 0px" }}
            transition={{ duration: 0.45, delay: idx * 0.07 }}
            className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/60 p-6"
          >
            <div className="text-sm font-semibold text-foreground">
              {c.title}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{c.label}</div>
            <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {c.desc}
            </div>

            {/* Series legend mock */}
            {c.series && (
              <div className="mt-5 space-y-2">
                <div className="h-16 rounded-xl bg-gradient-to-r from-muted/30 via-secondary/20 to-muted/30 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    Multi-series chart
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {c.series.map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <div
                        className="h-0.5 w-4 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      {s.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Symptom grid mock */}
            {c.symptomRows && (
              <div className="mt-5 space-y-2">
                {c.symptomRows.map((row) => {
                  const dotSet = new Set(row.days);
                  return (
                    <div key={row.name} className="flex items-center gap-2">
                      <div className="w-20 text-[10px] text-muted-foreground shrink-0">
                        {row.name}
                      </div>
                      <div className="flex flex-1 gap-1">
                        {DOT_INDICES.map((i) => (
                          <div key={i} className="flex flex-1 justify-center">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={
                                dotSet.has(i)
                                  ? { backgroundColor: SYMPTOM_DOT_COLOR }
                                  : { backgroundColor: "var(--color-border)", opacity: 0.5 }
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between text-[9px] text-muted-foreground/60 mt-1 px-[88px]">
                  {CHART_DAYS.map((d) => (
                    <div key={d} className="flex-1 text-center">
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats mock */}
            {c.stats && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border/70 bg-muted/20 px-3 py-3">
                  <div className="text-xs text-muted-foreground">Streak</div>
                  <div className="mt-1 text-2xl font-bold text-primary">12</div>
                  <div className="text-xs text-muted-foreground">day streak</div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 px-3 py-3">
                  <div className="text-xs text-muted-foreground">Crash days</div>
                  <div className="mt-1 text-2xl font-bold text-destructive">
                    2
                  </div>
                  <div className="text-xs text-muted-foreground">
                    this month
                  </div>
                </div>
              </div>
            )}

            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-secondary/30 blur-3xl" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ FAQ ------------------------------ */
function FAQ() {
  const items = [
    {
      q: "Is ElliesNote designed for CFS/ME?",
      a: "Yes. ElliesNote was built specifically for people managing Chronic Fatigue Syndrome, ME, fibromyalgia, and similar conditions — where energy management and crash pattern recognition are critical. That said, it works for any chronic condition.",
    },
    {
      q: "What is a crash day?",
      a: "A crash day (post-exertional malaise, or PEM) is when you feel significantly worse — often after activity. You can mark crash days with a single tap, and they appear as markers on your insights chart alongside your energy and health trends.",
    },
    {
      q: "Does it connect to Apple Health or Garmin?",
      a: "Yes. ElliesNote integrates with Apple Health to pull in sleep duration, resting heart rate, HRV, and step count. If your Garmin or other wearable syncs to Apple Health, that data flows in automatically.",
    },
    {
      q: "How often should I check in?",
      a: "Once or twice a day is usually enough to spot meaningful patterns without adding to your load. You can set custom reminder times that fit your routine.",
    },
    {
      q: "Is Android supported?",
      a: "ElliesNote is iOS-first. Android support is on the roadmap for a future release.",
    },
    {
      q: "What does Premium include?",
      a: "The free version gives you 7-day trends and core tracking. Premium unlocks 14 and 30-day insight windows, giving you a longer view of your patterns — useful for spotting monthly cycles.",
    },
  ];

  return (
    <section id="faq" className="py-14 sm:py-20">
      <SectionHeading
        eyebrow="FAQ"
        title="Common questions."
        subtitle="If something isn't covered here, reach out via the support page — we read every message."
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
            <div className="text-sm font-semibold text-foreground">{item.q}</div>
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
            Start today
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            One check-in can start a pattern.
          </div>
          <div className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            ElliesNote doesn't demand perfection. A single daily log — just your
            energy level and a tag — begins building the picture that helps you
            understand your own body. Your doctor will thank you too.
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={IOS_APP_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm shadow-foreground/10 transition hover:bg-primary/90"
            >
              <AppleGlyph className="h-4 w-4" />
              Download for iOS
            </Link>
            <div className="text-xs text-muted-foreground">
              Free to start · No pressure · Just progress
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-secondary/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
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
