import React, { useState } from 'react';
import { Plus, Printer, CalendarDays, Edit3, Trash2, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import { AgendaGroup, AgendaItem } from '../types';
import { getAgendaItemsByGroupId } from '../services/storageService';
import { format, addWeeks, eachDayOfInterval, isSameDay, startOfISOWeek, endOfISOWeek } from 'date-fns';
import id from 'date-fns/locale/id';

interface DashboardProps {
  groups: AgendaGroup[];
  allItems: AgendaItem[];
  onCreateNew: () => void;
  onEdit: (group: AgendaGroup) => void;
  onDelete: (groupId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ groups, allItems, onCreateNew, onEdit, onDelete }) => {
  const [printDate, setPrintDate] = useState('');
  // Use startOfISOWeek to ensure Monday start and avoid potential startOfWeek export issues
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfISOWeek(new Date()));

  // Calendar Logic
  const currentWeekEnd = endOfISOWeek(currentWeekStart);
  const weekDays = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });

  const prevWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, -1));
  const nextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));

  const handlePrintByDate = () => {
    if(!printDate) return alert("Pilih tanggal laporan terlebih dahulu");
    alert(`Sedang memproses laporan untuk tanggal ${printDate}...`);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Top Action Bar */}
      <div className="elegant-card p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-none shadow-lg shadow-emerald-600/30">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Dashboard Kegiatan</h2>
          <p className="text-emerald-50 opacity-90 text-sm md:text-base">Selamat datang di SIBUK PMD.</p>
        </div>
        <button
          onClick={onCreateNew}
          className="w-full md:w-auto bg-white text-emerald-700 hover:bg-slate-50 px-4 md:px-6 py-3 rounded-xl shadow-md flex items-center justify-center gap-2 font-bold transition-transform active:scale-95"
        >
          <Plus size={20} /> Tambah Kegiatan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Content: Weekly Calendar Grid */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CalendarDays className="text-emerald-600" />
              <span>{format(currentWeekStart, 'd MMM', { locale: id })} - {format(currentWeekEnd, 'd MMM yyyy', { locale: id })}</span>
            </h3>
            <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1">
                <button onClick={prevWeek} className="p-2 hover:bg-slate-100 rounded-md text-slate-600" title="Minggu Sebelumnya">
                    <ChevronLeft size={20}/>
                </button>
                <span className="text-xs font-semibold uppercase px-2 text-slate-400">Navigasi Minggu</span>
                <button onClick={nextWeek} className="p-2 hover:bg-slate-100 rounded-md text-slate-600" title="Minggu Berikutnya">
                    <ChevronRight size={20}/>
                </button>
            </div>
          </div>

          <div className="space-y-4">
            {weekDays.map((day) => {
                // Find agenda for this day
                const dayGroup = groups.find(g => {
                    try {
                        return isSameDay(new Date(g.title), day);
                    } catch { return false; }
                });
                
                const dayItemsCount = dayGroup ? getAgendaItemsByGroupId(dayGroup.id, allItems).length : 0;
                const isToday = isSameDay(day, new Date());

                return (
                    <div key={day.toISOString()} className={`elegant-card p-4 transition-all ${isToday ? 'ring-2 ring-emerald-500 shadow-md' : 'opacity-90 hover:opacity-100'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border ${isToday ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                    <span className="text-xs font-medium uppercase">{format(day, 'EEE', { locale: id })}</span>
                                    <span className="text-xl font-bold">{format(day, 'd', { locale: id })}</span>
                                </div>
                                <div>
                                    <h4 className={`font-bold text-lg ${dayGroup ? 'text-slate-800' : 'text-slate-400'}`}>
                                        {dayGroup ? 'Agenda Terjadwal' : 'Tidak Ada Kegiatan'}
                                    </h4>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                         {dayGroup ? (
                                             <span className="flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                                                 <Briefcase size={14}/> {dayItemsCount} Kegiatan
                                             </span>
                                         ) : (
                                             <span>Kosong</span>
                                         )}
                                    </div>
                                </div>
                            </div>

                            {dayGroup && (
                                <div className="flex items-center gap-2 self-end sm:self-center">
                                    <button 
                                        onClick={() => onEdit(dayGroup)} 
                                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-2"
                                    >
                                        <Edit3 size={16} /> Detail / Edit
                                    </button>
                                    <button 
                                        onClick={() => onDelete(dayGroup.id)} 
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
          </div>
        </div>

        {/* Sidebar: Print Tools */}
        <div className="space-y-6">
           <div className="elegant-card p-6 lg:sticky lg:top-24">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
               <Printer size={18} className="text-emerald-600"/> 
               Cetak Laporan
             </h3>
             <div className="space-y-4">
               <div>
                 <label className="block text-xs font-semibold text-slate-500 mb-1">Pilih Tanggal</label>
                 <input 
                  type="date" 
                  className="elegant-input w-full p-2 rounded-lg text-sm"
                  value={printDate}
                  onChange={(e) => setPrintDate(e.target.value)}
                 />
               </div>
               <button 
                onClick={handlePrintByDate}
                className="w-full bg-slate-800 text-white hover:bg-slate-900 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-lg shadow-slate-800/20"
               >
                 Cetak PDF (1 Hari)
               </button>
               <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 text-center leading-relaxed">
                    Tips: Pastikan kop surat dan logo sudah diatur di menu Pengaturan agar hasil cetak maksimal.
                  </p>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;