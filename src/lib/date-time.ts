import { ScheduledRun } from '@/types/api/responses.interface';

type DateTimeFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY/MM/DD';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The backend mixes three date formats, and one of them will silently show the wrong day if handed to
 * `new Date()`:
 *
 * - `date` on a schedule run is `YYYY-MM-DD` — a **date-only** form, which ECMA-262 parses as **UTC**.
 *   `new Date('2026-09-25')` is 2026-09-25T00:00Z, which in any negative-offset timezone renders as the
 *   24th. These helpers never construct a Date from it.
 * - `departureTime` is `HH:mm:ss` wall clock with no date and no zone.
 * - `scheduledDeparture` / `startedAt` / `startTime` are `LocalDateTime` with no offset.
 * - `lastLocation.recordedAt` is a real `Instant` with `Z`, and is the only one `new Date()` handles
 *   correctly out of the box.
 */
export class DateTimeUtil {
  static formatDate(date: Date, outputFormat?: DateTimeFormat) {
    const dd = pad(new Date(date).getDate());
    const mm = pad(new Date(date).getMonth() + 1);
    const yyyy = new Date(date).getFullYear();

    if (!outputFormat) {
      return `${dd}/${mm}/${yyyy}`;
    }

    switch (outputFormat) {
      case 'DD/MM/YYYY':
        return `${dd}/${mm}/${yyyy}`;
      case 'MM/DD/YYYY':
        return `${mm}/${dd}/${yyyy}`;
      case 'YYYY/MM/DD':
        return `${yyyy}/${mm}/${dd}`;
    }
  }
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Today's school-local calendar date as `YYYY-MM-DD`, read from the device clock rather than UTC. */
export const todayIsoDate = (): string => {
  const now = new Date();

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const parseIsoParts = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);

  return { year: y, month: m, day: d, weekday: new Date(y, (m ?? 1) - 1, d ?? 1).getDay() };
};

/** `2026-09-25` → `Fri, 25 Sep`. Never routes through `new Date(string)`. */
export const formatRunDate = (date: string): string => {
  const { month, day, weekday } = parseIsoParts(date);

  return `${WEEKDAYS[weekday].slice(0, 3)}, ${day} ${MONTHS[month - 1]}`;
};

/** `2026-09-25` → `Friday`. */
export const formatRunWeekday = (date: string): string => WEEKDAYS[parseIsoParts(date).weekday];

/** `Today` / `Tomorrow` / `Fri, 25 Sep`, relative to the device's current date. */
export const formatRunDateRelative = (date: string): string => {
  const today = todayIsoDate();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date === today) {
    return 'Today';
  }

  if (
    date === `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`
  ) {
    return 'Tomorrow';
  }

  return formatRunDate(date);
};

/** `07:30:00` → `07:30`. Null-safe, because legacy runs carry no departure time at all. */
export const formatWallClock = (time: string | null | undefined): string => {
  if (!time) {
    return '--:--';
  }

  const [h, m] = time.split(':');

  return `${h}:${m ?? '00'}`;
};

/** `2026-09-24T07:30:00` → `07:30`. Local date-time with no offset, so this is display-only. */
export const formatLocalDateTimeTime = (dateTime: string | null | undefined): string => {
  if (!dateTime) {
    return '--:--';
  }

  return formatWallClock(dateTime.split('T')[1] ?? dateTime);
};

/** `2026-09-24T07:30:00` → `Thu, 24 Sep`. */
export const formatLocalDateTimeDate = (dateTime: string | null | undefined): string => {
  if (!dateTime) {
    return '';
  }

  return formatRunDate(dateTime.split('T')[0]);
};

/**
 * A run's stable identity, per the backend's identity rule.
 *
 * `tripId` is not an identity — it does not exist for a run whose day has not arrived, so keying a
 * list on it makes the item look like a brand-new object the morning its row is generated. The one
 * exception is a legacy or admin-hand-created row on `/driver/schedule` that belongs to no scheduled
 * run, where both `scheduleId` and `overrideId` are null and only `tripId` can identify it.
 */
export const runKey = (run: Pick<ScheduledRun, 'scheduleId' | 'overrideId' | 'tripId' | 'date'>) =>
  `${run.scheduleId ?? (run.overrideId != null ? `o${run.overrideId}` : `t${run.tripId}`)}@${run.date}`;
