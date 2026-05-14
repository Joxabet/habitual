import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { today, yesterday } from '../lib/streaks'

export function useHabits(userId) {
  const [habits, setHabits] = useState([])
  const [checkins, setCheckins] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const [{ data: habitsData }, { data: checkinsData }] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', userId).order('sort_order').order('created_at'),
      supabase.from('checkins').select('*').eq('user_id', userId),
    ])
    setHabits(habitsData || [])
    const byHabit = {}
    for (const c of checkinsData || []) {
      if (!byHabit[c.habit_id]) byHabit[c.habit_id] = []
      byHabit[c.habit_id].push(c)
    }
    setCheckins(byHabit)
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchAll() }, [fetchAll])

  const addHabit = async (habit) => {
    const maxOrder = habits.reduce((m, h) => Math.max(m, h.sort_order || 0), 0)
    const { data, error } = await supabase.from('habits').insert({
      ...habit,
      user_id: userId,
      sort_order: maxOrder + 1,
      archived: false,
    }).select().single()
    if (!error) {
      setHabits(prev => [...prev, data])
      setCheckins(prev => ({ ...prev, [data.id]: [] }))
    }
    return { data, error }
  }

  const archiveHabit = async (habitId) => {
    const { error } = await supabase.from('habits').update({ archived: true }).eq('id', habitId)
    if (!error) setHabits(prev => prev.filter(h => h.id !== habitId))
  }

  const deleteHabit = async (habitId) => {
    const { error } = await supabase.from('habits').delete().eq('id', habitId)
    if (!error) {
      setHabits(prev => prev.filter(h => h.id !== habitId))
      setCheckins(prev => { const n = { ...prev }; delete n[habitId]; return n })
    }
  }

  const reorderHabits = async (newOrder) => {
    setHabits(newOrder)
    await Promise.all(
      newOrder.map((h, i) =>
        supabase.from('habits').update({ sort_order: i }).eq('id', h.id)
      )
    )
  }

  const toggleCheckin = async (habitId, date) => {
    const dateStr = date || today()
    const existing = (checkins[habitId] || []).find(c => c.date === dateStr)
    if (existing) {
      const { error } = await supabase.from('checkins').delete().eq('id', existing.id)
      if (!error) {
        setCheckins(prev => ({
          ...prev,
          [habitId]: prev[habitId].filter(c => c.id !== existing.id),
        }))
      }
    } else {
      const { data, error } = await supabase.from('checkins').insert({
        habit_id: habitId,
        user_id: userId,
        date: dateStr,
      }).select().single()
      if (!error) {
        setCheckins(prev => ({
          ...prev,
          [habitId]: [...(prev[habitId] || []), data],
        }))
      }
    }
  }

  const isDoneOn = (habitId, date) => {
    const dateStr = date || today()
    return (checkins[habitId] || []).some(c => c.date === dateStr)
  }

  const isDoneToday = (habitId) => isDoneOn(habitId, today())

  return {
    habits, checkins, loading,
    addHabit, archiveHabit, deleteHabit,
    reorderHabits, toggleCheckin,
    isDoneToday, isDoneOn,
    refetch: fetchAll,
  }
}
