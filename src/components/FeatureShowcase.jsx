import React, { useState } from 'react';
import { Brain, MessageSquare, FileText, Zap, ArrowRight, Download, Bot, User } from 'lucide-react';

const bodyFont = { fontFamily: "'Inter', sans-serif" };

const FeatureShowcase = () => {
  const [activeFeature, setActiveFeature] = useState(null);

  // Helper to determine card styles based on hover state
  const getCardStyle = (featureName, baseScale = 'scale-100') => {
    if (!activeFeature) return `opacity-100 ${baseScale}`; // Default state
    if (activeFeature === featureName) return 'opacity-100 scale-[1.15] border-white/50 shadow-[0_20px_50px_rgba(31,110,74,0.5)] bg-white/10 z-[70]'; // Hovered state
    return 'opacity-20 scale-[0.90] blur-[3px] pointer-events-none'; // Other cards state
  };

  return (
    <div className="relative w-full h-[460px] mt-8 perspective-[1200px] flex items-center justify-center transform-gpu">
      {/* Background Glowing orb */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] z-0 pointer-events-none transition-all duration-500 ${
          activeFeature ? 'w-[450px] h-[450px] bg-[#1F6E4A]/60' : 'w-[320px] h-[320px] bg-[#1F6E4A]/80 animate-orb'
        }`}
      ></div>
      
      {/* --- The Central Preview Screen --- */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[220px] z-[60] transition-all duration-500 ease-out pointer-events-none ${
          activeFeature ? 'opacity-100 scale-100' : 'opacity-0 scale-90 translate-y-4'
        }`}
      >
        <div className="w-full h-full bg-[#FAFAF8]/10 backdrop-blur-xl border border-white/20 rounded-[20px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex flex-col p-4 relative">
          
          {/* Smart Q&A Mockup */}
          {activeFeature === 'smart_qa' && (
            <div className="flex flex-col h-full gap-3 animate-[fadeIn_0.4s_ease-out]">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <Brain size={16} className="text-[#14b8a6]" />
                <span className="text-white text-[13px] font-semibold">Knowledge Extraction</span>
              </div>
              <div className="bg-[#17170F]/50 rounded-[10px] p-3 border border-white/5">
                <span className="text-[#A6A399] text-[11px] uppercase font-bold tracking-wider mb-1 block">Question Detected</span>
                <p className="text-white text-[12px] leading-tight">"Tell me about a time you led a challenging project?"</p>
              </div>
              <div className="bg-[#1F6E4A]/30 rounded-[10px] p-3 border border-[#14b8a6]/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#14b8a6]"></div>
                <span className="text-[#14b8a6] text-[11px] uppercase font-bold tracking-wider mb-1 block">AI Draft</span>
                <p className="text-white/90 text-[12px] leading-tight line-clamp-2">In my previous role, I spearheaded the migration of our legacy systems...</p>
              </div>
            </div>
          )}

          {/* AI Chat Agent Mockup */}
          {activeFeature === 'chat_agent' && (
            <div className="flex flex-col h-full gap-3 animate-[fadeIn_0.4s_ease-out]">
               <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <MessageSquare size={16} className="text-[#14b8a6]" />
                <span className="text-white text-[13px] font-semibold">Prep Session</span>
              </div>
              <div className="flex-1 flex flex-col gap-2 mt-1">
                {/* User Bubble */}
                <div className="self-end bg-[#17170F]/60 border border-white/10 rounded-l-[12px] rounded-tr-[12px] p-2.5 max-w-[85%]">
                  <p className="text-white text-[11px]">Can you review my answer for the leadership question?</p>
                </div>
                {/* AI Bubble */}
                <div className="flex gap-2 self-start max-w-[90%]">
                  <div className="w-6 h-6 rounded-full bg-[#1F6E4A] flex items-center justify-center shrink-0 border border-[#14b8a6]/30">
                    <Bot size={12} className="text-white" />
                  </div>
                  <div className="bg-[#1F6E4A]/30 border border-[#14b8a6]/20 rounded-r-[12px] rounded-bl-[12px] p-2.5">
                    <p className="text-white/90 text-[11px] leading-relaxed">Sure! Your STAR method structure is good, but try emphasizing the impact more...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PDF Upload Mockup */}
          {activeFeature === 'pdf_upload' && (
            <div className="flex flex-col items-center justify-center h-full gap-4 animate-[fadeIn_0.4s_ease-out]">
              <div className="w-full max-w-[200px] h-[120px] rounded-[14px] border-2 border-dashed border-[#14b8a6]/40 bg-[#1F6E4A]/10 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 h-1 bg-[#14b8a6] animate-[pulse_2s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
                <div className="w-10 h-10 rounded-full bg-[#1F6E4A]/50 flex items-center justify-center text-[#14b8a6]">
                  <FileText size={20} />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-white text-[12px] font-medium">resume.pdf</span>
                  <span className="text-[#A6A399] text-[10px]">Extracting pairs... 60%</span>
                </div>
              </div>
            </div>
          )}

          {/* Export Mockup */}
          {activeFeature === 'export' && (
            <div className="flex flex-col h-full animate-[fadeIn_0.4s_ease-out]">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                <span className="text-white text-[13px] font-semibold flex items-center gap-2"><Zap size={16} className="text-[#14b8a6]"/> Study Guide</span>
                <div className="px-2 py-1 bg-[#1F6E4A] rounded-full text-white text-[10px] flex items-center gap-1 shadow-[0_0_10px_rgba(31,110,74,0.5)]">
                  <Download size={10} /> PDF
                </div>
              </div>
              <div className="flex-1 bg-white/5 rounded-[8px] p-3 flex flex-col gap-2 relative border border-white/5">
                 <div className="w-3/4 h-2.5 bg-white/20 rounded-full"></div>
                 <div className="w-full h-1.5 bg-white/10 rounded-full mt-2"></div>
                 <div className="w-full h-1.5 bg-white/10 rounded-full"></div>
                 <div className="w-5/6 h-1.5 bg-white/10 rounded-full"></div>
                 <div className="w-1/2 h-2.5 bg-white/20 rounded-full mt-3"></div>
                 <div className="w-full h-1.5 bg-white/10 rounded-full mt-2"></div>
                 <div className="w-4/5 h-1.5 bg-white/10 rounded-full"></div>
                 {/* Shine effect */}
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* --- The Floating Cards (Organic 3D Layout) --- */}
      
      {/* Card 1: Front-Left */}
      <div className={`absolute top-[40px] left-[8%] z-40 animate-float-1 ${activeFeature ? '![animation-play-state:paused]' : ''}`}>
        <div style={{ transform: 'rotateY(10deg) rotateX(5deg)' }} className="transition-transform duration-500">
          <div 
            onMouseEnter={() => setActiveFeature('smart_qa')}
            onMouseLeave={() => setActiveFeature(null)}
            className={`bg-gradient-to-br from-[#FAFAF8]/10 to-[#FAFAF8]/5 border border-[#E7E5DF]/10 backdrop-blur-md p-4 rounded-[16px] flex items-center gap-4 text-white transition-all duration-500 w-[220px] cursor-pointer will-change-transform ${getCardStyle('smart_qa')}`}
          >
            <div className="p-3 bg-gradient-to-br from-[#1F6E4A] to-[#155336] text-white rounded-[12px] shadow-inner shrink-0">
              <Brain size={22} />
            </div>
            <div className="flex flex-col">
              <strong style={bodyFont} className="text-[14px] font-semibold text-white leading-none">Smart Q&A</strong>
              <span style={bodyFont} className="text-[11.5px] text-[#A6A399] leading-tight mt-1.5">AI deduplication</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Card 2: Back-Right */}
      <div className={`absolute top-[20px] right-[8%] z-20 animate-float-2 ${activeFeature ? '![animation-play-state:paused]' : ''}`}>
        <div style={{ transform: 'rotateY(-15deg) rotateX(8deg)' }} className="transition-transform duration-500">
          <div 
            onMouseEnter={() => setActiveFeature('chat_agent')}
            onMouseLeave={() => setActiveFeature(null)}
            className={`bg-gradient-to-bl from-[#FAFAF8]/10 to-[#FAFAF8]/5 border border-[#E7E5DF]/10 backdrop-blur-md p-4 rounded-[16px] flex items-center gap-4 text-white transition-all duration-500 w-[220px] cursor-pointer will-change-transform ${getCardStyle('chat_agent', 'scale-[0.92]')}`}
          >
            <div className="p-3 bg-gradient-to-br from-[#1F6E4A] to-[#155336] text-white rounded-[12px] shadow-inner shrink-0">
              <MessageSquare size={22} />
            </div>
            <div className="flex flex-col">
              <strong style={bodyFont} className="text-[14px] font-semibold text-white leading-none">AI Chat Agent</strong>
              <span style={bodyFont} className="text-[11.5px] text-[#A6A399] leading-tight mt-1.5">RAG + Web search</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Back-Left */}
      <div className={`absolute bottom-[50px] left-[2%] z-20 animate-float-3 ${activeFeature ? '![animation-play-state:paused]' : ''}`}>
        <div style={{ transform: 'rotateY(18deg) rotateX(5deg)' }} className="transition-transform duration-500">
          <div 
            onMouseEnter={() => setActiveFeature('pdf_upload')}
            onMouseLeave={() => setActiveFeature(null)}
            className={`bg-gradient-to-tr from-[#FAFAF8]/10 to-[#FAFAF8]/5 border border-[#E7E5DF]/10 backdrop-blur-md p-4 rounded-[16px] flex items-center gap-4 text-white transition-all duration-500 w-[220px] cursor-pointer will-change-transform ${getCardStyle('pdf_upload', 'scale-[0.88]')}`}
          >
            <div className="p-3 bg-gradient-to-br from-[#1F6E4A] to-[#155336] text-white rounded-[12px] shadow-inner shrink-0">
              <FileText size={22} />
            </div>
            <div className="flex flex-col">
              <strong style={bodyFont} className="text-[14px] font-semibold text-white leading-none">PDF Upload</strong>
              <span style={bodyFont} className="text-[11.5px] text-[#A6A399] leading-tight mt-1.5">Auto-extract pairs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Front-Right */}
      <div className={`absolute bottom-[10px] right-[12%] z-50 animate-float-4 ${activeFeature ? '![animation-play-state:paused]' : ''}`}>
        <div style={{ transform: 'rotateY(-12deg) rotateX(6deg)' }} className="transition-transform duration-500">
          <div 
            onMouseEnter={() => setActiveFeature('export')}
            onMouseLeave={() => setActiveFeature(null)}
            className={`bg-gradient-to-tl from-[#FAFAF8]/10 to-[#FAFAF8]/5 border border-[#E7E5DF]/10 backdrop-blur-md p-4 rounded-[16px] flex items-center gap-4 text-white transition-all duration-500 w-[220px] cursor-pointer will-change-transform ${getCardStyle('export')}`}
          >
            <div className="p-3 bg-gradient-to-br from-[#1F6E4A] to-[#155336] text-white rounded-[12px] shadow-inner shrink-0">
              <Zap size={22} />
            </div>
            <div className="flex flex-col">
              <strong style={bodyFont} className="text-[14px] font-semibold text-white leading-none">Export & Study</strong>
              <span style={bodyFont} className="text-[11.5px] text-[#A6A399] leading-tight mt-1.5">Download as PDF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;
