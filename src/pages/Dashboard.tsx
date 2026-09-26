import { useEffect, useState } from 'react';
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import {
  Target, Flame, BookOpen, Brain, Zap, ChevronRight,
  CheckCircle2, Clock, PlayCircle, Award, Activity,
  TrendingUp, AlertTriangle, Lightbulb, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../components/layout/SidebarLayout';
import { MetricCard, RadialGauge } from '../components/dashboard/MetricCard';
import { SkeletonDashboard } from '../components/dashboard/SkeletonLoaders';
import { getDashboard, getReadinessHistory } from '../services/api';
import type { DashboardData, ReadinessHistoryPoint, SkillData } from '../types';

// ─── Skill Progress Bar ────────────────────────────────────────────────────────
function SkillBar({ skill }: { skill: SkillData }) {
  const color = skill.classification === 'Strong' ? 'emerald' :
    skill.classification === 'Developing' ? 'amber' : 'red';

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-28 text-sm font-medium text-gray-700 flex-shrink-0 truncate" title={skill.display_name}>
        {skill.display_name}
      </div>
      <div className="flex-1">
        <div className="pp-progress-bar">
          <div
            className="pp-progress-bar-fill"
            style={{
              width: `${skill.score}%`,
              background: color === 'emerald' ? 'linear-gradient(90deg, #059669, #10b981)' :
                color === 'amber' ? 'linear-gradient(90deg, #d97706, #f59e0b)' :
                'linear-gradient(90deg, #dc2626, #ef4444)',
            }}
          />
        </div>
      </div>
      <div className="w-10 text-sm font-bold text-right" style={{
        color: color === 'emerald' ? '#059669' : color === 'amber' ? '#d97706' : '#dc2626'
      }}>
        {Math.round(skill.score)}%
      </div>
      <div className={`pp-badge-${color === 'emerald' ? 'strong' : color === 'amber' ? 'developing' : 'needs'} hidden sm:inline-flex`}>
        {skill.classification}
      </div>
    </div>
  );
}

// ─── Activity Item ─────────────────────────────────────────────────────────────
function ActivityItem({ activity }: { activity: DashboardData['recent_activity'][0] }) {
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const iconMap: Record<string, React.ReactNode> = {
    lesson_complete: <BookOpen className="w-4 h-4 text-emerald-600" />,
    assessment_complete: <CheckCircle2 className="w-4 h-4 text-blue-600" />,
    skill_improved: <TrendingUp className="w-4 h-4 text-purple-600" />,
  };

  const bgMap: Record<string, string> = {
    lesson_complete: 'bg-emerald-50',
    assessment_complete: 'bg-blue-50',
    skill_improved: 'bg-purple-50',
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 group">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${bgMap[activity.activity_type] || 'bg-gray-50'}`}>
        {iconMap[activity.activity_type] || <Activity className="w-4 h-4 text-gray-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800 truncate">{activity.title}</div>
        <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
          {activity.category && <span className="font-medium text-gray-600">{activity.category}</span>}
          {activity.score !== undefined && activity.score !== null && (
            <span className="text-emerald-600 font-bold">Score: {Math.round(activity.score)}%</span>
          )}
          {activity.score_change !== undefined && activity.score_change !== null && (
            <span className={activity.score_change > 0 ? 'text-emerald-500' : 'text-red-500'}>
              {activity.score_change > 0 ? '+' : ''}{Math.round(activity.score_change)}%
            </span>
          )}
        </div>
      </div>
      <div className="text-xs text-gray-400 flex-shrink-0">{timeAgo(activity.created_at)}</div>
    </div>
  );
}

// ─── Recommendation Card ──────────────────────────────────────────────────────
function RecommendationItem({ rec }: { rec: DashboardData['recommendations'][0] }) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`mt-0.5 flex-shrink-0 ${
            rec.priority === 'high' ? 'pp-priority-high' :
            rec.priority === 'medium' ? 'pp-priority-medium' : 'pp-priority-low'
          }`}>
            {rec.priority}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-gray-800">{rec.title}</div>
            <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{rec.description}</div>
          </div>
        </div>
        {rec.track_id && (
          <Link
            to={`/learn`}
            className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 group-hover:underline"
          >
            Start <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Today Task ───────────────────────────────────────────────────────────────
function TodayTaskItem({ task, index }: { task: DashboardData['today_tasks'][0]; index: number }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all">
      <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-600 font-bold text-sm">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800 truncate">{task.title}</div>
        <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
          {task.estimated_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {task.estimated_minutes} min
            </span>
          )}
          <span className={task.priority === 'high' ? 'text-red-500 font-semibold' :
            task.priority === 'medium' ? 'text-amber-500 font-semibold' : 'text-gray-400'}>
            {task.priority} priority
          </span>
        </div>
      </div>
      <Link to="/learn" className="pp-btn-secondary text-xs py-1.5 px-3 whitespace-nowrap">
        Start
      </Link>
    </div>
  );
}

