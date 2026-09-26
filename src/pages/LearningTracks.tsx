import { useEffect, useState } from 'react';
import { getLmsTracks } from '../services/api';
import type { LmsTrack } from '../types';
import { BookOpen, CheckCircle2, Lock, PlayCircle, X } from 'lucide-react';

export default function LearningTracks() {
  const [tracks, setTracks] = useState<LmsTrack[]>([]);
  const [activeTopic, setActiveTopic] = useState<{ title: string, id: string } | null>(null);

  useEffect(() => {
    getLmsTracks().then(setTracks);
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto relative h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Learning Roadmap</h1>
        <p className="text-muted-foreground mt-2 text-lg">Master your skills step-by-step.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {tracks.map(track => (
          <div key={track.trackId} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><BookOpen className="w-6 h-6" /></div>
                {track.title}
              </h2>
              <div className="text-right">
                <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{track.progress}% Complete</span>
              </div>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2 mb-8 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${track.progress}%` }}></div>
            </div>

            <div className="space-y-4">
              {track.modules.map((mod, idx) => (
                <div 
                  key={mod.id} 
                  onClick={() => mod.status !== 'locked' ? setActiveTopic(mod) : null}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300
                    ${mod.status === 'locked' ? 'bg-muted/30 border-transparent opacity-60 cursor-not-allowed' : 'bg-background border-border hover:border-indigo-300 hover:shadow-md cursor-pointer'}
                    ${mod.status === 'recommended_priority' ? 'border-orange-300 bg-orange-50/30' : ''}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className="font-mono text-sm font-bold text-muted-foreground w-6">{idx + 1}.</div>
                    <div>
                      <h4 className="font-semibold text-foreground">{mod.title}</h4>
                      {mod.status === 'recommended_priority' && <span className="text-xs text-orange-600 font-bold uppercase tracking-wider">Priority Recommendation</span>}
                    </div>
                  </div>
                  <div>
                    {mod.status === 'completed' && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                    {mod.status === 'in_progress' && <PlayCircle className="w-6 h-6 text-indigo-500 animate-pulse" />}
                    {mod.status === 'recommended_priority' && <PlayCircle className="w-6 h-6 text-orange-500" />}
                    {mod.status === 'locked' && <Lock className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Slide-over Drawer / Modal */}
      {activeTopic && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-card h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center bg-indigo-50">
              <h2 className="text-xl font-bold text-indigo-900">{activeTopic.title}</h2>
              <button onClick={() => setActiveTopic(null)} className="p-2 bg-white rounded-full text-muted-foreground hover:text-foreground shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-auto space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Topic Summary</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Dive deep into {activeTopic.title}. Understand the core principles, common patterns, and time-space complexity tradeoffs required to ace technical interviews.
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <h3 className="font-semibold text-indigo-900 mb-3 text-sm uppercase tracking-wider">Recommended Practice</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-indigo-700 hover:text-indigo-900 cursor-pointer">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full"></span> Basic Implementation
                  </li>
                  <li className="flex items-center gap-3 text-sm text-indigo-700 hover:text-indigo-900 cursor-pointer">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full"></span> LeetCode: Blind 75 List
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-6 border-t border-border bg-muted/20">
              <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-200">
                Start Module
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
