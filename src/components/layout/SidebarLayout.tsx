import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  ClipboardCheck,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  LogOut,
  GraduationCap,
  Bell,
  Search,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, owner: 'ashwin' },
  { to: '/learn', label: 'Learning', icon: BookOpen, owner: 'ashwin' },
  { to: '/assessment', label: 'Assessments', icon: ClipboardCheck, owner: 'kishore' },
  { to: '/mentor', label: 'Mentor', icon: MessageSquare, owner: 'kishore' },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, owner: 'ashwin' },
];

interface SidebarLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function SidebarLayout({ children, title, subtitle }: SidebarLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
        style={{ background: 'linear-gradient(180deg, #064e3b 0%, #065f46 100%)' }}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 bg-emerald-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-emerald-300" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-white font-black text-sm leading-tight">PlacementPrep</div>
              <div className="text-emerald-400 font-semibold text-xs">AI Dashboard</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto pp-scrollbar">
          {!collapsed && (
            <div className="text-emerald-500 text-xs font-bold uppercase tracking-wider px-3 mb-3">
              Navigation
            </div>
          )}
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                 ${isActive
                   ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/50'
                   : 'text-emerald-200 hover:bg-white/10 hover:text-white'
                 }
                 ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium text-sm">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <button
            onClick={() => setCollapsed(v => !v)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-emerald-300 hover:bg-white/10 hover:text-white transition-all w-full ${collapsed ? 'justify-center' : ''}`}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {!collapsed && <span className="text-sm font-medium">Collapse</span>}
          </button>
          <button
            onClick={logout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-emerald-300 hover:bg-red-500/20 hover:text-red-300 transition-all w-full ${collapsed ? 'justify-center' : ''}`}
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl font-black text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48"
              />
            </div>
            <button className="relative w-9 h-9 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center transition-colors">
              <Bell className="w-4 h-4 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto pp-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
