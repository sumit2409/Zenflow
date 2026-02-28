import React, { useState } from 'react'

type Props = { onLogin: (username: string, token: string) => void; onClose?: () => void }

export default function Login({ onLogin, onClose }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login'|'register'>('login')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password) return setError('username and password required')
    setError(null)
    setLoading(true)
    try {
      const url = mode === 'login' ? '/api/login' : '/api/register'
      const res = await fetch(url, {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({username,password})})
      // try parse json, but handle non-json (e.g. vite 404) gracefully
      let json: any = null
      try { json = await res.json() } catch(e) { /* non-json response */ }
      if (!res.ok) return setError((json && json.error) ? json.error : `Server error ${res.status}`)
      onLogin(json.username, json.token)
      onClose?.()
    } catch(err){ setError('network error') }
    finally { setLoading(false) }
  }

  return (
    <div className="login-card">
      <div className="section-kicker">{mode === 'login' ? 'Welcome back' : 'Start your first ritual'}</div>
      <h3>{mode === 'login' ? 'Pick up where your focus left off.' : 'Create your account in under a minute.'}</h3>
      <p className="muted">{mode === 'login' ? 'Your dashboard, tasks, and progress are waiting.' : 'You only need a username and password to reach the first setup checklist.'}</p>
      <form onSubmit={submit} className="login-form">
        <label>
          Username
          <input placeholder="Choose a username" value={username} onChange={e => setUsername(e.target.value)} />
        </label>
        <label>
          Password
          <input placeholder="Create a password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        {error && <div className="form-feedback error" role="alert">{error}</div>}
        {!error && loading && <div className="form-feedback">Securing your workspace...</div>}
        <div className="controls">
          <button type="submit" disabled={loading}>{mode === 'login' ? 'Return to my sanctuary' : 'Create my first reset ritual'}</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
      <div className="login-switch">
        {mode === 'login' ? (
          <small>Don&apos;t have an account? <button className="login-btn" onClick={() => setMode('register')}>Create one</button></small>
        ) : (
          <small>Already registered? <button className="login-btn" onClick={() => setMode('login')}>Sign in</button></small>
        )}
      </div>
    </div>
  )
}
