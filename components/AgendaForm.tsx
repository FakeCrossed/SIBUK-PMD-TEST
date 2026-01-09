import React, { useState, useEffect } from 'react';
import { Plus, Save, ArrowLeft, Trash2, Printer, Calendar } from 'lucide-react';
import { AgendaGroup, AgendaItem, Pegawai, User, KopDinas } from '../types';
import { generateAgendaPDF } from '../services/pdfService';
import { format } from 'date-fns';

interface AgendaFormProps {
  initialGroup?: AgendaGroup;
  initialItems?: AgendaItem[];
  currentUser: User;
  allPegawai: Pegawai[];
  kopDinas: KopDinas;
  onSave: (group: AgendaGroup, items: AgendaItem[]) => void;
  onCancel: () => void;
}

const AgendaForm: React.FC<AgendaFormProps> = ({
  initialGroup,
  initialItems,
  currentUser,
  allPegawai,
  kopDinas,
  onSave,
  onCancel
}) => {
  // Title is now the DATE of the agenda
  const [selectedDate, setSelectedDate] = useState(initialGroup?.title || new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<AgendaItem[]>(initialItems || []);
  
  // Initialize with one empty row if creating new
  useEffect(() => {
    if (items.length === 0) {
      handleAddItem();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddItem = () => {
    const newItem: AgendaItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      groupId: initialGroup?.id || '',
      waktu: '08:00',
      tempat: 'Ruang Rapat',
      acara: '',
      manual_keterangan: '',
      attendeeIds: []
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof AgendaItem, value: any) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleDeleteItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    } else {
      alert("Minimal satu agenda harus ada.");
    }
  };

  const handleToggleAttendee = (itemId: string, pegawaiId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const currentIds = item.attendeeIds;
        const newIds = currentIds.includes(pegawaiId)
          ? currentIds.filter(id => id !== pegawaiId)
          : [...currentIds, pegawaiId];
        return { ...item, attendeeIds: newIds };
      }
      return item;
    }));
  };

  const handleSubmit = () => {
    if (!selectedDate) return alert("Tanggal Agenda harus diisi.");
    
    const groupId = initialGroup?.id || `g-${Date.now()}`;
    const group: AgendaGroup = {
      id: groupId,
      title: selectedDate, // Store Date string as title
      created_at: new Date(selectedDate).toISOString(),
      userId: currentUser.id
    };

    const finalItems = items.map(i => ({ ...i, groupId }));
    onSave(group, finalItems);
  };

  const handleExport = () => {
    const tempGroup: AgendaGroup = {
       id: 'temp', 
       title: selectedDate, 
       created_at: new Date(selectedDate).toISOString(), 
       userId: currentUser.id 
    };
    generateAgendaPDF(tempGroup, items, kopDinas, currentUser, allPegawai);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Controls */}
      <div className="flex items-center justify-between elegant-card p-4">
        <button onClick={onCancel} className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors font-semibold">
          <ArrowLeft size={20} /> Kembali
        </button>
        <h2 className="text-xl font-bold text-slate-800">
          {initialGroup ? 'Edit Kegiatan' : 'Buat Kegiatan Baru'}
        </h2>
        <div className="flex gap-3">
           <button 
            onClick={handleExport}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-all"
            title="Export PDF F4"
          >
            <Printer size={18} /> Preview PDF
          </button>
          <button 
            onClick={handleSubmit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-all"
          >
            <Save size={18} /> Simpan
          </button>
        </div>
      </div>

      {/* Date Selection */}
      <div className="elegant-card p-6">
        <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Tanggal Kegiatan (Agenda)</label>
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20}/>
                <input 
                id="agenda-date"
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="elegant-input w-full pl-10 p-3 text-lg font-bold text-slate-800 rounded-xl cursor-pointer"
                onClick={(e) => (e.target as HTMLInputElement).showPicker && (e.target as HTMLInputElement).showPicker()}
                />
            </div>
            <div className="flex gap-3">
                 <button
                    type="button"
                    onClick={() => {
                        const input = document.getElementById('agenda-date') as HTMLInputElement;
                        if(input && input.showPicker) input.showPicker();
                        else if(input) input.focus();
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-sm border border-slate-200 whitespace-nowrap"
                >
                    <Calendar size={18} />
                    Pilih Tanggal
                </button>
                 <button
                    type="button"
                    onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-6 py-3 rounded-xl font-bold transition-colors shadow-sm border border-emerald-100 whitespace-nowrap"
                >
                    Hari Ini
                </button>
            </div>
        </div>
      </div>

      {/* Dynamic List */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="elegant-card p-6 relative group border-l-4 border-l-emerald-500">
            <div className="absolute -left-3 top-6 bg-white border border-emerald-500 text-emerald-600 w-8 h-8 flex items-center justify-center rounded-full font-bold shadow-sm z-10">
              {index + 1}
            </div>
            
            <button 
              onClick={() => handleDeleteItem(item.id)}
              className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
              title="Hapus Baris"
            >
              <Trash2 size={18} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 ml-4">
              {/* Row 1: Basic Info */}
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-500 mb-1">Waktu Mulai</label>
                <div className="flex items-center gap-2">
                    <input
                    type="time"
                    value={item.waktu.split(' - ')[0] || '08:00'}
                    onChange={(e) => {
                         const endTime = item.waktu.split(' - ')[1] || 'Selesai';
                         handleUpdateItem(item.id, 'waktu', `${e.target.value} - ${endTime}`)
                    }}
                    className="elegant-input w-full p-2.5 rounded-lg text-sm"
                    />
                    <span className="text-xs text-slate-400">s.d Selesai</span>
                </div>
              </div>
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-500 mb-1">Tempat</label>
                <input
                  type="text"
                  value={item.tempat}
                  onChange={(e) => handleUpdateItem(item.id, 'tempat', e.target.value)}
                  className="elegant-input w-full p-2.5 rounded-lg text-sm"
                  placeholder="Ruang Rapat Utama"
                />
              </div>
              <div className="md:col-span-5">
                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Acara</label>
                <input
                  type="text"
                  value={item.acara}
                  onChange={(e) => handleUpdateItem(item.id, 'acara', e.target.value)}
                  className="elegant-input w-full p-2.5 rounded-lg text-sm font-semibold"
                  placeholder="Rapat Koordinasi..."
                />
              </div>

              {/* Row 2: Details & Attendees */}
              <div className="md:col-span-7">
                <label className="block text-xs font-bold text-slate-500 mb-1">Keterangan Manual (Zoom/Link/Dresscode)</label>
                <textarea
                  value={item.manual_keterangan}
                  onChange={(e) => handleUpdateItem(item.id, 'manual_keterangan', e.target.value)}
                  className="elegant-input w-full p-2.5 rounded-lg text-sm h-24"
                  placeholder="Dresscode: Batik, Zoom ID: ..."
                />
              </div>
              
              <div className="md:col-span-5">
                <label className="block text-xs font-bold text-slate-500 mb-1 flex justify-between">
                  <span>Daftar Hadir (Pegawai)</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 rounded text-[10px]">{item.attendeeIds.length} Dipilih</span>
                </label>
                <div className="elegant-input rounded-lg h-24 overflow-y-auto p-2 border border-slate-200 bg-slate-50/30">
                   {allPegawai.map(p => (
                     <label key={p.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer border-b border-transparent hover:border-slate-100 transition-colors">
                       <input 
                        type="checkbox" 
                        checked={item.attendeeIds.includes(p.id)}
                        onChange={() => handleToggleAttendee(item.id, p.id)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                       />
                       <span className="text-sm text-slate-700 truncate">{p.nama}</span>
                     </label>
                   ))}
                </div>
              </div>

              {/* Row 3: Pengampu (Read Only) */}
              <div className="md:col-span-12">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold uppercase">Pengampu:</span>
                  <span className="text-sm font-bold text-emerald-700">{currentUser.name} Dinas PMD Kab. Muba</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button 
          onClick={handleAddItem}
          className="w-full py-4 border-2 border-dashed border-emerald-300 rounded-xl text-emerald-600 font-bold hover:bg-emerald-50 hover:border-emerald-400 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Tambah Kegiatan
        </button>
      </div>
    </div>
  );
};

export default AgendaForm;