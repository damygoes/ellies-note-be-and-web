import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { checkInEntries } from "@/db/schema/checkInEntry";
import { healthMetrics } from "@/db/schema/healthMetrics";
import { requireClerkUserId } from "@/lib/serverAuth";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { jsonError } from "@/utils/jsonError";
import { parseIntParam } from "@/utils/parseIntParam";

type InsightType =
  | "summary"
  | "energy_trend"
  | "symptom"
  | "day_of_week"
  | "sleep"
  | "activity"
  | "hrv";

type InsightItem = {
  type: InsightType;
  title: string;
  body: string;
  sampleCount: number;
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MIN_SAMPLES = 5;
const SLEEP_LOW_MINUTES = 360;
const STEPS_HIGH = 8000;
const ENERGY_DIFF = 0.5;
const BOOM_BUST_RATE = 0.5;
const TREND_MIN_DIFF = 0.3;

function nextDayKey(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function mean(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function fmt(n: number): string {
  return n.toFixed(1);
}

export async function GET(req: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    const url = new URL(req.url);
    const rangeDays = Math.min(
      90,
      Math.max(7, parseIntParam(url.searchParams.get("rangeDays"), 14)),
    );

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - rangeDays);
    const sinceStr = since.toISOString().slice(0, 10);

    // Fetch double range so we can compare current vs prior period
    const since2x = new Date();
    since2x.setUTCDate(since2x.getUTCDate() - rangeDays * 2);

    const allCheckIns = await db
      .select({
        energyLevel: checkInEntries.energyLevel,
        symptoms: checkInEntries.symptoms,
        dayKey: sql<string>`coalesce(
          ${checkInEntries.checkInDate}::text,
          ${checkInEntries.createdAt}::date::text
        )`.as("day_key"),
      })
      .from(checkInEntries)
      .where(
        and(
          eq(checkInEntries.userId, user.id),
          gte(checkInEntries.createdAt, since2x),
        ),
      );

    const rows = allCheckIns.filter((r) => r.dayKey != null && r.dayKey >= sinceStr);
    const priorRows = allCheckIns.filter((r) => r.dayKey != null && r.dayKey < sinceStr);

    if (rows.length < 3) {
      return NextResponse.json({
        success: true,
        data: { insights: [], message: null },
      });
    }

    const overallAvg = mean(rows.map((r) => Number(r.energyLevel)));
    const insights: InsightItem[] = [];

    // --- Energy summary (always shown, replaced by trend when prior data exists) ---
    {
      const periodLabel = rangeDays === 7 ? "this week" : rangeDays === 14 ? "over the past 2 weeks" : "over the past month";
      const uniqueDays = new Set(rows.map((r) => r.dayKey)).size;
      const highDays = rows.filter((r) => Number(r.energyLevel) >= 4).length;
      const lowDays = rows.filter((r) => Number(r.energyLevel) <= 2).length;

      let extra = "";
      if (highDays > 0 && lowDays === 0) extra = ` ${highDays === rows.length ? "All logged days were high-energy days." : `${highDays} out of ${uniqueDays} logged days were high-energy.`}`;
      else if (lowDays > highDays) extra = ` ${lowDays} out of ${uniqueDays} logged days had low energy — rest and pacing matter.`;

      insights.push({
        type: "summary",
        title: "This period",
        body: `You averaged ${fmt(overallAvg)} out of 5 ${periodLabel} across ${uniqueDays} logged day${uniqueDays !== 1 ? "s" : ""}.${extra}`,
        sampleCount: rows.length,
      });
    }

    // --- Energy trend (current vs prior period) ---
    if (rows.length >= 3 && priorRows.length >= 3) {
      const currentAvg = mean(rows.map((r) => Number(r.energyLevel)));
      const priorAvg = mean(priorRows.map((r) => Number(r.energyLevel)));
      const diff = currentAvg - priorAvg;

      let body: string;
      if (diff >= TREND_MIN_DIFF) {
        body = `Your energy has been stronger lately — averaging ${fmt(currentAvg)} recently vs ${fmt(priorAvg)} the prior period.`;
      } else if (diff <= -TREND_MIN_DIFF) {
        body = `Your energy has been a little lower lately — ${fmt(currentAvg)} recently vs ${fmt(priorAvg)} before.`;
      } else {
        body = `Your energy has been fairly consistent, averaging around ${fmt(currentAvg)} over this period.`;
      }

      insights.push({
        type: "energy_trend",
        title: "Energy trend",
        body,
        sampleCount: Math.min(rows.length, priorRows.length),
      });
    }

    // --- Symptom correlation ---
    const symptomAgg = new Map<string, { sum: number; count: number }>();
    for (const row of rows) {
      const energy = Number(row.energyLevel);
      if (!Number.isFinite(energy)) continue;
      for (const symptom of row.symptoms ?? []) {
        const key = symptom.trim();
        if (!key) continue;
        const cur = symptomAgg.get(key) ?? { sum: 0, count: 0 };
        cur.sum += energy;
        cur.count += 1;
        symptomAgg.set(key, cur);
      }
    }
    const worstSymptom = [...symptomAgg.entries()]
      .filter(([, v]) => v.count >= 3)
      .map(([symptom, v]) => ({ symptom, avg: v.sum / v.count, count: v.count }))
      .filter(({ avg: symAvg }) => overallAvg - symAvg >= ENERGY_DIFF)
      .sort((a, b) => a.avg - b.avg)[0];
    if (worstSymptom) {
      insights.push({
        type: "symptom",
        title: "Symptom pattern",
        body: `Your energy tends to be lower on days with "${worstSymptom.symptom}". Consider pacing more on those days.`,
        sampleCount: worstSymptom.count,
      });
    }

    // --- Day-of-week pattern ---
    const dowAgg = new Map<number, { sum: number; count: number }>();
    for (const row of rows) {
      const energy = Number(row.energyLevel);
      if (!Number.isFinite(energy) || !row.dayKey) continue;
      const dow = new Date(`${row.dayKey}T00:00:00Z`).getUTCDay();
      const cur = dowAgg.get(dow) ?? { sum: 0, count: 0 };
      cur.sum += energy;
      cur.count += 1;
      dowAgg.set(dow, cur);
    }
    const dowWorst = [...dowAgg.entries()]
      .filter(([, v]) => v.count >= 3)
      .map(([dow, v]) => ({ dow, avg: v.sum / v.count, count: v.count }))
      .filter(({ avg: dowAvg }) => overallAvg - dowAvg >= ENERGY_DIFF)
      .sort((a, b) => a.avg - b.avg)[0];
    if (dowWorst) {
      insights.push({
        type: "day_of_week",
        title: "Weekly pattern",
        body: `${DAY_NAMES[dowWorst.dow]} tends to be your most draining day of the week.`,
        sampleCount: dowWorst.count,
      });
    }

    // --- Health-based correlations ---
    const healthRows = await db
      .select({
        metricType: healthMetrics.metricType,
        value: healthMetrics.value,
        dayKey: sql<string>`to_char(${healthMetrics.measuredAt}::date, 'YYYY-MM-DD')`.as(
          "day_key",
        ),
      })
      .from(healthMetrics)
      .where(
        and(
          eq(healthMetrics.userId, user.id),
          gte(healthMetrics.measuredAt, since),
          inArray(healthMetrics.metricType, [
            "sleep_duration",
            "steps",
            "hrv",
          ]),
        ),
      );

    if (healthRows.length > 0) {
      const healthByDay = new Map<
        string,
        { sleep?: number; steps?: number; hrv?: number }
      >();
      for (const row of healthRows) {
        const cur = healthByDay.get(row.dayKey) ?? {};
        if (row.metricType === "sleep_duration") cur.sleep = row.value;
        if (row.metricType === "steps") cur.steps = row.value;
        if (row.metricType === "hrv") cur.hrv = row.value;
        healthByDay.set(row.dayKey, cur);
      }

      const energyByDay = new Map<string, { sum: number; count: number }>();
      for (const row of rows) {
        const energy = Number(row.energyLevel);
        if (!Number.isFinite(energy) || !row.dayKey) continue;
        const cur = energyByDay.get(row.dayKey) ?? { sum: 0, count: 0 };
        cur.sum += energy;
        cur.count += 1;
        energyByDay.set(row.dayKey, cur);
      }

      const avgEnergyForDay = (key: string): number | null => {
        const v = energyByDay.get(key);
        return v ? v.sum / v.count : null;
      };

      // Sleep → next-day energy
      const lowSleepE: number[] = [];
      const goodSleepE: number[] = [];
      for (const [day, health] of healthByDay.entries()) {
        if (health.sleep == null) continue;
        const e = avgEnergyForDay(nextDayKey(day));
        if (e == null) continue;
        if (health.sleep < SLEEP_LOW_MINUTES) lowSleepE.push(e);
        else goodSleepE.push(e);
      }
      if (lowSleepE.length >= MIN_SAMPLES && goodSleepE.length >= 2) {
        const lowAvg = mean(lowSleepE);
        const goodAvg = mean(goodSleepE);
        if (goodAvg - lowAvg >= ENERGY_DIFF) {
          insights.push({
            type: "sleep",
            title: "Sleep impact",
            body: `Your energy tends to dip after nights with less than 6 hours of sleep — averaging ${fmt(lowAvg)} vs ${fmt(goodAvg)} after longer rest.`,
            sampleCount: lowSleepE.length,
          });
        }
      }

      // Steps → crash (boom-bust)
      let highStepTotal = 0;
      let highStepCrash = 0;
      for (const [day, health] of healthByDay.entries()) {
        if (health.steps == null || health.steps <= STEPS_HIGH) continue;
        highStepTotal += 1;
        const todayE = avgEnergyForDay(day);
        const nextE = avgEnergyForDay(nextDayKey(day));
        if (todayE != null && nextE != null && todayE - nextE >= 1) {
          highStepCrash += 1;
        }
      }
      if (
        highStepTotal >= MIN_SAMPLES &&
        highStepCrash / highStepTotal >= BOOM_BUST_RATE
      ) {
        insights.push({
          type: "activity",
          title: "Activity pacing",
          body: `High step days often lead to a crash the next day — this pattern appeared ${highStepCrash} out of ${highStepTotal} times. Pacing may help.`,
          sampleCount: highStepCrash,
        });
      }

      // HRV → next-day energy
      const hrvEntries = [...healthByDay.entries()].filter(
        ([, h]) => h.hrv != null,
      );
      if (hrvEntries.length >= MIN_SAMPLES) {
        const sorted = [...hrvEntries].sort(
          (a, b) => a[1].hrv! - b[1].hrv!,
        );
        const medianHrv = sorted[Math.floor(sorted.length / 2)]![1].hrv!;
        const highHrvE: number[] = [];
        const lowHrvE: number[] = [];
        for (const [day, health] of hrvEntries) {
          const e = avgEnergyForDay(nextDayKey(day));
          if (e == null) continue;
          if (health.hrv! >= medianHrv) highHrvE.push(e);
          else lowHrvE.push(e);
        }
        if (highHrvE.length >= 3 && lowHrvE.length >= 3) {
          const highAvg = mean(highHrvE);
          const lowAvg = mean(lowHrvE);
          if (highAvg - lowAvg >= ENERGY_DIFF) {
            insights.push({
              type: "hrv",
              title: "Heart rate variability",
              body: `Your energy tends to be better after days with higher HRV — averaging ${fmt(highAvg)} vs ${fmt(lowAvg)}. Higher HRV is a sign of good recovery.`,
              sampleCount: hrvEntries.length,
            });
          }
        }
      }
    }

    insights.sort((a, b) => b.sampleCount - a.sampleCount);
    // Drop the generic summary if a richer energy_trend is present
    const hasTrend = insights.some((i) => i.type === "energy_trend");
    const filtered = hasTrend ? insights.filter((i) => i.type !== "summary") : insights;
    const topInsights = filtered.slice(0, 3);

    return NextResponse.json({
      success: true,
      data: {
        insights: topInsights,
        message: topInsights[0]?.body ?? null,
      },
    });
  } catch (err: unknown) {
    console.error("[api/check-ins/insight GET] ERROR:", err);
    const msg = err instanceof Error ? err.message : "";
    if (msg === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}
