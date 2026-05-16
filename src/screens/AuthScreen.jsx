import { useState } from 'react'
import { Check } from 'lucide-react'

export function AuthScreen({ onSignIn }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email.trim()) return
    setLoading(true)
    setError('')
    const { error } = await onSignIn(email.trim())
    if (error) { setError(error.message); setLoading(false) }
    else { setSent(true); setLoading(false) }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center bg-white dark:bg-neutral-950">
      <div className="w-12 h-12 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-8">
        <span className="text-2xl">✅</span>
      </div>
      <h1 className="text-2xl font-medium text-neutral-900 dark:text-neutral-100 mb-2">Habitual</h1>
      <p className="text-sm text-neutral-500 mb-10">Build habits that last.</p>

      {sent ? (
        <div className="w-full max-w-xs">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/15 border border-green-500/30 mx-auto mb-4">
            <Check size={18} className="text-green-500 dark:text-green-400" />
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-1">Check your email</p>
          <p className="text-xs text-neutral-400">We sent a magic link to <span className="text-neutral-600 dark:text-neutral-400">{email}</span></p>
        </div>
      ) : (
        <div className="w-full max-w-xs">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="your@email.com"
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-green-500/50 mb-3 transition-colors"
          />
          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={!email.trim() || loading}
            className="w-full py-3.5 rounded-xl bg-green-500 text-white font-medium text-sm disabled:opacity-40 hover:bg-green-400 transition-all active:scale-98"
          >
            {loading ? 'Sending…' : 'Continue with email'}
          </button>
          <p className="text-xs text-neutral-400 mt-4">No password needed. We'll email you a link.</p>
        </div>
      )}
    </div>
  )
}
