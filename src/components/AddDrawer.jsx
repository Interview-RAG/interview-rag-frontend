import React, { useState } from "react";
import { X, Check, Upload, FileText, Loader2 } from "lucide-react";
import axios from "axios";

const displayFont = { fontFamily: "'Fraunces', serif" };
const bodyFont = { fontFamily: "'Public Sans', sans-serif" };


export default function AddDrawer({ open, onClose, API_BASE, showToast, onAdded }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      showToast("Question and Answer are required.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/qa`, {
        question,
        answer
      });
      showToast("Q&A Added to Collection");
      setQuestion("");
      setAnswer("");
      if (onAdded) onAdded();
      onClose();
    } catch (err) {
      console.error(err);
      showToast("Failed to add Q&A");
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async () => {
    if (!pdfFile) return;
    
    setPdfLoading(true);
    const formData = new FormData();
    formData.append('file', pdfFile);
    
    try {
      const res = await axios.post(`${API_BASE}/qa/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast(res.data.message);
      if (res.data.added > 0) {
        if (onAdded) onAdded();
        onClose();
      }
      setPdfFile(null);
    } catch (err) {
      console.error("Error uploading PDF:", err);
      showToast(err.response?.data?.detail || "Failed to upload file");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-[#17170F]/35 z-40 transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 border-l border-[#E7E5DF] flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E7E5DF]">
          <div>
            <h2 style={displayFont} className="text-[#17170F] text-[17px] font-semibold">
              Add to collection
            </h2>
            <p style={bodyFont} className="text-[#6E6C63] text-[12px] mt-0.5">
              Saved pairs are used to ground every future answer.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#6E6C63] hover:bg-[#F1F0EB] transition-colors"
          >
            <X size={15} />
          </button>
        </div>


        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="bg-[#FAFAF8] border border-[#E7E5DF] rounded-[10px] p-4">
            <h3 style={bodyFont} className="text-[#17170F] text-[13px] font-semibold mb-3 flex items-center gap-1.5">
              <FileText size={14} className="text-[#1F6E4A]" /> Bulk Upload
            </h3>
            <div className="flex flex-col gap-3">
              <input 
                type="file" 
                accept="application/pdf, image/png, image/jpeg, image/webp"
                onChange={(e) => setPdfFile(e.target.files[0])}
                disabled={pdfLoading}
                className="w-full text-[12px] text-[#6E6C63] file:mr-3 file:py-1.5 file:px-3 file:rounded-[6px] file:border-0 file:text-[12px] file:font-semibold file:bg-[#1F6E4A] file:text-white hover:file:bg-[#195C3D] transition-colors cursor-pointer disabled:opacity-50"
              />
              <button 
                onClick={handlePdfUpload}
                disabled={!pdfFile || pdfLoading}
                className="inline-flex items-center justify-center gap-1.5 bg-[#17170F] text-white text-[12px] font-semibold rounded-[6px] px-3 py-2 transition-all active:scale-[0.98] hover:bg-[#2A2A20] disabled:opacity-50 disabled:active:scale-100"
              >
                {pdfLoading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {pdfLoading ? "Extracting..." : "Upload & Extract"}
              </button>
            </div>
          </div>
          
          <div className="h-px bg-[#E7E5DF] w-full" />
          
          <div className="flex flex-col gap-5">
          <div>
            <label style={bodyFont} className="text-[#17170F] text-[12.5px] font-semibold mb-1.5 block">
              Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={2}
              placeholder="e.g. Tell me about a time you missed a deadline."
              style={bodyFont}
              className="w-full bg-[#FAFAF8] border border-[#E7E5DF] rounded-[8px] p-3 text-[13px] text-[#17170F] placeholder:text-[#A6A399] outline-none focus:border-[#1F6E4A] resize-none"
            />
          </div>

          <div>
            <label style={bodyFont} className="text-[#17170F] text-[12.5px] font-semibold mb-1.5 block">
              Answer
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              placeholder="Write in STAR format — situation, task, action, result."
              style={bodyFont}
              className="w-full bg-[#FAFAF8] border border-[#E7E5DF] rounded-[8px] p-3 text-[13px] text-[#17170F] placeholder:text-[#A6A399] outline-none focus:border-[#1F6E4A] resize-none"
            />
          </div>

          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#E7E5DF] flex items-center justify-end gap-2.5">
          <button
            style={bodyFont}
            className="inline-flex items-center gap-1.5 text-[#17170F] text-[13px] font-medium rounded-[8px] px-3.5 py-2 border border-[#E7E5DF] transition-colors duration-150 hover:bg-[#F1F0EB] active:scale-[0.97]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            style={bodyFont}
            disabled={loading}
            className="inline-flex items-center gap-1.5 bg-[#1F6E4A] text-white text-[13px] font-semibold rounded-[8px] px-4 py-2.5 transition-all duration-150 active:scale-[0.97] hover:bg-[#195C3D] disabled:opacity-50"
            onClick={handleSave}
          >
            {loading ? "Saving..." : <><Check size={14} /> Save to collection</>}
          </button>
        </div>
      </div>
    </>
  );
}
