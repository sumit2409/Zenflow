import React, { useEffect, useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import {
  allQuestsComplete,
  getAchievements,
  getCurrentStreak,
  getLevel,
  getQuests,
  getRecentActiveDays,
  getRewardTitle,
  getTodayTotals,
  getTotalPoints,
  todayKey,
  type LogEntry,
  type WellnessMeta,
} from '../utils/wellness'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

type Props = { onSelect: (id: string) => void; user: string | null; token?: string | null }

const features = [
  {
    id: 'pomodoro',
    title: 'Focus Room',
    desc: 'Deep-work intervals with gentle cues and visible momentum.',
    sigil: 'FO',
    reward: '+80 ritual points',
  },
  {
    id: 'meditation',
    title: 'Calm Room',
    desc: 'Ambient breathing windows that lower pressure and reset attention.',
    sigil: 'CA',
    reward: '+60 ritual points',
  },
  {
    id: 'steps',
    title: 'Motion Room',
    desc: 'Daily movement tracking that keeps energy and mood from going flat.',
    sigil: 'MO',
    reward: '+90 ritual points',
  },
  {
    id: 'sudoku',
    title: 'Mind Puzzle Room',
    desc: 'Daily Sudoku to sharpen concentration and interrupt passive scrolling habits.',
    sigil: 'IQ',
    reward: '+70 ritual points',
  },
  {
    id: 'profile',
    title: 'Profile and Journal',
    desc: 'Store your body profile, journal the day, and tick off the tasks that matter.',
    sigil: 'PR',
    reward: 'Reflection and planning',
  },
]

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      ticks: { color: '#7d6a58' },
      grid: { color: 'rgba(79, 58, 41, 0.08)' },
    },
    y: {
      ticks: { color: '#7d6a58' },
      grid: { color: 'rgba(79, 58, 41, 0.08)' },
    },
  },
}

