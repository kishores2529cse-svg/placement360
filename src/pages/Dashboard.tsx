import { useEffect, useState } from 'react';
import { getStudentProfile } from '../services/api';
import type { StudentProfile } from '../types';
import { Play, Activity, MessageSquare, AlertTriangle, Flame, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    getStudentProfile().then(setProfile);
  }, []);

  if (!profile) {
    return <div className="p-8 flex justify-center items-center h-full animate-pulse"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <div className="z-10 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Welcome back, {profile.name}!</h1>
          <p className="text-indigo-100 flex items-center gap-2">
            <Target className="w-5 h-5" /> Targeting: {profile.targetRole} at {profile.dreamCompany}
          </p>
        </div>
        <div className="z-10 flex items-center gap-6 mt-6 md:mt-0">
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20 hover:scale-105 transition-transform">
            <div className="text-sm font-medium text-indigo-100 uppercase tracking-wider">Readiness</div>
            <div className="text-4xl font-black">{profile.readinessScore}<span className="text-xl">%</span></div>
          </div>
          <div className="bg-orange-500/80 backdrop-blur-md rounded-2xl p-4 text-center border border-orange-300/30 hover:scale-105 transition-transform flex flex-col items-center">
            <Flame className="w-6 h-6 text-yellow-300 mb-1" />
            <div className="text-2xl font-bold">{profile.streakDays} Days</div>
          </div>
        </div>
      </div>

      {/* Weak Spots Alert */}
      <div className="bg-destructive/10 border-l-4 border-destructive rounded-r-xl p-5 flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
        <div>
          <h3 className="text-lg font-bold text-destructive">Focus Areas Detected</h3>
          <p className="text-sm text-destructive/80 mb-3">Based on your recent CCC assessments, the engine recommends prioritizing these topics:</p>
          <div className="flex flex-wrap gap-2">
            {profile.recommendedTopics.map(topic => (
              <span key={topic} className="px-3 py-1 bg-destructive/20 text-destructive rounded-full text-xs font-bold uppercase tracking-wide">
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Launcher Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/learn" className="group bg-card hover:bg-indigo-50 border border-border hover:border-indigo-200 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Play className="w-8 h-8 text-indigo-600 ml-1" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Continue LMS Track</h3>
            <p className="text-sm text-muted-foreground mt-2">Resume Data Structures & Algorithms</p>
          </div>
        </Link>

        <Link to="/assessment" className="group bg-card hover:bg-rose-50 border border-border hover:border-rose-200 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Activity className="w-8 h-8 text-rose-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Take Monitored Test</h3>
            <p className="text-sm text-muted-foreground mt-2">Enter CCC proctored environment</p>
          </div>
        </Link>

        <Link to="/mentor" className="group bg-card hover:bg-emerald-50 border border-border hover:border-emerald-200 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <MessageSquare className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Talk to AI Mentor</h3>
            <p className="text-sm text-muted-foreground mt-2">Start a technical viva with Kishore-AI</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
