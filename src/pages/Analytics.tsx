import { useEffect, useState } from 'react';
import { getAnalyticsSummary } from '../services/api';
import type { AnalyticsSummary } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Award, Target } from 'lucide-react';

export default function Analytics() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    getAnalyticsSummary().then(setData);
  }, []);

  if (!data) {
    return <div className="p-8 flex justify-center items-center h-full animate-pulse"><div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  // Mock granular data for the table
  const tableData = [
    { topic: 'Arrays & Hashing', time: '12m 30s', accuracy: '95%', status: 'Excellent' },
    { topic: 'Two Pointers', time: '18m 45s', accuracy: '82%', status: 'Good' },
    { topic: 'Dynamic Programming', time: '45m 10s', accuracy: '45%', status: 'Needs Work' },
    { topic: 'Graph Theory', time: '30m 00s', accuracy: '60%', status: 'Average' },
    { topic: 'System Design Basics', time: '25m 15s', accuracy: '88%', status: 'Good' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 overflow-auto h-full">
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Analytics Engine</h1>
        <p className="text-muted-foreground mt-2 text-lg">Deep dive into your performance metrics and preparation readiness.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Radar Chart Card */}
        <div className="lg:col-span-1 bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-lg transition-shadow flex flex-col">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-indigo-500" /> Core Domains</h3>
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.categories}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
                <Radar name="Score" dataKey="score" stroke="#6366f1" strokeWidth={2} fill="#818cf8" fillOpacity={0.5} />
                <Tooltip wrapperClassName="rounded-xl shadow-xl border-none" />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strengths & Weaknesses / Highlights */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-6 flex flex-col">
            <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2"><Award className="w-5 h-5" /> Top Strengths</h3>
            <ul className="space-y-3 flex-1">
              {data.strengths.map(s => (
                <li key={s} className="flex items-center gap-3 bg-white/60 p-3 rounded-xl border border-emerald-200/50">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span className="font-semibold text-emerald-800">{s}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 rounded-3xl p-6 flex flex-col">
            <h3 className="text-lg font-bold text-rose-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Areas to Improve</h3>
            <ul className="space-y-3 flex-1">
              {data.weaknesses.map(w => (
                <li key={w} className="flex items-center gap-3 bg-white/60 p-3 rounded-xl border border-rose-200/50">
                  <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                  <span className="font-semibold text-rose-800">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Granular Breakdown Table */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border bg-muted/20">
          <h3 className="text-xl font-bold">Granular Topic Breakdown</h3>
          <p className="text-sm text-muted-foreground mt-1">Contrasting Time-to-Solve vs Accuracy</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Topic</th>
                <th className="px-6 py-4 font-semibold">Avg Time to Solve</th>
                <th className="px-6 py-4 font-semibold">Accuracy</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tableData.map((row, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{row.topic}</td>
                  <td className="px-6 py-4 font-mono text-sm text-muted-foreground">{row.time}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{row.accuracy}</span>
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden hidden sm:block">
                        <div 
                          className={`h-full rounded-full ${parseInt(row.accuracy) > 80 ? 'bg-green-500' : parseInt(row.accuracy) > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: row.accuracy }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide
                      ${row.status === 'Excellent' ? 'bg-green-100 text-green-700' : 
                        row.status === 'Good' ? 'bg-blue-100 text-blue-700' : 
                        row.status === 'Average' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }
                    `}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
