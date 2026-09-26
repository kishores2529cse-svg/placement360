import { useEffect, useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell,
} from 'recharts';
import {
  BarChart3, TrendingUp, TrendingDown, Target, Brain, Award,
  BookOpen, CheckCircle2, Flame, AlertTriangle, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../components/layout/SidebarLayout';
import { getAnalyticsOverview, getReadinessHistory } from '../services/api';
import type { AnalyticsOverview, ReadinessHistoryPoint } from '../types';

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-xl rounded-xl p-3 border border-gray-100 text-sm">
        <div className="font-bold text-gray-700 mb-2">{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} style={{ color: p.color || p.fill }} className="flex items-center justify-between gap-4">
            <span className="text-gray-500">{p.name || p.dataKey}:</span>
            <span className="font-bold">{p.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// ─── Skill Radar ──────────────────────────────────────────────────────────────
function SkillRadar({ skills }: { skills: AnalyticsOverview['skills'] }) {
  const data = skills.slice(0, 8).map(s => ({
    subject: s.display_name.length > 10 ? s.display_name.slice(0, 10) + '…' : s.display_name,
    score: Math.round(s.score),
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }} />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#059669"
          fill="#059669"
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ─── Readiness Trend Chart ────────────────────────────────────────────────────
function ReadinessTrend({ data, period, onPeriodChange }: {
  data: ReadinessHistoryPoint[];
  period: string;
  onPeriodChange: (p: 'daily' | 'weekly' | 'monthly') => void;
}) {
  const chartData = data.map(h => ({
    date: new Date(h.date).toLocaleDateString('en', {
      month: 'short',
      day: 'numeric',
    }),
    Overall: Math.round(h.score),
    Technical: Math.round(h.technical_score),
    Aptitude: Math.round(h.aptitude_score),
    Communication: Math.round(h.communication_score),
  }));

  return (
    <div className="pp-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="pp-section-title">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Readiness Trend
        </h3>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['daily', 'weekly', 'monthly'] as const).map(p => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize ${
                period === p
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <defs>
              {[
                { id: 'overall', color: '#059669' },
                { id: 'tech', color: '#6366f1' },
                { id: 'apt', color: '#f59e0b' },
              ].map(({ id, color }) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <YAxis domain={[40, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Overall" stroke="#059669" strokeWidth={2.5} fill="url(#overall)" />
            <Area type="monotone" dataKey="Technical" stroke="#6366f1" strokeWidth={1.5} fill="url(#tech)" />
            <Area type="monotone" dataKey="Aptitude" stroke="#f59e0b" strokeWidth={1.5} fill="url(#apt)" />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-52 text-gray-400 text-sm">
          No history data yet
        </div>
      )}
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 rounded inline-block" /> Overall</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-indigo-500 rounded inline-block" /> Technical</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-400 rounded inline-block" /> Aptitude</span>
      </div>
    </div>
  );
}

// ─── Skill Bar Chart ──────────────────────────────────────────────────────────
function SkillBarChart({ skills }: { skills: AnalyticsOverview['skills'] }) {
  const data = skills.map(s => ({
    name: s.display_name.length > 14 ? s.display_name.slice(0, 14) + '…' : s.display_name,
    score: Math.round(s.score),
    classification: s.classification,
  }));

  const getBarColor = (classification: string) =>
    classification === 'Strong' ? '#059669' :
    classification === 'Developing' ? '#f59e0b' : '#ef4444';

  return (
    <div className="pp-card p-6">
      <h3 className="pp-section-title mb-4">
        <Brain className="w-5 h-5 text-emerald-600" />
        Skill Scores
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 70 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getBarColor(entry.classification)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Weakness Cards ───────────────────────────────────────────────────────────
function WeaknessCards({ weaknesses }: { weaknesses: AnalyticsOverview['weaknesses'] }) {
  if (!weaknesses.length) return null;
  return (
    <div className="pp-card p-6">
      <h3 className="pp-section-title mb-4">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        Focus Areas
      </h3>
      <div className="space-y-3">
        {weaknesses.map((w, i) => (
          <div key={i} className="flex items-center gap-4 p-3 bg-red-50 border border-red-100 rounded-xl">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-800">{w.display_name}</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="pp-progress-bar flex-1">
                  <div className="pp-progress-bar-fill" style={{
                    width: `${w.score}%`,
                    background: 'linear-gradient(90deg, #dc2626, #ef4444)',
                  }} />
                </div>
                <span className="text-sm font-bold text-red-600">{Math.round(w.score)}%</span>
                {w.trend !== 0 && (
                  <span className={`text-xs font-bold ${w.trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {w.trend > 0 ? '▲' : '▼'} {Math.abs(w.trend).toFixed(1)}%
                  </span>
                )}
              </div>
              {w.recommended_module_title && (
                <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Recommended: {w.recommended_module_title}
                </div>
              )}
            </div>
            {w.recommended_track_id && (
              <Link to="/learn" className="flex-shrink-0 pp-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                Study <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Analytics Page ──────────────────────────────────────────────────────
export default function Analytics() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [history, setHistory] = useState<ReadinessHistoryPoint[]>([]);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getAnalyticsOverview(), getReadinessHistory(period)])
      .then(([ov, hist]) => { setOverview(ov); setHistory(hist); setError(null); })
      .catch(err => setError(err.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <SidebarLayout title="Analytics" subtitle="Insights into your placement readiness">
        <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="pp-card p-6">
              <div className="pp-skeleton h-4 w-24 mb-3" />
              <div className="pp-skeleton h-8 w-16 mb-2" />
              <div className="pp-skeleton h-3 w-20" />
            </div>
          ))}
        </div>
        <div className="p-6 pt-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="pp-card p-6">
              <div className="pp-skeleton h-4 w-40 mb-4" />
              <div className="pp-skeleton h-64 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </SidebarLayout>
    );
  }

  if (error) {
    return (
      <SidebarLayout title="Analytics">
        <div className="p-6 flex items-center justify-center h-96">
          <div className="pp-card p-8 text-center max-w-sm">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="font-bold text-gray-800 mb-2">Failed to load analytics</h3>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="pp-btn-primary w-full justify-center">
              Retry
            </button>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!overview) return null;

  return (
    <SidebarLayout
      title="Analytics"
      subtitle="Deep insights into your placement readiness and skill progression"
    >
      <div className="p-6 space-y-6 animate-fade-up">

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: <Target className="w-5 h-5" />,
              label: 'Overall Readiness',
              value: `${Math.round(overview.overall_readiness)}%`,
              trend: overview.readiness_trend,
              accent: 'emerald',
            },
            {
              icon: <Brain className="w-5 h-5" />,
              label: 'Avg Skill Score',
              value: `${Math.round(overview.avg_skill_score)}%`,
              trend: undefined,
              accent: 'indigo',
            },
            {
              icon: <BookOpen className="w-5 h-5" />,
              label: 'Lessons Completed',
              value: overview.total_lessons_completed,
              trend: undefined,
              accent: 'blue',
            },
            {
              icon: <Flame className="w-5 h-5" />,
              label: 'Current Streak',
              value: `${overview.current_streak} days`,
              trend: undefined,
              accent: 'orange',
            },
          ].map(item => (
            <div key={item.label} className="pp-card p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-${item.accent}-100 text-${item.accent}-600`}>
                {item.icon}
              </div>
              <div className="text-2xl font-black text-gray-900 flex items-center gap-2">
                {item.value}
                {item.trend !== undefined && (
                  <span className={`text-sm font-bold ${item.trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {item.trend >= 0 ? <TrendingUp className="w-4 h-4 inline" /> : <TrendingDown className="w-4 h-4 inline" />}
                    {Math.abs(item.trend).toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Strengths row */}
        {overview.strengths.length > 0 && (
          <div className="pp-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-gray-800">Strengths</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {overview.strengths.map(s => (
                <span key={s} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-xl">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Readiness Trend */}
          <ReadinessTrend data={history} period={period} onPeriodChange={setPeriod} />

          {/* Skill Radar */}
          <div className="pp-card p-6">
            <h3 className="pp-section-title mb-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Skill Radar
            </h3>
            <p className="text-xs text-gray-400 mb-4">Visual overview of your competency profile</p>
            <SkillRadar skills={overview.skills} />
          </div>

          {/* Skill Bar Chart */}
          <SkillBarChart skills={overview.skills} />

          {/* Weakness / Focus Areas */}
          <WeaknessCards weaknesses={overview.weaknesses} />
        </div>

      </div>
    </SidebarLayout>
  );
}