export default function Dashboard({ onSelect, user, token }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [meta, setMeta] = useState<WellnessMeta>({})
  const [intentionDraft, setIntentionDraft] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  useEffect(() => {
    async function load() {
      if (!user || !token) {
        setLogs([])
        setMeta({})
        return
      }

      try {
        const [logsRes, metaRes] = await Promise.all([
          fetch('/api/logs', { headers: { authorization: `Bearer ${token}` } }),
          fetch('/api/meta', { headers: { authorization: `Bearer ${token}` } }),
        ])

        if (logsRes.ok) {
          const logsJson = await logsRes.json()
          setLogs(logsJson.logs || [])
        }

        if (metaRes.ok) {
          const metaJson = await metaRes.json()
          setMeta(metaJson.meta || {})
        }
      } catch (error) {
        console.error(error)
      }
    }

    void load()
  }, [user, token])

  useEffect(() => {
    setIntentionDraft(meta.intention || '')
  }, [meta.intention])

  const goal = Number(meta.goal) || 8000
  const totalPoints = useMemo(() => getTotalPoints(logs), [logs])
  const level = useMemo(() => getLevel(totalPoints), [totalPoints])
  const today = useMemo(() => getTodayTotals(logs), [logs])
  const todayPoints = Math.round(today.steps / 250 + today.pomodoro * 4 + today.meditation * 5 + today.sudoku * 70)
  const streak = useMemo(() => getCurrentStreak(logs), [logs])
  const recentDays = useMemo(() => getRecentActiveDays(logs), [logs])
  const quests = useMemo(() => getQuests(logs, goal), [logs, goal])
  const achievements = useMemo(() => getAchievements(logs), [logs])
  const rewardCount = meta.rewardCount || 0
  const rewardReady = Boolean(user && allQuestsComplete(quests) && meta.lastClaimedDate !== todayKey())

  async function persistMeta(partial: WellnessMeta) {
    setMeta(prev => ({ ...prev, ...partial }))
    if (!user || !token) return
    await fetch('/api/meta', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ meta: partial }),
    })
  }

  async function saveIntention() {
    setSaveState('saving')
    try {
      await persistMeta({ intention: intentionDraft.trim() })
      setSaveState('saved')
      window.setTimeout(() => setSaveState('idle'), 1400)
    } catch (error) {
      console.error(error)
      setSaveState('idle')
    }
  }

  async function claimReward() {
    try {
      await persistMeta({ rewardCount: rewardCount + 1, lastClaimedDate: todayKey() })
    } catch (error) {
      console.error(error)
    }
  }

  const buildData = (type: string, color: string) => {
    const filtered = logs.filter(entry => entry.type === type).sort((a, b) => a.date.localeCompare(b.date))
    return {
      labels: filtered.map(entry => entry.date.slice(5)),
      datasets: [
        {
          label: type,
          data: filtered.map(entry => entry.value),
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2,
          pointRadius: 2,
          tension: 0.38,
        },
      ],
    }
  }

  return (
    <div className="dashboard sanctuary-shell">
      <section className="overview-grid">
        <article className="sanctuary-story card fade-rise">
          <div className="section-kicker">Sanctuary</div>
          <h2>{user ? `Welcome back, ${user}.` : 'A softer rhythm for ambitious days.'}</h2>
          <p>
            Zenflow now rewards consistency with calm. Build focus, breath, and movement without turning your day into a scoreboard.
          </p>
          <div className="story-ribbon">
            <span>Quiet points</span>
            <span>Gentle streaks</span>
            <span>Unlockable rituals</span>
          </div>
        </article>

        <article className="level-card card fade-rise">
          <div className="section-kicker">Sanctuary Points</div>
          <div className="level-row">
            <div>
              <div className="big-number">{totalPoints}</div>
              <div className="subtle-line">Level {level.level} resident</div>
            </div>
            <div className="reward-badge">{rewardCount} rewards</div>
          </div>
          <div className="progress-rail">
            <span style={{ width: `${level.progress}%` }} />
          </div>
          <p className="muted">{level.nextLevelIn} points until the next sanctuary tier.</p>
          <div className="mini-stats">
            <div>
              <strong>{todayPoints}</strong>
              <span>today</span>
            </div>
            <div>
              <strong>{streak}</strong>
              <span>day streak</span>
            </div>
            <div>
              <strong>{recentDays}/7</strong>
              <span>active days</span>
            </div>
          </div>
        </article>

        <article className="intention-card card fade-rise">
          <div className="section-kicker">Daily Intention</div>
          <textarea
            className="intention-input"
            value={intentionDraft}
            onChange={(event) => setIntentionDraft(event.target.value)}
            placeholder="Write a gentle sentence for today: move slowly, focus deeply, leave room to breathe."
          />
          <div className="intention-actions">
            <button onClick={saveIntention} disabled={!user || saveState === 'saving'}>
              {saveState === 'saving' ? 'Saving...' : 'Save intention'}
            </button>
            <span className="muted">{user ? (saveState === 'saved' ? 'Saved.' : 'Stored in your account.') : 'Login to keep this.'}</span>
          </div>
        </article>
      </section>

      <section className="quest-grid">
        <article className="quest-board card fade-rise">
          <div className="section-heading">
            <div>
              <div className="section-kicker">Daily Rituals</div>
              <h3>Three gentle wins for the day</h3>
            </div>
            <button className="ghost-btn" onClick={claimReward} disabled={!rewardReady}>
              {rewardReady ? `Claim ${getRewardTitle(rewardCount)}` : meta.lastClaimedDate === todayKey() ? 'Reward claimed today' : 'Complete all rituals'}
            </button>
          </div>
          <div className="quest-list">
            {quests.map((quest) => {
              const progress = Math.max(6, Math.round((quest.progress / quest.target) * 100))
              return (
                <div key={quest.id} className="quest-row">
                  <div className="quest-copy">
                    <strong>{quest.title}</strong>
                    <span>{quest.detail}</span>
                  </div>
                  <div className="quest-meter">
                    <div className="progress-rail small">
                      <span style={{ width: `${Math.min(100, progress)}%` }} />
                    </div>
                    <div className="quest-meta">
                      <span>{Math.round(quest.progress)} / {quest.target} {quest.unit}</span>
                      <span>+{quest.reward}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </article>

        <article className="reward-card card fade-rise">
          <div className="section-kicker">Reward Shelf</div>
          <h3>{rewardCount > 0 ? getRewardTitle(rewardCount - 1) : 'Your first reward is waiting'}</h3>
          <p>
            Rewards here are symbolic by design: a calmer ritual, a small celebration, and a visual reminder that consistency compounds.
          </p>
          <div className="achievement-list">
            {achievements.map((achievement) => (
              <div key={achievement.id} className={`achievement-pill ${achievement.unlocked ? 'unlocked' : ''}`}>
                <strong>{achievement.title}</strong>
                <span>{achievement.detail}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="history-layout">
        <article className="history-card card fade-rise">
          <div className="section-heading">
            <div>
              <div className="section-kicker">History</div>
              <h3>Your recent rhythm</h3>
            </div>
            <div className="today-summary">
              <span>{today.pomodoro} focus min</span>
              <span>{today.meditation} meditation min</span>
              <span>{today.steps} steps</span>
              <span>{today.sudoku} puzzles</span>
            </div>
          </div>
          {user && logs.length > 0 ? (
            <div className="history-charts">
              <div className="chart-block">
                <div className="chart-label">Focus</div>
                <Line options={chartOptions} data={buildData('pomodoro', '#bc6c47')} />
              </div>
              <div className="chart-block">
                <div className="chart-label">Meditation</div>
                <Line options={chartOptions} data={buildData('meditation', '#6b8f71')} />
              </div>
              <div className="chart-block">
                <div className="chart-label">Steps</div>
                <Line options={chartOptions} data={buildData('steps', '#d4a373')} />
              </div>
              <div className="chart-block">
                <div className="chart-label">Sudoku</div>
                <Line options={chartOptions} data={buildData('sudoku', '#8b6f9b')} />
              </div>
            </div>
          ) : (
            <div className="empty-panel">
              <h4>No rhythm logged yet</h4>
              <p>Finish one focus block, one breathing session, or update your steps to start building your sanctuary history.</p>
            </div>
          )}
        </article>
      </section>

      <div className="feature-grid">
        {features.map((feature) => (
          <button key={feature.id} className="feature-card fade-rise" onClick={() => onSelect(feature.id)}>
            <div className="feature-sigil">{feature.sigil}</div>
            <div className="feature-stack">
              <div className="feature-title">{feature.title}</div>
              <div className="feature-desc">{feature.desc}</div>
              <div className="feature-reward">{feature.reward}</div>
            </div>
            <div className="arrow">&gt;</div>
          </button>
        ))}
      </div>
    </div>
  )
}
