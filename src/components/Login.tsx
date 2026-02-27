import React, { useState } from 'react'

type Props = { onLogin: (username: string, token: string) => void; onClose?: () => void }

export default function Login({ onLogin, onClose }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login'|'register'>('login')
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password) return setError('username and password required')
    setError(null)
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
  }

  return (
    <div className="login-card">
      <h3>{mode === 'login' ? 'Login' : 'Register'}</h3>
      <form onSubmit={submit} className="login-form">
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div style={{color:'crimson'}}>{error}</div>}
        <div className="controls">
          <button type="submit">{mode === 'login' ? 'Login' : 'Create account'}</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
      <div style={{marginTop:8}}>
        {mode === 'login' ? (
          <small>Don't have an account? <button className="login-btn" onClick={() => setMode('register')}>Create one</button></small>
        ) : (
          <small>Already registered? <button className="login-btn" onClick={() => setMode('login')}>Sign in</button></small>
        )}
      </div>
    </div>
  )
}
