import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle2, Loader2, Briefcase, GraduationCap, Code, Layers, Award, Globe, PlusCircle, Trash2 } from 'lucide-react';

const displayFont = { fontFamily: "'Fraunces', serif" };
const bodyFont = { fontFamily: "'Public Sans', sans-serif" };

export default function ResumeHub({ API_BASE, showToast }) {
  const [resumeData, setResumeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showJDModal, setShowJDModal] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [isScoringJD, setIsScoringJD] = useState(false);

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE}/resume`);
      if (res.data.resume) {
        setResumeData(res.data.resume.parsed_data);
      }
    } catch (err) {
      console.error("Failed to fetch resume", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== "application/pdf") {
      showToast("Only PDF files are supported");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      showToast("Parsing resume with AI...");
      const res = await axios.post(`${API_BASE}/resume/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setResumeData(res.data.parsed_data);
      showToast("Resume parsed successfully!");
    } catch (err) {
      console.error("Upload failed", err);
      showToast(err.response?.data?.detail || "Failed to upload resume");
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm("Are you sure you want to delete your resume? This cannot be undone.")) return;
    
    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE}/resume`);
      setResumeData(null);
      showToast("Resume deleted.");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete resume.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreJD = async () => {
    if (!jobDescription.trim()) return;
    try {
      setIsScoringJD(true);
      const res = await axios.post(`${API_BASE}/resume/match`, { job_description: jobDescription });
      
      setResumeData(prev => ({
        ...prev,
        ats_targeted_score: res.data.score_data,
        targeted_job_description: jobDescription
      }));
      setShowJDModal(false);
      showToast("Resume scored against Job Description!");
    } catch (err) {
      console.error(err);
      showToast("Failed to score resume.");
    } finally {
      setIsScoringJD(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-neutral-950">
        <Loader2 className="animate-spin text-white/50" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-neutral-950 overflow-y-auto relative text-white" style={bodyFont}>
      
      {/* Background Animated Orbs */}
      <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] animate-orb pointer-events-none" />
      <div className="absolute top-[40%] right-[10%] w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] animate-orb pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* Header */}
      <div className="bg-neutral-950/80 backdrop-blur-xl border-b border-white/5 px-10 py-8 shrink-0 sticky top-0 z-20 shadow-lg">
        <h1 style={displayFont} className="text-3xl font-bold text-white tracking-tight">Resume Hub</h1>
        <p className="text-neutral-400 text-[14px] mt-2 font-medium">Upload your resume to personalize your AI interview prep.</p>
      </div>

      <div className="flex-1 p-10 max-w-6xl mx-auto w-full flex flex-col gap-10 relative z-10">
        
        {/* Upload Section - Only show if NO resume data exists */}
        {!resumeData && (
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group transition-all duration-500 hover:border-white/20">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 text-emerald-400 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all duration-500">
              {isUploading ? <Loader2 className="animate-spin" size={36} strokeWidth={1.5} /> : <Upload size={36} strokeWidth={1.5} />}
            </div>
            
            <h2 style={displayFont} className="text-2xl font-bold text-white mb-3">
              {isUploading ? "Analyzing Resume with AI..." : "Upload New Resume"}
            </h2>
            <p className="text-neutral-400 text-[14px] mb-8 max-w-lg leading-relaxed">
              We use advanced AI to extract your skills and experience to tailor your mock interviews and generated answers specifically to your profile.
            </p>
            
            <label className={`relative flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl text-[14px] font-bold transition-all duration-300 ${isUploading ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-white text-neutral-950 hover:bg-neutral-200 hover:scale-105 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]'}`}>
              <FileText size={18} />
              {isUploading ? 'Processing PDF...' : 'Select PDF Resume'}
              <input 
                type="file" 
                accept=".pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        )}

        {/* Parsed Data Display */}
        {resumeData && (
          <div className="animate-[slideUp_0.6s_ease_forwards] flex flex-col gap-8 pb-16">
            <div className="flex items-center justify-between gap-3 mb-2 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-emerald-400" />
                <h2 style={displayFont} className="text-2xl font-bold text-white tracking-tight">Extracted Profile</h2>
              </div>
              <button 
                onClick={handleDeleteResume}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg text-sm font-medium transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] border border-red-500/20 hover:border-red-500/40"
              >
                <Trash2 size={16} />
                Delete Resume
              </button>
            </div>
            
            {/* ATS Score Section */}
            {resumeData.ats_general_score && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
                {/* General Score Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-6">General ATS Score</h3>
                  <div className="flex gap-6 items-start">
                    <div className="flex-shrink-0 relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-white/10" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className={resumeData.ats_general_score.score >= 80 ? 'text-emerald-400' : resumeData.ats_general_score.score >= 60 ? 'text-yellow-400' : 'text-red-400'} strokeDasharray={`${resumeData.ats_general_score.score}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span style={displayFont} className="text-2xl font-bold text-white">{resumeData.ats_general_score.score}</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      {resumeData.ats_general_score.feedback.map((fb, idx) => (
                        <div key={idx} className={`flex items-start gap-2 text-[13px] ${fb.type === 'positive' ? 'text-emerald-400/90' : fb.type === 'negative' ? 'text-red-400/90' : 'text-yellow-400/90'}`}>
                          <span className="mt-0.5">{fb.type === 'positive' ? '✓' : fb.type === 'negative' ? '✗' : 'ℹ'}</span>
                          <span className="leading-snug">{fb.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Targeted Score Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-6">Targeted JD Match</h3>
                  
                  {resumeData.ats_targeted_score ? (
                    <div className="flex gap-6 items-start">
                      <div className="flex-shrink-0 relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path className="text-white/10" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className={resumeData.ats_targeted_score.score >= 80 ? 'text-emerald-400' : resumeData.ats_targeted_score.score >= 60 ? 'text-yellow-400' : 'text-red-400'} strokeDasharray={`${resumeData.ats_targeted_score.score}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span style={displayFont} className="text-2xl font-bold text-white">{resumeData.ats_targeted_score.score}</span>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="space-y-3 mb-4">
                          {resumeData.ats_targeted_score.feedback.map((fb, idx) => (
                            <div key={idx} className={`flex items-start gap-2 text-[13px] ${fb.type === 'positive' ? 'text-emerald-400/90' : fb.type === 'negative' ? 'text-red-400/90' : 'text-yellow-400/90'}`}>
                              <span className="mt-0.5">{fb.type === 'positive' ? '✓' : fb.type === 'negative' ? '✗' : 'ℹ'}</span>
                              <span className="leading-snug">{fb.message}</span>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => { setJobDescription(resumeData.targeted_job_description || ""); setShowJDModal(true); }} className="mt-auto self-start text-[12px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-500/20 transition-all">
                          Update Job Description
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                      <p className="text-white/50 text-[14px] mb-4">You have a general health score, but to get a highly accurate targeted score, we need to compare it against a Job Description.</p>
                      <button onClick={() => setShowJDModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[14px] font-semibold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                        <FileText size={16} /> Add Job Description
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Skills, Summary, Languages */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                
                {/* Profile Picture & Summary */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-7 shadow-xl hover:border-white/20 transition-colors duration-300">
                  {resumeData.profile_picture_url && (
                    <div className="flex justify-center mb-6">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <img 
                          src={resumeData.profile_picture_url} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    </div>
                  )}
                  {resumeData.summary && (
                    <>
                      <h3 className="text-[12px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-4">Summary</h3>
                      <p className="text-[14px] leading-relaxed text-white/80">{resumeData.summary}</p>
                    </>
                  )}
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-7 shadow-xl hover:border-white/20 transition-colors duration-300">
                  <div className="flex items-center gap-2 mb-5">
                    <Code size={18} className="text-emerald-400" />
                    <h3 className="text-[12px] font-bold uppercase tracking-[0.15em] text-neutral-400">Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {resumeData.skills && resumeData.skills.length > 0 ? (
                      resumeData.skills.map((skill, i) => (
                        <span key={i} className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 text-[13px] font-semibold rounded-full border border-emerald-500/30 hover:bg-emerald-500/30 hover:scale-105 transition-all duration-300 cursor-default shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-[14px] text-white/40">No skills extracted.</p>
                    )}
                  </div>
                </div>

                {/* Languages */}
                {resumeData.languages && resumeData.languages.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-7 shadow-xl hover:border-white/20 transition-colors duration-300">
                    <div className="flex items-center gap-2 mb-5">
                      <Globe size={18} className="text-emerald-400" />
                      <h3 className="text-[12px] font-bold uppercase tracking-[0.15em] text-neutral-400">Languages</h3>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {resumeData.languages.map((lang, i) => (
                        <span key={i} className="px-3.5 py-1.5 bg-blue-500/10 text-blue-400 text-[13px] font-semibold rounded-full border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Experience & Education */}
              <div className="lg:col-span-2 flex flex-col gap-8">
                
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-2 mb-8">
                    <Briefcase size={20} className="text-emerald-400" />
                    <h3 className="text-[12px] font-bold uppercase tracking-[0.15em] text-neutral-400">Experience</h3>
                  </div>
                  <div className="flex flex-col relative pl-6 border-l-2 border-white/10 space-y-10">
                    {resumeData.experience && resumeData.experience.length > 0 ? (
                      resumeData.experience.map((exp, i) => (
                        <div key={i} className="relative group">
                          {/* Timeline Node */}
                          <div className="absolute -left-[31px] top-1.5 w-[14px] h-[14px] rounded-full bg-neutral-950 border-[3px] border-emerald-400 group-hover:bg-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.6)] transition-all duration-300" />
                          
                          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 hover:bg-white/[0.04] hover:border-white/10 transition-colors duration-300">
                              <h4 style={displayFont} className="text-[18px] font-bold text-white tracking-tight mb-1">{exp.role}</h4>
                            <div className="flex flex-wrap items-center justify-between gap-4 text-[13px] text-neutral-400 font-medium mb-4">
                              <span className="text-emerald-400">{exp.company}</span>
                              <span className="bg-white/5 px-2.5 py-1 rounded-md">{exp.start_date} - {exp.end_date || 'Present'}</span>
                            </div>
                            {exp.description && (
                              <div className="text-[14px] text-white/70 leading-relaxed space-y-2">
                                {Array.isArray(exp.description) ? (
                                  <ul className="list-disc pl-5 space-y-2 marker:text-white/30">
                                    {exp.description.map((item, idx) => <li key={idx}>{item}</li>)}
                                  </ul>
                                ) : (
                                  <p>{exp.description}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[14px] text-white/40">No experience extracted.</p>
                    )}
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-2 mb-8">
                    <GraduationCap size={20} className="text-emerald-400" />
                    <h3 className="text-[12px] font-bold uppercase tracking-[0.15em] text-neutral-400">Education</h3>
                  </div>
                  <div className="flex flex-col relative pl-6 border-l-2 border-white/10 space-y-8">
                    {resumeData.education && resumeData.education.length > 0 ? (
                      resumeData.education.map((edu, i) => (
                        <div key={i} className="relative group">
                          {/* Timeline Node */}
                          <div className="absolute -left-[31px] top-1.5 w-[14px] h-[14px] rounded-full bg-neutral-950 border-[3px] border-emerald-400 group-hover:bg-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.6)] transition-all duration-300" />
                          
                          <div className="flex flex-col gap-1.5">
                            <h4 style={displayFont} className="text-[17px] font-bold text-white tracking-tight">{edu.degree} in {edu.field_of_study}</h4>
                            <p className="text-[14px] text-neutral-400 font-medium">{edu.institution} <span className="text-white/30 mx-2">•</span> {edu.start_date} - {edu.end_date}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[14px] text-white/40">No education extracted.</p>
                    )}
                  </div>
                </div>

                {/* Projects Section */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-2 mb-8">
                    <Layers size={20} className="text-emerald-400" />
                    <h3 className="text-[12px] font-bold uppercase tracking-[0.15em] text-neutral-400">Projects</h3>
                  </div>
                  <div className="flex flex-col relative pl-6 border-l-2 border-white/10 space-y-10">
                    {resumeData.projects && resumeData.projects.length > 0 ? (
                      resumeData.projects.map((proj, i) => (
                        <div key={i} className="relative group">
                          {/* Timeline Node */}
                          <div className="absolute -left-[31px] top-1.5 w-[14px] h-[14px] rounded-full bg-neutral-950 border-[3px] border-emerald-400 group-hover:bg-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.6)] transition-all duration-300" />
                          
                          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 hover:bg-white/[0.04] hover:border-white/10 transition-colors duration-300">
                              <h4 style={displayFont} className="text-[18px] font-bold text-white tracking-tight mb-3">{proj.name}</h4>
                            {proj.description && (
                              <div className="text-[14px] text-white/70 leading-relaxed mb-4 space-y-2">
                                {Array.isArray(proj.description) ? (
                                  <ul className="list-disc pl-5 space-y-2 marker:text-white/30">
                                    {proj.description.map((item, idx) => <li key={idx}>{item}</li>)}
                                  </ul>
                                ) : (
                                  <p>{proj.description}</p>
                                )}
                              </div>
                            )}
                            {proj.technologies && proj.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {proj.technologies.map((tech, idx) => (
                                  <span key={idx} className="px-2.5 py-1 bg-white/5 text-neutral-300 text-[11px] font-semibold rounded-md border border-white/10">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[14px] text-white/40">No projects extracted.</p>
                    )}
                  </div>
                </div>

                {/* Certifications Section */}
                {resumeData.certifications && resumeData.certifications.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
                    <div className="flex items-center gap-2 mb-8">
                      <Award size={20} className="text-emerald-400" />
                      <h3 className="text-[12px] font-bold uppercase tracking-[0.15em] text-neutral-400">Certifications</h3>
                    </div>
                    <div className="flex flex-col relative pl-6 border-l-2 border-white/10 space-y-8">
                      {resumeData.certifications.map((cert, i) => (
                        <div key={i} className="relative group">
                          {/* Timeline Node */}
                          <div className="absolute -left-[31px] top-1.5 w-[14px] h-[14px] rounded-full bg-neutral-950 border-[3px] border-emerald-400 group-hover:bg-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.6)] transition-all duration-300" />
                          
                          <div className="flex flex-col gap-1.5">
                            <h4 style={displayFont} className="text-[17px] font-bold text-white tracking-tight">{cert.name}</h4>
                            <p className="text-[14px] text-neutral-400 font-medium">
                              {cert.issuer} {cert.date && <><span className="text-white/30 mx-2">•</span> {cert.date}</>}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Sections (Catch-all) */}
                {resumeData.custom_sections && resumeData.custom_sections.length > 0 && (
                  <>
                    {resumeData.custom_sections.map((section, idx) => (
                      <div key={idx} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
                        <div className="flex items-center gap-2 mb-8">
                          <PlusCircle size={20} className="text-emerald-400" />
                          <h3 className="text-[12px] font-bold uppercase tracking-[0.15em] text-neutral-400">{section.title}</h3>
                        </div>
                        <div className="text-[14px] text-white/70 leading-relaxed">
                          {Array.isArray(section.content) ? (
                            <ul className="list-disc pl-5 space-y-2 marker:text-white/30">
                              {section.content.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                          ) : (
                            <p>{section.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}

              </div>

            </div>
          </div>
        )}
      </div>

      {/* Job Description Modal */}
      {showJDModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/80 backdrop-blur-md p-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-[slideUp_0.3s_ease_out]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 style={displayFont} className="text-xl font-bold text-white">Targeted ATS Score</h3>
              <button onClick={() => setShowJDModal(false)} className="text-white/40 hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-[14px] text-white/60 mb-4">Paste the job description you are applying for below. We will calculate a deterministic match score based on your extracted resume data.</p>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste Job Description here..."
                className="w-full h-64 bg-white/5 border border-white/10 rounded-xl p-4 text-[14px] text-white/90 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none"
              />
            </div>
            <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end gap-3">
              <button onClick={() => setShowJDModal(false)} className="px-5 py-2.5 rounded-xl text-[14px] font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
              <button 
                onClick={handleScoreJD} 
                disabled={isScoringJD || !jobDescription.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 disabled:text-white/50 text-white rounded-xl text-[14px] font-semibold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:shadow-none"
              >
                {isScoringJD ? <><Loader2 size={16} className="animate-spin" /> Scoring...</> : 'Calculate Match Score'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
