import React from 'react';

export default function AssessmentHub() {
  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Modern Light Header */}
      <div className="flex justify-between items-center px-8 py-5 bg-white border-b border-slate-200 shadow-sm z-10">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            CCC Assessment Hub
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Code. Compile. Conquer. <span className="text-slate-400 font-normal">| Proctored Environment</span>
          </p>
        </div>
        
        {/* Crisp Status Indicator */}
        <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded-full shadow-sm transition-all hover:bg-rose-100">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
          </div>
          <span className="text-sm font-bold text-rose-700 tracking-wide">AI SECURE: ACTIVE</span>
        </div>
      </div>

      {/* Framed Iframe Workspace */}
      <div className="flex-1 w-full h-full p-6 lg:p-8">
        <div className="w-full h-full bg-[#0d1117] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 ring-1 ring-slate-900/5 transition-all duration-300">
          <iframe 
            src="http://system-monitoring-phi.vercel.app/" 
            className="w-full h-full border-none"
            title="CCC System Monitoring"
            allow="camera; microphone; display-capture; fullscreen" 
          />
        </div>
      </div>
    </div>
  );
}
