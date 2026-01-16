type NotificationTime = { hour: number; minute: number };

export function computeNextReminderAtUtc(opts: {
  nowUtc: Date;
  tzOffsetMinutes: number; // same convention as JS getTimezoneOffset()
  times: NotificationTime[]; // assumed sorted; if not, sort
}): Date | null {
  const { nowUtc, tzOffsetMinutes } = opts;
  const times = [...opts.times].sort((a, b) =>
    a.hour !== b.hour ? a.hour - b.hour : a.minute - b.minute
  );

  if (times.length === 0) return null;

  // Convert "now" into local-frame by subtracting offset minutes
  const nowLocalFrame = new Date(nowUtc.getTime() - tzOffsetMinutes * 60_000);

  // Build local "today"
  const year = nowLocalFrame.getUTCFullYear();
  const month = nowLocalFrame.getUTCMonth();
  const date = nowLocalFrame.getUTCDate();

  // Find next time today
  for (const time of times) {
    const candidateLocal = new Date(
      Date.UTC(year, month, date, time.hour, time.minute, 0, 0)
    );
    if (candidateLocal.getTime() > nowLocalFrame.getTime()) {
      // Convert back to UTC
      return new Date(candidateLocal.getTime() + tzOffsetMinutes * 60_000);
    }
  }

  // Otherwise tomorrow at first time
  const first = times[0];
  const tomorrowLocal = new Date(
    Date.UTC(year, month, date + 1, first.hour, first.minute, 0, 0)
  );
  return new Date(tomorrowLocal.getTime() + tzOffsetMinutes * 60_000);
}
