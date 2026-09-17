/**
 * The split hero used by Login and Signup: an accent panel with the pitch on
 * the left, a floating form card on the right.
 */
export default function AuthLayout({ headline, children }) {
  return (
    <div className="auth-grid">
      <div
        className="auth-hero"
        style={{
          background: 'var(--color-accent-100)',
          borderRadius: 32,
          padding: 56,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute', right: -120, bottom: -160, width: 520, height: 520,
            borderRadius: '50%', background: 'var(--color-accent)', opacity: 0.9,
          }}
        />
        <div
          style={{
            position: 'absolute', right: 120, bottom: -60, width: 260, height: 260,
            borderRadius: '50%', background: 'var(--color-bg)', opacity: 0.35,
          }}
        />

        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18,
            position: 'relative',
          }}
        >
          <span style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block' }} />
          PrepAI
        </div>

        <div style={{ position: 'relative', maxWidth: '22ch' }}>
          <h1 style={{ fontSize: 'clamp(40px,4.6vw,66px)', lineHeight: 1, letterSpacing: '-.035em', margin: '0 0 20px' }}>
            {headline}
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.5, margin: 0, maxWidth: '34ch', opacity: 0.85 }}>
            Collect the questions you meet, rehearse them with a coach that knows your resume,
            and walk in already having said it out loud.
          </p>
        </div>

        <div style={{ position: 'relative', display: 'flex', gap: 28, fontSize: 13, opacity: 0.75, flexWrap: 'wrap' }}>
          <span>Spaced practice</span>
          <span>Mock interviews</span>
          <span>Resume-aware answers</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 28 }}>
        {/* Shown only when the hero panel is hidden, so the brand survives on phones. */}
        <div
          className="auth-brand-mobile"
          style={{
            alignItems: 'center', gap: 10, alignSelf: 'flex-start',
            fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18,
          }}
        >
          <span style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block' }} />
          PrepAI
        </div>
        <div
          style={{
            width: '100%', maxWidth: 400, background: 'var(--color-surface)',
            borderRadius: 28, padding: 40, boxShadow: 'var(--shadow-lg)',
            animation: 'rise .4s ease',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthHeader({ title, sub }) {
  return (
    <>
      <h2 style={{ fontSize: 30, letterSpacing: '-.025em', margin: '0 0 6px' }}>{title}</h2>
      <p className="text-muted" style={{ fontSize: 14, margin: '0 0 28px' }}>{sub}</p>
    </>
  );
}

export function AuthField({ label, action, ...props }) {
  return (
    <div className="field">
      {action ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <label>{label}</label>
          {action}
        </div>
      ) : (
        <label>{label}</label>
      )}
      <input className="input" style={{ minHeight: 46, padding: '10px 16px' }} {...props} />
    </div>
  );
}
