import { useState } from 'react';
import { LayoutDashboard, TrendingUp, Workflow, Upload, Activity, X, Menu, Dices, Target, Swords } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
  { id: 'backtesting', label: 'Backtesting', icon: TrendingUp },
  { id: 'pipeline', label: 'Pipeline', icon: Workflow },
  { id: 'import', label: 'Import', icon: Upload },
  { id: 'monteCarlo', label: 'Monte-Carlo', icon: Dices },
  { id: 'mpp', label: 'MPP Scores', icon: Target },
  { id: 'knockout', label: 'Phases Finales', icon: Swords },
];

export default function Sidebar({ activeTab, onTabChange, user, onAuthClick, onSignOut }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleTabClick = (id) => {
    onTabChange(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Activity size={16} className="text-white" />
          </div>
          <span className="font-bold text-sm text-slate-100 tracking-tight">Sport Prediction Hub</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar panel */}
      <aside
        className={`
          lg:hidden fixed top-14 left-0 bottom-0 z-40 w-64
          bg-slate-950 border-r border-slate-800
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="p-4 pt-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-300 border-l-2 border-emerald-400 pl-[14px]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-slate-500'} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-950 border-r border-slate-800 z-30">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Activity size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 tracking-tight leading-tight">Sport Prediction</h1>
            <p className="text-[11px] text-slate-500 font-medium">Hub</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-300 border-l-2 border-emerald-400 pl-[14px]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-slate-500'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 space-y-2">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={onSignOut}
                className="text-slate-500 hover:text-slate-300 text-[11px] ml-2 shrink-0"
              >
                Déco
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="w-full text-[11px] text-slate-400 hover:text-emerald-400 transition-colors text-left"
            >
              Se connecter →
            </button>
          )}
          <p className="text-[11px] text-slate-600">v1.0.0 · Prédictions IA</p>
        </div>
      </aside>
    </>
  );
}
