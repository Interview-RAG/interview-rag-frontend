import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X } from 'lucide-react';
import { useCollection } from '../contexts/CollectionContext';
import { API_BASE } from '../lib/api';

const questionOf = (qa) => (qa?.questions?.length ? qa.questions[0] : 'Untitled question');

/**
 * Sending the question alone gave the coach nothing to check against, so it
 * just answered from scratch. Hand it the saved answer too and ask for a
 * verdict on that answer.
 */
export const reviewPrompt = (qa) => [
  'This is a question and answer I saved in my collection. Is my answer correct and complete?',
  '',
  `Question: ${questionOf(qa)}`,
  '',
  `My saved answer: ${qa.answer || '(I have not written an answer yet.)'}`,
  '',
  'Tell me what is right, what is missing or wrong, and give me a stronger version I could say out loud.',
].join('\n');

const easeLabel = (qa) => {
  if (!qa.review_count) return 'never rated';
  return { again: 'Again', good: 'Good', easy: 'Easy' }[qa.last_ease] || '—';
};

const dueLabel = (qa) => {
  if (!qa.due_date) return 'today';
  const today = new Date().toISOString().slice(0, 10);
  if (qa.due_date <= today) return 'today';
  return new Date(qa.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function QADetail({ showToast }) {
  const navigate = useNavigate();
  const { viewing, setViewing, deleteQA, updateTags, refresh } = useCollection();

  const [editing, setEditing] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  const [tagDraft, setTagDraft] = useState('');
  const [q, setQ] = useState('');
  const [a, setA] = useState('');
  const [saving, setSaving] = useState(false);

  // Reset the local edit buffers whenever a different card is opened.
  useEffect(() => {
    if (viewing) {
      setEditing(false);
      setAddingTag(false);
      setTagDraft('');
      setQ(questionOf(viewing));
      setA(viewing.answer || '');
    }
  }, [viewing]);

  useEffect(() => {
    if (!viewing) return;
    const onKey = (e) => { if (e.key === 'Escape') setViewing(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewing, setViewing]);

  if (!viewing) return null;

  const close = () => setViewing(null);

  const handleSave = async () => {
    if (!q.trim() || !a.trim()) {
      showToast?.('Question and answer are required');
      return;
    }
    setSaving(true);
    try {
      const res = await axios.put(`${API_BASE}/qa/${viewing.id}`, { question: q, answer: a });
      setViewing(res.data);
      await refresh();
      setEditing(false);
      showToast?.('Q&A updated');
    } catch (err) {
      console.error(err);
      showToast?.(err.response?.data?.detail || 'Failed to update Q&A');
    } finally {
      setSaving(false);
    }
  };

  const commitTag = async () => {
    const label = tagDraft.trim();
    setAddingTag(false);
    setTagDraft('');
    if (!label || (viewing.tags || []).includes(label)) return;
    await updateTags(viewing.id, [...(viewing.tags || []), label]);
  };

  const removeTag = async (tag) => {
    await updateTags(viewing.id, (viewing.tags || []).filter((t) => t !== tag));
  };

  return (
    <div
      className="dialog-backdrop"
      onClick={close}
      style={{
        zIndex: 100,
        background: 'color-mix(in srgb, var(--color-neutral-900) 40%, transparent)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        className="dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(680px, 100%)', maxHeight: '88vh', overflowY: 'auto',
          gap: 0, padding: 0, borderRadius: 28, background: 'var(--color-bg)',
          animation: 'rise .3s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '22px 28px 0', flexWrap: 'wrap' }}>
          {(viewing.tags || []).map((tg) => (
            <button
              key={tg}
              className="tag tag-accent"
              onClick={() => removeTag(tg)}
              title="Remove tag"
              style={{ border: 0, cursor: 'pointer', font: 'inherit', fontSize: 11, padding: '4px 12px' }}
            >
              {tg} ×
            </button>
          ))}

          {addingTag ? (
            <input
              autoFocus
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onBlur={commitTag}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitTag();
                if (e.key === 'Escape') { setAddingTag(false); setTagDraft(''); }
              }}
              placeholder="Tag name"
              className="input"
              style={{ width: 130, minHeight: 28, fontSize: 12, padding: '4px 12px', borderRadius: 999 }}
            />
          ) : (
            <button className="btn btn-ghost" onClick={() => setAddingTag(true)} style={{ fontSize: 12, padding: '2px 8px' }}>
              + tag
            </button>
          )}

          <button
            className="btn btn-ghost"
            onClick={close}
            style={{ marginLeft: 'auto', width: 36, height: 36, padding: 0, justifyContent: 'center', color: 'var(--color-text)' }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '16px 28px 8px' }}>
          {editing ? (
            <>
              <div className="field" style={{ marginBottom: 16 }}>
                <label>Question</label>
                <textarea
                  className="input"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  style={{ minHeight: 72, borderRadius: 16, padding: '12px 16px' }}
                />
              </div>
              <div className="field">
                <label>Answer</label>
                <textarea
                  className="input"
                  value={a}
                  onChange={(e) => setA(e.target.value)}
                  style={{ minHeight: 200, borderRadius: 16, padding: '12px 16px' }}
                />
              </div>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: 28, lineHeight: 1.15, letterSpacing: '-.025em', margin: '0 0 20px' }}>
                {questionOf(viewing)}
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.65, margin: '0 0 20px', whiteSpace: 'pre-wrap' }}>
                {viewing.answer}
              </p>
              {viewing.questions?.length > 1 && (
                <p className="text-muted" style={{ fontSize: 12.5, margin: '0 0 20px' }}>
                  Also asked as: {viewing.questions.slice(1).join(' · ')}
                </p>
              )}
              <div className="text-muted" style={{ display: 'flex', gap: 20, fontSize: 12, flexWrap: 'wrap' }}>
                <span>{viewing.review_count} reviews</span>
                <span>Last rating: {easeLabel(viewing)}</span>
                <span>Due {dueLabel(viewing)}</span>
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '16px 28px 24px', flexWrap: 'wrap' }}>
          {editing ? (
            <>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button className="btn" onClick={() => setEditing(false)} style={{ background: 'var(--color-surface)' }}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={() => { close(); navigate('/practice'); }}>
                Practise this
              </button>
              <button
                className="btn"
                onClick={() => { close(); navigate('/chat', { state: { ask: reviewPrompt(viewing) } }); }}
                style={{ background: 'var(--color-surface)' }}
              >
                Ask the coach
              </button>
              <button className="btn" onClick={() => setEditing(true)} style={{ background: 'var(--color-surface)' }}>
                Edit
              </button>
              <button className="btn btn-ghost" onClick={() => deleteQA(viewing.id)} style={{ marginLeft: 'auto' }}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
