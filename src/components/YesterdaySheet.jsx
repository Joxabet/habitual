import { X, Check } from 'lucide-react'
import { format, subDays } from 'date-fns'

const ICONS = {
  droplet:'💧', barbell:'🏋️', moon:'🌙', book:'📚',
  walk:'🚶', heart:'❤️', apple:'🍎', pen:'✏️',
  brain:'🧠', sun:'☀️', leaf:'🌿', music:'🎵',
}

export function YesterdaySheet({ habits, isDoneYesterday, onToggle, onClose }) {
  const yesterdayLabel = format(subDays(new Date(), 1), 'EEEE, MMM d')

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full max-w-lg mx-auto bg-neutral-900 rounded-t-3xl border-t border-x border-neutral-800 p-6 pb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-medium text-neutral-100">Log yesterday</h2>
          <button onClick={onClose} className="p-2 text-neutral-500 active:text-neutral-300">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-neutral-600 mb-5">{yesterdayLabel}</p>

        <div className="flex flex-col gap-2 mb-6">
          {habits.map(h => {
            const done = isDoneYesterday(h.id)
            return (
              <button
                key={h.id}
                onClick={() => onToggle(h.id)}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-98 ${
                  done
                    ? 'bg-neutral-900 border-green-500/30'
                    : 'bg-neutral-800/50 border-neutral-800'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                  done ? 'bg-green-500/10' : 'bg-neutral-800'
                }`}>
                  {ICONS[h.icon] || '✨'}
                </div>
                <span className={`flex-1 text-left text-sm font-medium ${done ? 'text-neutral-400 line-through' : 'text-neutral-200'}`}>
                  {h.name}
                </span>
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  done ? 'bg-green-500 border-green-500 text-neutral-950' : 'border-neutral-600 text-transparent'
                }`}>
                  <Check size={13} strokeWidth={3} />
                </div>
              </button>
            )
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-green-500 text-neutral-950 font-medium text-sm"
        >
          Done
        </button>
      </div>
    </div>
  )
}
