import React, { useState, useRef, useEffect } from 'react'
import { playEndChime, playStartChime } from '../utils/sound'

function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

type Props = { user: string | null; token?: string | null; onRequireLogin?: () => void }

export default function PomodoroTimer({ user, token, onRequireLogin }: Props) {
  const presets = { work: 25 * 60, short: 5 * 60, long: 15 * 60 }
  const [seconds, setSeconds] = useState(presets.work)
  const [running, setRunning] = useState(false)
  const timerRef = useRef<number | null>(null)
  const currentPreset = useRef<number>(presets.work)
  const completedRef = useRef(false)

  useEffect(() => {
    if (running) {
      timerRef.current = window.setInterval(() => setSeconds(s => s - 1), 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [running])

  useEffect(() => {
    if (seconds > 0) completedRef.current = false
    if (seconds <= 0) setRunning(false)
  }, [seconds])

  useEffect(() => {
    if (seconds !== 0 || completedRef.current) return
    completedRef.current = true
    void playEndChime()

    const minutes = currentPreset.current / 60
    if (user && token) {
      fetch('/api/logs', {method:'POST', headers:{'content-type':'application/json', authorization:`Bearer ${token}`}, body: JSON.stringify({date: todayKey(), type:'pomodoro', value: minutes})}).catch(e=>console.error(e))
    } else {
      onRequireLogin?.()
    }
  }, [seconds, user, token, onRequireLogin])

  const setPreset = (s: number) => { setSeconds(s); currentPreset.current = s; setRunning(false) }

  const toggleRunning = () => {
    if (!running) void playStartChime()
    setRunning(r => !r)
  }

  return (
    <div>
      <div className="module-meta">
        <h2>Deep Focus Session</h2>
        <p>Work in focused intervals and take deliberate breaks to stay mentally fresh.</p>
      </div>
      <div className="timer-display">{formatTime(Math.max(0, seconds))}</div>
      <div className="controls">
        <button onClick={() => setPreset(presets.work)}>25 min</button>
        <button onClick={() => setPreset(presets.short)}>5 min</button>
        <button onClick={() => setPreset(presets.long)}>15 min</button>
      </div>
      <div className="controls">
        <button onClick={toggleRunning}>{running ? 'Pause' : 'Start'}</button>
        <button onClick={() => { setRunning(false); setSeconds(presets.work) }}>Reset</button>
      </div>
    </div>
  )
}
