-- SCHEMA UNTUK SUPABASE
-- Berdasarkan format import massal kepegawaian

-- 1. Buat tabel pegawai
CREATE TABLE IF NOT EXISTS public.pegawai (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama TEXT NOT NULL,
    nip TEXT UNIQUE NOT NULL,
    pass TEXT DEFAULT '123' NOT NULL, -- Kolom password untuk login aplikasi
    jenis_asn TEXT,
    pangkat_gol TEXT,
    jabatan TEXT,
    tupoksi TEXT, -- Tugas Pokok dan Fungsi
    tugas_sehari_hari TEXT,
    unit_organisasi TEXT,
    opd TEXT,
    alamat TEXT,
    no_hp TEXT,
    role TEXT DEFAULT 'staf_pelaksana', -- Untuk role di aplikasi (camat, sekcam, kasi, dll)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Mengaktifkan Row Level Security (opsional tapi sangat disarankan)
ALTER TABLE public.pegawai ENABLE ROW LEVEL SECURITY;

-- Policy agar semua orang yang login atau anonim bisa hit login endpoint via API
-- Karena login menggunakan query ke table ini, butuh policy SELECT untuk anon/auth
CREATE POLICY "Pegawai dapat dibaca untuk keperluan login" ON public.pegawai
    FOR SELECT USING (true);

-- Policy agar admin bisa mengelola data (disesuaikan)
CREATE POLICY "Pegawai dapat dikelola oleh admin" ON public.pegawai
    FOR ALL USING (true); -- Untuk development, ubah sesuai auth nanti

