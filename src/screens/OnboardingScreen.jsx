import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

const STEPS = [
  {
    emoji: '👋',
    title: 'Welcome to Habitual',
    body: 'Build habits that stick — not by willpower, but by showing up consistently. Science says just 2–3 habits at a time works better than a list of ten.',
    cta: "Let's go",
  },
  {
    emoji: '🔥',
    title: 'Streaks keep you going',
    body: 'Every day you complete a habit, your streak grows. Missing once won\'t break you — the goal is consistency over perfection.',
    cta: 'Got it',
  },
  {
    emoji: '✅',
    title: 'Start small',
    body: 'Add one or two habits to begin. You can always add more. The best habit is one you actually do.',
    cta: 'Add my first habit',
  },
]

export function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-neutral-950 px-6 pt-16 pb-10">
      <div className="flex gap-2 justify-center mb-16">
        {STEPS.map((_, i) => (
          <div key={i} className={`rounded-full transition-all duration-300 ${
            i === step
              ? 'w-6 h-2 bg-green-500'
              : 'w-2 h-2 bg-neutral-200 dark:bg-neutral-800'
          }`} />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center text-center">
        <div className="text-6xl mb-8">{current.emoji}</div>
        <h1 className="text-2xl font-medium text-neutral-900 dark:text-neutral-100 mb-4 leading-tight">
          {current.title}
        </h1>
        <p className="text-neutral-500 text-base leading-relaxed max-w-xs">
          {current.body}
        </p>
      </div>

      <button
        onClick={() => isLast ? onComplete() : setStep(s => s + 1)}
        className="w-full py-4 rounded-2xl bg-green-500 text-white font-medium text-base flex items-center justify-center gap-2 active:scale-98 transition-transform"
      >
        {current.cta}
        <ChevronRight size={18} strokeWidth={2.5} />
      </button>

      {!isLast && (
        <button onClick={onComplete} className="mt-4 text-sm text-neutral-400 py-2 w-full text-center">
          Skip
        </button>
      )}
    </div>
  )
}
