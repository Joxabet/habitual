import { useState } from 'react'
import { LogOut, User, Moon, Sun } from 'lucide-react'

export function SettingsScreen({ user, onSignOut, theme, onToggleTheme }) {
  const [confirmSignOut, setConfirmSignOut] = useState(false)
  const isDark = theme === 'dark'

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide bg-white dark:bg-neutral-950">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-medium text-neutral-900 dark:text-neutral-100">Settings</h1>
      </div>

      {/* Account card */}
      <div className="mx-4 mb-6 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <User size={18} className="text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{user?.email}</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-0.5">Signed in</p>
        </div>
      </div>

      {/* Appearance */}
      <div className="px-4 mb-4">
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 mb-2 px-1">Appearance</p>
        <div className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                {isDark
                  ? <Moon size={15} className="text-neutral-400" />
                  : <Sun size={15} className="text-neutral-500" />
                }
              </div>
              <div>
                <p className="text-sm text-neutral-800 dark:text-neutral-300">
                  {isDark ? 'Dark mode' : 'Light mode'}
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-0.5">Tap to switch</p>
              </div>
            </div>

            {/* Toggle switch */}
            <button
              onClick={onToggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                isDark ? 'bg-green-500' : 'bg-neutral-300'
              }`}
              aria-label="Toggle theme"
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                isDark ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Account / sign out */}
      <div className="px-4 mb-8">
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 mb-2 px-1">Account</p>
        <div className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
          {!confirmSignOut ? (
            <button
              onClick={() => setConfirmSignOut(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-neutral-200 dark:active:bg-neutral-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                <LogOut size={15} className="text-neutral-500 dark:text-neutral-400" />
              </div>
              <span className="text-sm text-neutral-700 dark:text-neutral-300">Sign out</span>
            </button>
          ) : (
            <div className="px-4 py-4">
              <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">Sign out of Habitual?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmSignOut(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-500 dark:text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  onClick={onSignOut}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500 dark:text-red-400"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-[10px] text-neutral-300 dark:text-neutral-800 pb-4">Habitual v1.0</p>
    </div>
  )
}
