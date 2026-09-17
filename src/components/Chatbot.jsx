import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, Check, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

import { useSession } from '../contexts/SessionContext';
import { useAuth } from '../contexts/AuthContext';
import { useCollection } from '../contexts/CollectionContext';

const MODES = {
  coach: {
    label: 'Coach',
    kicker: 'Coach mode',
    headline: 'Ask, critique, draft. Grounded in what you saved.',
    placeholder: 'Ask a follow-up, or say “save that as a Q&A”…',
  },
  mock: {
    label: 'Mock interview',
    kicker: 'Mock interview',
    headline: 'One question at a time. Answer as you would in the room.',
    placeholder: 'Answer out loud, then type the short version…',
  },
  pressure: {
    label: 'Pressure test',
    kicker: 'Pressure test',
    headline: 'Pick a project. Expect the follow-ups to hurt.',
    placeholder: 'Defend a decision you made on this project…',
  },
  jobs: {
    label: 'Jobs',
    kicker: 'Job search',
    headline: 'Roles opened this week, matched to your resume.',
    placeholder: 'Find me backend roles in Bangalore posted this week…',
  },
};

const TOOL_LABELS = {
  search_knowledge_base: 'Searching your collection',
  get_resume: 'Reading your resume',
  search_jobs: 'Searching job boards',
  search_web: 'Searching the internet',
  save_user_fact: 'Updating your profile',
  save_qa_to_collection: 'Drafting Q&A',
};

