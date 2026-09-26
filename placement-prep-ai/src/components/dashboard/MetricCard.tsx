import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon: ReactNode;
  accent?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  subtitle,
  trend,
  trendLabel,
  icon,
  accent = 'emerald',
}: MetricCardProps) {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;

  return (
    <div className="pp-card p-6 hover:shadow-lg transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${accent}-100 text-${accent}-600 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
            isPositive ? 'bg-emerald-50 text-emerald-600' :
            isNegative ? 'bg-red-50 text-red-500' :
            'bg-gray-50 text-gray-500'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> :
             isNegative ? <TrendingDown className="w-3 h-3" /> :
             <Minus className="w-3 h-3" />}
            {Math.abs(trend).toFixed(1)}{unit === '%' ? '' : ''}%
          </div>
        )}
      </div>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-black text-gray-900">{value}</span>
        {unit && <span className="text-lg font-bold text-gray-400 mb-0.5">{unit}</span>}
      </div>
      <div className="mt-1">
        <div className="text-sm font-semibold text-gray-600">{title}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
        {trendLabel && (
          <div className="text-xs text-gray-400 mt-0.5">{trendLabel}</div>
        )}
      </div>
    </div>
  );
}

// ─── Radial Gauge ─────────────────────────────────────────────────────────────
interface RadialGaugeProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function RadialGauge({ value, size = 120, strokeWidth = 10, label }: RadialGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - value / 100);
  const color = value >= 75 ? '#059669' : value >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="text-center -mt-2">
        <div className="text-2xl font-black" style={{ color }}>{value}<span className="text-base font-bold text-gray-400">%</span></div>
        {label && <div className="text-xs font-medium text-gray-500 mt-0.5">{label}</div>}
      </div>
    </div>
  );
}
