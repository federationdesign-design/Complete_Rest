// Opening hours for the contact page status tag (ported from the LHM site).
//
// PLACEHOLDER: OPENING_HOURS (PLACEHOLDERS.md). This site states no opening
// hours, so none are invented here. While `openingHours` is null the status
// tag is not shown. To switch it on, replace null with one entry per day,
// in 24-hour UK time, or null for a closed day, for example:
//
//   export const openingHours: OpeningHours = {
//     0: null,                                    // Sunday, closed
//     1: { open: [8, 0], close: [17, 30] },       // Monday
//     ...
//   };

export type DayHours = { open: [hour: number, minute: number]; close: [hour: number, minute: number] } | null;
// Keys are days of the week, 0 (Sunday) to 6 (Saturday).
export type OpeningHours = Record<0 | 1 | 2 | 3 | 4 | 5 | 6, DayHours>;

export const openingHours: OpeningHours | null = null;

export type OpenStatus = { label: string; state: 'open' | 'closing' | 'closed' };

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatTime([hour, minute]: [number, number]): string {
  const suffix = hour < 12 ? 'am' : 'pm';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return minute ? `${h}.${String(minute).padStart(2, '0')}${suffix}` : `${h}${suffix}`;
}

// The current day and time in the UK, whatever the visitor's own time zone.
function ukNow(now: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return { day: DAY_NAMES.indexOf(get('weekday')), minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

// Same rules as LHM: open, closing within the hour, or closed with the next
// opening time. (LHM's version assumed 9am for a closed day and used the
// visitor's local time; both are corrected here.)
export function getOpenStatus(hours: OpeningHours, now = new Date()): OpenStatus {
  const { day, minutes } = ukNow(now);
  const today = hours[day as keyof OpeningHours];

  if (today) {
    const opens = today.open[0] * 60 + today.open[1];
    const closes = today.close[0] * 60 + today.close[1];
    if (minutes < opens) return { label: `Closed, opens today at ${formatTime(today.open)}`, state: 'closed' };
    if (minutes < closes) {
      return closes - minutes <= 60 ? { label: 'Closing soon', state: 'closing' } : { label: 'Open now', state: 'open' };
    }
  }

  for (let i = 1; i <= 7; i++) {
    const nextDay = (day + i) % 7;
    const next = hours[nextDay as keyof OpeningHours];
    if (next) {
      const when = i === 1 ? 'tomorrow' : DAY_NAMES[nextDay];
      return { label: `Closed, opens ${when} at ${formatTime(next.open)}`, state: 'closed' };
    }
  }
  return { label: 'Closed', state: 'closed' };
}
