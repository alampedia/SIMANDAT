-- SI-MANDAT (Sistem Informasi Manajemen Naskah Dinas Terpadu)
-- Skema Database PostgreSQL (Supabase)

-- 1. Buat tabel pegawai
CREATE TABLE IF NOT EXISTS public.pegawai (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nip TEXT UNIQUE NOT NULL,
    nama TEXT NOT NULL,
    pass TEXT DEFAULT 'password' NOT NULL,
    role TEXT DEFAULT 'staf_pelaksana' NOT NULL,
    jabatan TEXT,
    jenis_asn TEXT,
    pangkat_gol TEXT,
    unit_organisasi TEXT,
    opd TEXT,
    alamat TEXT,
    no_hp TEXT,
    tupoksi TEXT,
    tugas_sehari_hari TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Buat tabel kinerja_harian (Jurnal Kinerja)
CREATE TABLE IF NOT EXISTS public.kinerja_harian (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nip TEXT NOT NULL REFERENCES public.pegawai(nip) ON DELETE CASCADE,
    aktivitas TEXT NOT NULL,
    tanggal TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Buat tabel manajemen_surat (Surat Masuk & Keluar)
CREATE TABLE IF NOT EXISTS public.manajemen_surat (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nomor_surat TEXT NOT NULL,
    judul_surat TEXT NOT NULL,
    jenis_surat TEXT NOT NULL CHECK (jenis_surat IN ('masuk', 'keluar', 'internal')),
    tanggal_surat DATE NOT NULL,
    pengirim TEXT,
    penerima TEXT,
    deskripsi TEXT,
    link_drive TEXT,
    status_verifikasi TEXT DEFAULT 'draft' CHECK (status_verifikasi IN ('draft', 'validasi_sekcam', 'approved', 'rejected')),
    created_by TEXT REFERENCES public.pegawai(nip) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Buat tabel disposisi (Penugasan & Perintah)
CREATE TABLE IF NOT EXISTS public.disposisi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    surat_id UUID REFERENCES public.manajemen_surat(id) ON DELETE CASCADE,
    judul TEXT NOT NULL,
    instruksi TEXT NOT NULL,
    pemberi_nip TEXT NOT NULL REFERENCES public.pegawai(nip) ON DELETE CASCADE,
    penerima_nip TEXT NOT NULL REFERENCES public.pegawai(nip) ON DELETE CASCADE,
    prioritas TEXT DEFAULT 'medium' CHECK (prioritas IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
    batas_waktu TIMESTAMP WITH TIME ZONE,
    link_drive TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Buat tabel tracking_kinerja (Histori Progres Disposisi & Surat)
CREATE TABLE IF NOT EXISTS public.tracking_kinerja (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    disposisi_id UUID REFERENCES public.disposisi(id) ON DELETE CASCADE,
    surat_id UUID REFERENCES public.manajemen_surat(id) ON DELETE CASCADE,
    nip TEXT NOT NULL REFERENCES public.pegawai(nip) ON DELETE CASCADE,
    aksi_lapangan TEXT NOT NULL,
    status_update TEXT,
    link_drive TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Buat tabel dokumen_referensi (JDIH & SOP)
CREATE TABLE IF NOT EXISTS public.dokumen_referensi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kategori TEXT NOT NULL CHECK (kategori IN ('jdih', 'sop')),
    judul TEXT NOT NULL,
    deskripsi TEXT,
    link_drive TEXT NOT NULL,
    created_by TEXT REFERENCES public.pegawai(nip) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Buat tabel app_tasks (Unified tasks board untuk testing/demo UI flow)
CREATE TABLE IF NOT EXISTS public.app_tasks (
    id TEXT PRIMARY KEY,
    nomor_surat TEXT,
    title TEXT NOT NULL,
    sender TEXT,
    date TEXT,
    status TEXT,
    priority TEXT,
    drive_url TEXT,
    assigned_to TEXT,
    instructions TEXT,
    notes_camat TEXT,
    notes_sekcam TEXT,
    deadline TEXT,
    progress INTEGER DEFAULT 0,
    history JSONB DEFAULT '[]'::jsonb,
    opd TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Hapus data lama (opsional, jika ingin reset)
-- TRUNCATE TABLE public.dokumen_referensi CASCADE;
-- TRUNCATE TABLE public.tracking_kinerja CASCADE;
-- TRUNCATE TABLE public.disposisi CASCADE;
-- TRUNCATE TABLE public.manajemen_surat CASCADE;
-- TRUNCATE TABLE public.app_tasks CASCADE;
-- TRUNCATE TABLE public.kinerja_harian CASCADE;
-- TRUNCATE TABLE public.pegawai CASCADE;

-- 8. Buat akun default administrator
INSERT INTO public.pegawai (nip, nama, pass, role, jabatan, unit_organisasi) 
VALUES 
    ('admin', 'Admin System', 'password', 'admin', 'Administrator', 'Pemerintah Kecamatan')
ON CONFLICT (nip) DO NOTHING;

-- 9. Konfigurasi Row Level Security (RLS) - Jika diperlukan, saat ini dimuka agar bisa diakses API dengan anon key
-- Pastikan tabel bisa di-select, insert, update tanpa auth token khusus karena platform menggunakan URL bawaan
ALTER TABLE public.pegawai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kinerja_harian ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manajemen_surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disposisi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_kinerja ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dokumen_referensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_tasks ENABLE ROW LEVEL SECURITY;

-- Kebijakan akses bypass RLS (Izinkan semua untuk testing frontend)
DROP POLICY IF EXISTS "Enable all access for anons on pegawai" ON public.pegawai;
CREATE POLICY "Enable all access for anons on pegawai" ON public.pegawai FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for anons on kinerja_harian" ON public.kinerja_harian;
CREATE POLICY "Enable all access for anons on kinerja_harian" ON public.kinerja_harian FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for anons on manajemen_surat" ON public.manajemen_surat;
CREATE POLICY "Enable all access for anons on manajemen_surat" ON public.manajemen_surat FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for anons on disposisi" ON public.disposisi;
CREATE POLICY "Enable all access for anons on disposisi" ON public.disposisi FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for anons on tracking_kinerja" ON public.tracking_kinerja;
CREATE POLICY "Enable all access for anons on tracking_kinerja" ON public.tracking_kinerja FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for anons on dokumen_referensi" ON public.dokumen_referensi;
CREATE POLICY "Enable all access for anons on dokumen_referensi" ON public.dokumen_referensi FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for anons on app_tasks" ON public.app_tasks;
CREATE POLICY "Enable all access for anons on app_tasks" ON public.app_tasks FOR ALL USING (true) WITH CHECK (true);

-- 10. Tabel referensi konfigurasi aplikasi
CREATE TABLE IF NOT EXISTS public.app_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    app_name TEXT DEFAULT 'SIMANDAT',
    app_description TEXT DEFAULT '',
    app_logo TEXT DEFAULT '',
    primary_color TEXT DEFAULT '#2563eb',
    wa_api_key TEXT,
    wa_group_id TEXT,
    wa_webhook_url TEXT,
    gemini_api_key TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure columns exist if table was already created
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS app_description TEXT;
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS wa_api_key TEXT;
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS wa_group_id TEXT;
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS wa_webhook_url TEXT;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for anons on app_settings" ON public.app_settings;
CREATE POLICY "Enable all access for anons on app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.app_settings (id, app_name, app_logo, wa_api_key, wa_group_id, wa_webhook_url) VALUES ('global', 'SIMANDAT', 'https://lh3.googleusercontent.com/d/11C8rXuMkNbeh8xleHHB7LcYgQwDggqYk', '1cJnf2tcHCFcfi8wPHDt', '120363426010181190@g.us', 'https://simandat.netlify.app/') ON CONFLICT (id) DO UPDATE SET app_logo = EXCLUDED.app_logo, app_name = EXCLUDED.app_name, primary_color = EXCLUDED.primary_color, wa_api_key = EXCLUDED.wa_api_key, wa_group_id = EXCLUDED.wa_group_id, wa_webhook_url = EXCLUDED.wa_webhook_url, app_description = EXCLUDED.app_description;