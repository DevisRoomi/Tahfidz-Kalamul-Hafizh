
INSERT INTO public.ustadz (nama, nip, no_hp, jenis_kelamin, keterangan) VALUES
('Ust. Abdul Hakim, S.Pd.I', 'DI-001', '081234500001', 'L', 'Pengampu kelas 7'),
('Ust. Muhammad Fauzan, Lc', 'DI-002', '081234500002', 'L', 'Pengampu kelas 8'),
('Ust. Ahmad Zamzami', 'DI-003', '081234500003', 'L', 'Pengampu kelas 9 & 10'),
('Ust. Ridwan Syarif, S.Ag', 'DI-004', '081234500004', 'L', 'Pengampu kelas 11'),
('Ust. Yusuf Maulana, Lc', 'DI-005', '081234500005', 'L', 'Pengampu kelas 12');

WITH nama_list AS (
  SELECT nama, row_number() OVER () AS rn FROM unnest(ARRAY[
    'Ahmad Fauzi','Muhammad Rizki','Abdullah Hakim','Farhan Maulana','Zaid Ibrahim',
    'Hafidz Ramadhan','Ilham Nugraha','Rafi Alfarizi','Naufal Hidayat','Salman Alfarisi',
    'Yusuf Hamzah','Umar Abdurrahman','Bilal Syakir','Hasan Basri','Husain Ali',
    'Ridho Ananda','Fikri Haikal','Alif Pratama','Daffa Kurniawan','Rayhan Mahendra',
    'Aisyah Nur Fadhilah','Fatimah Azzahra','Khadijah Salsabila','Maryam Husna','Zahra Alifia',
    'Nabila Rahma','Syifa Aulia','Hanifah Putri','Aliyah Zahira','Ummu Salamah',
    'Rizky Maulana','Arkan Fadhil','Zulfikar Anwar','Fahri Ramadhan','Habib Ahmad',
    'Iqbal Fauzan','Rasyid Ridha','Taufik Hidayat','Wildan Syafiq','Zaki Mubarak',
    'Azka Nabila','Dinda Salsabila','Faiza Rahmania','Ghina Mumtaz','Hilma Sakinah',
    'Izzah Nadhifa','Jihan Aqila','Kayla Ramadhani','Laila Mardhiyah','Mutiara Insani'
  ]) AS nama
)
INSERT INTO public.santri (nis, nama, kelas, jenis_kelamin, tanggal_lahir, alamat, nama_wali, no_hp_wali, ustadz_id, status)
SELECT
  '2026' || lpad(rn::text, 3, '0'),
  nama,
  7 + ((rn - 1) % 6),
  CASE WHEN rn BETWEEN 21 AND 30 OR rn > 40 THEN 'P' ELSE 'L' END,
  date '2009-01-01' + (((rn * 37) % 1500)::int),
  (ARRAY['Jl. Melati No.','Jl. Kenanga No.','Jl. Mawar No.','Jl. Anggrek No.','Jl. Cempaka No.'])[1 + (rn % 5)] || ' ' || (rn + 3),
  'Bapak/Ibu ' || split_part(nama, ' ', 1),
  '0812' || lpad((3400000 + rn)::text, 8, '0'),
  (SELECT id FROM public.ustadz ORDER BY nip OFFSET ((7 + ((rn - 1) % 6)) - 7) % 5 LIMIT 1),
  'Aktif'
FROM nama_list;

WITH surah(idx, nama, jml, juz) AS (
  VALUES
   (1,'Al-Baqarah',286,1),(2,'Ali Imran',200,3),(3,'An-Nisa',176,5),(4,'Al-Maidah',120,6),
   (5,'Al-Anam',165,7),(6,'Al-Araf',206,8),(7,'Yusuf',111,12),(8,'Ar-Rad',43,13),
   (9,'Al-Kahfi',110,15),(10,'Maryam',98,16),(11,'Thaha',135,16),(12,'Al-Mulk',30,29),
   (13,'Al-Muzzammil',20,29),(14,'An-Naba',40,30),(15,'An-Naziat',46,30),(16,'Abasa',42,30),
   (17,'Al-Buruj',22,30),(18,'Al-Ala',19,30),(19,'Al-Ghasyiyah',26,30),(20,'Ad-Dhuha',11,30)
), hari AS (
  SELECT d::date AS tgl FROM generate_series(date '2026-06-01', date '2026-09-05', interval '1 day') d
  WHERE extract(dow from d) <> 5
), base AS (
  SELECT s.id AS santri_id, s.ustadz_id, h.tgl,
         row_number() OVER (PARTITION BY s.id ORDER BY h.tgl) AS n,
         extract(dow from h.tgl)::int AS dow
  FROM public.santri s CROSS JOIN hari h
), rows AS (
  SELECT b.*, j.jenis
  FROM base b
  JOIN LATERAL (
    SELECT unnest(
      CASE
        WHEN b.dow IN (1,3) AND b.dow = 6 THEN ARRAY['Sabaq']
        WHEN b.dow IN (1,3) THEN ARRAY['Sabaq','Sabqi']
        WHEN b.dow = 6 THEN ARRAY['Sabaq','Manzil']
        ELSE ARRAY['Sabaq']
      END
    ) AS jenis
  ) j ON true
), final AS (
  SELECT r.santri_id, r.ustadz_id, r.tgl, r.jenis, sr.nama AS surah, sr.juz,
         1 + ((r.n * 7) % GREATEST(sr.jml - 8, 1)) AS ayat_mulai,
         3 + (r.n % 6) AS panjang,
         70 + ((r.n * 13 + length(r.jenis)) % 29) AS nilai
  FROM rows r
  JOIN surah sr ON sr.idx = 1 + ((r.n + CASE r.jenis WHEN 'Sabaq' THEN 0 WHEN 'Sabqi' THEN 5 ELSE 11 END) % 20)
)
INSERT INTO public.setoran (santri_id, ustadz_id, tanggal, jenis, surah, juz, ayat_mulai, ayat_selesai, jumlah_ayat, nilai, kelancaran, predikat, catatan)
SELECT santri_id, ustadz_id, tgl, jenis, surah, juz,
  ayat_mulai, ayat_mulai + panjang, panjang + 1, nilai,
  CASE WHEN nilai >= 90 THEN 'Sangat Lancar' WHEN nilai >= 80 THEN 'Lancar' WHEN nilai >= 70 THEN 'Cukup Lancar' ELSE 'Kurang Lancar' END,
  CASE WHEN nilai >= 90 THEN 'Mumtaz' WHEN nilai >= 80 THEN 'Jayyid Jiddan' WHEN nilai >= 70 THEN 'Jayyid' ELSE 'Maqbul' END,
  CASE WHEN nilai >= 90 THEN 'Hafalan sangat baik, pertahankan.' WHEN nilai >= 80 THEN 'Hafalan baik, perbaiki tajwid.' ELSE 'Perlu murajaah tambahan.' END
FROM final;
