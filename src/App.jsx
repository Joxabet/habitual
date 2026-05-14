import { useState, useEffect, useRef } from 'react'
import { useAuth } from './hooks/useAuth'
import { useHabits } from './hooks/useHabits'
import { AuthScreen } from './screens/AuthScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { TodayScreen } from './screens/TodayScreen'
import { StatsScreen } from './screens/StatsScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { BottomNav } from './components/BottomNav'
import { MilestoneToast } from './components/MilestoneToast'
import { getEarnedMilestones } from './lib/streaks'

const ONBOARDING_KEY = 'habitual_onboarded'

export default function App() {
  const { session, loading: authLoading, signInWithMagicLink, signOut, user } = useAuth()
  const {
    habits, checkins, loading,
    addHabit, archiveHabit, deleteHabit,
    reorderHabits, toggleCheckin,
    isDoneToday, isDoneOn,
  } = useHabits(user?.id)

  const [tab, setTab] = useState('today')
  const [onboarded, setOnboarded] = useState(() => !!localStorage.getItem(ONBOARDING_KEY))
  const [pendingMilestone, setPendingMilestone] = useState(null)
  const prevEarnedRef = useRef([])

  // Detect newly earned milestones
  useEffect(() => {
    if (!habits.length) return
    const earned = getEarnedMilestones(habits, checkins)
    const prev = prevEarnedRef.current
    const newOnes = earned.filter(m => !prev.find(p => p.id === m.id))
    if (newOnes.length > 0 && prev.length > 0) {
      setPendingMilestone(newOnes[0])
    }
    prevEarnedRef.current = earned
  }, [habits, checkins])

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, '1')
    setOnboarded(true)
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <div className="w-6 h-6 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return <AuthScreen onSignIn={signInWithMagicLink} />
  if (!onboarded) return <OnboardingScreen onComplete={handleComplete} />

  return (
    <div className="flex flex-col h-screen max-w-sm mx-auto bg-neutral-950 relative">
      {pendingMilestone && (
        <MilestoneToast
          milestone={pendingMilestone}
          onDismiss={() => setPendingMilestone(null)}
        />
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
        </div>
      ) : tab === 'today' ? (
        <TodayScreen
          habits={habits}
          checkins={checkins}
          isDoneToday={isDoneToday}
          isDoneOn={isDoneOn}
          onToggle={toggleCheckin}
          onAdd={addHabit}
          onArchive={archiveHabit}
          onDelete={deleteHabit}
          onReorder={reorderHabits}
        />
      ) : tab === 'stats' ? (
        <StatsScreen habits={habits} checkins={checkins} />
      ) : (
        <SettingsScreen user={user} onSignOut={signOut} />
      )}

      <BottomNav tab={tab} setTab={setTab} />
    </div>
  )
}
