import React, { useState } from 'react';
import { Plus, Trash2, Save, Users, Search, Award } from 'lucide-react';
import { Pegawai, User } from '../types';

interface EmployeePanelProps {
  pegawaiList: Pegawai[];
  onUpdatePegawai: (list: Pegawai[]) => void;
  currentUser: User;
}

const EmployeePanel: React.FC<EmployeePanelProps> = ({ pegawaiList, onUpdatePegawai, currentUser }) => {
  const [employees, setEmployees] = useState<Pegawai[]>(pegawaiList);
  const [search, setSearch] = useState('');

  // Permission Check
  const today = new Date().toISOString().split('T')[0];
  const isTempAdmin = currentUser.tempAdminAccessDate === today;
  const isAdmin = currentUser.role === 'admin' || isTempAdmin;

  const handleAddRow = () => {
    if (!isAdmin) return;
    const newPegawai: Pegawai = {
      id: `p${Date.now()}`,
      nama: '',
      nip: '',
      jabatan: '',
      kelas_jabatan: ''
    };
    setEmployees([...employees, newPegawai]);
  };

  const handleChange = (id: string, field: keyof Pegawai, value: string) => {
    if (!isAdmin) return;
    setEmployees(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) return;
    if (confirm('Hapus data pegawai ini?')) {
      setEmployees(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSave = () => {
    if (!isAdmin) return;
    onUpdatePegawai(employees);
    alert('Data pegawai berhasil disimpan!');
  };

  const filtered = employees.filter(p => 
    p.nama.toLowerCase().includes(search.toLowerCase()) || 
    p.jabatan.toLowerCase().includes(search.toLowerCase())
  );

  // Extract unique Jabatan and Kelas for the "Kelas Jabatan" Reference Table
  const uniqueKelasJabatan = Array.from(new Set(employees.map(p => JSON.stringify({j: p.jabatan, k: p.kelas_jabatan}))))
    .map((s: string) => JSON.parse(s) as {j: string, k: string})
    .filter(item => item.j && item.k);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 elegant-card p-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-primary-600" />
            Data Kepegawaian
          </h2>
          <p className="text-slate-500 text-sm mt-1">
             {isAdmin ? 'Kelola data pegawai dan kelas jabatan.' : 'Daftar Pegawai Dinas PMD.'}
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={handleAddRow}
              className="flex-1 md:flex-none bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Tambah
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 md:flex-none bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} /> Simpan
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Employee Table */}
        <div className="lg:col-span-2 space-y-4">
             <div className="elegant-card overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between gap-4 items-center">
                  <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide w-full sm:w-auto">Daftar Pegawai</h3>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Cari nama..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="elegant-input w-full pl-9 pr-4 py-2 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 w-10">No</th>
                        <th className="px-4 py-3 min-w-[150px]">Nama</th>
                        <th className="px-4 py-3 min-w-[120px]">NIP</th>
                        <th className="px-4 py-3 min-w-[150px]">Jabatan</th>
                        {isAdmin && <th className="px-4 py-3 w-20 text-center">Kelas</th>}
                        {isAdmin && <th className="px-4 py-3 w-10 text-center">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map((pegawai, index) => (
                        <tr key={pegawai.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-400 text-center">{index + 1}</td>
                          <td className="px-4 py-2">
                            {isAdmin ? (
                                <input
                                type="text"
                                value={pegawai.nama}
                                onChange={(e) => handleChange(pegawai.id, 'nama', e.target.value)}
                                className="elegant-input w-full px-2 py-1.5 rounded"
                                />
                            ) : <span className="font-medium text-slate-700">{pegawai.nama}</span>}
                          </td>
                          <td className="px-4 py-2">
                             {isAdmin ? (
                                <input
                                type="text"
                                value={pegawai.nip}
                                onChange={(e) => handleChange(pegawai.id, 'nip', e.target.value)}
                                className="elegant-input w-full px-2 py-1.5 rounded font-mono text-xs"
                                />
                             ) : <span className="font-mono text-xs text-slate-500">{pegawai.nip}</span>}
                          </td>
                          <td className="px-4 py-2">
                             {isAdmin ? (
                                <input
                                type="text"
                                value={pegawai.jabatan}
                                onChange={(e) => handleChange(pegawai.id, 'jabatan', e.target.value)}
                                className="elegant-input w-full px-2 py-1.5 rounded"
                                />
                             ) : <span className="text-slate-600">{pegawai.jabatan}</span>}
                          </td>
                          
                          {/* Admin Only Columns */}
                          {isAdmin && (
                              <td className="px-4 py-2">
                                <input
                                    type="text"
                                    value={pegawai.kelas_jabatan}
                                    onChange={(e) => handleChange(pegawai.id, 'kelas_jabatan', e.target.value)}
                                    className="elegant-input w-full px-2 py-1.5 rounded text-center"
                                />
                              </td>
                          )}
                          {isAdmin && (
                              <td className="px-4 py-2 text-center">
                                <button
                                    onClick={() => handleDelete(pegawai.id)}
                                    className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                              </td>
                          )}
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={isAdmin ? 6 : 4} className="px-6 py-8 text-center text-slate-400 italic">
                            Data tidak ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
            </div>
        </div>

        {/* Reference Table: Kelas Jabatan */}
        <div className="lg:col-span-1">
            <div className="elegant-card h-full">
                <div className="p-4 border-b border-slate-200 bg-amber-50/50">
                    <h3 className="font-bold text-amber-800 text-sm uppercase tracking-wide flex items-center gap-2">
                        <Award size={16}/> Referensi Kelas Jabatan
                    </h3>
                </div>
                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Jabatan</th>
                                <th className="px-4 py-3 w-16 text-center">Kelas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {uniqueKelasJabatan.length > 0 ? (
                                uniqueKelasJabatan.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="px-4 py-2 text-slate-700">{item.j}</td>
                                        <td className="px-4 py-2 text-center font-bold text-emerald-600">{item.k}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={2} className="px-4 py-8 text-center text-slate-400 text-xs">
                                        Belum ada data kelas jabatan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePanel;