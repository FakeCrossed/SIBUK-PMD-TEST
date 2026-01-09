import React, { useState, useRef } from 'react';
import { Save, Building2, Database, UserCog, CheckCircle2, AlertCircle, FileDown, Lock, ShieldCheck } from 'lucide-react';
import { AppState, KopDinas, User, SQLConfig } from '../types';

interface SettingsPanelProps {
  state: AppState;
  onUpdateKop: (kop: KopDinas) => void;
  onUpdateUser: (user: User) => void; 
  onUpdateSQL: (config: SQLConfig) => void;
  onUpdateAllUsers: (users: User[]) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ state, onUpdateKop, onUpdateSQL, onUpdateAllUsers }) => {
  const [activeSection, setActiveSection] = useState<'kop' | 'users' | 'sql'>('users');
  
  // Local states
  const [tempKop, setTempKop] = useState<KopDinas>(state.kopDinas);
  const [tempSQL, setTempSQL] = useState<SQLConfig>(state.sqlConfig);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Admin Pwd Management
  const [adminPassword, setAdminPassword] = useState(state.users.find(u => u.role === 'admin')?.password || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempKop(prev => ({ ...prev, logoBase64: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const testConnection = () => {
    setTestStatus('idle');
    setTimeout(() => {
      // Simulation
      if (tempSQL.host && tempSQL.database) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
    }, 1000);
  };

  const handleDownloadSQL = () => {
    const script = `
-- Script Database MS SQL Express untuk SIBUK PMD
-- Database: ${tempSQL.database}

CREATE DATABASE [${tempSQL.database}];
GO

USE [${tempSQL.database}];
GO

-- Tabel Users
CREATE TABLE [dbo].[Users](
	[id] [nvarchar](50) NOT NULL PRIMARY KEY,
	[name] [nvarchar](100) NOT NULL,
	[username] [nvarchar](50) NOT NULL,
	[password] [nvarchar](255) NULL,
	[role] [nvarchar](20) NOT NULL
);
GO

-- Tabel Pegawai
CREATE TABLE [dbo].[Pegawai](
	[id] [nvarchar](50) NOT NULL PRIMARY KEY,
	[nama] [nvarchar](100) NOT NULL,
	[nip] [nvarchar](50) NULL,
	[jabatan] [nvarchar](100) NULL,
	[kelas_jabatan] [nvarchar](10) NULL
);
GO

-- Tabel AgendaGroups (Header Agenda per Tanggal)
CREATE TABLE [dbo].[AgendaGroups](
	[id] [nvarchar](50) NOT NULL PRIMARY KEY,
	[title] [date] NOT NULL, -- Tanggal Kegiatan
	[created_at] [datetime] NOT NULL,
	[userId] [nvarchar](50) NOT NULL
);
GO

-- Tabel AgendaItems (Detail Kegiatan)
CREATE TABLE [dbo].[AgendaItems](
	[id] [nvarchar](50) NOT NULL PRIMARY KEY,
	[groupId] [nvarchar](50) NOT NULL,
	[waktu] [nvarchar](50) NOT NULL,
	[tempat] [nvarchar](100) NOT NULL,
	[acara] [nvarchar](255) NOT NULL,
	[manual_keterangan] [nvarchar](max) NULL,
    FOREIGN KEY (groupId) REFERENCES AgendaGroups(id)
);
GO

-- Tabel Relasi Kehadiran (Agenda - Pegawai)
CREATE TABLE [dbo].[AgendaAttendees](
    [agendaId] [nvarchar](50) NOT NULL,
    [pegawaiId] [nvarchar](50) NOT NULL,
    PRIMARY KEY (agendaId, pegawaiId),
    FOREIGN KEY (agendaId) REFERENCES AgendaItems(id),
    FOREIGN KEY (pegawaiId) REFERENCES Pegawai(id)
);
GO
    `;
    
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SIBUK_PMD_DB_SCRIPT.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAdminPasswordChange = () => {
    const updatedUsers = state.users.map(u => 
      u.role === 'admin' ? { ...u, password: adminPassword } : u
    );
    onUpdateAllUsers(updatedUsers);
    alert('Password Admin telah diperbarui!');
  };

  const handleGrantAccess = (userId: string, grant: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedUsers = state.users.map(u => 
      u.id === userId ? { ...u, tempAdminAccessDate: grant ? today : undefined } : u
    );
    onUpdateAllUsers(updatedUsers);
  };

  const renderSidebarItem = (id: 'kop' | 'users' | 'sql', icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-200
        ${activeSection === id 
          ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm ring-1 ring-emerald-100' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="grid grid-cols-12 gap-6 h-full animate-fade-in">
      {/* Sidebar */}
      <div className="col-span-12 md:col-span-3">
        <div className="elegant-card p-4 h-full">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Konfigurasi</h2>
          <div className="space-y-1">
            {renderSidebarItem('kop', <Building2 size={18} />, 'Kop Surat')}
            {renderSidebarItem('users', <UserCog size={18} />, 'Manajemen User')}
            {renderSidebarItem('sql', <Database size={18} />, 'Database SQL')}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="col-span-12 md:col-span-9">
        <div className="elegant-card p-8 min-h-[500px]">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {activeSection === 'kop' && 'Kop Surat Dinas'}
                {activeSection === 'users' && 'Akses & Password'}
                {activeSection === 'sql' && 'Database Server'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {activeSection === 'kop' && 'Atur header surat dinas.'}
                {activeSection === 'users' && 'Kelola password admin dan hak akses.'}
                {activeSection === 'sql' && 'Download script SQL untuk deployment.'}
              </p>
            </div>
            {activeSection !== 'users' && (
              <button 
                onClick={() => {
                  if(activeSection === 'kop') onUpdateKop(tempKop);
                  if(activeSection === 'sql') onUpdateSQL(tempSQL);
                  alert('Pengaturan berhasil disimpan.');
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all font-medium"
              >
                <Save size={18} /> Simpan
              </button>
            )}
          </div>

          {/* Forms */}
          <div className="max-w-3xl">
            {activeSection === 'kop' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Baris 1 (PEMERINTAH KABUPATEN...)</label>
                    <input type="text" className="elegant-input w-full p-3 rounded-lg"
                      value={tempKop.instansi_baris1} onChange={e => setTempKop({ ...tempKop, instansi_baris1: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Baris 2 (DINAS...)</label>
                    <input type="text" className="elegant-input w-full p-3 rounded-lg"
                      value={tempKop.instansi_baris2} onChange={e => setTempKop({ ...tempKop, instansi_baris2: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Alamat Lengkap</label>
                    <textarea className="elegant-input w-full p-3 rounded-lg" rows={3}
                      value={tempKop.alamat} onChange={e => setTempKop({ ...tempKop, alamat: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                     <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kontak</label>
                      <input type="text" className="elegant-input w-full p-3 rounded-lg"
                        value={tempKop.kontak} onChange={e => setTempKop({ ...tempKop, kontak: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kota Surat</label>
                      <input type="text" className="elegant-input w-full p-3 rounded-lg"
                        value={tempKop.kota_surat} onChange={e => setTempKop({ ...tempKop, kota_surat: e.target.value })} />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Logo Instansi</label>
                    <div className="flex items-start gap-6">
                      <div className="w-24 h-24 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center p-2">
                        {tempKop.logoBase64 ? (
                          <img src={tempKop.logoBase64} alt="Logo" className="max-w-full max-h-full object-contain" />
                        ) : (
                          <span className="text-xs text-slate-400">No Logo</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoUpload}
                          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 mb-2" />
                        <p className="text-xs text-slate-500">Format: PNG (Transparan) atau JPG.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'users' && (
              <div className="space-y-8">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Lock size={20} className="text-slate-500"/> Ganti Password Admin
                    </h3>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Password Baru (Sekretariat)</label>
                            <input 
                                type="text" 
                                className="elegant-input w-full p-2.5 rounded-lg"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={handleAdminPasswordChange}
                            className="bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-slate-900 transition-colors"
                        >
                            Update Password
                        </button>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <ShieldCheck size={20} className="text-emerald-600"/> Akses Admin Harian
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                        Izinkan user biasa mengakses menu konfigurasi (Kop & SQL) untuk hari ini saja. 
                        Akses akan otomatis terkunci kembali besok.
                    </p>
                    <div className="space-y-3">
                        {state.users.filter(u => u.role !== 'admin').map(user => {
                            const isGranted = user.tempAdminAccessDate === new Date().toISOString().split('T')[0];
                            return (
                                <div key={user.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-100 p-2 rounded-full">
                                            <UserCog size={18} className="text-slate-500"/>
                                        </div>
                                        <span className="font-semibold text-slate-700">{user.name}</span>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input 
                                            type="checkbox" 
                                            checked={isGranted}
                                            onChange={(e) => handleGrantAccess(user.id, e.target.checked)}
                                            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                                        />
                                        <span className={`text-sm font-medium ${isGranted ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            {isGranted ? 'Diizinkan (Hari Ini)' : 'Terkunci'}
                                        </span>
                                    </label>
                                </div>
                            )
                        })}
                    </div>
                </div>
              </div>
            )}

            {activeSection === 'sql' && (
              <div className="space-y-6">
                 <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex justify-between items-center">
                    <div>
                        <h4 className="font-bold text-blue-800">Download Script Database</h4>
                        <p className="text-sm text-blue-600 mt-1">Unduh query SQL untuk membuat database kosong di MS SQL Express.</p>
                    </div>
                    <button 
                        onClick={handleDownloadSQL}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-md"
                    >
                        <FileDown size={18} /> Download .sql
                    </button>
                 </div>

                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
                  <span className="font-bold">Mode Simulasi:</span> Aplikasi ini berjalan lokal. Konfigurasi di bawah ini hanya untuk referensi integrasi.
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                     <label className="block text-sm font-semibold text-slate-700 mb-1.5">Database Provider</label>
                     <select className="elegant-input w-full p-3 rounded-lg" disabled
                        value={tempSQL.provider} onChange={e => setTempSQL({ ...tempSQL, provider: e.target.value as any })}>
                        <option value="sqlexpress">Microsoft SQL Server Express</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1.5">Server Instance</label>
                     <input type="text" className="elegant-input w-full p-3 rounded-lg font-mono text-sm" placeholder="localhost\SQLEXPRESS"
                        value={tempSQL.host} onChange={e => setTempSQL({ ...tempSQL, host: e.target.value })} />
                  </div>
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1.5">Port</label>
                     <input type="text" className="elegant-input w-full p-3 rounded-lg font-mono text-sm" placeholder="1433"
                        value={tempSQL.port} onChange={e => setTempSQL({ ...tempSQL, port: e.target.value })} />
                  </div>
                   <div className="col-span-2">
                     <label className="block text-sm font-semibold text-slate-700 mb-1.5">Database Name</label>
                     <input type="text" className="elegant-input w-full p-3 rounded-lg font-mono text-sm"
                        value={tempSQL.database} onChange={e => setTempSQL({ ...tempSQL, database: e.target.value })} />
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <button onClick={testConnection} className="text-slate-600 hover:text-emerald-600 font-medium text-sm border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                    Test Connection
                  </button>
                  {testStatus === 'success' && <span className="text-emerald-600 text-sm flex items-center gap-2"><CheckCircle2 size={16}/> Connected</span>}
                  {testStatus === 'error' && <span className="text-red-600 text-sm flex items-center gap-2"><AlertCircle size={16}/> Connection Failed</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;