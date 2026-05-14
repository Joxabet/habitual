import { Sun, BarChart2, Settings } from 'lucide-react'

export function BottomNav({ tab, setTab }) {
  const items = [
    { id: 'today', icon: Sun, label: 'Today' },
    { id: 'stats', icon: BarChart2, label: 'Stats' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <nav className="flex-shrink-0 flex items-center border-t border-neutral-800/60 bg-neutral-950/90 backdrop-blur-sm pb-safe">
      {items.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setTab(id)}
          className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
            tab === id ? 'text-green-400' : 'text-neutral-600 hover:text-neutral-400'
          }`}
        >
          <Icon size={20} strokeWidth={tab === id ? 2 : 1.5} />
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </nav>
  )
}
