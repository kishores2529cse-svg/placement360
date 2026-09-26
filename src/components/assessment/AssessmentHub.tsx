import React from 'react';

export default function AssessmentHub() {
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Assessment Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-red-500">CCC Assessment Hub</h1>
          <p className="text-gray-400">Code. Compile. Conquer. [Proctored Environment]</p>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-4 py-2 bg-red-950 border border-red-800 rounded-full">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-red-400">AI SECURE: ACTIVE</span>
        </div>
      </div>

      {/* Embedded Live CCC System */}
      <div className="flex-1 w-full h-full relative">
        <iframe 
          src="https://system-monitoring-phi.vercel.app/" 
          className="w-full h-full border-none"
          title="CCC System Monitoring"
          // CRITICAL FOR PROCTORING: Allows camera, mic, and screen sharing if your app uses it
          allow="camera; microphone; display-capture; fullscreen" 
        />
      </div>
    </div>
  );
}
