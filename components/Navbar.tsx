import React from 'react';
import { BookOpen, Settings, Users, UserCircle, LogOut } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'pegawai' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'pegawai' | 'settings') => void;
  currentUser: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, currentUser, onLogout }) => {
  
  // Check access: Role is admin OR has temporary access for today
  const hasSettingsAccess = () => {
    if (currentUser.role === 'admin') return true;
    const today = new Date().toISOString().split('T')[0];
    return currentUser.tempAdminAccessDate === today;
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4 sm:gap-0">
            {/* Brand */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-500/20 shrink-0">
                <BookOpen size={22} />
                </div>
                <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">SIBUK PMD</h1>
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wide">SIstem BUku Kegiatan Dinas PMD</p>
                </div>
                
                {/* Mobile User Icon - Visible only on small screens */}
                <div className="ml-auto sm:hidden flex items-center gap-2">
                     <button onClick={onLogout} className="text-slate-400 hover:text-red-500 p-2">
                         <LogOut size={20} />
                     </button>
                </div>
            </div>

            {/* Navigation Menu - Scrollable on mobile */}
            <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                <div className="flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200 min-w-max">
                    <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap
                        ${activeTab === 'dashboard' 
                        ? 'bg-white shadow text-emerald-600 ring-1 ring-black/5' 
                        : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'}`}
                    >
                    <BookOpen size={18} />
                    Agenda
                    </button>
                    <button
                    onClick={() => setActiveTab('pegawai')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap
                        ${activeTab === 'pegawai' 
                        ? 'bg-white shadow text-emerald-600 ring-1 ring-black/5' 
                        : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'}`}
                    >
                    <Users size={18} />
                    Pegawai
                    </button>
                    
                    {hasSettingsAccess() && (
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap
                            ${activeTab === 'settings' 
                                ? 'bg-white shadow text-emerald-600 ring-1 ring-black/5' 
                                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'}`}
                        >
                            <Settings size={18} />
                            Pengaturan
                        </button>
                    )}
                </div>
            </div>

            {/* Desktop User Profile */}
            <div className="hidden sm:flex items-center gap-4">
                <div className="text-right">
                <p className="text-sm font-bold text-slate-700">{currentUser.name}</p>
                <p className="text-xs text-slate-500 truncate max-w-[150px]">Dinas PMD Kab. Muba</p>
                </div>
                <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200">
                <UserCircle size={24} />
                </div>
                <button 
                onClick={onLogout}
                className="ml-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Keluar"
                >
                <LogOut size={20} />
                </button>
            </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;