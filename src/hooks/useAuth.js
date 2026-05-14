import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithMagicLink = async (email) => {
    return supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
  }

  const signOut = () => supabase.auth.signOut()

  return { session, loading, signInWithMagicLink, signOut, user: session?.user }
}
