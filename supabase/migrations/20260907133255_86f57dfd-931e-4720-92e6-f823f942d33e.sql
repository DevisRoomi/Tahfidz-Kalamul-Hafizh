
CREATE TABLE public.ustadz (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  nip text,
  no_hp text,
  jenis_kelamin text NOT NULL DEFAULT 'L',
  keterangan text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ustadz TO anon, authenticated;
GRANT ALL ON public.ustadz TO service_role;
ALTER TABLE public.ustadz ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ustadz akses publik" ON public.ustadz FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.santri (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nis text NOT NULL UNIQUE,
  nama text NOT NULL,
  kelas int NOT NULL CHECK (kelas BETWEEN 7 AND 12),
  jenis_kelamin text NOT NULL DEFAULT 'L',
  tanggal_lahir date,
  alamat text,
  nama_wali text,
  no_hp_wali text,
  ustadz_id uuid REFERENCES public.ustadz(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'Aktif',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.santri TO anon, authenticated;
GRANT ALL ON public.santri TO service_role;
ALTER TABLE public.santri ENABLE ROW LEVEL SECURITY;
CREATE POLICY "santri akses publik" ON public.santri FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.setoran (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id uuid NOT NULL REFERENCES public.santri(id) ON DELETE CASCADE,
  ustadz_id uuid REFERENCES public.ustadz(id) ON DELETE SET NULL,
  tanggal date NOT NULL DEFAULT current_date,
  jenis text NOT NULL CHECK (jenis IN ('Sabaq','Sabqi','Manzil')),
  surah text NOT NULL,
  juz int,
  ayat_mulai int NOT NULL DEFAULT 1,
  ayat_selesai int NOT NULL DEFAULT 1,
  jumlah_ayat int NOT NULL DEFAULT 1,
  nilai numeric(5,2) NOT NULL DEFAULT 0 CHECK (nilai >= 0 AND nilai <= 100),
  kelancaran text NOT NULL DEFAULT 'Lancar',
  predikat text NOT NULL DEFAULT 'Baik',
  catatan text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX setoran_santri_idx ON public.setoran (santri_id);
CREATE INDEX setoran_tanggal_idx ON public.setoran (tanggal);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.setoran TO anon, authenticated;
GRANT ALL ON public.setoran TO service_role;
ALTER TABLE public.setoran ENABLE ROW LEVEL SECURITY;
CREATE POLICY "setoran akses publik" ON public.setoran FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.pengaturan (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  nama_pesantren text NOT NULL DEFAULT 'Pesantren Darul Ilmi',
  logo_url text,
  tema text NOT NULL DEFAULT 'hijau-klasik',
  tahun_ajaran text NOT NULL DEFAULT '2026/2027',
  semester text NOT NULL DEFAULT 'Ganjil',
  alamat text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pengaturan TO anon, authenticated;
GRANT ALL ON public.pengaturan TO service_role;
ALTER TABLE public.pengaturan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pengaturan akses publik" ON public.pengaturan FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.pengaturan (id, nama_pesantren, tema, alamat)
VALUES (1, 'Pesantren Darul Ilmi', 'hijau-klasik', 'Jl. Pendidikan No. 1, Indonesia');

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_ustadz_updated BEFORE UPDATE ON public.ustadz FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_santri_updated BEFORE UPDATE ON public.santri FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_setoran_updated BEFORE UPDATE ON public.setoran FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_pengaturan_updated BEFORE UPDATE ON public.pengaturan FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
