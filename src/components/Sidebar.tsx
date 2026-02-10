import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Upload, Moon } from 'lucide-react';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Панель' },
  { to: '/documents', icon: FileText, label: 'Документы' },
  { to: '/upload', icon: Upload, label: 'Загрузить' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
            <Moon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base">Islamic AI</h1>
            <p className="text-xs text-slate-400">Админ панель</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">
            A
          </div>
          <div>
            <p className="text-sm font-medium">Админ</p>
            <p className="text-xs text-slate-400">Управление</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
