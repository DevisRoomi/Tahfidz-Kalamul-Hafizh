
DELETE FROM public.setoran
WHERE id IN (
  SELECT id FROM public.setoran
  WHERE (abs(hashtext(id::text)) % 100) < 9
);

UPDATE public.setoran s
SET nilai = v.nilai_baru,
    jumlah_ayat = v.ayat_baru,
    ayat_selesai = s.ayat_mulai + v.ayat_baru - 1,
    kelancaran = CASE WHEN v.nilai_baru >= 90 THEN 'Sangat Lancar' WHEN v.nilai_baru >= 80 THEN 'Lancar' WHEN v.nilai_baru >= 70 THEN 'Cukup Lancar' ELSE 'Kurang Lancar' END,
    predikat = CASE WHEN v.nilai_baru >= 90 THEN 'Mumtaz' WHEN v.nilai_baru >= 80 THEN 'Jayyid Jiddan' WHEN v.nilai_baru >= 70 THEN 'Jayyid' ELSE 'Maqbul' END
FROM (
  SELECT id,
    LEAST(100, GREATEST(62,
      68 + (abs(hashtext(santri_id::text)) % 22) + (abs(hashtext(id::text)) % 9) - 4
    ))::numeric AS nilai_baru,
    2 + (abs(hashtext(santri_id::text || 'a')) % 6) + (abs(hashtext(id::text)) % 4) AS ayat_baru
  FROM public.setoran
) v
WHERE v.id = s.id;
