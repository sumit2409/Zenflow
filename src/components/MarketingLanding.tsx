import React from 'react'

type Props = {
  onPrimaryCta: () => void
}

const problemCards = [
  {
    title: 'Scattered attention',
    problem: 'You open your laptop to work and end up in five tabs, three chats, and zero momentum.',
    mechanism: 'Zenflow turns tasks, focus sessions, and mental resets into one guided daily loop.',
    outcome: 'You recover concentration faster and convert intention into visible progress.',
  },
  {
    title: 'Passive stimulation',
    problem: 'Scrolling makes your brain busy but not sharper.',
    mechanism: 'Brain-training rooms like Sudoku and the arcade replace passive drift with active recall and reaction.',
    outcome: 'You leave breaks feeling more awake, not more foggy.',
  },
  {
    title: 'No closure',
    problem: 'Days feel full, but it is hard to see what actually moved forward.',
    mechanism: 'Tasks link directly to focus sessions, journaling, and reward loops.',
    outcome: 'You finish the day with evidence, not guilt.',
  },
]

const faqs = [
  {
    question: 'What do I do first after signing up?',
    answer: 'Set one intention, add 1 to 3 meaningful tasks, then start your first focus block. That is the fastest path to value.',
  },
  {
    question: 'Do I need to use every room every day?',
    answer: 'No. Zenflow is designed for progressive disclosure. Start with focus + tasks, then add calm, puzzles, and journaling when they help.',
  },
  {
    question: 'Is my data private?',
    answer: 'Your account data is scoped to your login, and sensitive values are stored behind your authenticated API session. The product avoids social exposure by design.',
  },
]

export default function MarketingLanding({ onPrimaryCta }: Props) {
  return (
    <>
      <section className="marketing-hero fade-rise">
        <div className="marketing-copy">
          <div className="eyebrow">Designed to fight digital brain rot</div>
          <h1>Turn distracted days into deep work, sharper thinking, and cleaner endings.</h1>
          <p className="lead">
            Zenflow combines focus, planning, journaling, and brain-training into one calm system that helps you do meaningful work instead of endlessly reacting.
          </p>
          <div className="hero-actions">
            <button className="primary-cta" onClick={onPrimaryCta}>Create my first reset ritual</button>
            <span className="cta-note">Free to start. No credit card. First win in under 3 minutes.</span>
          </div>
        </div>
        <div className="credibility-card card">
          <div className="section-kicker">Used for</div>
          <div className="credibility-grid">
            <div>
              <strong>Deep work</strong>
              <span>Task-linked Pomodoro flow</span>
            </div>
            <div>
              <strong>Mental resets</strong>
              <span>Breath, Sudoku, and arcade micro-recovery</span>
            </div>
            <div>
              <strong>Daily closure</strong>
              <span>Journal, completed tasks, and reward feedback</span>
            </div>
          </div>
          <blockquote className="testimonial">
            “It feels less like another productivity app and more like a system that brings my mind back online.”
          </blockquote>
        </div>
      </section>

      <section className="trust-strip fade-rise" aria-label="Credibility">
        <div className="trust-metric">
          <strong>3 min</strong>
          <span>to first meaningful action</span>
        </div>
        <div className="trust-metric">
          <strong>1 loop</strong>
          <span>tasks, focus, reflection, reward</span>
        </div>
        <div className="trust-metric">
          <strong>5 rooms</strong>
          <span>for focus, calm, planning, and cognition</span>
        </div>
      </section>

      <section className="marketing-section fade-rise">
        <div className="section-heading-block">
          <div className="section-kicker">Why it converts</div>
          <h2>Built around outcomes, not feature clutter</h2>
          <p>Each card explains the user problem, the mechanism inside Zenflow, and the result they can expect.</p>
        </div>
        <div className="problem-grid">
          {problemCards.map((card) => (
            <article key={card.title} className="problem-card card">
              <h3>{card.title}</h3>
              <p><strong>Problem:</strong> {card.problem}</p>
              <p><strong>Mechanism:</strong> {card.mechanism}</p>
              <p><strong>Outcome:</strong> {card.outcome}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section fade-rise">
        <div className="section-heading-block">
          <div className="section-kicker">How it works</div>
          <h2>Start narrow, then let the product widen only when useful</h2>
        </div>
        <div className="how-grid">
          <article className="how-card card">
            <strong>1. Choose today&apos;s direction</strong>
            <span>Write one intention and add a small number of important tasks.</span>
          </article>
          <article className="how-card card">
            <strong>2. Attach action to focus</strong>
            <span>Start a focus block tied to a real task so each session counts for something concrete.</span>
          </article>
          <article className="how-card card">
            <strong>3. Reset without rotting</strong>
            <span>Use breathing, Sudoku, or arcade resets to recover attention instead of losing it.</span>
          </article>
        </div>
      </section>

      <section className="marketing-section fade-rise">
        <div className="section-heading-block">
          <div className="section-kicker">How to start</div>
          <h2>Free to begin, useful on day one</h2>
        </div>
        <div className="start-card card">
          <div>
            <strong>Create your account</strong>
            <span>Unlock your private rooms, checklist, and saved progress.</span>
          </div>
          <div>
            <strong>Finish the 3-step setup</strong>
            <span>Intention, tasks, and first focus ritual.</span>
          </div>
          <div>
            <strong>Claim your first reward</strong>
            <span>Visible progress creates the retention loop without manipulation.</span>
          </div>
          <button className="primary-cta" onClick={onPrimaryCta}>Create my first reset ritual</button>
        </div>
      </section>

      <section className="marketing-section fade-rise">
        <div className="faq-grid">
          <div>
            <div className="section-kicker">FAQ</div>
            <h2>Clear answers reduce hesitation</h2>
            <div className="faq-list">
              {faqs.map((faq) => (
                <article key={faq.question} className="faq-card card">
                  <strong>{faq.question}</strong>
                  <p>{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
          <aside className="trust-card card">
            <div className="section-kicker">Privacy and trust</div>
            <h3>Designed to be persuasive without being manipulative</h3>
            <ul className="trust-list">
              <li>Single-account private workspace</li>
              <li>Reward loops framed as reinforcement, not pressure</li>
              <li>Clear feedback on save, loading, and completion states</li>
              <li>Accessible navigation and reduced-motion support</li>
            </ul>
          </aside>
        </div>
      </section>

      <footer className="site-footer fade-rise">
        <div>
          <strong>Zenflow</strong>
          <span>Mindful focus software for people who want to think clearly again.</span>
        </div>
        <div className="footer-links">
          <a href="mailto:hello@zenflow.app">Contact</a>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
        </div>
      </footer>
    </>
  )
}
