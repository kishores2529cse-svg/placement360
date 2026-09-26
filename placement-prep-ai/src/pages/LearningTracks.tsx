import { useEffect, useState } from 'react';
import {
  BookOpen, CheckCircle2, Lock, PlayCircle, ChevronRight, ChevronDown,
  Clock, BarChart2, X, Play, Award, AlertTriangle, Layers, Code2, Coffee,
  Database, Brain, MessageCircle, Users, Zap,
} from 'lucide-react';
import SidebarLayout from '../components/layout/SidebarLayout';
import { getTracksData, completeLesson } from '../services/api';
import type { TrackData, ModuleData, LessonData } from '../types';

const ICON_MAP: Record<string, React.ReactNode> = {
  Code2: <Code2 className="w-5 h-5" />,
  Coffee: <Coffee className="w-5 h-5" />,
  Database: <Database className="w-5 h-5" />,
  Brain: <Brain className="w-5 h-5" />,
  MessageCircle: <MessageCircle className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
};

const COLOR_MAP: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  teal: 'bg-teal-100 text-teal-700 border-teal-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

const PROGRESS_COLOR_MAP: Record<string, string> = {
  emerald: 'from-emerald-500 to-emerald-400',
  blue: 'from-blue-500 to-blue-400',
  orange: 'from-orange-500 to-orange-400',
  purple: 'from-purple-500 to-purple-400',
  teal: 'from-teal-500 to-teal-400',
  red: 'from-red-500 to-red-400',
  indigo: 'from-indigo-500 to-indigo-400',
};

// ─── Module status icon ───────────────────────────────────────────────────────
function StatusIcon({ status }: { status: ModuleData['status'] }) {
  if (status === 'completed') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
  if (status === 'in_progress') return <PlayCircle className="w-5 h-5 text-amber-500 animate-pulse" />;
  if (status === 'recommended') return <Zap className="w-5 h-5 text-orange-500" />;
  if (status === 'available') return <PlayCircle className="w-5 h-5 text-blue-400" />;
  return <Lock className="w-5 h-5 text-gray-300" />;
}

