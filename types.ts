export interface User {
  id: string;
  name: string;
  nip: string; // Used for "Bidang ..." text or NIP
  jabatan: string; // Used for "Dinas PMD..." suffix context
  username: string; 
  password?: string;
  role: 'admin' | 'user';
  tempAdminAccessDate?: string; // ISO Date String (YYYY-MM-DD) to allow temporary access
}

export interface Pegawai {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
  kelas_jabatan: string; 
}

export interface SQLConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
  provider: 'mysql' | 'sqlexpress';
}

export interface KopDinas {
  instansi_baris1: string;
  instansi_baris2: string;
  alamat: string;
  kontak: string;
  logoBase64: string; 
  kota_surat: string;
}

export interface AgendaGroup {
  id: string;
  title: string; // Effectively the Date string now (e.g. "2026-01-02")
  created_at: string; // ISO String
  userId: string; 
}

export interface AgendaItem {
  id: string;
  groupId: string; 
  waktu: string;
  tempat: string;
  acara: string;
  manual_keterangan: string; 
  attendeeIds: string[]; 
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  pegawai: Pegawai[];
  kopDinas: KopDinas;
  agendaGroups: AgendaGroup[];
  agendaItems: AgendaItem[];
  sqlConfig: SQLConfig;
}