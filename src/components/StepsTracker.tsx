import React, { useState, useEffect } from 'react'

type Props = { user: string | null; token?: string | null; onRequireLogin?: () => void }

function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

export default function StepsTracker({ user, token, onRequireLogin }: Props) {
  const [steps, setSteps] = useState(0)
  const [goal, setGoal] = useState(10000)
  const [logs, setLogs] = useState<Array<{date:string,type:string,value:number}>>([]) // array of log entries

  useEffect(() => {
    async function load() {
      if (!user || !token) return
      try {
        const [logsRes, metaRes] = await Promise.all([
          fetch('/api/logs', {headers:{authorization:`Bearer ${token}`}}),
          fetch('/api/meta', {headers:{authorization:`Bearer ${token}`}})
        ])
        if (logsRes.ok) {
          const jl = await logsRes.json();
          setLogs(jl.logs || [])
          // extract today's steps
          const todayEntry = (jl.logs || []).find((e:any)=>e.date===todayKey() && e.type==='steps')
          setSteps(todayEntry ? todayEntry.value : 0)
        }
        if (metaRes.ok) {
          const jm = await metaRes.json();
          if (jm.meta && jm.meta.goal) setGoal(Number(jm.meta.goal)||10000)
        }
      } catch(e){ console.error(e) }
    }
    if (!user) {
      // logged-out, clear
      setLogs([]); setSteps(0)
    }
    load()
  }, [user, token])

  const persist = async (date: string, value: number) => {
    // update local logs array
    setLogs(prev => {
      const existing = prev.find(e=>e.date===date && e.type==='steps')
      if (existing) {
        return prev.map(e=> e===existing ? {...e,value} : e)
      }
      return [...prev,{date,type:'steps',value}]
    })
    if (!user || !token) return
    try { await fetch('/api/logs', {method:'POST', headers:{'content-type':'application/json', authorization:`Bearer ${token}`}, body: JSON.stringify({date, type:'steps', value})}) } catch(e){ console.error(e) }
  }

  const changeSteps = (delta: number) => {
    if (!user || !token) return onRequireLogin?.()
    const k = todayKey()
    const newVal = Math.max(0, steps + delta)
    persist(k, newVal)
    setSteps(newVal)
  }

  const resetToday = () => {
    if (!user || !token) return onRequireLogin?.()
    const k = todayKey()
    persist(k, 0)
    setSteps(0)
  }

  const saveGoal = (g: number) => {
    setGoal(g)
    if (!user || !token) return
    fetch('/api/meta', {method:'POST', headers:{'content-type':'application/json', authorization:`Bearer ${token}`}, body: JSON.stringify({meta:{goal: g}})}).catch(e=>console.error(e))
  }

  // quick aggregates for week/month
  const aggregate = (period: 'day'|'week'|'month') => {
    const now = new Date()
    const relevant = logs.filter(e=>e.type==='steps')
    if (period === 'day') return steps
    if (period === 'week') {
      const start = new Date(now);
      start.setDate(now.getDate()-6)
      return relevant.filter(e=>new Date(e.date)>=start).reduce((s,e)=>s+e.value,0)
    }
    const start = new Date(now); start.setMonth(now.getMonth()-1)
    return relevant.filter(e=>new Date(e.date)>=start).reduce((s,e)=>s+e.value,0)
  }

  return (
    <div>
      <div className="steps-display">Steps today: {steps}</div>
      <div className="controls">
        <button onClick={() => changeSteps(100)}>+100</button>
        <button onClick={() => changeSteps(-100)}>-100</button>
        <button onClick={resetToday}>Reset</button>
      </div>
      <div className="goal">
        <label>Daily goal: <input type="number" value={goal} onChange={e => saveGoal(Number(e.target.value) || 0)} /></label>
        <div>Progress: {goal ? Math.min(100, Math.round((steps/goal)*100)) : 0}%</div>
      </div>
      <div className="aggregates">
        <div>Day: {aggregate('day')}</div>
        <div>Week: {aggregate('week')}</div>
        <div>Month: {aggregate('month')}</div>
      </div>
      {!user && (
        <div className="login-cta">
          <p className="muted">Logging and history are gated - please login to persist your data across sessions.</p>
          <button onClick={() => onRequireLogin?.()}>Login to save logs</button>
        </div>
      )}
    </div>
  )
}
