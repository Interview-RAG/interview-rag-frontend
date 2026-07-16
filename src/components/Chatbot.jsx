import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Sparkles, Loader2, Pencil, Check, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useSession } from '../contexts/SessionContext';
import { useAuth } from '../contexts/AuthContext';

const displayFont = { fontFamily: "'Fraunces', serif" };
const bodyFont = { fontFamily: "'Public Sans', sans-serif" };

function ToolRow({ label }) {
  return (
    <div className="flex items-center gap-2 pl-11">
      <Loader2 size={12} className="text-[#A6A399] animate-spin" />
      <span style={bodyFont} className="text-[#A6A399] text-[12px] italic">
        {label}…
      </span>
    </div>
  );
}

function ChatMessage({ msg, userInitials }) {
  if (msg.role === "tool") return <ToolRow label={msg.text} />;

  if (msg.role === "user") {
    return (
      <div className="flex justify-end gap-3 animate-[fadeIn_0.3s_ease]">
        <div
          style={bodyFont}
          className="max-w-[60%] bg-[#17170F] text-white text-[13.5px] leading-relaxed rounded-[12px] rounded-tr-[3px] px-4 py-3 whitespace-pre-line"
        >
          {msg.text}
        </div>
        <div className="w-8 h-8 rounded-full bg-[#1F6E4A] flex items-center justify-center text-white text-[10px] font-semibold shrink-0 uppercase">
          {userInitials}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 animate-[fadeIn_0.3s_ease]">
      <div className="w-8 h-8 rounded-full border border-[#E7E5DF] shrink-0 overflow-hidden">
        <img src="/favicon.png" alt="AI" className="w-full h-full object-cover" />
      </div>
      <div
        style={bodyFont}
        className="max-w-[80%] text-[#17170F] text-[13.5px] leading-relaxed pt-1.5 markdown-content"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {msg.text}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default function Chatbot({ API_BASE, showToast }) {
  const { user } = useAuth();
  const { activeSession, messages, setMessages, loading, setLoading, updateSessionTitle } = useSession();
  
  const [input, setInput] = useState('');
  const [currentTool, setCurrentTool] = useState(null);
  const [approvalData, setApprovalData] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const endOfMessagesRef = useRef(null);

  const isNew = messages.length <= 1;
  const userInitials = user?.email?.substring(0, 2) || "U";

  const scrollToBottom = () => {
    setTimeout(() => {
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentTool]);

  useEffect(() => {
    document.title = activeSession ? `${activeSession.title} - PrepAI` : "New Chat - PrepAI";
  }, [activeSession]);

  const getToolDisplayName = (toolName) => {
    switch(toolName) {
      case 'search_knowledge_base': return 'Searching knowledge base';
      case 'search_web': return 'Searching the internet';
      case 'save_user_fact': return 'Updating your profile';
      case 'save_qa_to_collection': return 'Drafting Q&A';
      default: return 'Using tool';
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeSession) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);
    setCurrentTool(null);

    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ query: userMessage, session_id: activeSession.id })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.substring(6);
              try {
                const data = JSON.parse(dataStr);
                
                if (data.type === 'session_title') {
                  setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, title: data.title } : s));
                  setActiveSession(prev => ({ ...prev, title: data.title }));
                } else if (data.type === 'tool_start') {
                  setCurrentTool(getToolDisplayName(data.name));
                } else if (data.type === 'tool_end') {
                  setCurrentTool(null);
                } else if (data.type === 'requires_approval') {
                  setMessages(prev => [...prev, { role: 'bot', text: data.answer_msg }]);
                  setApprovalData({
                      ...data,
                      approvals: data.approvals.map(a => ({ ...a, approved: true }))
                  });
                } else if (data.type === 'final_answer') {
                  setMessages(prev => [...prev, { role: 'bot', text: data.content }]);
                } else if (data.type === 'error') {
                  setMessages(prev => [...prev, { role: 'bot', text: data.message }]);
                }
              } catch (e) {
                console.error("Error parsing JSON from stream:", e);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error answering your question.' }]);
    } finally {
      setLoading(false);
      setCurrentTool(null);
    }
  };

  const handleApproveSave = async () => {
    if (!approvalData) return;
    setLoading(true);
    
    const dataToSend = {
      session_id: activeSession.id,
      approvals: approvalData.approvals.map(item => ({
          tool_call_id: item.tool_call_id,
          question: item.question,
          answer: item.answer,
          approved: item.approved
      }))
    };
    
    setApprovalData(null);
    try {
      const res = await axios.post(`${API_BASE}/chat/approve-save`, dataToSend);
      setMessages(prev => [...prev, { role: 'bot', text: res.data.answer }]);
      showToast("Q&A processed successfully");
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'bot', text: 'Error processing approval.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleRenameSubmit = async () => {
    if (editTitle.trim() && editTitle !== activeSession?.title) {
      await updateSessionTitle(activeSession.id, editTitle.trim());
      showToast("Chat renamed");
    }
    setIsEditingTitle(false);
  };

  const startEditing = () => {
    if (!activeSession) return;
    setEditTitle(activeSession.title);
    setIsEditingTitle(true);
  };

  return (
    <div className="flex flex-col h-full relative">
      <header className="flex items-center justify-between px-8 py-5 border-b border-[#E7E5DF] shrink-0">
        <div className="flex-1 min-w-0 pr-4">
          {isEditingTitle ? (
            <input
              style={displayFont}
              autoFocus
              className="w-full bg-white border border-[#1F6E4A] rounded-[6px] px-2 py-1 text-[19px] font-semibold text-[#17170F] outline-none"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
              onBlur={handleRenameSubmit}
            />
          ) : (
            <h1 
              style={displayFont} 
              className="text-[#17170F] text-[19px] font-semibold truncate cursor-text"
              onClick={startEditing}
              title="Click to rename"
            >
              {activeSession ? activeSession.title : "New Chat"}
            </h1>
          )}
          <p style={bodyFont} className="text-[#6E6C63] text-[12.5px] mt-0.5">
            {isNew ? "Not yet grounded — ask a question to begin" : "Grounded in your knowledge base"}
          </p>
        </div>
        <button 
          onClick={startEditing}
          title="Rename Chat"
          className="inline-flex items-center justify-center text-[#17170F] w-8 h-8 rounded-[8px] border border-[#E7E5DF] transition-colors duration-150 hover:bg-[#F1F0EB] active:scale-[0.97]"
        >
          <Pencil size={13} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-7 flex flex-col gap-5 max-w-3xl w-full mx-auto relative">
        {isNew && messages.length === 1 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-16 animate-[fadeIn_0.5s_ease]">
            <div className="w-10 h-10 rounded-full border border-[#E7E5DF] mb-1 overflow-hidden shrink-0">
              <img src="/favicon.png" alt="AI" className="w-full h-full object-cover" />
            </div>
            <p style={displayFont} className="text-[#17170F] text-[15px] font-medium">
              Start a new prep session
            </p>
            <p style={bodyFont} className="text-[#A6A399] text-[12.5px] max-w-xs">
              Ask an interview question, or paste one you're prepping for.
            </p>
          </div>
        ) : (
          <>
            {messages.map((m, idx) => (
              <ChatMessage key={idx} msg={m} userInitials={userInitials} />
            ))}
            {currentTool && <ToolRow label={currentTool} />}
            <div ref={endOfMessagesRef} />
          </>
        )}
      </div>

      <div className="px-8 pb-6 pt-2 shrink-0 bg-[#FAFAF8]">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center gap-2 rounded-[10px] border border-[#E7E5DF] bg-white px-4 py-1.5 focus-within:border-[#1F6E4A] transition-colors">
          <input
            style={bodyFont}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || !activeSession}
            placeholder="Ask a follow-up, or say “save that as a Q&A”…"
            className="flex-1 bg-transparent outline-none text-[13.5px] text-[#17170F] placeholder:text-[#A6A399] py-2 disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={loading || !activeSession || !input.trim()}
            className="w-8 h-8 rounded-[7px] bg-[#1F6E4A] flex items-center justify-center text-white transition-all active:scale-90 hover:bg-[#195C3D] shrink-0 disabled:opacity-50 disabled:active:scale-100"
          >
            <Send size={14} />
          </button>
        </form>
      </div>

      {/* Approval Modal - Styled to match Ink & Paper */}
      {approvalData && (
        <div className="fixed inset-0 bg-[#17170F]/40 z-[999] flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease]">
          <div className="bg-white w-full max-w-3xl max-h-[85vh] flex flex-col rounded-[16px] border border-[#E7E5DF] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E7E5DF] bg-[#FAFAF8]">
              <div>
                <h3 style={displayFont} className="text-[#17170F] text-[18px] font-semibold">
                  Review {approvalData.approvals.length} Drafted Q&A{approvalData.approvals.length > 1 ? 's' : ''}
                </h3>
                <p style={bodyFont} className="text-[#6E6C63] text-[13px] mt-0.5">
                  Select the items you want to permanently add to your knowledge base.
                </p>
              </div>
              <button onClick={() => setApprovalData(null)} className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#6E6C63] hover:bg-[#E7E5DF] transition-colors">
                 <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 bg-white">
              {approvalData.approvals.map((item, index) => (
                <div key={item.tool_call_id} className={`p-5 rounded-[12px] border transition-colors ${item.approved ? 'border-[#1F6E4A] bg-[#FAFAF8]' : 'border-[#E7E5DF] opacity-60'}`}>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={item.approved} 
                        onChange={(e) => {
                          const newApprovals = [...approvalData.approvals];
                          newApprovals[index].approved = e.target.checked;
                          setApprovalData({...approvalData, approvals: newApprovals});
                        }}
                        className="peer appearance-none w-5 h-5 border border-[#C7C4B9] rounded-[4px] checked:bg-[#1F6E4A] checked:border-[#1F6E4A] transition-colors group-hover:border-[#1F6E4A]"
                      />
                      <Check size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                    </div>
                    <span style={bodyFont} className="text-[14px] font-semibold text-[#17170F]">
                      Approve this Q&A
                    </span>
                  </label>
                  
                  <div className="mt-4 pl-8 flex flex-col gap-4">
                    <div>
                      <p style={bodyFont} className="text-[#6E6C63] text-[11px] font-semibold uppercase tracking-wider mb-1">Question</p>
                      <textarea 
                        value={item.question}
                        onChange={(e) => {
                          const newApprovals = [...approvalData.approvals];
                          newApprovals[index].question = e.target.value;
                          setApprovalData({...approvalData, approvals: newApprovals});
                        }}
                        className="w-full bg-white border border-[#E7E5DF] rounded-[8px] p-2.5 text-[13.5px] text-[#17170F] outline-none focus:border-[#1F6E4A]"
                        rows={2}
                      />
                    </div>
                    <div>
                      <p style={bodyFont} className="text-[#6E6C63] text-[11px] font-semibold uppercase tracking-wider mb-1">Answer</p>
                      <textarea 
                        value={item.answer}
                        onChange={(e) => {
                          const newApprovals = [...approvalData.approvals];
                          newApprovals[index].answer = e.target.value;
                          setApprovalData({...approvalData, approvals: newApprovals});
                        }}
                        className="w-full bg-white border border-[#E7E5DF] rounded-[8px] p-2.5 text-[13.5px] text-[#17170F] outline-none focus:border-[#1F6E4A] min-h-[120px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="px-6 py-4 border-t border-[#E7E5DF] flex items-center justify-end gap-3 bg-[#FAFAF8]">
              <button 
                onClick={() => setApprovalData(null)}
                style={bodyFont}
                className="inline-flex items-center gap-1.5 text-[#17170F] text-[13px] font-medium rounded-[8px] px-4 py-2.5 border border-[#E7E5DF] transition-colors hover:bg-white active:scale-[0.97]"
              >
                Cancel
              </button>
              <button 
                onClick={handleApproveSave}
                style={bodyFont}
                className="inline-flex items-center gap-1.5 bg-[#1F6E4A] text-white text-[13px] font-semibold rounded-[8px] px-5 py-2.5 transition-all active:scale-[0.97] hover:bg-[#195C3D]"
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
