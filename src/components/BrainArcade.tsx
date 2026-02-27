import React, { useEffect, useMemo, useState } from 'react'
import { playEndChime, playStartChime } from '../utils/sound'
import { todayKey } from '../utils/wellness'
import { type ProfileMeta } from '../utils/profile'

type Props = { user: string | null; token?: string | null; onRequireLogin?: () => void }

const cards = ['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D']

function shuffledDeck() {
  return [...cards]
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}

export default function BrainArcade({ user, token, onRequireLogin }: Props) {
  const [deck, setDeck] = useState<string[]>(() => shuffledDeck())
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [reactionState, setReactionState] = useState<'idle' | 'waiting' | 'go'>('idle')
  const [reactionStart, setReactionStart] = useState(0)
  const [reactionMs, setReactionMs] = useState<number | null>(null)
  const [meta, setMeta] = useState<ProfileMeta>({})

  useEffect(() => {
    async function load() {
      if (!user || !token) return
      try {
        const response = await fetch('/api/meta', { headers: { authorization: `Bearer ${token}` } })
        if (!response.ok) return
        const payload = await response.json()
        setMeta(payload.meta || {})
      } catch (error) {
        console.error(error)
      }
    }

    void load()
  }, [user, token])

  useEffect(() => {
    if (flipped.length !== 2) return
    const [first, second] = flipped
    if (deck[first] === deck[second]) {
      setMatched((prev) => [...prev, first, second])
      setFlipped([])
      return
    }
    const timeout = window.setTimeout(() => setFlipped([]), 650)
    return () => window.clearTimeout(timeout)
  }, [deck, flipped])

  useEffect(() => {
    if (matched.length === deck.length && deck.length > 0) {
      void playEndChime()
      void logArcade('memory', 1)
      const best = meta.brainArcade?.memoryBestMoves
      if (!best || moves < best) {
        void persistMeta({
          brainArcade: {
            ...(meta.brainArcade || {}),
            memoryBestMoves: moves,
          },
        })
      }
    }
  }, [deck.length, matched.length, meta.brainArcade, moves])

  async function persistMeta(partial: Partial<ProfileMeta>) {
    setMeta((prev) => ({ ...prev, ...partial }))
    if (!user || !token) return
    await fetch('/api/meta', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ meta: partial }),
    })
  }

  async function logArcade(type: string, value: number) {
    if (!user || !token) return
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ date: todayKey(), type, value }),
    })
  }

  function flipCard(index: number) {
    if (matched.includes(index) || flipped.includes(index) || flipped.length === 2) return
    const nextFlipped = [...flipped, index]
    setFlipped(nextFlipped)
    if (nextFlipped.length === 2) setMoves((prev) => prev + 1)
  }

  function resetMemory() {
    void playStartChime()
    setDeck(shuffledDeck())
    setFlipped([])
    setMatched([])
    setMoves(0)
  }

  function startReaction() {
    if (!user || !token) return onRequireLogin?.()
    setReactionState('waiting')
    setReactionMs(null)
    window.setTimeout(() => {
      setReactionState('go')
      setReactionStart(performance.now())
    }, 1200 + Math.random() * 1800)
  }

  async function handleReactionTap() {
    if (reactionState === 'waiting') {
      setReactionState('idle')
      setReactionMs(null)
      return
    }
    if (reactionState !== 'go') return
    const elapsed = Math.round(performance.now() - reactionStart)
    setReactionMs(elapsed)
    setReactionState('idle')
    void playEndChime()
    await logArcade('reaction', elapsed <= 450 ? 1 : 0)
    const best = meta.brainArcade?.reactionBestMs
    if (!best || elapsed < best) {
      void persistMeta({
        brainArcade: {
          ...(meta.brainArcade || {}),
          reactionBestMs: elapsed,
        },
      })
    }
  }

  const memoryDone = matched.length === deck.length
  const shownCards = useMemo(() => new Set([...flipped, ...matched]), [flipped, matched])

  return (
    <div>
      <div className="module-meta">
        <h2>Brain Arcade</h2>
        <p>Short, repeatable games built to interrupt passive consumption and bring your attention back online.</p>
        <div className="session-reward">Use the arcade as a reset button, not a distraction sink.</div>
      </div>

      <div className="arcade-layout">
        <section className="arcade-card card inset-card">
          <div className="section-kicker">Memory Match</div>
          <div className="memory-grid">
            {deck.map((card, index) => (
              <button key={`${card}-${index}`} className={`memory-card ${shownCards.has(index) ? 'revealed' : ''}`} onClick={() => flipCard(index)}>
                <span>{shownCards.has(index) ? card : '?'}</span>
              </button>
            ))}
          </div>
          <div className="mini-stats">
            <div>
              <strong>{moves}</strong>
              <span>moves</span>
            </div>
            <div>
              <strong>{meta.brainArcade?.memoryBestMoves || '-'}</strong>
              <span>best</span>
            </div>
            <div>
              <strong>{memoryDone ? 'Done' : 'Live'}</strong>
              <span>status</span>
            </div>
          </div>
          <div className="controls">
            <button onClick={resetMemory}>Shuffle again</button>
          </div>
        </section>

        <section className="arcade-card card inset-card">
          <div className="section-kicker">Reaction Reset</div>
          <div className={`reaction-stage ${reactionState}`}>
            <strong>{reactionState === 'go' ? 'Tap now' : reactionState === 'waiting' ? 'Wait for the signal' : 'Ready?'}</strong>
            <span>{reactionMs ? `${reactionMs} ms` : 'Keep your mind alert, not frantic.'}</span>
          </div>
          <div className="mini-stats">
            <div>
              <strong>{reactionMs ?? '-'}</strong>
              <span>latest</span>
            </div>
            <div>
              <strong>{meta.brainArcade?.reactionBestMs || '-'}</strong>
              <span>best ms</span>
            </div>
            <div>
              <strong>+55</strong>
              <span>reward</span>
            </div>
          </div>
          <div className="controls">
            <button onClick={reactionState === 'go' ? handleReactionTap : startReaction}>
              {reactionState === 'go' ? 'Tap' : 'Start reaction test'}
            </button>
            {reactionState === 'waiting' && <button onClick={handleReactionTap}>Too soon</button>}
          </div>
        </section>
      </div>
    </div>
  )
}
