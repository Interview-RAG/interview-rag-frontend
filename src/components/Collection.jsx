import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Plus, Trash2, X } from 'lucide-react';

const displayFont = { fontFamily: "'Fraunces', serif" };
const bodyFont = { fontFamily: "'Public Sans', sans-serif" };

function QACard({ c, onDelete, onClick }) {
  return (
    <div 
      onClick={() => onClick(c)}
      className="cursor-pointer group relative bg-white border border-[#E7E5DF] rounded-[12px] overflow-hidden hover:border-[#1F6E4A] hover:shadow-sm transition-all flex flex-col h-[180px]"
    >
      {/* perforated edge — the flashcard signature */}
      <div className="h-3 border-b border-dashed border-[#E7E5DF] bg-[#FAFAF8] flex items-center px-3 shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-[#E7E5DF] -ml-1" />
      </div>

      <div className="p-5 flex flex-col flex-1 min-h-0">
        <div className="flex items-start justify-between gap-3 mb-3 shrink-0">
          <h3 style={displayFont} className="text-[#17170F] font-semibold text-[15px] leading-snug line-clamp-2">
            {c.questions && c.questions.length > 0 ? c.questions[0] : "Untitled Question"}
          </h3>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
            className="p-1 -mr-1 -mt-1 text-[#A6A399] opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#D97757] shrink-0 rounded-[5px] hover:bg-[#F1F0EB]"
          >
            <Trash2 size={14} />
          </button>
        </div>
        <p style={bodyFont} className="text-[#6E6C63] text-[13px] leading-relaxed line-clamp-4">
          {c.answer || "No answer provided."}
        </p>
      </div>
    </div>
  );
}

function ViewModal({ qa, onClose }) {
  if (!qa) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#17170F]/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]">
      <div 
        className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[16px] shadow-2xl border border-[#E7E5DF] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5DF] bg-[#FAFAF8] shrink-0">
          <h2 style={displayFont} className="text-[#17170F] text-[16px] font-semibold flex items-center gap-2">
            Knowledge Base Entry
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-[8px] text-[#A6A399] hover:bg-[#E7E5DF] hover:text-[#17170F] transition-colors">
            <X size={16} />
          </button>
        </div>
        
        <div className="p-6 md:p-8 overflow-y-auto">
          <div className="mb-8">
            <h3 style={bodyFont} className="text-[#6E6C63] text-[11px] font-bold uppercase tracking-wider mb-2">Question</h3>
            <p style={displayFont} className="text-[#17170F] text-[18px] md:text-[20px] font-medium leading-relaxed whitespace-pre-wrap">
              {qa.questions && qa.questions.length > 0 ? qa.questions[0] : "Untitled Question"}
            </p>
          </div>
          
          <div>
            <h3 style={bodyFont} className="text-[#6E6C63] text-[11px] font-bold uppercase tracking-wider mb-2">Answer</h3>
            <div style={bodyFont} className="text-[#17170F] text-[14.5px] leading-[1.7] whitespace-pre-wrap">
              {qa.answer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Collection({ API_BASE, showToast, refreshKey, onAddClick }) {
  const [qas, setQas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewingQA, setViewingQA] = useState(null);

  const fetchQAs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/qa`);
      setQas(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load Collection");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Collections - PrepAI";
    fetchQAs();
  }, [refreshKey]);

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this Q&A?')) return;
    try {
      await axios.delete(`${API_BASE}/qa/${id}`);
      setQas(qas.filter(qa => qa.id !== id));
      showToast("Q&A deleted");
    } catch(err) {
      console.error(err);
      showToast("Failed to delete Q&A");
    }
  };

  const filteredQAs = useMemo(() => {
    return qas.filter(qa => {
      const q = (qa.questions && qa.questions.length > 0 ? qa.questions[0] : "").toLowerCase();
      const a = (qa.answer || "").toLowerCase();
      const search = (searchTerm || "").toLowerCase();
      return q.includes(search) || a.includes(search);
    });
  }, [qas, searchTerm]);

  if (loading) {
    return <div className="p-8 text-[#A6A399]" style={bodyFont}>Loading your knowledge base...</div>;
  }

  return (
    <div className="h-full overflow-y-auto px-8 py-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={displayFont} className="text-[#17170F] text-[22px] font-semibold">
            Collections
          </h1>
          <p style={bodyFont} className="text-[#6E6C63] text-[13px] mt-1">
            {qas.length} saved pairs — referenced automatically during every chat.
          </p>
        </div>
        <button
          style={bodyFont}
          onClick={onAddClick}
          className="inline-flex items-center gap-1.5 bg-[#1F6E4A] text-white text-[13px] font-semibold rounded-[8px] px-4 py-2.5 transition-all duration-150 active:scale-[0.97] hover:bg-[#195C3D]"
        >
          <Plus size={15} /> Add Q&A
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="relative w-full max-w-md shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A6A399]" />
          <input
            style={bodyFont}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search collection"
            className="w-full bg-white border border-[#E7E5DF] rounded-[8px] pl-8 pr-3 py-2 text-[13px] text-[#17170F] placeholder:text-[#A6A399] outline-none focus:border-[#1F6E4A]"
          />
        </div>
      </div>

      {qas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[#E7E5DF] flex items-center justify-center mb-4">
            <Plus size={24} className="text-[#A6A399]" />
          </div>
          <h2 style={displayFont} className="text-[17px] font-semibold text-[#17170F] mb-2">No Q&As yet</h2>
          <p style={bodyFont} className="text-[#6E6C63] text-[13px] max-w-md mb-6">
            Build your personal knowledge base by adding common interview questions and your STAR method answers.
          </p>
          <button
            onClick={onAddClick}
            style={bodyFont}
            className="inline-flex items-center gap-1.5 bg-[#1F6E4A] text-white text-[13px] font-semibold rounded-[8px] px-4 py-2.5 transition-all duration-150 active:scale-[0.97] hover:bg-[#195C3D]"
          >
            Add your first Q&A
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pb-12">
          {filteredQAs.map((c) => (
            <QACard key={c.id} c={c} onDelete={handleDelete} onClick={setViewingQA} />
          ))}
          {filteredQAs.length === 0 && (
             <div className="col-span-full py-10 text-center text-[#6E6C63] text-[13px]">
                No Q&As match your search.
             </div>
          )}
        </div>
      )}
      
      {/* Full View Modal */}
      {viewingQA && (
        <ViewModal qa={viewingQA} onClose={() => setViewingQA(null)} />
      )}
    </div>
  );
}
