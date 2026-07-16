import React, { useEffect } from 'react';
import { BookOpen, Search, Brain, Save, FileText, Download, Sparkles, MessageSquare, Zap } from 'lucide-react';

const displayFont = { fontFamily: "'Fraunces', serif" };
const bodyFont = { fontFamily: "'Public Sans', sans-serif" };

export default function Docs() {
  useEffect(() => {
    document.title = "Documentation - PrepAI";
  }, []);

  return (
    <div className="h-full bg-[#FAFAF8] overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-12">
        
        {/* Header */}
        <div className="mb-16 border-b border-[#E7E5DF] pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#1F6E4A] flex items-center justify-center text-white">
              <BookOpen size={20} />
            </div>
            <h1 style={displayFont} className="text-[#17170F] text-4xl font-bold">
              Documentation
            </h1>
          </div>
          <p style={bodyFont} className="text-[#6E6C63] text-lg max-w-2xl">
            Welcome to PrepAI! This guide will help you understand how to use our agentic workflows, long-term memory, and knowledge extraction tools to master your next interview.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-16">

          {/* Section 1: The AI Chatbot */}
          <section className="bg-white rounded-[16px] border border-[#E7E5DF] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare size={24} className="text-[#1F6E4A]" />
              <h2 style={displayFont} className="text-[#17170F] text-2xl font-bold">The AI Chatbot</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 style={bodyFont} className="text-[#17170F] text-lg font-semibold flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-[#C97A2B]" /> Interactive Coaching
                </h3>
                <p style={bodyFont} className="text-[#6E6C63] text-sm leading-relaxed mb-3">
                  The chatbot is your personal interviewer. It doesn't just answer questions; it can simulate an interview environment.
                </p>
                <div className="bg-[#FAFAF8] rounded-[8px] border border-[#E7E5DF] p-4 text-sm font-mono text-[#1F6E4A]">
                  <span className="text-[#A6A399]">Example prompt:</span> "Act as a Senior Engineering Manager and ask me a behavioral question about handling team conflicts."
                </div>
              </div>

              <div className="pt-4 border-t border-[#FAFAF8]">
                <h3 style={bodyFont} className="text-[#17170F] text-lg font-semibold flex items-center gap-2 mb-2">
                  <Search size={16} className="text-[#1F6E4A]" /> Autonomous Web Search
                </h3>
                <p style={bodyFont} className="text-[#6E6C63] text-sm leading-relaxed mb-3">
                  If you ask a question about recent events, companies, or specific technologies that aren't in your knowledge base, the agent will autonomously browse the internet to find the answer.
                </p>
                <div className="bg-[#FAFAF8] rounded-[8px] border border-[#E7E5DF] p-4 text-sm font-mono text-[#1F6E4A]">
                  <span className="text-[#A6A399]">Example prompt:</span> "What are the core engineering values currently listed on Netflix's culture page?"
                </div>
              </div>

              <div className="pt-4 border-t border-[#FAFAF8]">
                <h3 style={bodyFont} className="text-[#17170F] text-lg font-semibold flex items-center gap-2 mb-2">
                  <Brain size={16} className="text-[#1F6E4A]" /> Long-Term Memory (LTM)
                </h3>
                <p style={bodyFont} className="text-[#6E6C63] text-sm leading-relaxed mb-3">
                  Tell the bot facts about yourself. It will autonomously save these facts to its Long-Term Memory and use them in all future conversations.
                </p>
                <div className="bg-[#FAFAF8] rounded-[8px] border border-[#E7E5DF] p-4 text-sm font-mono text-[#1F6E4A]">
                  <span className="text-[#A6A399]">Example prompt:</span> "I am applying for a Senior Frontend Developer role at Vercel. Keep this in mind."
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Drafting & Saving Q&A */}
          <section className="bg-white rounded-[16px] border border-[#E7E5DF] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Save size={24} className="text-[#1F6E4A]" />
              <h2 style={displayFont} className="text-[#17170F] text-2xl font-bold">Drafting & Saving Q&A</h2>
            </div>
            <div className="space-y-6">
              <p style={bodyFont} className="text-[#6E6C63] text-sm leading-relaxed">
                You don't need to manually type out flashcards. You can have a conversation with the AI to refine an answer, and once it looks perfect, simply tell the AI to save it to your collection.
              </p>
              <div className="bg-[#FAFAF8] rounded-[8px] border border-[#E7E5DF] p-4 text-sm font-mono text-[#1F6E4A]">
                <span className="text-[#A6A399]">Step 1:</span> "Help me draft a STAR method answer for when I migrated our database to Postgres."
                <br/><br/>
                <span className="text-[#A6A399]">Step 2:</span> "That looks great. Please save that last answer to my collection as 'Database Migration'."
              </div>
            </div>
          </section>

          {/* Section 3: The Knowledge Collection */}
          <section className="bg-white rounded-[16px] border border-[#E7E5DF] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen size={24} className="text-[#1F6E4A]" />
              <h2 style={displayFont} className="text-[#17170F] text-2xl font-bold">The Knowledge Collection</h2>
            </div>
            <div className="space-y-6">
              <p style={bodyFont} className="text-[#6E6C63] text-sm leading-relaxed">
                The <b>Collections</b> tab is your personal RAG (Retrieval-Augmented Generation) database. Every time you save a Q&A pair, it is embedded as a vector. 
                <br/><br/>
                When you chat with the bot and ask, "What was my story about leadership?", the bot will perform a semantic vector search across your collection to find the exact story you saved previously.
              </p>
            </div>
          </section>

          {/* Section 4: PDF Upload & Auto-Extraction */}
          <section className="bg-white rounded-[16px] border border-[#E7E5DF] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <FileText size={24} className="text-[#1F6E4A]" />
              <h2 style={displayFont} className="text-[#17170F] text-2xl font-bold">PDF Upload & Auto-Extraction</h2>
            </div>
            <div className="space-y-6">
              <p style={bodyFont} className="text-[#6E6C63] text-sm leading-relaxed">
                Have a raw transcript of a past interview, or a resume? You can upload it instantly.
              </p>
              <ul className="list-disc list-inside text-[#6E6C63] text-sm space-y-2 ml-2" style={bodyFont}>
                <li>Click the <b>"Add +"</b> button in the top right of the Collections page.</li>
                <li>Select the <b>PDF Upload</b> option.</li>
                <li>Our backend will chunk the document and use a powerful LLM to automatically extract structural Q&A pairs (ignoring conversational filler).</li>
              </ul>
            </div>
          </section>

          {/* Section 5: Exporting the Study Guide */}
          <section className="bg-white rounded-[16px] border border-[#E7E5DF] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Download size={24} className="text-[#1F6E4A]" />
              <h2 style={displayFont} className="text-[#17170F] text-2xl font-bold">Exporting the Study Guide</h2>
            </div>
            <div className="space-y-6">
              <p style={bodyFont} className="text-[#6E6C63] text-sm leading-relaxed">
                Before your actual interview, you might want a physical or offline copy of all your polished stories.
              </p>
              <div className="bg-[#17170F] text-white rounded-[8px] p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#1F6E4A] flex items-center justify-center shrink-0">
                  <Zap size={20} className="text-white" />
                </div>
                <p style={bodyFont} className="text-sm">
                  Click the <b>Download</b> icon at the bottom of the left sidebar at any time to generate a beautifully formatted PDF study guide of your entire collection.
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
