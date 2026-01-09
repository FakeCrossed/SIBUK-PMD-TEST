import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AgendaForm from './components/AgendaForm';
import SettingsPanel from './components/SettingsPanel';
import EmployeePanel from './components/EmployeePanel';
import { AppState, AgendaGroup, AgendaItem, KopDinas, Pegawai, User, SQLConfig } from './types';
import { loadState, saveState, getAgendaItemsByGroupId } from './services/storageService';
import { UserCircle, Lock, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  
  // Login State
  const [loginSelection, setLoginSelection] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pegawai' | 'settings'>('dashboard');
  const [isCreatingAgenda, setIsCreatingAgenda] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AgendaGroup | undefined>(undefined);

  // Load data on mount
  useEffect(() => {
    const data = loadState();
    setState(data);
  }, []);

  // Save data whenever critical state changes
  useEffect(() => {
    if (state) {
      saveState(state);
    }
  }, [state]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state) return;

    const user = state.users.find(u => u.id === loginSelection);
    if (user) {
      // Only Admin (Sekretariat) requires password
      if (user.role === 'admin') {
        if (user.password && user.password !== loginPassword) {
          alert("Password Salah, Jangan coba-coba!");
          return;
        }
        alert("Login Berhasil!");
      }
      
      // Regular users login immediately without password check
      setLoggedInUser(user);
      setLoginPassword('');
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setLoginSelection('');
    setActiveTab('dashboard');
  };

  // Handlers
  const handleCreateNew = () => {
    setEditingGroup(undefined);
    setIsCreatingAgenda(true);
  };

  const handleEditGroup = (group: AgendaGroup) => {
    setEditingGroup(group);
    setIsCreatingAgenda(true);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (confirm('Yakin ingin menghapus agenda ini secara permanen?')) {
      setState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          agendaGroups: prev.agendaGroups.filter(g => g.id !== groupId),
          agendaItems: prev.agendaItems.filter(i => i.groupId !== groupId)
        };
      });
    }
  };

  const handleSaveAgenda = (group: AgendaGroup, items: AgendaItem[]) => {
    setState(prev => {
      if (!prev) return null;
      const existingGroupIndex = prev.agendaGroups.findIndex(g => g.id === group.id);
      let newGroups = [...prev.agendaGroups];
      if (existingGroupIndex >= 0) {
        newGroups[existingGroupIndex] = group;
      } else {
        newGroups = [group, ...newGroups];
      }
      const otherItems = prev.agendaItems.filter(i => i.groupId !== group.id);
      const newItems = [...otherItems, ...items];
      return { ...prev, agendaGroups: newGroups, agendaItems: newItems };
    });
    setIsCreatingAgenda(false);
  };

  const handleUpdateKop = (newKop: KopDinas) => setState(prev => prev ? ({ ...prev, kopDinas: newKop }) : null);
  const handleUpdateSQL = (newSQL: SQLConfig) => setState(prev => prev ? ({ ...prev, sqlConfig: newSQL }) : null);
  const handleUpdatePegawai = (newPegawai: Pegawai[]) => setState(prev => prev ? ({ ...prev, pegawai: newPegawai }) : null);
  const handleUpdateAllUsers = (updatedUsers: User[]) => setState(prev => prev ? ({ ...prev, users: updatedUsers }) : null);

  if (!state) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading SIBUK PMD...</div>;

  // LOGIN SCREEN
  if (!loggedInUser) {
    const selectedUserObj = state.users.find(u => u.id === loginSelection);
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
           <div className="text-center mb-8">
             <div className="w-16 h-16 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/30">
               <UserCircle size={40} />
             </div>
             <h1 className="text-2xl font-bold text-slate-800">SIBUK PMD</h1>
             <p className="text-emerald-600 font-semibold text-sm mt-1 mb-2">SIstem BUku Kegiatan Dinas PMD</p>
             <p className="text-slate-400 text-xs">Silahkan pilih user untuk masuk</p>
           </div>
           
           <form onSubmit={handleLogin} className="space-y-4">
             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pilih User</label>
               <select 
                className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={loginSelection}
                onChange={(e) => setLoginSelection(e.target.value)}
               >
                 <option value="">-- Pilih Bidang / User --</option>
                 {state.users.map(u => (
                   <option key={u.id} value={u.id}>{u.name}</option>
                 ))}
               </select>
             </div>

             {/* Only show password field for Admins */}
             {selectedUserObj && selectedUserObj.role === 'admin' && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input 
                      type="password" 
                      className="w-full pl-10 p-3 rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Masukkan password..."
                    />
                  </div>
                </div>
             )}

             <button 
              disabled={!loginSelection}
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-6"
             >
               Masuk Aplikasi <ArrowRight size={18} />
             </button>
           </form>
           
           <div className="mt-8 text-center text-xs text-slate-400">
             &copy; Dinas Pemberdayaan Masyarakat dan Desa<br/>Kabupaten Musi Banyuasin
           </div>
        </div>
      </div>
    )
  }

  // View Routing
  const renderContent = () => {
    if (isCreatingAgenda) {
      return (
        <AgendaForm
          initialGroup={editingGroup}
          initialItems={editingGroup ? getAgendaItemsByGroupId(editingGroup.id, state.agendaItems) : undefined}
          currentUser={loggedInUser}
          allPegawai={state.pegawai}
          kopDinas={state.kopDinas}
          onSave={handleSaveAgenda}
          onCancel={() => setIsCreatingAgenda(false)}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            groups={state.agendaGroups} 
            allItems={state.agendaItems}
            onCreateNew={handleCreateNew}
            onEdit={handleEditGroup}
            onDelete={handleDeleteGroup}
          />
        );
      case 'pegawai':
        return (
          <EmployeePanel 
            pegawaiList={state.pegawai}
            onUpdatePegawai={handleUpdatePegawai}
            currentUser={loggedInUser}
          />
        );
      case 'settings':
        return (
          <SettingsPanel 
            state={state}
            onUpdateKop={handleUpdateKop}
            onUpdateUser={() => {}} 
            onUpdateSQL={handleUpdateSQL}
            onUpdateAllUsers={handleUpdateAllUsers}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { 
          setActiveTab(tab); 
          setIsCreatingAgenda(false); 
        }} 
        currentUser={loggedInUser}
        onLogout={handleLogout}
      />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {renderContent()}
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} SIBUK PMD - Dinas PMD MUBA.</p>
      </footer>
    </div>
  );
};

export default App;