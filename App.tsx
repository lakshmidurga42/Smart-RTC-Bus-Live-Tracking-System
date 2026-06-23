import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bus as BusIcon, 
  Map as MapIcon, 
  Mic, 
  LayoutDashboard, 
  Bell, 
  ShieldAlert, 
  Search,
  Menu,
  X,
  Settings,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BusMap from './components/BusMap';
import VoiceAssistant from './components/VoiceAssistant';
import AdminDashboard from './components/AdminDashboard';
import { cn } from './lib/utils';

type Tab = 'map' | 'assistant' | 'admin' | 'alerts' | 'emergency';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [busStates, setBusStates] = useState<any>({});
  const [stops, setStops] = useState<any[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Fetch initial data
    fetch('/api/stops').then(res => res.json()).then(setStops);

    // Setup WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'INIT') {
        setBusStates(data.payload.busStates);
      } else if (data.type === 'BUS_UPDATE') {
        setBusStates((prev: any) => ({
          ...prev,
          [data.payload.busId]: data.payload
        }));
      }
    };

    setSocket(ws);
    return () => ws.close();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return <BusMap busStates={busStates} stops={stops} />;
      case 'assistant':
        return <VoiceAssistant context={{ busStates, stops }} />;
      case 'admin':
        return <AdminDashboard />;
      case 'alerts':
        return (
          <div className="p-8 flex flex-col items-center justify-center h-full text-slate-400">
            <Bell className="w-16 h-16 mb-4 opacity-20" />
            <h2 className="text-xl font-semibold">Notifications</h2>
            <p>No new alerts for your current route.</p>
          </div>
        );
      case 'emergency':
        return (
          <div className="p-8 flex flex-col items-center justify-center h-full bg-red-50">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-48 h-48 bg-red-600 text-white rounded-full shadow-2xl shadow-red-500/50 flex flex-col items-center justify-center gap-2 border-8 border-red-200"
            >
              <ShieldAlert className="w-16 h-16" />
              <span className="font-bold text-xl">PANIC BUTTON</span>
            </motion.button>
            <p className="mt-8 text-red-800 font-medium text-center max-w-xs">
              Pressing this will immediately alert the RTC Control Room and share your live location.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-slate-200 flex flex-col z-50 relative shadow-sm"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-xl text-white">
            <BusIcon className="w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl tracking-tight text-slate-800"
            >
              Smart RTC
            </motion.h1>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <NavItem 
            icon={<MapIcon />} 
            label="Live Tracking" 
            active={activeTab === 'map'} 
            onClick={() => setActiveTab('map')} 
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Mic />} 
            label="AI Assistant" 
            active={activeTab === 'assistant'} 
            onClick={() => setActiveTab('assistant')} 
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<LayoutDashboard />} 
            label="Admin Panel" 
            active={activeTab === 'admin'} 
            onClick={() => setActiveTab('admin')} 
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Bell />} 
            label="Alerts" 
            active={activeTab === 'alerts'} 
            onClick={() => setActiveTab('alerts')} 
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<ShieldAlert />} 
            label="Emergency" 
            active={activeTab === 'emergency'} 
            onClick={() => setActiveTab('emergency')} 
            collapsed={!isSidebarOpen}
            variant="danger"
          />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <NavItem 
            icon={<Settings />} 
            label="Settings" 
            active={false} 
            onClick={() => {}} 
            collapsed={!isSidebarOpen}
          />
          <div className={cn(
            "mt-4 flex items-center gap-3 p-2 rounded-xl bg-slate-50",
            !isSidebarOpen && "justify-center"
          )}>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <User className="w-4 h-4" />
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">Passenger #420</p>
                <p className="text-[10px] text-slate-500 truncate">Pro Member</p>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1 shadow-md hover:bg-slate-50 transition-colors"
        >
          {isSidebarOpen ? <X className="w-3 h-3" /> : <Menu className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-40">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search bus number or route..."
                className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Location</p>
              <p className="text-sm font-semibold text-slate-700">Miyapur, Hyderabad</p>
            </div>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              LIVE
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ 
  icon, 
  label, 
  active, 
  onClick, 
  collapsed,
  variant = 'default'
}: { 
  icon: React.ReactNode, 
  label: string, 
  active: boolean, 
  onClick: () => void,
  collapsed: boolean,
  variant?: 'default' | 'danger'
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group",
        active 
          ? (variant === 'danger' ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700")
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
        collapsed && "justify-center px-0"
      )}
    >
      <div className={cn(
        "transition-transform duration-200",
        active && "scale-110",
        !active && "group-hover:scale-110"
      )}>
        {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
      </div>
      {!collapsed && (
        <span className="font-semibold text-sm whitespace-nowrap">{label}</span>
      )}
      {active && !collapsed && (
        <motion.div 
          layoutId="active-pill"
          className={cn(
            "ml-auto w-1.5 h-1.5 rounded-full",
            variant === 'danger' ? "bg-red-500" : "bg-emerald-500"
          )}
        />
      )}
    </button>
  );
}
