import { useState } from 'react'
import { LogOut, User, ChevronRight } from 'lucide-react'

export function SettingsScreen({ user, onSignOut }) {
  const [confirmSignOut, setConfirmSignOut] = useState(false)

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-medium">Settings</h1>
      </div>

      {/* Account card */}
      <div className="mx-4 mb-6 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <User size={18} className="text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-200 truncate">{user?.email}</p>
          <p className="text-xs text-neutral-600 mt-0.5">Signed in</p>
        </div>
      </div>

      {/* Danger zone */}
      <div className="px-4 mb-8">
        <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-2 px-1">Account</p>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          {!confirmSignOut ? (
            <button
              onClick={() => setConfirmSignOut(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-800/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center">
                <LogOut size={15} className="text-neutral-400" />
              </div>
              <span className="text-sm text-neutral-300">Sign out</span>
            </button>
          ) : (
            <div className="px-4 py-4">
              <p className="text-sm text-neutral-300 mb-3">Sign out of Habitual?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmSignOut(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-sm text-neutral-400 hover:border-neutral-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onSignOut}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 hover:bg-red-500/15 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-[10px] text-neutral-800 pb-4">Habitual v1.0</p>
    </div>
  )
}

function SettingRow({ icon: Icon, label, sub, onClick, divider = false }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-800/50 transition-colors border-t border-neutral-800/50 first:border-t-0"
    >
      <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-neutral-400" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm text-neutral-300">{label}</p>
        {sub && <p className="text-xs text-neutral-600">{sub}</p>}
      </div>
      <ChevronRight size={14} className="text-neutral-700" />
    </button>
  )
}