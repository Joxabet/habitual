import { useEffect, useState } from 'react'

export function MilestoneToast({ milestone, onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Slide in
    const t1 = setTimeout(() => setVisible(true), 50)
    // Auto-dismiss after 4s
    const t2 = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 400)
    }, 4000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDismiss])

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-400 ${
        visible ? 'pt-14 opacity-100' : 'pt-8 opacity-0'
      }`}
      style={{ maxWidth: '390px', margin: '0 auto' }}
      onClick={() => { setVisible(false); setTimeout(onDismiss, 400) }}
    >
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-2xl w-full max-w-sm">
        <div className="text-3xl flex-shrink-0">{milestone.emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-green-400 font-medium uppercase tracking-wider mb-0.5">Milestone unlocked</p>
          <p className="text-sm font-medium text-neutral-100">{milestone.label}</p>
          <p className="text-xs text-neutral-500">{milestone.desc}</p>
        </div>
      </div>
    </div>
  )
}
