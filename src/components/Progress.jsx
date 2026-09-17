import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCollection } from '../contexts/CollectionContext';

const WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
  'Eighteen', 'Nineteen', 'Twenty'];

const spell = (n) => (n >= 0 && n <= 20 ? WORDS[n] : String(n));
const lower = (n) => spell(n).toLowerCase();

const questionOf = (w) => (w?.questions?.length ? w.questions[0] : 'Untitled question');

export default function Progress() {
  const navigate = useNavigate();
  const { progress, setViewing, qas } = useCollection();

  useEffect(() => {
    document.title = 'Progress — PrepAI';
  }, []);

  if (!progress) {
    return <div className="text-muted" style={{ padding: 56 }}>Loading your progress…</div>;
  }

  const {
    bars = [], reviews_this_week: thisWeek = 0, reviews_last_week: lastWeek = 0,
    streak = 0, due_count: dueCount = 0, strong_pct: strongPct = 0,
    gap_rows: gapRows = [], untouched_skills: untouched = 0, weak = [], week_of: weekOf,
  } = progress;

  const maxBar = Math.max(1, ...bars.map((b) => b.n));
  const softSpot = gapRows.find((g) => g.count === 0)?.skill || gapRows[0]?.skill;
  const delta = thisWeek - lastWeek;

  const headline = streak > 0
    ? `${spell(streak)} ${streak === 1 ? 'day' : 'days'} in a row.${softSpot ? ` ${softSpot} is still the soft spot.` : ''}`
    : qas.length === 0
      ? 'Nothing tracked yet.'
      : 'Time to start a streak.';

  const weekLabel = weekOf
    ? new Date(weekOf).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : '';

  return (
    <div className="screen" style={{ maxWidth: 1000 }}>
      <p className="text-muted" style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>
        Progress{weekLabel ? ` · week of ${weekLabel}` : ''}
      </p>
      <h1 style={{ fontSize: 'clamp(36px,4.4vw,58px)', lineHeight: 1, letterSpacing: '-.035em', margin: '0 0 20px', maxWidth: '18ch' }}>
        {headline}
      </h1>
      <p style={{ fontSize: 18, lineHeight: 1.55, margin: '0 0 40px', maxWidth: '58ch', opacity: 0.85 }}>
        You reviewed <b>{thisWeek}</b> {thisWeek === 1 ? 'card' : 'cards'} this week
        {lastWeek > 0 || thisWeek > 0
          ? delta === 0
            ? ', the same as last week'
            : `, ${lower(Math.abs(delta))} ${delta > 0 ? 'more' : 'fewer'} than last`
          : ''}
        . <b>{dueCount}</b> {dueCount === 1 ? 'is' : 'are'} due today
        {strongPct > 0 && <>, and <b>{strongPct}%</b> of what you have rehearsed is rated Good or Easy</>}
        .{untouched > 0 && ` ${spell(untouched)} ${untouched === 1 ? 'skill' : 'skills'} on your resume still ${untouched === 1 ? 'has' : 'have'} no answers behind ${untouched === 1 ? 'it' : 'them'}.`}
      </p>

      <div className="split-wide" style={{ marginBottom: 56 }}>
        <div style={{ background: 'var(--color-bg)', borderRadius: 24, padding: '28px 30px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, letterSpacing: '-.015em' }}>
              Last 14 days
            </span>
            <span className="text-muted" style={{ fontSize: 12 }}>reviews per day</span>
          </div>
          <div className="bars-14">
            {bars.map((b) => (
              <div
                key={b.date}
                title={`${b.n} ${b.n === 1 ? 'review' : 'reviews'} on ${b.date}`}
                style={{
                  borderRadius: 999,
                  background: b.n ? 'var(--color-accent)' : 'var(--color-surface)',
                  height: b.n ? `${Math.max(8, (b.n / maxBar) * 100)}%` : 8,
                }}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            background: 'var(--color-text)', color: 'var(--color-bg)', borderRadius: 24,
            padding: '28px 30px', display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 6 }}>
              Due today
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 64, lineHeight: 1, letterSpacing: '-.03em' }}>
              {dueCount}
            </div>
          </div>
          <button
            className="btn"
            onClick={() => navigate('/practice')}
            disabled={dueCount === 0}
            style={{ background: 'var(--color-accent)', color: '#fff', alignSelf: 'flex-start', minHeight: 44 }}
          >
            Start practising<ArrowRight size={15} />
          </button>
        </div>
      </div>

      {gapRows.length > 0 && (
        <>
          <h2 style={{ fontSize: 24, letterSpacing: '-.02em', margin: '0 0 6px' }}>Resume versus collection</h2>
          <p className="text-muted" style={{ fontSize: 14, margin: '0 0 20px' }}>
            Each skill you list, against how many answers you actually have ready.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 760, marginBottom: 56 }}>
            {gapRows.map((g) => {
              const pct = Math.min(100, g.count * 25);
              return (
                <div
                  key={g.skill}
                  className="row-gap"
                  style={{
                    padding: '14px 0',
                    borderBottom: '1px solid var(--color-divider)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{g.skill}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>{g.where}</div>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: 'var(--color-bg)' }}>
                    <div
                      style={{
                        height: 8, borderRadius: 999, width: `${pct}%`,
                        background: g.count === 0 ? 'var(--color-neutral-300)' : 'var(--color-accent)',
                      }}
                    />
                  </div>
                  <div className="text-muted" style={{ fontSize: 13, textAlign: 'right' }}>{g.count} Q&amp;A</div>
                  <button
                    className="btn btn-ghost"
                    onClick={() => navigate('/chat', {
                      state: {
                        ask: g.count === 0
                          ? `Draft an interview question and answer about ${g.skill}, based on my resume.`
                          : `Quiz me on ${g.skill}.`,
                      },
                    })}
                    style={{ fontSize: 13, whiteSpace: 'nowrap', padding: '6px 10px' }}
                  >
                    {g.count === 0 ? 'Generate one' : 'Quiz me'}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {weak.length > 0 && (
        <>
          <h2 style={{ fontSize: 24, letterSpacing: '-.02em', margin: '0 0 6px' }}>Cards that keep slipping</h2>
          <p className="text-muted" style={{ fontSize: 14, margin: '0 0 20px' }}>
            Rated Again or never reviewed.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 760 }}>
            {weak.map((w) => (
              <div
                key={w.id}
                onClick={() => setViewing(w)}
                style={{
                  cursor: 'pointer', background: 'var(--color-bg)', borderRadius: 16,
                  padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{questionOf(w)}</span>
                <span className="tag tag-accent">{w.ease_label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
