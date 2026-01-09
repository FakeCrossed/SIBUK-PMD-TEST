import { Pegawai, User, KopDinas, SQLConfig } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Bagian Sekretariat',
    nip: '-',
    jabatan: 'Sekretariat',
    username: 'Sekretariat',
    password: 'abis rokok',
    role: 'admin'
  },
  {
    id: 'u2',
    name: 'Bidang PEMDES',
    nip: '-',
    jabatan: 'Bidang Pemdes',
    username: 'PEMDES',
    password: '',
    role: 'user'
  },
  {
    id: 'u3',
    name: 'Bidang PED',
    nip: '-',
    jabatan: 'Bidang PED',
    username: 'PED',
    password: '',
    role: 'user'
  },
  {
    id: 'u4',
    name: 'Bidang TTG',
    nip: '-',
    jabatan: 'Bidang TTG',
    username: 'TTG',
    password: '',
    role: 'user'
  },
  {
    id: 'u5',
    name: 'Bidang KMD',
    nip: '-',
    jabatan: 'Bidang KMD',
    username: 'KMD',
    password: '',
    role: 'user'
  }
];

export const INITIAL_PEGAWAI: Pegawai[] = [
  { id: 'p1', nama: 'Contoh Pegawai 1', nip: '1980xxxx', jabatan: 'Staf', kelas_jabatan: '7' },
];

export const INITIAL_KOP: KopDinas = {
  instansi_baris1: 'PEMERINTAH KABUPATEN MUSI BANYUASIN',
  instansi_baris2: 'DINAS PEMBERDAYAAN MASYARAKAT DAN DESA',
  alamat: 'Jalan Kolonel Wahid Udin No. 234, Sekayu',
  kontak: 'Email: dpmd@mubakab.go.id',
  kota_surat: 'Sekayu',
  logoBase64: '' 
};

export const INITIAL_SQL_CONFIG: SQLConfig = {
  host: 'localhost\\SQLEXPRESS',
  port: '1433',
  user: 'sa',
  password: '',
  database: 'SibukPMD',
  provider: 'sqlexpress'
};