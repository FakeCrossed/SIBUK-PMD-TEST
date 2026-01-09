import { AppState, AgendaGroup, AgendaItem, KopDinas, Pegawai, User } from '../types';
import { INITIAL_USERS, INITIAL_PEGAWAI, INITIAL_KOP, INITIAL_SQL_CONFIG } from '../constants';

const DB_KEY = 'siagenda_db_v2';

export const loadState = (): AppState => {
  const stored = localStorage.getItem(DB_KEY);
  if (stored) {
    // Merge with defaults in case of new fields in version update
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      sqlConfig: parsed.sqlConfig || INITIAL_SQL_CONFIG,
      pegawai: parsed.pegawai.map((p: any) => ({ ...p, kelas_jabatan: p.kelas_jabatan || '-' }))
    };
  }
  
  const initialState: AppState = {
    currentUser: INITIAL_USERS[0],
    users: INITIAL_USERS,
    pegawai: INITIAL_PEGAWAI,
    kopDinas: INITIAL_KOP,
    agendaGroups: [],
    agendaItems: [],
    sqlConfig: INITIAL_SQL_CONFIG
  };
  saveState(initialState);
  return initialState;
};

export const saveState = (state: AppState) => {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
};

export const getAttendees = (item: AgendaItem, allPegawai: Pegawai[]): Pegawai[] => {
  return allPegawai.filter(p => item.attendeeIds.includes(p.id));
};

export const getAgendaItemsByGroupId = (groupId: string, allItems: AgendaItem[]): AgendaItem[] => {
  return allItems.filter(item => item.groupId === groupId);
};