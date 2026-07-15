import React, { useState } from "react";
import { MessageSquare, LayoutGrid, Plus, Search, Trash2, Sparkles, Settings, LogOut, Download, UserMinus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSession } from "../contexts/SessionContext";
import axios from "axios";

const displayFont = { fontFamily: "'Fraunces', serif" };
const bodyFont = { fontFamily: "'Public Sans', sans-serif" };

const NAV = [
  { id: "collection", label: "Collections", icon: LayoutGrid, path: "/collection" },
  { id: "chat", label: "Chat", icon: MessageSquare, path: "/chat" },
];

export default function Sidebar({ onAddClick, handleDownloadPDF, API_BASE }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  
  const { 
    sessions, 
    activeSession, 
    loadSession, 
    createNewSession, 
    deleteSession 
  } = useSession();

  if (!user) return null;

  const currentView = location.pathname.includes("/chat") ? "chat" : "collection";
  const showSessions = currentView === "chat";

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      try {
        await axios.delete(`${API_BASE}/user`);
        await signOut();
        navigate('/login');
      } catch (err) {
        console.error("Failed to delete account", err);
        alert("Failed to delete account. Please try again.");
      }
    }
  };

  return (
    <aside
      style={bodyFont}
      className="w-[240px] shrink-0 bg-[#17170F] flex flex-col py-5 px-3 h-screen"
    >
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-7 h-7 rounded-[7px] bg-[#1F6E4A] flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
        <span style={displayFont} className="text-white text-[15px] font-semibold">
          InterviewRAG
        </span>
      </div>


      <p className="text-[#6E6C63] text-[10px] font-semibold uppercase tracking-[0.06em] px-2 mb-2 shrink-0">
        Workspace
      </p>
      <nav className="flex flex-col gap-0.5 shrink-0">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => navigate(n.path)}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-[7px] text-[13px] font-medium transition-colors ${
              currentView === n.id
                ? "bg-[#2A2A20] text-white"
                : "text-[#A6A399] hover:text-white hover:bg-[#2A2A20]/60"
            }`}
          >
            <n.icon size={15} />
            {n.label}
          </button>
        ))}
      </nav>

      {/* session list — only visible once Chat is the active workspace item */}
      {showSessions && (
        <div className="mt-5 pt-4 border-t border-[#2A2A20] flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between px-2 mb-2 shrink-0">
            <p className="text-[#6E6C63] text-[10px] font-semibold uppercase tracking-[0.06em]">
              Chats
            </p>
            <button
              onClick={createNewSession}
              title="New chat"
              className="w-5 h-5 rounded-[5px] flex items-center justify-center text-[#6E6C63] hover:text-white hover:bg-[#2A2A20] transition-colors"
            >
              <Plus size={13} />
            </button>
          </div>

          <div className="px-2 mb-2 shrink-0">
            <div className="relative">
              <Search
                size={11}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6E6C63]"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chats"
                style={bodyFont}
                className="w-full bg-[#2A2A20] border border-transparent rounded-[6px] pl-7 pr-2 py-1.5 text-[11.5px] text-white placeholder:text-[#6E6C63] outline-none focus:border-[#1F6E4A] transition-colors"
              />
            </div>
          </div>

          <nav className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-0.5 pr-0.5">
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => loadSession(s)}
                className={`group flex items-start gap-1.5 text-left px-2.5 py-2 rounded-[7px] transition-colors ${
                  s.id === activeSession?.id
                    ? "bg-[#2A2A20] text-white"
                    : "text-[#A6A399] hover:text-white hover:bg-[#2A2A20]/60"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] leading-snug truncate font-medium">
                    {s.title}
                  </p>
                </div>
                <Trash2
                  size={11}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(s.id);
                  }}
                  className="text-[#6E6C63] opacity-0 group-hover:opacity-100 hover:text-[#D97757] transition-opacity mt-0.5 shrink-0"
                />
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-[#6E6C63] text-[11px] px-2.5 py-4 text-center">
                No chats match "{query}"
              </p>
            )}
          </nav>
        </div>
      )}

      {/* Bottom Profile and Settings */}
      <div className={`${!showSessions ? "mt-auto" : ""} pt-4 border-t border-[#2A2A20] flex flex-col gap-2 shrink-0`}>
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-7 h-7 rounded-full bg-[#1F6E4A] flex items-center justify-center text-white text-[10px] font-semibold shrink-0 uppercase">
            {user?.email?.substring(0, 2) || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-[12px] font-medium truncate">{user?.email}</p>
          </div>
        </div>
        
        {/* Actions row */}
        <div className="flex items-center gap-1 mt-1 px-2">
           <button onClick={handleDownloadPDF} title="Export PDF" className="p-1.5 rounded-[5px] text-[#A6A399] hover:bg-[#2A2A20] hover:text-white transition-colors">
              <Download size={14} />
           </button>
           <button onClick={handleLogout} title="Logout" className="p-1.5 rounded-[5px] text-[#A6A399] hover:bg-[#2A2A20] hover:text-[#D97757] transition-colors ml-auto">
              <LogOut size={14} />
           </button>
           <button onClick={handleDeleteAccount} title="Delete Account" className="p-1.5 rounded-[5px] text-[#A6A399] hover:bg-[#2A2A20] hover:text-[#D97757] transition-colors">
              <UserMinus size={14} />
           </button>
        </div>
      </div>
    </aside>
  );
}
