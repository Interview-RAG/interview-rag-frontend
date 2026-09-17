import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutGrid, Repeat, MessageSquare, FileText, TrendingUp,
  Plus, Trash2, BookOpen, Download, LogOut, UserMinus,
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import { useCollection } from '../contexts/CollectionContext';

const NAV = [
  { id: 'collection', label: 'Collections', icon: LayoutGrid, path: '/collection' },
  { id: 'practice', label: 'Practice', icon: Repeat, path: '/practice' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, path: '/chat' },
  { id: 'resume', label: 'Resume Hub', icon: FileText, path: '/resume' },
  { id: 'progress', label: 'Progress', icon: TrendingUp, path: '/progress' },
];

const relativeWhen = (iso) => {
  if (!iso) return '';
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '';
  const days = Math.floor((Date.now() - then.getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return then.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function Sidebar({ API_BASE, handleDownloadPDF, showToast }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { sessions, activeSession, loadSession, createNewSession, deleteSession } = useSession();
  const { qas, dueCount, progress } = useCollection();
  const [query, setQuery] = useState('');

  if (!user) return null;

  const current = NAV.find((n) => location.pathname.startsWith(n.path))?.id || 'collection';
  const isChat = current === 'chat';

  const filtered = sessions.filter((s) => s.title.toLowerCase().includes(query.toLowerCase()));

  const badgeFor = (id) => {
    if (id === 'collection') return qas.length ? String(qas.length) : '';
    if (id === 'practice') return dueCount ? String(dueCount) : '';
    return '';
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Permanently delete your account? This cannot be undone.')) return;
    try {
      await axios.delete(`${API_BASE}/user`);
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Failed to delete account', err);
      showToast?.('Failed to delete account');
    }
  };

  const initials = (user.email || 'U').slice(0, 2).toUpperCase();
  const streak = progress?.streak || 0;
  const subtitle = streak > 0
    ? `${streak}-day streak`
    : dueCount > 0 ? `${dueCount} due today` : user.email;

  return (
    <aside
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '22px 12px 14px',
        minHeight: 0,
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px 24px',
          fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17,
        }}
      >
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block' }} />
        PrepAI
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map((n) => {
          const active = current === n.id;
          const badge = badgeFor(n.id);
          return (
            <button
              key={n.id}
              onClick={() => navigate(n.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 12,
                font: 'inherit', fontSize: 14, textAlign: 'left',
                border: 0, cursor: 'pointer',
                background: active ? 'var(--color-surface)' : 'transparent',
                color: 'var(--color-text)',
                fontWeight: active ? 700 : 400,
                boxShadow: active ? 'var(--shadow-sm)' : 'none',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--color-surface)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <n.icon size={16} color={active ? 'var(--color-accent)' : 'currentColor'} />
              {n.label}
              {badge && <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.55 }}>{badge}</span>}
            </button>
          );
        })}
      </nav>

      {isChat && (
        <div style={{ marginTop: 22, flex: 1, minHeight: 150, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px 6px' }}>
            <span className="text-muted" style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Recent chats
            </span>
            <button onClick={createNewSession} className="btn btn-ghost" style={{ padding: '2px 6px' }} title="New chat">
              <Plus size={14} />
            </button>
          </div>

          <div style={{ padding: '0 12px 8px' }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats"
              className="input"
              style={{ minHeight: 32, fontSize: 12.5, padding: '6px 12px', borderRadius: 999 }}
            />
          </div>

          <div style={{ overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filtered.map((s) => {
              const active = s.id === activeSession?.id;
              return (
                <button
                  key={s.id}
                  onClick={() => loadSession(s)}
                  className="group"
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 6,
                    padding: '8px 12px', borderRadius: 12,
                    font: 'inherit', textAlign: 'left', border: 0, cursor: 'pointer',
                    background: active ? 'var(--color-surface)' : 'transparent',
                    color: 'var(--color-text)',
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--color-surface)'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span
                      style={{
                        fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap', fontWeight: active ? 700 : 400,
                      }}
                    >
                      {s.title}
                    </span>
                    <span className="text-muted" style={{ fontSize: 11 }}>{relativeWhen(s.created_at)}</span>
                  </span>
                  <Trash2
                    size={12}
                    onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                    style={{ marginTop: 3, flexShrink: 0, opacity: 0.45 }}
                  />
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-muted" style={{ fontSize: 12, padding: '16px 12px', margin: 0 }}>
                {sessions.length === 0 ? 'No chats yet' : `No chats match “${query}”`}
              </p>
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FooterButton icon={BookOpen} label="Documentation" onClick={() => navigate('/docs')} />
        <FooterButton icon={Download} label="Export study guide" onClick={handleDownloadPDF} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 12px 4px' }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: '50%', background: 'var(--color-accent)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </div>
            <div className="text-muted" style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {subtitle}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-ghost"
            title="Sign out"
            style={{ padding: 6, color: 'var(--color-text)', opacity: 0.6 }}
          >
            <LogOut size={14} />
          </button>
          <button
            onClick={handleDeleteAccount}
            className="btn btn-ghost"
            title="Delete account"
            style={{ padding: 6, color: 'var(--color-text)', opacity: 0.6 }}
          >
            <UserMinus size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function FooterButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 12px', borderRadius: 12,
        font: 'inherit', fontSize: 13, textAlign: 'left',
        border: 0, cursor: 'pointer', background: 'transparent',
        color: 'var(--color-text)', opacity: 0.8,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}
