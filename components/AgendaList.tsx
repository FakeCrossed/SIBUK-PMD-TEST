import React from 'react';
import { Plus, Calendar, Edit3, Trash2 } from 'lucide-react';
import { AgendaGroup, AgendaItem } from '../types';
import { getAgendaItemsByGroupId } from '../services/storageService';

interface AgendaListProps {
  groups: AgendaGroup[];
  allItems: AgendaItem[];
  onCreateNew: () => void;
  onEdit: (group: AgendaGroup) => void;
  onDelete: (groupId: string) => void;
}

const AgendaList: React.FC<AgendaListProps> = ({ groups, allItems, onCreateNew, onEdit, onDelete }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center glass-panel p-6 rounded-xl">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Daftar Agenda</h2>
          <p className="text-slate-500">Kelola jadwal kegiatan dinas anda.</p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 font-semibold transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={20} /> Buat Agenda Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.length === 0 ? (
          <div className="col-span-full glass-panel p-12 rounded-xl text-center text-slate-400">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>Belum ada agenda dibuat.</p>
          </div>
        ) : (
          groups.map(group => {
            const itemCount = getAgendaItemsByGroupId(group.id, allItems).length;
            const dateStr = new Date(group.created_at).toLocaleDateString('id-ID', {
               day: 'numeric', month: 'long', year: 'numeric'
            });

            return (
              <div key={group.id} className="glass-panel p-6 rounded-xl flex flex-col justify-between hover:border-blue-300 transition-all hover:shadow-xl group-hover:translate-y-1">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wide">
                      {itemCount} Kegiatan
                    </span>
                    <span className="text-xs text-slate-400">{dateStr}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 line-clamp-2">
                    {group.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => onEdit(group)}
                    className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                  >
                    <Edit3 size={16} /> Edit / PDF
                  </button>
                  <button 
                    onClick={() => onDelete(group.id)}
                    className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AgendaList;