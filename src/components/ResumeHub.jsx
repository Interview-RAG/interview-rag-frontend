import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, Swords, X } from 'lucide-react';
import { useCollection } from '../contexts/CollectionContext';

const DOT = {
  positive: 'var(--color-accent-500)',
  neutral: 'var(--color-neutral-400)',
  negative: 'var(--color-neutral-600)',
};

const asBullets = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return String(value).split('\n').map((s) => s.trim()).filter(Boolean);
};

export default function ResumeHub({ API_BASE, showToast }) {
  const navigate = useNavigate();
  const { qas } = useCollection();
  const fileRef = useRef(null);

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showJD, setShowJD] = useState(false);
  const [jd, setJd] = useState('');
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    document.title = 'Resume Hub — PrepAI';
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/resume`);
        if (res.data.resume) setResume(res.data.resume.parsed_data);
      } catch (err) {
        console.error('Failed to fetch resume', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [API_BASE]);

  // A skill is "covered" once some saved pair mentions or is tagged with it.
  const coverage = useMemo(() => {
    const map = new Map();
    (resume?.skills || []).forEach((skill) => {
      if (typeof skill !== 'string') return;
      const needle = skill.toLowerCase();
      const count = qas.filter((qa) => {
        if ((qa.tags || []).some((t) => t.toLowerCase() === needle)) return true;
        return `${(qa.questions || []).join(' ')} ${qa.answer || ''}`.toLowerCase().includes(needle);
      }).length;
      map.set(skill, count);
    });
    return map;
  }, [resume, qas]);

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      showToast('Only PDF files are supported');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      setUploading(true);
      showToast('Parsing resume with AI…');
      const res = await axios.post(`${API_BASE}/resume/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResume(res.data.parsed_data);
      showToast('Resume parsed');
    } catch (err) {
      console.error('Upload failed', err);
      showToast(err.response?.data?.detail || 'Failed to upload resume');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your resume? This cannot be undone.')) return;
    try {
      await axios.delete(`${API_BASE}/resume`);
      setResume(null);
      showToast('Resume deleted');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete resume');
    }
  };

  const handleScoreJD = async () => {
    if (!jd.trim()) return;
    try {
      setScoring(true);
      const res = await axios.post(`${API_BASE}/resume/match`, { job_description: jd });
      setResume((prev) => ({
        ...prev,
        ats_targeted_score: res.data.score_data,
        targeted_job_description: jd,
      }));
      setShowJD(false);
      showToast('Scored against the job description');
    } catch (err) {
      console.error(err);
      showToast('Failed to score resume');
    } finally {
      setScoring(false);
    }
  };

  if (loading) {
    return <div className="text-muted" style={{ padding: 56 }}>Loading your resume…</div>;
  }

  if (!resume) {
    return (
      <div style={{ padding: '56px 56px 72px', maxWidth: 1000 }}>
        <p className="text-muted" style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>
          Resume Hub
        </p>
        <h1 style={{ fontSize: 'clamp(40px,4.6vw,64px)', lineHeight: 0.98, letterSpacing: '-.035em', margin: '0 0 20px', maxWidth: '20ch' }}>
          Give the coach something to work with.
        </h1>
        <p style={{ fontSize: 19, lineHeight: 1.5, margin: '0 0 32px', maxWidth: '52ch' }}>
          Upload a PDF and the coach extracts your skills, experience and projects — then it can
          draft STAR answers from your real work and pressure-test your projects.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => handleFileUpload(e.target.files[0])}
          style={{ display: 'none' }}
        />
        <button
          className="btn btn-primary"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          style={{ minHeight: 48, padding: '0 24px' }}
        >
          <Upload size={15} />{uploading ? 'Parsing…' : 'Upload your resume'}
        </button>
      </div>
    );
  }

  const general = resume.ats_general_score;
  const targeted = resume.ats_targeted_score;
  const name = resume.contact_info?.name || 'Your resume';
  const experience = resume.experience || [];
  const education = resume.education || [];
  const projects = resume.projects || [];
  const certifications = resume.certifications || [];

  return (
    <div style={{ padding: '56px 56px 72px', maxWidth: 1000 }}>
      <p className="text-muted" style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>
        Resume Hub · parsed from your PDF
      </p>
      <h1 style={{ fontSize: 'clamp(40px,4.6vw,64px)', lineHeight: 0.98, letterSpacing: '-.035em', margin: '0 0 20px' }}>
        {name}
      </h1>
      {resume.summary && (
        <p style={{ fontSize: 19, lineHeight: 1.5, margin: '0 0 12px', maxWidth: '52ch' }}>{resume.summary}</p>
      )}
      <p className="text-muted" style={{ fontSize: 14, margin: '0 0 28px' }}>
        {[resume.contact_info?.email, resume.contact_info?.phone, resume.contact_info?.linkedin]
          .filter(Boolean)
          .join(' · ')}
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        onChange={(e) => handleFileUpload(e.target.files[0])}
        style={{ display: 'none' }}
      />
      <div style={{ display: 'flex', gap: 8, marginBottom: 48, flexWrap: 'wrap' }}>
        <button
          className="btn"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          style={{ background: 'var(--color-bg)', boxShadow: 'var(--shadow-sm)' }}
        >
          <Upload size={14} />{uploading ? 'Parsing…' : 'Replace PDF'}
        </button>
        <button className="btn btn-ghost" onClick={handleDelete}>Delete resume</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16, marginBottom: 56 }}>
        <div style={{ background: 'var(--color-bg)', borderRadius: 24, padding: '28px 30px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 6 }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 56, lineHeight: 1, letterSpacing: '-.03em' }}>
              {general?.score ?? '—'}
            </span>
            <span className="text-muted" style={{ fontSize: 14 }}>general ATS score</span>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: 'var(--color-surface)', margin: '10px 0 18px' }}>
            <div style={{ height: 6, borderRadius: 999, width: `${general?.score || 0}%`, background: 'var(--color-text)' }} />
          </div>
          <FeedbackList items={general?.feedback} />
        </div>

        <div style={{ background: 'var(--color-accent-100)', borderRadius: 24, padding: '28px 30px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 6 }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 56,
                lineHeight: 1, letterSpacing: '-.03em', color: 'var(--color-accent)',
              }}
            >
              {targeted?.score ?? '—'}
            </span>
            <span style={{ fontSize: 14, opacity: 0.75 }}>
              {targeted ? 'match · your target role' : 'no job description yet'}
            </span>
          </div>
          <div
            style={{
              height: 6, borderRadius: 999, margin: '10px 0 18px',
              background: 'color-mix(in srgb, var(--color-accent) 18%, transparent)',
            }}
          >
            <div style={{ height: 6, borderRadius: 999, width: `${targeted?.score || 0}%`, background: 'var(--color-accent)' }} />
          </div>
          {targeted ? (
            <FeedbackList items={targeted.feedback} />
          ) : (
            <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0, opacity: 0.8 }}>
              Paste the job description you are targeting and the coach scores your resume
              against its actual keywords.
            </p>
          )}
          <button className="btn btn-ghost" onClick={() => setShowJD(true)} style={{ marginTop: 12, paddingLeft: 0 }}>
            {targeted ? 'Change job description →' : 'Add a job description →'}
          </button>
        </div>
      </div>

      {coverage.size > 0 && (
        <>
          <h2 style={{ fontSize: 24, letterSpacing: '-.02em', margin: '0 0 6px' }}>What you claim to know</h2>
          <p className="text-muted" style={{ fontSize: 14, margin: '0 0 16px' }}>
            Filled skills have Q&amp;As behind them. Outlined ones don&apos;t yet —{' '}
            <a href="#progress" onClick={(e) => { e.preventDefault(); navigate('/progress'); }}>see the gap</a>.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 56 }}>
            {[...coverage.entries()].map(([skill, count]) => (
              <span
                key={skill}
                title={count ? `${count} Q&A behind this` : 'No answers yet'}
                style={{
                  fontSize: 14, padding: '8px 16px', borderRadius: 999,
                  background: count ? 'var(--color-accent-100)' : 'transparent',
                  color: count ? 'var(--color-accent-800)' : 'var(--color-text)',
                  border: `1px solid ${count ? 'transparent' : 'var(--color-divider)'}`,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </>
      )}

      {(experience.length > 0 || education.length > 0) && (
        <>
          <h2 style={{ fontSize: 24, letterSpacing: '-.02em', margin: '0 0 24px' }}>Where you learned it</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36, marginBottom: 56, maxWidth: 720 }}>
            {experience.map((e, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '150px minmax(0,1fr)', gap: 20 }}>
                <div className="text-muted" style={{ fontSize: 13, lineHeight: 1.5, paddingTop: 4 }}>
                  {[e.start_date, e.end_date].filter(Boolean).join(' – ')}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, letterSpacing: '-.015em' }}>
                    {e.role}
                  </div>
                  <div style={{ fontSize: 14, marginBottom: 10, color: 'var(--color-accent-700)' }}>{e.company}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14.5, lineHeight: 1.55 }}>
                    {asBullets(e.description).map((b, j) => <p key={j} style={{ margin: 0 }}>{b}</p>)}
                  </div>
                </div>
              </div>
            ))}

            {education.map((ed, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '150px minmax(0,1fr)', gap: 20 }}>
                <div className="text-muted" style={{ fontSize: 13, paddingTop: 4 }}>
                  {[ed.start_date, ed.end_date].filter(Boolean).join(' – ')}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, letterSpacing: '-.015em' }}>
                    {[ed.degree, ed.field_of_study].filter(Boolean).join(', ')}
                  </div>
                  <div className="text-muted" style={{ fontSize: 14 }}>
                    {[ed.institution, ...certifications.map((c) => `${c.name}${c.date ? `, ${c.date}` : ''}`)]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {projects.length > 0 && (
        <>
          <h2 style={{ fontSize: 24, letterSpacing: '-.02em', margin: '0 0 6px' }}>
            Projects an interviewer will dig into
          </h2>
          <p className="text-muted" style={{ fontSize: 14, margin: '0 0 20px' }}>
            Run a pressure test and the coach will interrogate one of these.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 16 }}>
            {projects.map((p, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--color-bg)', borderRadius: 24, padding: 28,
                  boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 12,
                }}
              >
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, letterSpacing: '-.02em' }}>
                  {p.name}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, lineHeight: 1.55, opacity: 0.85, flex: 1 }}>
                  {asBullets(p.description).map((b, j) => <p key={j} style={{ margin: 0 }}>{b}</p>)}
                </div>
                {(p.technologies || []).length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {p.technologies.map((t) => <span key={t} className="tag tag-neutral">{t}</span>)}
                  </div>
                )}
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/chat', {
                    state: { ask: `Pressure-test me on ${p.name}. Start with the architecture.` },
                  })}
                  style={{ alignSelf: 'flex-start', marginTop: 6 }}
                >
                  <Swords size={14} />Pressure test this
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {showJD && (
        <div
          className="dialog-backdrop"
          onClick={() => setShowJD(false)}
          style={{
            zIndex: 120,
            background: 'color-mix(in srgb, var(--color-neutral-900) 40%, transparent)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            className="dialog"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(560px, 100%)', borderRadius: 28, padding: 32,
              background: 'var(--color-bg)', gap: 0, animation: 'rise .3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 24, letterSpacing: '-.025em', margin: '0 0 6px' }}>Target a role</h3>
                <p className="text-muted" style={{ fontSize: 13.5, margin: '0 0 20px' }}>
                  Paste the job description. Your resume is scored against its keywords.
                </p>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => setShowJD(false)}
                style={{ width: 36, height: 36, padding: 0, justifyContent: 'center', color: 'var(--color-text)' }}
              >
                <X size={16} />
              </button>
            </div>
            <textarea
              className="input"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the full job description…"
              style={{ minHeight: 200, borderRadius: 16, padding: '14px 16px' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-primary" onClick={handleScoreJD} disabled={scoring || !jd.trim()} style={{ minHeight: 46 }}>
                {scoring ? 'Scoring…' : 'Score my resume'}
              </button>
              <button className="btn" onClick={() => setShowJD(false)} style={{ minHeight: 46, background: 'var(--color-surface)' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackList({ items }) {
  if (!items?.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, lineHeight: 1.5 }}>
      {items.map((f, i) => (
        <div key={i} style={{ display: 'flex', gap: 10 }}>
          <span
            style={{
              width: 8, height: 8, borderRadius: '50%', marginTop: 7, flexShrink: 0,
              background: DOT[f.type] || DOT.neutral,
            }}
          />
          <span>{f.message}</span>
        </div>
      ))}
    </div>
  );
}
