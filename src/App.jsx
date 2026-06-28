import { useState } from 'react';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import { useAuth } from './hooks/useAuth';
import DashboardTab from './tabs/DashboardTab';
import BacktestingTab from './tabs/BacktestingTab';
import PipelineTab from './tabs/PipelineTab';
import ImportTab from './tabs/ImportTab';
import MonteCarloTab from './tabs/MonteCarloTab';
import MppTab from './tabs/MppTab';
import KnockoutSimTab from './tabs/KnockoutSimTab';

const tabs = {
  dashboard: DashboardTab,
  backtesting: BacktestingTab,
  pipeline: PipelineTab,
  import: ImportTab,
  monteCarlo: MonteCarloTab,
  mpp: MppTab,
  knockout: KnockoutSimTab,
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authOpen, setAuthOpen] = useState(false);
  const { user, signOut } = useAuth();
  const ActiveComponent = tabs[activeTab] || DashboardTab;

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onAuthClick={() => setAuthOpen(true)}
        onSignOut={signOut}
      />

      {/* Main content area */}
      <main className="lg:pl-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <ActiveComponent />
        </div>
      </main>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
}

export default App