// ─── Custom Tooltip for Chart ─────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-3 border border-gray-100 text-sm">
        <div className="font-semibold text-gray-700 mb-1">{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.color }} className="font-bold">
            {p.name}: {p.value}%
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [history, setHistory] = useState<ReadinessHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getDashboard(),
      getReadinessHistory('monthly'),
    ])
      .then(([dashData, hist]) => {
        setData(dashData);
        setHistory(hist);
        setError(null);
      })
      .catch(err => setError(err.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SidebarLayout title="Overview" subtitle="Your personalized placement preparation command center">
        <SkeletonDashboard />
      </SidebarLayout>
    );
  }

  if (error) {
    return (
      <SidebarLayout title="Overview">
        <div className="p-6 flex items-center justify-center h-96">
          <div className="pp-card p-8 text-center max-w-sm">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="font-bold text-gray-800 text-lg mb-2">Failed to load dashboard</h3>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="pp-btn-primary w-full justify-center"
            >
              Retry
            </button>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!data) return null;

  const { student, readiness, streak, today_tasks, recommendations, recent_activity, skills } = data;

  // Format chart data
  const chartData = history.map(h => ({
    date: new Date(h.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    'Readiness': Math.round(h.score),
    'Technical': Math.round(h.technical_score),
  }));

  const topSkills = [...skills].sort((a, b) => b.score - a.score);

  return (
    <SidebarLayout
      title="Overview"
      subtitle={`Welcome back, ${student.name}! Your placement journey continues.`}
    >
      <div className="p-6 space-y-6 animate-fade-up">

        {/* ── Hero Banner ──────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="text-emerald-200 text-sm font-medium mb-1">
                {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <h2 className="text-2xl font-black">Welcome back, {student.name}!</h2>
              <p className="text-emerald-200 text-sm mt-1 flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                Targeting {student.target_role} at {student.target_company}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/15 backdrop-blur rounded-2xl p-4 text-center border border-white/20">
                <div className="text-xs text-emerald-200 uppercase font-bold tracking-wider mb-1">Readiness</div>
                <div className="text-3xl font-black">{Math.round(readiness.overall)}<span className="text-lg">%</span></div>
              </div>
              <div className="bg-orange-500/80 backdrop-blur rounded-2xl p-4 text-center border border-orange-300/30 flex flex-col items-center">
                <Flame className="w-5 h-5 text-yellow-300 mb-1" />
                <div className="text-xl font-bold">{streak.current}</div>
                <div className="text-xs text-orange-200">day streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI Cards ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Placement Readiness"
            value={Math.round(readiness.overall)}
            unit="%"
            trend={3.2}
            trendLabel="vs last week"
            icon={<Target className="w-5 h-5" />}
            accent="emerald"
          />
          <MetricCard
            title="Learning Progress"
            value={Math.round(skills.reduce((a, s) => a + s.score, 0) / Math.max(skills.length, 1))}
            unit="%"
            trend={2.1}
            trendLabel="avg skill score"
            icon={<BookOpen className="w-5 h-5" />}
            accent="blue"
          />
          <MetricCard
            title="Current Streak"
            value={streak.current}
            unit=" days"
            subtitle={`Best: ${streak.longest} days`}
            icon={<Flame className="w-5 h-5" />}
            accent="orange"
          />
          <MetricCard
            title="Skill Strength"
            value={Math.round(readiness.technical)}
            unit="%"
            trend={1.8}
            trendLabel="technical avg"
            icon={<Brain className="w-5 h-5" />}
            accent="purple"
          />
        </div>

        {/* ── Readiness Chart + Skill Performance ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 pp-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="pp-section-title">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  Placement Readiness
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Historical readiness progression</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-600">{Math.round(readiness.overall)}%</div>
                <div className="text-xs text-emerald-500 font-medium">Overall</div>
              </div>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <defs>
                    <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="Readiness"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fill="url(#readinessGrad)"
                    dot={{ fill: '#059669', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Technical"
                    stroke="#6366f1"
                    strokeWidth={1.5}
                    strokeDasharray="5 3"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-52 text-gray-400 text-sm">
                No history data yet — start learning to see trends!
              </div>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 rounded inline-block" /> Overall Readiness</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-indigo-500 rounded inline-block border-dashed" /> Technical</span>
            </div>
          </div>

          {/* Readiness Gauge + breakdown */}
          <div className="pp-card p-6 flex flex-col">
            <h3 className="pp-section-title mb-4">
              <Target className="w-5 h-5 text-emerald-600" />
              Readiness Breakdown
            </h3>
            <div className="flex justify-center mb-4">
              <RadialGauge value={Math.round(readiness.overall)} label="Overall" size={130} />
            </div>
            <div className="space-y-3 flex-1">
              {[
                { label: 'Technical', value: readiness.technical },
                { label: 'Aptitude', value: readiness.aptitude },
                { label: 'Communication', value: readiness.communication },
                { label: 'Interview', value: readiness.interview },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                    <span>{item.label}</span>
                    <span className="font-bold">{Math.round(item.value)}%</span>
                  </div>
                  <div className="pp-progress-bar">
                    <div className="pp-progress-bar-fill" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Skill Performance + Today's Tasks ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skills */}
          <div className="pp-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="pp-section-title">
                <Brain className="w-5 h-5 text-emerald-600" />
                Skill Performance
              </h3>
              <Link to="/analytics" className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-1 divide-y divide-gray-50">
              {topSkills.slice(0, 7).map(skill => (
                <SkillBar key={skill.id} skill={skill} />
              ))}
            </div>
          </div>

          {/* Today's Preparation */}
          <div className="pp-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="pp-section-title">
                <Zap className="w-5 h-5 text-emerald-600" />
                Today's Preparation
              </h3>
              <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                {today_tasks.length} tasks
              </span>
            </div>
            <div className="space-y-2">
              {today_tasks.length > 0 ? (
                today_tasks.map((task, i) => (
                  <TodayTaskItem key={task.id} task={task} index={i} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-300" />
                  <div className="text-sm font-medium">All caught up!</div>
                  <div className="text-xs mt-1">Complete an assessment to get new recommendations</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── AI Recommendations + Recent Activity ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recommendations */}
          <div className="pp-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="pp-section-title">
                <Lightbulb className="w-5 h-5 text-emerald-600" />
                AI Recommendations
              </h3>
            </div>
            <div className="space-y-2">
              {recommendations.length > 0 ? (
                recommendations.slice(0, 4).map(rec => (
                  <RecommendationItem key={rec.id} rec={rec} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <Award className="w-10 h-10 mx-auto mb-2 text-emerald-300" />
                  All skills are strong! Keep it up.
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="pp-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="pp-section-title">
                <Activity className="w-5 h-5 text-emerald-600" />
                Recent Activity
              </h3>
            </div>
            <div>
              {recent_activity.length > 0 ? (
                recent_activity.slice(0, 6).map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <PlayCircle className="w-10 h-10 mx-auto mb-2 text-emerald-300" />
                  No activity yet. Start a lesson!
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </SidebarLayout>
  );
}
