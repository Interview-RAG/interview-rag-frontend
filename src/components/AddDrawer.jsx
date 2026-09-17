import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { X, Upload, Sparkles } from 'lucide-react';
import { useCollection } from '../contexts/CollectionContext';

export default function AddDrawer({ open, onClose, API_BASE, showToast }) {
  const { refresh, refreshProgress } = useCollection();
  const fileRef = useRef(null);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [tags, setTags] = useState([]);
  const [tagDraft, setTagDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [starUsed, setStarUsed] = useState(false);

  const reset = () => {
    setQuestion('');
    setAnswer('');
    setTags([]);
    setTagDraft('');
    setStarUsed(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Suggest tags once the question settles, and only while none are chosen.
  useEffect(() => {
    if (!open || tags.length > 0 || question.trim().length < 12) return;
    const timer = setTimeout(async () => {
      try {
        const res = await axios.post(`${API_BASE}/qa/suggest-tags`, { question });
        if (res.data.tags?.length) setTags(res.data.tags);
      } catch {
        /* suggestions are a convenience — silence is fine */
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [open, question, tags.length, API_BASE]);

  if (!open) return null;

  const addTag = (label) => {
    const clean = label.trim().slice(0, 32);
    if (clean && !tags.includes(clean)) setTags([...tags, clean]);
    setTagDraft('');
  };

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      showToast('Question and answer are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await axios.post(`${API_BASE}/qa`, { question, answer, tags });
      showToast(res.data.message || 'Added to your collection');
      reset();
      await refresh();
      refreshProgress();
      onClose();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Failed to add Q&A');
    } finally {
      setSaving(false);
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(`${API_BASE}/qa/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast(res.data.message);
      if (res.data.added > 0) {
        await refresh();
        refreshProgress();
        onClose();
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      showToast(err.response?.data?.detail || 'Failed to upload file');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDraftStar = async () => {
    if (!question.trim()) {
      showToast('Write the question first.');
      return;
    }
    setDrafting(true);
    try {
      const res = await axios.post(`${API_BASE}/qa/draft-star`, { question });
      setAnswer(res.data.answer);
      setStarUsed(true);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Could not draft an answer');
    } finally {
      setDrafting(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 90,
          background: 'color-mix(in srgb, var(--color-neutral-900) 40%, transparent)',
          backdropFilter: 'blur(6px)',
        }}
      />
      <div
        style={{
          position: 'fixed', top: 14, right: 14, bottom: 14,
          width: 'min(500px, calc(100% - 28px))',
          background: 'var(--color-bg)', zIndex: 95, borderRadius: 28,
          display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)', animation: 'rise .3s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '28px 28px 8px' }}>
          <div>
            <h3 style={{ fontSize: 26, letterSpacing: '-.025em', margin: '0 0 4px' }}>Add to your collection</h3>
            <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>Saved pairs ground every future answer.</p>
          </div>
          <button
            className="btn btn-ghost"
            onClick={onClose}
            style={{ width: 36, height: 36, padding: 0, justifyContent: 'center', color: 'var(--color-text)' }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div
            style={{
              background: 'var(--color-surface)', borderRadius: 18, padding: '18px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}
          >
            <div
              style={{
                width: 40, height: 40, borderRadius: '50%', background: 'var(--color-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Upload size={18} />
            </div>
            <div style={{ flex: 1, fontSize: 13.5, lineHeight: 1.4 }}>
              <b>Have a PDF?</b>
              <br />
              <span className="text-muted">Pairs are extracted, deduplicated and tagged.</span>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf, image/png, image/jpeg, image/webp"
              onChange={(e) => handleFile(e.target.files[0])}
              style={{ display: 'none' }}
            />
            <button
              className="btn"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              style={{ background: 'var(--color-bg)', whiteSpace: 'nowrap', boxShadow: 'var(--shadow-sm)' }}
            >
              {uploading ? 'Extracting…' : 'Choose file'}
            </button>
          </div>

          <div className="field">
            <label>Question</label>
            <textarea
              rows={2}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Tell me about a time you missed a deadline."
              className="input"
              style={{ minHeight: 72, borderRadius: 16, padding: '12px 16px' }}
            />
          </div>

          <div className="field">
            <label>Answer</label>
            <textarea
              rows={7}
              value={answer}
              onChange={(e) => { setAnswer(e.target.value); setStarUsed(false); }}
              placeholder="Leave blank and the coach drafts one — or pull a STAR answer from your resume."
              className="input"
              style={{ minHeight: 170, borderRadius: 16, padding: '12px 16px' }}
            />
            <button
              className="btn btn-ghost"
              onClick={handleDraftStar}
              disabled={drafting}
              style={{ fontSize: 13, padding: '8px 4px', marginTop: 4 }}
            >
              <Sparkles size={14} />
              {drafting ? 'Drafting…' : 'Draft a STAR answer from my resume'}
            </button>
            {starUsed && (
              <p className="text-muted" style={{ fontSize: 12, margin: '2px 0 0' }}>
                Drafted from your resume. Edit freely before saving.
              </p>
            )}
          </div>

          <div className="field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label>Tags</label>
              <span className="text-muted" style={{ fontSize: 11 }}>Suggested as you type · click to remove</span>
            </div>
            <div
              style={{
                display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center',
                minHeight: 44, padding: '8px 12px',
                background: 'var(--color-neutral-100)', borderRadius: 16,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {tags.map((t) => (
                <button
                  key={t}
                  className="tag tag-accent"
                  onClick={() => setTags(tags.filter((x) => x !== t))}
                  style={{ border: 0, cursor: 'pointer', font: 'inherit', fontSize: 12, padding: '5px 12px' }}
                >
                  {t} ×
                </button>
              ))}
              <input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagDraft); }
                  if (e.key === 'Backspace' && !tagDraft && tags.length) setTags(tags.slice(0, -1));
                }}
                onBlur={() => tagDraft && addTag(tagDraft)}
                placeholder="Add tag"
                style={{
                  border: 0, background: 'transparent', fontSize: 13, outline: 'none',
                  flex: 1, minWidth: 80, color: 'inherit',
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 28px 28px', display: 'flex', gap: 8 }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ minHeight: 46, padding: '0 22px' }}
          >
            {saving ? 'Saving…' : 'Save to collection'}
          </button>
          <button
            className="btn"
            onClick={onClose}
            style={{ minHeight: 46, background: 'var(--color-surface)' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
