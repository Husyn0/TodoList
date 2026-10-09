import { Link } from 'react-router-dom';

/**
 * Shared shell for all auth pages.
 * Left panel: brand + tagline + decorative SVG.
 * Right panel: whatever the caller passes as `children`.
 */
export default function AuthShell({ children }) {
  return (
    <div className="auth-shell">
      {/* ---------- Brand panel ---------- */}
      <aside className="auth-brand">
        <div className="auth-brand-bg" aria-hidden="true">
          <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="g1" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="rgba(255,255,255,.35)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>
            <circle cx="120" cy="120" r="260" fill="url(#g1)" />
            <circle cx="500" cy="480" r="220" fill="url(#g1)" />
          </svg>
          <span className="auth-orb auth-orb-1" />
          <span className="auth-orb auth-orb-2" />
          <span className="auth-orb auth-orb-3" />
        </div>

        <div className="auth-brand-content">
          <Link to="/" className="auth-logo">
            <span className="auth-logo-text">TodoList</span>
          </Link>

          <h1 className="auth-hero">
            Plan your week.
            <br />
            Get things done.
          </h1>

          <p className="auth-sub">
            A clean, distraction-free task manager that keeps you focused on
            what matters — not on the tool.
          </p>

          <ul className="auth-features">
            <li>
              <span className="auth-feature-dot" />
              Weekly board with drag &amp; drop
            </li>
            <li>
              <span className="auth-feature-dot" />
              Recurring tasks and reminders
            </li>
            <li>
              <span className="auth-feature-dot" />
              Progress charts that actually help
            </li>
          </ul>
        </div>
      </aside>

      {/* ---------- Form panel ---------- */}
      <section className="auth-form-panel">
        <div className="auth-form-inner">{children}</div>
      </section>
    </div>
  );
}