export default function Chatbot({ API_BASE, showToast }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    activeSession, messages, setMessages, loading, setLoading,
    updateSessionTitle, setSessions, setActiveSession,
  } = useSession();
  const { refresh: refreshCollection } = useCollection();

  const [input, setInput] = useState('');
  const [mode, setMode] = useState('coach');
  const [project, setProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [pending, setPending] = useState(null);
  const [currentTool, setCurrentTool] = useState(null);
  const [approvalData, setApprovalData] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const endRef = useRef(null);

  const meta = MODES[mode];
  const initials = (user?.email || 'U').slice(0, 2).toUpperCase();
  const isNew = messages.length <= 1;

  useEffect(() => {
    document.title = activeSession ? `${activeSession.title} — PrepAI` : 'Chat — PrepAI';
  }, [activeSession]);

  useEffect(() => {
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [messages, currentTool, approvalData]);

  // Arriving from an "Ask the coach" button. `ask` is sent for you — the
  // button promised a question, so making the user press Enter again is just
  // a dead end. `prefill` only populates the box, for anything you'd want to
  // edit first.
  useEffect(() => {
    const incoming = location.state;
    if (!incoming?.ask && !incoming?.prefill) return;

    if (incoming.ask) {
      // These buttons all want critique or questioning, which is Coach mode.
      // Mock and Pressure would answer with a question of their own.
      setMode('coach');
      setPending(incoming.ask);
    } else {
      setInput(incoming.prefill);
    }
    navigate(location.pathname, { replace: true, state: {} });
  }, [location, navigate]);

  // Held until the session exists and nothing else is streaming.
  useEffect(() => {
    if (pending && activeSession && !loading) {
      const text = pending;
      setPending(null);
      sendMessage(text);
    }
    // sendMessage is intentionally omitted: it is recreated every render and
    // `pending` is cleared before dispatch, so this can only fire once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, activeSession, loading]);

  // Pressure test needs something to interrogate.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/resume`);
        const parsed = res.data?.resume?.parsed_data;
        if (!cancelled && parsed?.projects) {
          setProjects(parsed.projects.map((p) => p.name).filter(Boolean).slice(0, 4));
        }
      } catch {
        /* no resume yet — pressure test just runs without a preset project */
      }
    })();
    return () => { cancelled = true; };
  }, [API_BASE]);

  const sendMessage = async (text) => {
    const userMessage = (text || '').trim();
    if (!userMessage || !activeSession || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);
    setCurrentTool(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query: userMessage,
          session_id: activeSession.id,
          mode,
          project: mode === 'pressure' ? project : null,
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (!value) continue;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.substring(6));

            if (data.type === 'session_title') {
              setSessions((prev) => prev.map((s) => (s.id === activeSession.id ? { ...s, title: data.title } : s)));
              setActiveSession((prev) => ({ ...prev, title: data.title }));
            } else if (data.type === 'tool_start') {
              setCurrentTool(TOOL_LABELS[data.name] || 'Using tool');
            } else if (data.type === 'tool_end') {
              setCurrentTool(null);
            } else if (data.type === 'requires_approval') {
              setMessages((prev) => [...prev, { role: 'bot', text: data.answer_msg }]);
              setApprovalData({ ...data, approvals: data.approvals.map((a) => ({ ...a, approved: true })) });
            } else if (data.type === 'final_answer') {
              setMessages((prev) => [...prev, { role: 'bot', text: data.content }]);
            } else if (data.type === 'error') {
              setMessages((prev) => [...prev, { role: 'bot', text: data.message }]);
            }
          } catch (err) {
            console.error('Error parsing JSON from stream:', err);
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [...prev, { role: 'bot', text: 'Sorry, I encountered an error answering your question.' }]);
    } finally {
      setLoading(false);
      setCurrentTool(null);
    }
  };

  const handleApproveSave = async () => {
    if (!approvalData) return;
    setLoading(true);
    const payload = {
      session_id: activeSession.id,
      approvals: approvalData.approvals.map((item) => ({
        tool_call_id: item.tool_call_id,
        question: item.question,
        answer: item.answer,
        approved: item.approved,
      })),
    };
    setApprovalData(null);
    try {
      const res = await axios.post(`${API_BASE}/chat/approve-save`, payload);
      setMessages((prev) => [...prev, { role: 'bot', text: res.data.answer }]);
      await refreshCollection();
      showToast('Saved to your collection');
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: 'bot', text: 'Error processing approval.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleRenameSubmit = async () => {
    if (editTitle.trim() && editTitle !== activeSession?.title) {
      await updateSessionTitle(activeSession.id, editTitle.trim());
      showToast('Chat renamed');
    }
    setIsEditingTitle(false);
  };

  const startEditing = () => {
    if (!activeSession) return;
    setEditTitle(activeSession.title);
    setIsEditingTitle(true);
  };

  const headline = isNew || !activeSession ? meta.headline : activeSession.title;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="chat-head">
        <p className="text-muted" style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>
          {meta.kicker}
        </p>

        {isEditingTitle ? (
          <input
            autoFocus
            className="input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
            onBlur={handleRenameSubmit}
            style={{
              fontFamily: 'var(--font-heading)', fontWeight: 800,
              fontSize: 28, letterSpacing: '-.03em', minHeight: 48,
              padding: '4px 12px', marginBottom: 18, maxWidth: '24ch',
            }}
          />
        ) : (
          <h1
            className="chat-title"
            onClick={isNew ? undefined : startEditing}
            title={isNew ? undefined : 'Click to rename'}
            style={{
              fontSize: 'clamp(28px,3vw,38px)', lineHeight: 1.05, letterSpacing: '-.03em',
              margin: '0 0 18px', maxWidth: '24ch',
              cursor: isNew ? 'default' : 'text',
            }}
          >
            {headline}
          </h1>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', paddingBottom: 20 }}>
          <div style={{ display: 'inline-flex', background: 'var(--color-bg)', borderRadius: 999, padding: 4, boxShadow: 'var(--shadow-sm)' }}>
            {Object.entries(MODES).map(([id, m]) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                style={{
                  font: 'inherit', fontSize: 13, padding: '8px 16px', borderRadius: 999,
                  border: 0, cursor: 'pointer',
                  background: mode === id ? 'var(--color-accent)' : 'transparent',
                  color: mode === id ? '#fff' : 'var(--color-text)',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {mode === 'pressure' && (
            projects.length > 0 ? (
              <>
                <span className="text-muted" style={{ fontSize: 13, marginLeft: 8 }}>on</span>
                {projects.map((name) => {
                  const active = project === name;
                  return (
                    <button
                      key={name}
                      onClick={() => setProject(active ? null : name)}
                      style={{
                        font: 'inherit', fontSize: 13, padding: '8px 14px', borderRadius: 999,
                        cursor: 'pointer', border: '1px solid var(--color-divider)',
                        background: active ? 'var(--color-accent)' : 'transparent',
                        color: active ? '#fff' : 'var(--color-text)',
                      }}
                    >
                      {name}
                    </button>
                  );
                })}
              </>
            ) : (
              <span className="text-muted" style={{ fontSize: 13, marginLeft: 8 }}>
                Upload a resume to pick a project.
              </span>
            )
          )}
        </div>
      </div>

      <div className="chat-body">
        <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 22 }}>
          {messages.map((m, idx) => (
            <Message key={idx} msg={m} initials={initials} />
          ))}

          {approvalData && (
            <ApprovalCard
              data={approvalData}
              setData={setApprovalData}
              onSave={handleApproveSave}
            />
          )}

          {currentTool && (
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-accent)', opacity: 0.5, flexShrink: 0 }} />
              <span className="text-muted" style={{ fontSize: 13, fontStyle: 'italic' }}>{currentTool}…</span>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      <div className="chat-foot">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          style={{
            maxWidth: 720, display: 'flex', gap: 8, background: 'var(--color-bg)',
            borderRadius: 999, padding: '6px 6px 6px 20px',
            boxShadow: 'var(--shadow-md)', alignItems: 'center',
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || !activeSession}
            placeholder={meta.placeholder}
            style={{
              flex: 1, border: 0, background: 'transparent', outline: 'none',
              fontSize: 15, color: 'inherit', minHeight: 40,
            }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !activeSession || !input.trim()}
            style={{ width: 44, height: 44, padding: 0, justifyContent: 'center', flexShrink: 0 }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

function Message({ msg, initials }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexDirection: isUser ? 'row-reverse' : 'row' }}>
      <div
        style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800,
          background: isUser ? 'var(--color-surface)' : 'var(--color-accent)',
          color: isUser ? 'var(--color-text)' : '#fff',
        }}
      >
        {isUser ? initials : 'AI'}
      </div>
      <div
        className={isUser ? undefined : 'markdown-content'}
        style={{
          maxWidth: '78%', fontSize: 15, lineHeight: 1.6,
          padding: isUser ? '14px 18px' : '18px 22px',
          borderRadius: 20,
          background: isUser ? 'var(--color-text)' : 'var(--color-bg)',
          color: isUser ? 'var(--color-bg)' : 'inherit',
          boxShadow: isUser ? 'none' : 'var(--shadow-sm)',
          whiteSpace: isUser ? 'pre-line' : 'normal',
        }}
      >
        {isUser ? msg.text : (
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {msg.text}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

function ApprovalCard({ data, setData, onSave }) {
  const update = (index, patch) => {
    const approvals = [...data.approvals];
    approvals[index] = { ...approvals[index], ...patch };
    setData({ ...data, approvals });
  };

  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: 'var(--color-accent)' }} />
      <div
        style={{
          maxWidth: '78%', background: 'var(--color-bg)', borderRadius: 20,
          padding: '20px 22px', boxShadow: 'var(--shadow-sm)',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
          Drafted for your collection
        </span>

        {data.approvals.map((item, index) => (
          <div
            key={item.tool_call_id}
            style={{
              display: 'flex', flexDirection: 'column', gap: 8,
              opacity: item.approved ? 1 : 0.5,
              paddingTop: index > 0 ? 14 : 0,
              borderTop: index > 0 ? '1px solid var(--color-divider)' : 'none',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12 }}>
              <span
                style={{
                  width: 18, height: 18, borderRadius: 6, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: item.approved ? 'var(--color-accent)' : 'transparent',
                  border: item.approved ? 'none' : '1px solid var(--color-divider)',
                  color: '#fff',
                }}
              >
                {item.approved && <Check size={12} />}
              </span>
              <input
                type="checkbox"
                checked={item.approved}
                onChange={(e) => update(index, { approved: e.target.checked })}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
              />
              <span className="text-muted">Include this pair</span>
            </label>

            <textarea
              value={item.question}
              onChange={(e) => update(index, { question: e.target.value })}
              rows={2}
              className="input"
              style={{
                fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16,
                lineHeight: 1.25, letterSpacing: '-.01em', borderRadius: 14,
                padding: '10px 14px', minHeight: 56, background: 'var(--color-surface)',
              }}
            />
            <textarea
              value={item.answer}
              onChange={(e) => update(index, { answer: e.target.value })}
              className="input"
              style={{
                fontSize: 13.5, lineHeight: 1.55, borderRadius: 14,
                padding: '10px 14px', minHeight: 120, background: 'var(--color-surface)',
              }}
            />
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={onSave} disabled={!data.approvals.some((a) => a.approved)}>
            Save it
          </button>
          <button className="btn btn-ghost" onClick={() => setData(null)}>
            <X size={14} />Discard
          </button>
        </div>
      </div>
    </div>
  );
}
