import { format, parseISO, subDays, isToday, startOfWeek, eachDayOfInterval } from 'date-fns'

export const today = () => format(new Date(), 'yyyy-MM-dd')
export const yesterday = () => format(subDays(new Date(), 1), 'yyyy-MM-dd')

export function calcStreak(checkins, habit) {
  if (!checkins || checkins.length === 0) return 0
  const dates = [...new Set(checkins.map(c => c.date))].sort().reverse()
  if (dates.length === 0) return 0

  const todayStr = today()
  let streak = 0
  let cursor = todayStr

  for (let i = 0; i < 365; i++) {
    const cursorDate = parseISO(cursor)
    if (isExpectedDay(habit, cursorDate)) {
      if (dates.includes(cursor)) {
        streak++
      } else {
        if (cursor === todayStr) {
          cursor = format(subDays(cursorDate, 1), 'yyyy-MM-dd')
          continue
        }
        break
      }
    }
    cursor = format(subDays(cursorDate, 1), 'yyyy-MM-dd')
  }
  return streak
}

export function missedYesterday(checkins, habit) {
  const yest = yesterday()
  const tod = today()
  // Already done today — no nudge needed
  if (checkins.some(c => c.date === tod)) return false
  // Had a streak going but didn't check in yesterday
  const hadStreak = checkins.some(c => {
    const d = parseISO(c.date)
    return c.date <= yest
  })
  const doneYest = checkins.some(c => c.date === yest)
  return hadStreak && !doneYest
}

export function completionsThisWeek(checkins) {
  const start = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  return (checkins || []).filter(c => c.date >= start).length
}

export function getWeekDays() {
  const days = []
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1
  const mon = subDays(d, diff)
  for (let i = 0; i < 7; i++) {
    const date = new Date(mon)
    date.setDate(mon.getDate() + i)
    days.push({
      label: format(date, 'EEE').charAt(0),
      date: format(date, 'yyyy-MM-dd'),
      isToday: isToday(date),
    })
  }
  return days
}

function isExpectedDay(habit, date) {
  if (habit.frequency === 'daily') return true
  if (habit.frequency === 'weekly') return true
  if (habit.frequency === 'specific_days') {
    const dayName = format(date, 'EEE').toLowerCase()
    return (habit.specific_days || []).includes(dayName)
  }
  return true
}

// Milestone definitions
export const MILESTONES = [
  { id: 'first_checkin', label: 'First step', desc: 'Completed your first habit', emoji: '🌱', threshold: 1 },
  { id: 'streak_7',      label: '7-day streak', desc: '7 days in a row',          emoji: '🔥', threshold: 7 },
  { id: 'streak_14',     label: 'Two weeks',    desc: '14 days in a row',         emoji: '⚡', threshold: 14 },
  { id: 'streak_30',     label: 'One month',    desc: '30 days in a row',         emoji: '💎', threshold: 30 },
  { id: 'streak_100',    label: '100 days',     desc: '100 days in a row',        emoji: '👑', threshold: 100 },
  { id: 'total_10',      label: '10 check-ins', desc: '10 total completions',     emoji: '✅', threshold: 10, type: 'total' },
  { id: 'total_50',      label: '50 check-ins', desc: '50 total completions',     emoji: '🏆', threshold: 50, type: 'total' },
  { id: 'total_100',     label: '100 check-ins',desc: '100 total completions',    emoji: '💯', threshold: 100, type: 'total' },
]

export function getEarnedMilestones(habits, checkins) {
  const totalCheckins = Object.values(checkins).flat().length
  const bestStreak = habits.reduce((best, h) => Math.max(best, calcStreak(checkins[h.id] || [], h)), 0)
  return MILESTONES.filter(m => {
    if (m.type === 'total') return totalCheckins >= m.threshold
    return bestStreak >= m.threshold
  })
}
