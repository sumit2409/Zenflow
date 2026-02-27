import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

type LogEntry = {date:string,type:string,value:number}

type Props = { onSelect: (id: string) => void; user: string | null; token?: string | null }

const features = [
  { id: 'pomodoro', title: 'Pomodoro Timer', desc: 'Focus in 25-minute bursts with smart breaks to maximize productivity.', emoji: '??' },
  { id: 'meditation', title: 'Meditation', desc: 'Guided breathing sessions to calm your mind and reduce stress.', emoji: '??' },
  { id: 'steps', title: 'Steps Tracker', desc: 'Log your daily steps and watch your fitness progress grow.', emoji: '??' },
]

export default function Dashboard({ onSelect, user, token }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    if (user && token) {
      fetch('/api/logs', {headers:{authorization:`Bearer ${token}`}})
        .then(r=>r.json())
        .then(j=>setLogs(j.logs || []))
        .catch(console.error)
    } else {
      setLogs([])
    }
  }, [user, token])

  const buildData = (type:string) => {
    const filtered = logs.filter(l=>l.type===type)
    filtered.sort((a,b)=>a.date.localeCompare(b.date))
    const labels = filtered.map(l=>l.date)
    const data = filtered.map(l=>l.value)
    return {labels, datasets:[{label:type, data, borderColor:type==='steps'? '#8bcf6d': type==='pomodoro'?'#e98b4b':'#d08f7f', tension:0.35}]}
  }

  return (
    <div className="dashboard">
      {user && logs.length > 0 && (
        <div className="charts card">
          <h3>Progress History</h3>
          <Line data={buildData('steps')} />
          <Line data={buildData('pomodoro')} />
          <Line data={buildData('meditation')} />
        </div>
      )}
      <div className="feature-grid">
        {features.map(f => (
          <button key={f.id} className="feature-card" onClick={() => onSelect(f.id)}>
            <div className="feature-emoji">{f.emoji}</div>
            <div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
            <div className="arrow">&gt;</div>
          </button>
        ))}
      </div>
    </div>
  )
}
