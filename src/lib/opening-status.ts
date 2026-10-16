/**
 * «Сейчас открыто. Работаем до 19:30» — статус салона в шапке. Время —
 * по часовому поясу салона (SITE.hours.timeZone), а не устройства
 * посетителя; часы и минуты — из графика (src/lib/contacts-data.ts).
 */

export interface DayHours { opens: string; closes: string }
export interface WeekHours { weekdays: DayHours; saturday: DayHours; sunday: DayHours }

const toMinutes = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(':').map(Number)
  return h * 60 + m
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const hoursOf = (week: WeekHours, day: number) => (day === 0 ? week.sunday : day === 6 ? week.saturday : week.weekdays)

/** День недели (0 — воскресенье) и минуты с полуночи в часовом поясе салона */
function zoned(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return { day: DAYS.indexOf(get('weekday')), minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

export function openingStatus(now: Date, week: WeekHours, timeZone: string): { open: boolean; detail: string } {
  const { day, minutes } = zoned(now, timeZone)
  const today = hoursOf(week, day)
  if (minutes >= toMinutes(today.opens) && minutes < toMinutes(today.closes)) {
    return { open: true, detail: `Работаем до ${today.closes}` }
  }
  if (minutes < toMinutes(today.opens)) return { open: false, detail: `Откроемся сегодня в ${today.opens}` }
  return { open: false, detail: `Откроемся завтра в ${hoursOf(week, (day + 1) % 7).opens}` }
}
