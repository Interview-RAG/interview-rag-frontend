import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useCollection } from '../contexts/CollectionContext';

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
  'Eighteen', 'Nineteen', 'Twenty'];

const spell = (n) => (n <= 20 ? WORDS[n] : String(n));

const questionOf = (qa) => (qa.questions?.length ? qa.questions[0] : 'Untitled question');

const easeLabel = (qa) => {
  if (!qa.review_count) return 'never';
  return { again: 'Again', good: 'Good', easy: 'Easy' }[qa.last_ease] || '—';
};

const dueLabel = (qa) => {
  if (!qa.due_date) return 'today';
  const today = new Date().toISOString().slice(0, 10);
  if (qa.due_date <= today) return 'today';
  const days = Math.round((new Date(qa.due_date) - new Date(today)) / 86400000);
  if (days === 1) return 'tomorrow';
  if (days < 30) return `in ${days}d`;
  return new Date(qa.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function Collection({ onAddClick }) {
  const navigate = useNavigate();
  const { qas, loading, due, dueCount, allTags, setViewing } = useCollection();
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState(null);

  useEffect(() => {
    document.title = 'Collections — PrepAI';
  }, []);

  const filtering = Boolean(search.trim() || tag);

  const matches = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return qas.filter((qa) => {
      if (tag && !(qa.tags || []).includes(tag)) return false;
      if (!needle) return true;
      const haystack = `${(qa.questions || []).join(' ')} ${qa.answer || ''}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [qas, search, tag]);

  // The due band only leads when nothing is being filtered — a search should
  // show one flat list of results, not split them in two.
  const showDue = !filtering && dueCount > 0;
  const hero = showDue ? due[0] : null;
  const dueRest = showDue ? due.slice(1, 3) : [];
  const heroIds = new Set([hero?.id, ...dueRest.map((c) => c.id)].filter(Boolean));
  const rest = matches.filter((qa) => !heroIds.has(qa.id));

  if (loading) {
    return <div className="text-muted" style={{ padding: 56 }}>Loading your collection…</div>;
  }

  if (qas.length === 0) {
    return (
      <div style={{ padding: '56px 56px 72px', maxWidth: 1040 }}>
        <p className="text-muted" style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>
          Your collection · empty
        </p>
        <h1 style={{ fontSize: 'clamp(36px,4vw,54px)', lineHeight: 1, letterSpacing: '-.035em', margin: '0 0 16px', maxWidth: '20ch' }}>
          Nothing to rehearse yet.
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.5, margin: '0 0 32px', maxWidth: '56ch', opacity: 0.8 }}>
          Save the questions you meet — your own answers ground everything the coach says later.
        </p>
        <button className="btn btn-primary" onClick={onAddClick} style={{ minHeight: 48, padding: '0 24px' }}>
          Add your first Q&amp;A
        </button>
      </div>
    );
  }

  const restTitle = filtering
    ? `${matches.length} ${matches.length === 1 ? 'match' : 'matches'}`
    : showDue ? 'Everything else' : 'Your collection';
  const restSub = filtering
    ? tag ? `Tagged ${tag}${search.trim() ? ` · matching “${search.trim()}”` : ''}` : `Matching “${search.trim()}”`
    : showDue ? 'Not due yet — still worth a skim.' : 'Every pair here grounds the coach.';

  return (
    <div style={{ padding: '56px 56px 72px', maxWidth: 1040 }}>
      <p className="text-muted" style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>
        Your collection · {qas.length} {qas.length === 1 ? 'pair' : 'pairs'}
      </p>
      <h1 style={{ fontSize: 'clamp(36px,4vw,54px)', lineHeight: 1, letterSpacing: '-.035em', margin: '0 0 16px', maxWidth: '20ch' }}>
        {spell(qas.length)} {qas.length === 1 ? 'answer' : 'answers'} you can already say with confidence.
      </h1>
      <p style={{ fontSize: 17, lineHeight: 1.5, margin: '0 0 36px', maxWidth: '56ch', opacity: 0.8 }}>
        Every pair here grounds the coach.{' '}
        {dueCount > 0
          ? `${dueCount} ${dueCount === 1 ? 'is' : 'are'} due for review today — start with those, or browse by topic.`
          : 'Nothing is due today — you are ahead.'}
      </p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240, maxWidth: 380 }}>
          <Search
            size={15}
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}
          />
          <input
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions and answers"
            style={{ padding: '10px 16px 10px 40px', minHeight: 44, borderRadius: 999 }}
          />
        </div>
        {allTags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[null, ...allTags].map((t) => {
              const active = tag === t;
              return (
                <button
                  key={t ?? '__all'}
                  onClick={() => setTag(t)}
                  style={{
                    font: 'inherit', fontSize: 13, padding: '8px 14px', borderRadius: 999,
                    cursor: 'pointer', border: 0,
                    background: active ? 'var(--color-accent)' : 'var(--color-bg)',
                    color: active ? '#fff' : 'var(--color-text)',
                  }}
                >
                  {t ?? 'All'}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {showDue && (
        <>
          <h2 style={{ fontSize: 22, letterSpacing: '-.02em', margin: '0 0 4px' }}>Due today</h2>
          <p className="text-muted" style={{ fontSize: 14, margin: '0 0 20px' }}>
            Spaced review says these are about to fade.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)',
              gap: 16,
              marginBottom: 48,
            }}
          >
            <div
              onClick={() => setViewing(hero)}
              style={{
                cursor: 'pointer', background: 'var(--color-text)', color: 'var(--color-bg)',
                borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column', gap: 14,
                boxShadow: 'var(--shadow-md)', gridRow: dueRest.length > 1 ? 'span 2' : 'span 1',
              }}
            >
              {(hero.tags || []).length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {hero.tags.map((tg) => (
                    <span
                      key={tg}
                      style={{
                        fontSize: 11, padding: '4px 10px', borderRadius: 999,
                        background: 'color-mix(in srgb, var(--color-bg) 15%, transparent)',
                      }}
                    >
                      {tg}
                    </span>
                  ))}
                </div>
              )}
              <h3 style={{ fontSize: 28, lineHeight: 1.15, letterSpacing: '-.025em', margin: 0, color: 'inherit' }}>
                {questionOf(hero)}
              </h3>
              <p
                style={{
                  fontSize: 14, lineHeight: 1.55, margin: 0, opacity: 0.75, flex: 1,
                  display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}
              >
                {hero.answer}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, opacity: 0.7 }}>
                <span>Last rated {easeLabel(hero)}</span>
                <span>·</span>
                <span>{hero.review_count} reviews</span>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate('/practice'); }}
                  className="btn"
                  style={{ marginLeft: 'auto', background: 'var(--color-accent)', color: '#fff', fontSize: 13 }}
                >
                  Practise now
                </button>
              </div>
            </div>

            {dueRest.map((c) => (
              <div
                key={c.id}
                onClick={() => setViewing(c)}
                style={{
                  cursor: 'pointer', background: 'var(--color-bg)', borderRadius: 20,
                  padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 8,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {(c.tags || []).length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {c.tags.map((tg) => (
                      <span key={tg} className="tag tag-accent">{tg}</span>
                    ))}
                  </div>
                )}
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, lineHeight: 1.25, letterSpacing: '-.01em' }}>
                  {questionOf(c)}
                </div>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  {c.review_count} reviews · last {easeLabel(c)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 style={{ fontSize: 22, letterSpacing: '-.02em', margin: '0 0 4px' }}>{restTitle}</h2>
      <p className="text-muted" style={{ fontSize: 14, margin: '0 0 20px' }}>{restSub}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rest.map((c) => (
          <div
            key={c.id}
            onClick={() => setViewing(c)}
            style={{
              cursor: 'pointer', background: 'var(--color-bg)', borderRadius: 20,
              padding: '22px 26px', display: 'grid',
              gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1.4fr) auto',
              gap: 24, alignItems: 'center', boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div>
              {(c.tags || []).length > 0 && (
                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  {c.tags.map((tg) => (
                    <span key={tg} className="tag tag-accent">{tg}</span>
                  ))}
                </div>
              )}
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, lineHeight: 1.25, letterSpacing: '-.01em' }}>
                {questionOf(c)}
              </div>
            </div>
            <p
              style={{
                fontSize: 13.5, lineHeight: 1.55, margin: 0, opacity: 0.7,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}
            >
              {c.answer}
            </p>
            <div className="text-muted" style={{ fontSize: 12, textAlign: 'right', whiteSpace: 'nowrap' }}>
              Due {dueLabel(c)}
              <br />
              {c.review_count} reviews
            </div>
          </div>
        ))}
      </div>

      {matches.length === 0 && (
        <p className="text-muted" style={{ padding: '32px 0', fontSize: 15 }}>
          Nothing matches. Try another topic or clear the search.
        </p>
      )}
    </div>
  );
}
