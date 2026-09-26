import { useEffect, useState } from 'react';
import { getAssessmentQuestions, postCccTelemetry } from '../services/api';
import type { AssessmentQuestion } from '../types';
import { Camera, AlertCircle, Play, Send, Clock } from 'lucide-react';

export default function AssessmentHub() {
  const [question, setQuestion] = useState<AssessmentQuestion | null>(null);
  const [code, setCode] = useState('');
  const [isProctoringActive, setIsProctoringActive] = useState(true);

  useEffect(() => {
    getAssessmentQuestions('dsa').then(data => {
      if (data.length > 0) {
        setQuestion(data[0]);
        setCode(data[0].starterCode || '');
      }
    });

    // Simulate sending telemetry periodically
    const interval = setInterval(() => {
      if(isProctoringActive) {
        postCccTelemetry({
          testSessionId: "sess_" + Math.floor(Math.random()*1000),
          focusLostCount: Math.floor(Math.random() * 3),
          avgHesitationSec: 2 + Math.random() * 5,
          compilationCount: 1,
          stressIndexScore: 20 + Math.random() * 30,
          flaggedBehaviors: []
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isProctoringActive]);

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Top Navbar for Assessment */}
      <div className="h-16 border-b border-border bg-card flex justify-between items-center px-6 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-lg">{question?.title || 'Loading...'}</h2>
          {question && (
            <span className="px-2 py-1 text-xs font-bold rounded-md bg-green-100 text-green-700 uppercase tracking-wide">
              {question.difficulty}
            </span>
          )}
        </div>

        {/* CCC Proctoring Widget Bar */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
            <Clock className="w-4 h-4 text-indigo-500" />
            45:00
          </div>
          
          <div 
            onClick={() => setIsProctoringActive(!isProctoringActive)}
            className={`flex items-center gap-3 px-4 py-1.5 rounded-full border shadow-sm transition-colors cursor-pointer ${isProctoringActive ? 'bg-red-50 border-red-200 text-red-700' : 'bg-muted border-border text-muted-foreground'}`}
          >
            <div className="relative">
              <Camera className="w-5 h-5" />
              {isProctoringActive && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>}
              {isProctoringActive && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
            </div>
            <span className="text-sm font-bold tracking-wide">
              {isProctoringActive ? 'CCC PROCTORING: ACTIVE' : 'PROCTORING: OFF'}
            </span>
          </div>
        </div>
      </div>

      {/* Split Screen Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Description */}
        <div className="w-1/3 border-r border-border bg-card overflow-auto p-6 space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-4">Problem Statement</h3>
            <div className="prose prose-sm dark:prose-invert">
              <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>
              <p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
              <p>You can return the answer in any order.</p>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-xl border border-border font-mono text-sm space-y-2">
            <div className="font-bold text-foreground mb-1">Example 1:</div>
            <div><span className="text-muted-foreground">Input:</span> nums = [2,7,11,15], target = 9</div>
            <div><span className="text-muted-foreground">Output:</span> [0,1]</div>
            <div className="text-xs text-muted-foreground mt-2">Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].</div>
          </div>
        </div>

        {/* Right Panel: Code Editor */}
        <div className="w-2/3 flex flex-col bg-[#1e1e1e]">
          <div className="h-10 bg-[#2d2d2d] border-b border-[#404040] flex items-center px-4 text-xs font-mono text-gray-400">
            Solution.java
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 bg-transparent text-[#d4d4d4] font-mono p-4 resize-none focus:outline-none focus:ring-0 leading-relaxed"
            spellCheck="false"
          />
          <div className="h-16 bg-[#2d2d2d] border-t border-[#404040] flex justify-between items-center px-6 shrink-0">
            <button className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
              <AlertCircle className="w-4 h-4" /> Report Issue
            </button>
            <div className="flex gap-3">
              <button className="px-5 py-2 bg-[#3d3d3d] hover:bg-[#4d4d4d] text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors">
                <Play className="w-4 h-4" /> Run Code
              </button>
              <button className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-green-900/20">
                <Send className="w-4 h-4" /> Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
