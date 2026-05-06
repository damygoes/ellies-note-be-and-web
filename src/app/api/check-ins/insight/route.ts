import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { checkInEntries } from "@/db/schema/checkInEntry";
import { healthMetrics } from "@/db/schema/healthMetrics";
import { requireClerkUserId } from "@/lib/serverAuth";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { jsonError } from "@/utils/jsonError";
import { parseIntParam } from "@/utils/parseIntParam";

type InsightCandidate = { message: string; sampleCount: number };

const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

const MIN_SAMPLES = 5;
const SLEEP_LOW_MINUTES = 360; // 6 hours
const STEPS_HIGH = 8000;
const ENERGY_DIFF = 0.5;
const BOOM_BUST_RATE = 0.5;

function nextDayKey(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
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

    const rows = await db
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
          gte(checkInEntries.createdAt, since),
        ),
      );

    if (rows.length < 6) {
      return NextResponse.json({ success: true, data: { message: null } });
    }

    const candidates: InsightCandidate[] = [];

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
    const symptomCandidates = [...symptomAgg.entries()]
      .filter(([, v]) => v.count >= 3)
      .map(([symptom, v]) => ({ symptom, avg: v.sum / v.count, count: v.count }))
      .sort((a, b) => a.avg - b.avg);
    if (symptomCandidates.length > 0) {
      const worst = symptomCandidates[0]!;
      candidates.push({
        message: `Your energy tends to be lower on days with "${worst.symptom}". Consider pacing more on those days.`,
        sampleCount: worst.count,
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
    const overallAvg =
      rows.reduce((s, r) => s + Number(r.energyLevel), 0) / rows.length;
    const dowWorst = [...dowAgg.entries()]
      .filter(([, v]) => v.count >= 3)
      .map(([dow, v]) => ({ dow, avg: v.sum / v.count, count: v.count }))
      .filter(({ avg }) => overallAvg - avg >= ENERGY_DIFF)
      .sort((a, b) => a.avg - b.avg)[0];
    if (dowWorst) {
      candidates.push({
        message: `${DAY_NAMES[dowWorst.dow]} tends to be your most draining day of the week.`,
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
          inArray(healthMetrics.metricType, ["sleep_duration", "steps"]),
        ),
      );

    if (healthRows.length > 0) {
      const healthByDay = new Map<string, { sleep?: number; steps?: number }>();
      for (const row of healthRows) {
        const cur = healthByDay.get(row.dayKey) ?? {};
        if (row.metricType === "sleep_duration") cur.sleep = row.value;
        if (row.metricType === "steps") cur.steps = row.value;
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

      const avgEnergy = (key: string): number | null => {
        const v = energyByDay.get(key);
        return v ? v.sum / v.count : null;
      };

      // Sleep → next-day energy
      const lowSleepE: number[] = [];
      const goodSleepE: number[] = [];
      for (const [day, health] of healthByDay.entries()) {
        if (health.sleep == null) continue;
        const e = avgEnergy(nextDayKey(day));
        if (e == null) continue;
        if (health.sleep < SLEEP_LOW_MINUTES) lowSleepE.push(e);
        else goodSleepE.push(e);
      }
      if (lowSleepE.length >= MIN_SAMPLES && goodSleepE.length >= 2) {
        const lowAvg = lowSleepE.reduce((s, v) => s + v, 0) / lowSleepE.length;
        const goodAvg = goodSleepE.reduce((s, v) => s + v, 0) / goodSleepE.length;
        if (goodAvg - lowAvg >= ENERGY_DIFF) {
          candidates.push({
            message:
              "Your energy tends to dip after nights with less than 6 hours of sleep.",
            sampleCount: lowSleepE.length,
          });
        }
      }

      // Steps → crash (boom-bust pattern)
      let highStepTotal = 0;
      let highStepCrash = 0;
      for (const [day, health] of healthByDay.entries()) {
        if (health.steps == null || health.steps <= STEPS_HIGH) continue;
        highStepTotal += 1;
        const todayE = avgEnergy(day);
        const nextE = avgEnergy(nextDayKey(day));
        if (todayE != null && nextE != null && todayE - nextE >= 1) {
          highStepCrash += 1;
        }
      }
      if (
        highStepTotal >= MIN_SAMPLES &&
        highStepCrash / highStepTotal >= BOOM_BUST_RATE
      ) {
        candidates.push({
          message:
            "High activity days often lead to a crash the following day. Pacing may help.",
          sampleCount: highStepCrash,
        });
      }
    }

    candidates.sort((a, b) => b.sampleCount - a.sampleCount);
    const best = candidates[0] ?? null;

    return NextResponse.json({
      success: true,
      data: { message: best?.message ?? null },
    });
  } catch (err: any) {
    console.error("[api/check-ins/insight GET] ERROR:", err);
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}
