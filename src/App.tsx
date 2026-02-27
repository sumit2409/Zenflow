import React, { useState } from 'react'
import Dashboard from './components/Dashboard'
import PomodoroTimer from './components/PomodoroTimer'
import MeditationTimer from './components/MeditationTimer'
import StepsTracker from './components/StepsTracker'
import Login from './components/Login'

export default function App() {
  const [selected, setSelected] = useState<string | null>(null)
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('zenflow_user'))
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('zenflow_token'))
  const [showLogin, setShowLogin] = useState(false)

  const setView = (view: string | null) => setSelected(view)

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="brand-wrap">
          <div className="brand-dot" aria-hidden />
          <div className="brand">Zenflow</div>
        </div>
        <nav className="nav" aria-label="Main navigation">
          <button className={`nav-link ${selected === null ? 'active' : ''}`} onClick={() => setView(null)}>Dashboard</button>
          <button className={`nav-link ${selected === 'pomodoro' ? 'active' : ''}`} onClick={() => setView('pomodoro')}>Pomodoro</button>
          <button className={`nav-link ${selected === 'meditation' ? 'active' : ''}`} onClick={() => setView('meditation')}>Meditation</button>
          <button className={`nav-link ${selected === 'steps' ? 'active' : ''}`} onClick={() => setView('steps')}>Steps</button>
        </nav>
        <div className="auth">
          {user ? (
            <>
              <span className="muted">{user}</span>
              <button className="login-btn" onClick={() => { setUser(null); setToken(null); localStorage.removeItem('zenflow_user'); localStorage.removeItem('zenflow_token') }}>Logout</button>
            </>
          ) : (
            <button className="login-btn" onClick={() => setShowLogin(true)}>Login</button>
          )}
        </div>
      </header>
      <main>
        {!selected ? (
          <>
            <section className="hero">
              <div className="hero-inner">
                <div>
                  <div className="eyebrow">Your personal wellness toolkit</div>
                  <h1>Focus with intensity. Recover with intention.</h1>
                  <p className="lead">Track effort, build calm, and turn daily routines into measurable momentum you can actually sustain.</p>
                  <div className="hero-tags">
                    <span>Habit tracking</span>
                    <span>Session history</span>
                    <span>Simple daily flow</span>
                  </div>
                </div>
                <div className="hero-panel">
                  <div className="hero-stat">
                    <strong>3</strong>
                    <span>Core tools</span>
                  </div>
                  <div className="hero-stat">
                    <strong>1</strong>
                    <span>Unified dashboard</span>
                  </div>
                  <div className="hero-stat">
                    <strong>24/7</strong>
                    <span>Your pace, your schedule</span>
                  </div>
                </div>
              </div>
            </section>
            <Dashboard onSelect={(id: string) => setView(id)} user={user} token={token} />
            <section className="detail-strip">
              <article className="detail-card">
                <h3>Focus Protocol</h3>
                <p>Run 25-minute deep-work sessions, then take 5-minute resets to avoid burnout and stay sharp for longer blocks.</p>
              </article>
              <article className="detail-card">
                <h3>Recovery Layer</h3>
                <p>Use short meditation windows between tasks to reset your nervous system and improve concentration quality.</p>
              </article>
              <article className="detail-card">
                <h3>Movement Baseline</h3>
                <p>Keep daily steps visible so your physical energy supports your cognitive output throughout the day.</p>
              </article>
            </section>
          </>
        ) : (
          <section className="focus-card">
            <button className="back" onClick={() => setView(null)}>&lt; Back to dashboard</button>
            {selected === 'pomodoro' && <PomodoroTimer user={user} token={token} onRequireLogin={() => setShowLogin(true)} />}
            {selected === 'meditation' && <MeditationTimer user={user} token={token} onRequireLogin={() => setShowLogin(true)} />}
            {selected === 'steps' && <StepsTracker user={user} token={token} onRequireLogin={() => setShowLogin(true)} />}
          </section>
        )}
      </main>
      {showLogin && <div className="overlay"><Login onLogin={(u, t) => { setUser(u); setToken(t); localStorage.setItem('zenflow_user', u); localStorage.setItem('zenflow_token', t); setShowLogin(false) }} onClose={() => setShowLogin(false)} /></div>}
    </div>
  )
}
