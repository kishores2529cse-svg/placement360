import { useState } from 'react';
import { postMentorSession } from '../services/api';
import { Mic, Send, Activity, Brain, CheckCircle2, MessageSquare } from 'lucide-react';

export default function MentorLounge() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{role: 'mentor'|'student', text: string}[]>([
    { role: 'mentor', text: "Hello Kishore! Let's start your technical viva. Today we are focusing on Dynamic Programming. Are you ready?" }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [telemetry, setTelemetry] = useState({ confidence: 0, clarity: 'N/A' });

  const handleSend = async () => {
    if(!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    setHistory(prev => [...prev, { role: 'student', text: userMessage }]);
    setIsProcessing(true);

    const res = await postMentorSession({
      mode: 'technical_viva',
      targetTopic: 'Dynamic Programming',
      userAudioOrTextInput: userMessage
    });

    setHistory(prev => [...prev, { role: 'mentor', text: res.mentorResponse }]);
    setTelemetry({ confidence: res.confidenceScore, clarity: res.speechClarityRating });
    setIsProcessing(false);
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-background">
      {/* Main Interaction Area */}
      <div className="flex-1 flex flex-col border-r border-border relative">
        {/* Center Stage: Avatar Placeholder */}
        <div className="h-2/5 bg-gradient-to-b from-indigo-950 to-background flex items-center justify-center relative overflow-hidden shrink-0 border-b border-border">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Abstract Avatar Representation */}
            <div className={`w-32 h-32 rounded-full border-4 ${isProcessing ? 'border-emerald-400 animate-pulse' : 'border-indigo-500'} bg-black/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.4)]`}>
               <Brain className={`w-16 h-16 ${isProcessing ? 'text-emerald-400' : 'text-indigo-400'}`} />
            </div>
            <div className="mt-4 px-4 py-1.5 rounded-full bg-background/50 backdrop-blur-md border border-white/10 text-sm font-medium flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-emerald-500 animate-ping' : 'bg-indigo-500'}`}></div>
              {isProcessing ? 'Kishore-AI is thinking...' : 'Kishore-AI Listening'}
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-auto p-6 space-y-6 bg-muted/10">
          {history.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === 'student' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-card border border-border text-foreground rounded-bl-sm'}`}>
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {isProcessing && (
             <div className="flex justify-start">
               <div className="bg-card border border-border rounded-2xl rounded-bl-sm p-4 flex gap-1 items-center">
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
               </div>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-card border-t border-border flex items-center gap-3 shrink-0">
          <button className="p-3 bg-muted hover:bg-muted/80 rounded-xl text-muted-foreground transition-colors">
            <Mic className="w-6 h-6" />
          </button>
          <input 
            type="text" 
            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            placeholder="Type your response..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isProcessing || !input.trim()}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors shadow-md"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Right Sidebar: Telemetry & Feedback */}
      <div className="w-full md:w-80 bg-card p-6 flex flex-col gap-6 overflow-auto">
        <h3 className="font-bold text-lg border-b border-border pb-2">Live Session Telemetry</h3>
        
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-indigo-900 flex items-center gap-2"><Activity className="w-4 h-4"/> Confidence Meter</span>
            <span className="font-bold text-indigo-700">{telemetry.confidence}%</span>
          </div>
          <div className="w-full bg-indigo-200/50 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full transition-all duration-1000" style={{width: `${telemetry.confidence}%`}}></div>
          </div>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-900 flex items-center gap-2"><MessageSquare className="w-4 h-4"/> Comm. Clarity</span>
            <span className="font-bold text-emerald-700 bg-emerald-200/50 px-2 py-0.5 rounded text-xs uppercase">{telemetry.clarity}</span>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">AI Feedback Insights</h4>
          <div className="space-y-3">
            <div className="flex gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <p className="text-foreground/80">Strong understanding of foundational concepts.</p>
            </div>
            <div className="flex gap-3 text-sm">
              <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 font-bold text-xs">!</div>
              <p className="text-foreground/80">Try to use more precise technical vocabulary when describing optimization techniques.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