// ─── Lesson Drawer ────────────────────────────────────────────────────────────
function LessonDrawer({
  module,
  onClose,
  onLessonComplete,
}: {
  module: ModuleData;
  onClose: () => void;
  onLessonComplete: (lessonId: number) => void;
}) {
  const [completing, setCompleting] = useState<number | null>(null);

  const handleComplete = async (lesson: LessonData) => {
    if (lesson.is_completed || completing) return;
    setCompleting(lesson.id);
    try {
      await completeLesson(lesson.id, lesson.estimated_minutes);
      onLessonComplete(lesson.id);
    } catch (err) {
      console.error('Failed to complete lesson:', err);
    } finally {
      setCompleting(null);
    }
  };

  const difficultyColor = (d: string) =>
    d === 'easy' ? 'text-emerald-600 bg-emerald-50' :
    d === 'hard' ? 'text-red-600 bg-red-50' :
    'text-amber-600 bg-amber-50';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-up">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className={`p-6 border-b border-gray-100 flex justify-between items-start ${
          module.status === 'completed' ? 'bg-emerald-50' : 'bg-gray-50'
        }`}>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              {module.difficulty} · {module.estimated_minutes} min
            </div>
            <h2 className="text-xl font-black text-gray-900">{module.title}</h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="text-sm text-gray-500">
                {module.completed_lessons}/{module.total_lessons} lessons
              </div>
              <div className="flex-1 pp-progress-bar max-w-32">
                <div className="pp-progress-bar-fill" style={{ width: `${module.progress_percent}%` }} />
              </div>
              <div className="text-sm font-bold text-emerald-600">{Math.round(module.progress_percent)}%</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors ml-4"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lessons */}
        <div className="flex-1 overflow-y-auto pp-scrollbar p-4 space-y-2">
          <p className="text-sm font-semibold text-gray-500 px-2 mb-3">
            {module.description || `Complete all ${module.total_lessons} lessons to finish this module.`}
          </p>
          {module.lessons.map((lesson, idx) => (
            <div
              key={lesson.id}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                lesson.is_completed
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-sm'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                lesson.is_completed ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {lesson.is_completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold ${lesson.is_completed ? 'text-emerald-700' : 'text-gray-800'} truncate`}>
                  {lesson.title}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{lesson.estimated_minutes} min
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${difficultyColor(lesson.difficulty)}`}>
                    {lesson.difficulty}
                  </span>
                </div>
              </div>
              {lesson.is_completed ? (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">Done</span>
              ) : (
                <button
                  onClick={() => handleComplete(lesson)}
                  disabled={completing === lesson.id}
                  className="pp-btn-primary text-xs py-1.5 px-3 disabled:opacity-60"
                >
                  {completing === lesson.id ? 'Saving...' : 'Complete'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Track Card ───────────────────────────────────────────────────────────────
function TrackCard({
  track,
  onModuleSelect,
}: {
  track: TrackData;
  onModuleSelect: (module: ModuleData, track: TrackData) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const color = track.color || 'emerald';
  const iconColors = COLOR_MAP[color] || COLOR_MAP.emerald;
  const progressGrad = PROGRESS_COLOR_MAP[color] || PROGRESS_COLOR_MAP.emerald;
  const icon = ICON_MAP[track.icon || 'BookOpen'] || <BookOpen className="w-5 h-5" />;

  const inProgressMod = track.modules.find(m => m.status === 'in_progress');

  return (
    <div className="pp-card overflow-hidden">
      <div className="p-5">
        {/* Track header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${iconColors}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base leading-tight">{track.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{track.description}</p>
          </div>
          {track.is_completed && (
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex-shrink-0">
              <Award className="w-3 h-3" /> Done
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${progressGrad} transition-all duration-700`}
                style={{ width: `${track.progress_percent}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-bold text-gray-700 flex-shrink-0">{Math.round(track.progress_percent)}%</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <BarChart2 className="w-3 h-3" />
            {track.completed_modules}/{track.total_modules} modules
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {track.estimated_hours}h est.
          </span>
          {inProgressMod && (
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <PlayCircle className="w-3 h-3" />
              {inProgressMod.title}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {inProgressMod ? (
            <button
              onClick={() => onModuleSelect(inProgressMod, track)}
              className="pp-btn-primary flex-1 justify-center text-xs"
            >
              <Play className="w-3 h-3" /> Continue Learning
            </button>
          ) : (
            <button
              onClick={() => setExpanded(v => !v)}
              className="pp-btn-secondary flex-1 justify-center text-xs"
            >
              View Modules
            </button>
          )}
          <button
            onClick={() => setExpanded(v => !v)}
            className="pp-btn-ghost px-3"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expandable modules list */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-1 max-h-64 overflow-y-auto pp-scrollbar">
          {track.modules.map((mod, idx) => (
            <button
              key={mod.id}
              onClick={() => mod.status !== 'locked' && onModuleSelect(mod, track)}
              disabled={mod.status === 'locked'}
              className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl text-left transition-all ${
                mod.status === 'locked'
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-white hover:shadow-sm cursor-pointer'
              } ${mod.status === 'in_progress' ? 'bg-white shadow-sm border border-amber-200' : ''}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono text-gray-400 w-5 flex-shrink-0">{idx + 1}</span>
                <StatusIcon status={mod.status} />
                <span className={`text-sm font-medium truncate ${
                  mod.status === 'completed' ? 'text-emerald-700 line-through' :
                  mod.status === 'locked' ? 'text-gray-400' : 'text-gray-800'
                }`}>
                  {mod.title}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {mod.progress_percent > 0 && mod.status !== 'completed' && (
                  <span className="text-xs font-bold text-amber-500">{Math.round(mod.progress_percent)}%</span>
                )}
                {mod.status !== 'locked' && <ChevronRight className="w-4 h-4 text-gray-400" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main LearningTracks Page ─────────────────────────────────────────────────
export default function LearningTracks() {
  const [tracks, setTracks] = useState<TrackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<{ module: ModuleData; track: TrackData } | null>(null);

  useEffect(() => {
    setLoading(true);
    getTracksData()
      .then(data => { setTracks(data); setError(null); })
      .catch(err => setError(err.message || 'Failed to load learning tracks'))
      .finally(() => setLoading(false));
  }, []);

  const handleLessonComplete = (lessonId: number) => {
    // Optimistically update state
    setTracks(prev =>
      prev.map(track => ({
        ...track,
        modules: track.modules.map(mod => ({
          ...mod,
          lessons: mod.lessons.map(l =>
            l.id === lessonId ? { ...l, is_completed: true } : l
          ),
          completed_lessons: mod.lessons.filter(l =>
            l.id === lessonId ? true : l.is_completed
          ).length,
        })),
      }))
    );
    // Update active module
    if (activeModule) {
      setActiveModule(prev => prev ? {
        ...prev,
        module: {
          ...prev.module,
          lessons: prev.module.lessons.map(l =>
            l.id === lessonId ? { ...l, is_completed: true } : l
          ),
        },
      } : null);
    }
  };

  // Summary stats
  const totalCompleted = tracks.reduce((a, t) => a + t.completed_modules, 0);
  const totalModules = tracks.reduce((a, t) => a + t.total_modules, 0);
  const avgProgress = tracks.length > 0
    ? Math.round(tracks.reduce((a, t) => a + t.progress_percent, 0) / tracks.length)
    : 0;

  return (
    <SidebarLayout
      title="Learning Tracks"
      subtitle="Master skills step-by-step through structured learning paths"
    >
      <div className="p-6 space-y-6">
        {/* Stats strip */}
        {!loading && !error && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Tracks Available', value: tracks.length, color: 'text-emerald-600' },
              { label: 'Modules Completed', value: `${totalCompleted}/${totalModules}`, color: 'text-blue-600' },
              { label: 'Average Progress', value: `${avgProgress}%`, color: 'text-purple-600' },
            ].map(stat => (
              <div key={stat.label} className="pp-card p-4 text-center">
                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="pp-card p-5">
                <div className="pp-skeleton h-10 w-10 rounded-xl mb-3" />
                <div className="pp-skeleton h-5 w-3/4 mb-2" />
                <div className="pp-skeleton h-3 w-full mb-1" />
                <div className="pp-skeleton h-3 w-2/3 mb-4" />
                <div className="pp-skeleton h-2 w-full rounded-full mb-4" />
                <div className="pp-skeleton h-9 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="pp-card p-8 text-center max-w-sm mx-auto">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="font-bold text-gray-800 mb-2">Failed to load tracks</h3>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="pp-btn-primary w-full justify-center">
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {tracks.map(track => (
              <TrackCard
                key={track.id}
                track={track}
                onModuleSelect={(mod, t) => setActiveModule({ module: mod, track: t })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lesson Drawer */}
      {activeModule && (
        <LessonDrawer
          module={activeModule.module}
          onClose={() => setActiveModule(null)}
          onLessonComplete={handleLessonComplete}
        />
      )}
    </SidebarLayout>
  );
}
