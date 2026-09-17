import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Sparkles, ArrowRight } from 'lucide-react';
import { useCollection } from '../contexts/CollectionContext';
import { reviewPrompt } from './QADetail';

// Mirrors next_interval() in backend/routes/practice.py so the rating buttons
// advertise the interval the card will actually get.
const nextInterval = (ease, current) => {
  const base = { again: 1, good: 4, easy: 10 }[ease];
  if (ease === 'again' || !current) return base;
  const grown = Math.round(current * (ease === 'good' ? 2 : 2.6));
  return Math.max(base, Math.min(grown, 365));
};

const questionOf = (qa) => (qa?.questions?.length ? qa.questions[0] : 'Untitled question');

export default function Practice({ showToast }) {
  const navigate = useNavigate();
  const { due, rateCard, gradeAnswer, refreshProgress, loading } = useCollection();

  // Snapshot the queue on entry so ratings don't reshuffle the deck underfoot.
  const [queue, setQueue] = useState(null);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState('flip');
  const [showAnswer, setShowAnswer] = useState(false);
  const [typed, setTyped] = useState('');
  const [graded, setGraded] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Practice — PrepAI';
  }, []);

  useEffect(() => {
    if (!loading && queue === null) setQueue(due);
  }, [loading, due, queue]);

  const cards = queue || [];
  const card = cards[index];
  const total = cards.length;

  const progressPct = useMemo(
    () => (total ? `${Math.round((index / total) * 100)}%` : '0%'),
    [index, total],
  );

  const resetCard = () => {
    setShowAnswer(false);
    setTyped('');
    setGraded(null);
  };

  const advance = () => {
    resetCard();
    setIndex((i) => i + 1);
  };

  const handleRate = async (ease) => {
    if (!card || busy) return;
    setBusy(true);
    try {
      const res = await rateCard(card.id, ease, { mode, score: graded?.score });
      const days = res.interval_days;
      showToast?.(`Back in ${days} ${days === 1 ? 'day' : 'days'}`);
      refreshProgress();
      advance();
    } catch (err) {
      console.error(err);
      showToast?.('Failed to save that rating');
    } finally {
      setBusy(false);
    }
  };

  const handleGrade = async () => {
    if (!card || !typed.trim() || busy) return;
    setBusy(true);
    try {
      setGraded(await gradeAnswer(card.id, typed));
      setShowAnswer(true);
    } catch (err) {
      console.error(err);
      showToast?.(err.response?.data?.detail || 'Could not grade that answer');
    } finally {
      setBusy(false);
    }
  };

  const askCoach = () => {
    if (!card) return;
    // If they typed an attempt, that is what they want judged; otherwise fall
    // back to reviewing the saved answer.
    const ask = typed.trim()
      ? [
        'I am practising this question. How did my attempt do against the answer I saved?',
        '',
        `Question: ${questionOf(card)}`,
        '',
        `My attempt: ${typed.trim()}`,
        '',
        `My saved answer: ${card.answer}`,
        '',
        'Tell me what I missed and give me a stronger version.',
      ].join('\n')
      : reviewPrompt(card);
    navigate('/chat', { state: { ask } });
  };

  const switchMode = (next) => {
    setMode(next);
    resetCard();
  };

  if (loading || queue === null) {
    return <div className="text-muted" style={{ padding: 56 }}>Loading your queue…</div>;
  }

  if (total === 0 || index >= total) {
    const done = total > 0;
    return (
      <div className="screen" style={{ maxWidth: 860, margin: '0 auto' }}>
        <p className="text-muted" style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>
          Practice
        </p>
        <h1 style={{ fontSize: 'clamp(32px,3.4vw,44px)', lineHeight: 1, letterSpacing: '-.035em', margin: '0 0 20px' }}>
          {done ? 'Deck cleared. Come back tomorrow.' : 'Nothing is due right now.'}
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.5, margin: '0 0 28px', maxWidth: '52ch', opacity: 0.85 }}>
          {done
            ? `You rated ${total} ${total === 1 ? 'card' : 'cards'}. Each one is scheduled to return just before it would have faded.`
            : 'Spaced review keeps cards out of your way until they are about to fade. Add a pair, or look at what is slipping.'}
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/progress')} style={{ minHeight: 48, padding: '0 24px' }}>
            See your progress<ArrowRight size={15} />
          </button>
          <button className="btn" onClick={() => navigate('/collection')} style={{ minHeight: 48, background: 'var(--color-bg)', boxShadow: 'var(--shadow-sm)' }}>
            Back to collection
          </button>
        </div>
      </div>
    );
  }

  const isType = mode === 'type';
  const showFlipBtn = !isType && !showAnswer;
  const showRate = !isType && showAnswer;
  const showGradeBtn = isType && !graded;

  return (
    <div className="screen" style={{ maxWidth: 860, margin: '0 auto' }}>
      <p className="text-muted" style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>
        Practice · card {index + 1} of {total}
      </p>
      <h1 style={{ fontSize: 'clamp(32px,3.4vw,44px)', lineHeight: 1, letterSpacing: '-.035em', margin: '0 0 28px' }}>
        Say it out loud. Then check yourself.
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'inline-flex', background: 'var(--color-bg)', borderRadius: 999,
            padding: 4, boxShadow: 'var(--shadow-sm)',
          }}
        >
          {[['flip', 'Flip & self-rate'], ['type', 'Type & grade']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => switchMode(id)}
              style={{
                font: 'inherit', fontSize: 13, padding: '8px 16px', borderRadius: 999,
                border: 0, cursor: 'pointer',
                background: mode === id ? 'var(--color-accent)' : 'transparent',
                color: mode === id ? '#fff' : 'var(--color-text)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 160, height: 6, borderRadius: 999, background: 'var(--color-bg)', position: 'relative' }}>
          <div
            style={{
              position: 'absolute', left: 0, top: 0, height: 6, borderRadius: 999,
              background: 'var(--color-accent)', width: progressPct, transition: 'width .3s ease',
            }}
          />
        </div>
      </div>

      {/* The stack behind the card is the rest of the deck. */}
      <div style={{ position: 'relative', paddingBottom: 18 }}>
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 6, height: 60, borderRadius: 24, background: 'var(--color-bg)', opacity: 0.5 }} />
        <div style={{ position: 'absolute', left: 12, right: 12, bottom: 12, height: 60, borderRadius: 24, background: 'var(--color-bg)', opacity: 0.8 }} />
        <div
          key={card.id}
          style={{
            position: 'relative', background: 'var(--color-bg)', borderRadius: 24, padding: 40,
            boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: 18,
            minHeight: 280, animation: 'rise .35s ease',
          }}
        >
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {(card.tags || []).map((tg) => (
              <span key={tg} className="tag tag-accent">{tg}</span>
            ))}
            <span className="text-muted" style={{ marginLeft: 'auto', fontSize: 12 }}>
              {showAnswer ? 'Answer' : 'Question'}
            </span>
          </div>

          <h2 style={{ fontSize: 30, lineHeight: 1.15, letterSpacing: '-.025em', margin: 0 }}>
            {questionOf(card)}
          </h2>

          {isType && !graded && (
            <textarea
              className="input"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Type your answer as you would say it out loud…"
              style={{ minHeight: 140, borderRadius: 16, background: 'var(--color-surface)', padding: '14px 16px' }}
            />
          )}

          {showAnswer && (
            <p style={{ fontSize: 16, lineHeight: 1.65, margin: 0, paddingTop: 16, borderTop: '1px solid var(--color-divider)', whiteSpace: 'pre-wrap' }}>
              {card.answer}
            </p>
          )}

          {graded && (
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', paddingTop: 16, borderTop: '1px solid var(--color-divider)' }}>
              <div
                style={{
                  width: 84, height: 84, borderRadius: '50%', background: 'var(--color-accent)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 30, flexShrink: 0,
                }}
              >
                {graded.score}
              </div>
              <div style={{ fontSize: 14.5, lineHeight: 1.6 }}>
                {graded.verdict && <p style={{ margin: '0 0 6px' }}>{graded.verdict}</p>}
                {graded.missed && <p style={{ margin: 0, opacity: 0.8 }}>{graded.missed}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {showFlipBtn && (
          <button className="btn btn-primary" onClick={() => setShowAnswer(true)} style={{ minHeight: 48, padding: '0 24px' }}>
            <RotateCcw size={15} />Reveal answer
          </button>
        )}

        {showGradeBtn && (
          <button
            className="btn btn-primary"
            onClick={handleGrade}
            disabled={!typed.trim() || busy}
            style={{ minHeight: 48, padding: '0 24px' }}
          >
            <Sparkles size={15} />{busy ? 'Grading…' : 'Grade my answer'}
          </button>
        )}

        {(showRate || graded) && (
          <>
            <span className="text-muted" style={{ fontSize: 13, marginRight: 6 }}>How did it go?</span>
            {[['again', 'Again'], ['good', 'Good'], ['easy', 'Easy']].map(([ease, label]) => {
              const days = nextInterval(ease, card.interval_days || 0);
              const primary = ease === 'easy';
              return (
                <button
                  key={ease}
                  className={primary ? 'btn btn-primary' : 'btn'}
                  onClick={() => handleRate(ease)}
                  disabled={busy}
                  style={primary
                    ? { minHeight: 48 }
                    : { minHeight: 48, background: 'var(--color-bg)', boxShadow: 'var(--shadow-sm)' }}
                >
                  {label}
                  <span style={{ fontSize: 11, opacity: primary ? 0.7 : 0.5, marginLeft: 6 }}>{days}d</span>
                </button>
              );
            })}
          </>
        )}

        <button className="btn btn-ghost" onClick={askCoach} style={{ marginLeft: 'auto' }}>
          Ask the coach about this →
        </button>
      </div>
    </div>
  );
}
