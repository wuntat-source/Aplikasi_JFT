# SI JFT - Sistem Informasi Manajemen & Penetapan Angka Kredit Jabatan Fungsional Tertentu
**Balai Besar Guru dan Tenaga Kependidikan (BBGTK) Provinsi Jawa Tengah**  
*Kementerian Pendidikan Dasar dan Menengah Republik Indonesia*

---

## 📌 Tentang Aplikasi

**SI JFT** adalah sistem informasi berbasis web (*Single Page Application*) yang dirancang untuk mengelola data kepegawaian, memantau distribusi formasi jabatan fungsional, melakukan perhitungan dan konversi Angka Kredit (AK) berdasarkan **PermenPAN-RB No. 1 Tahun 2023**, serta mencetak dokumen penetapan resmi berstandar **Badan Kepegawaian Negara (BKN)**.

---

## ✨ Fitur Utama

1. **Dashboard & Analitik Visual**:
   - Statistik KPI total pegawai JFT, distribusi rumpun jabatan, jenjang karir, dan kesiapan kenaikan pangkat/jenjang.
   - Grafik interaktif distribusi 11 kategori rumpun JFT dengan visualisasi multi-warna dan bar berdekatan.

2. **Perhitungan & Konversi Angka Kredit (PermenPAN-RB No. 1/2023)**:
   - Kalkulator simulasi perolehan AK tahunan berdasarkan predikat kinerja tahunan dan koefisien jenjang jabatan.
   - Acuan dasar regulasi dan pedoman tabel konversi resmi.
   - Tabel rekapitulasi capaian angka kredit seluruh pegawai JFT.

3. **Laporan Resmi Format Standar BKN**:
   - **Laporan Akumulasi Angka Kredit**: Tabel akumulasi 6 kolom (*AK Lama, AK Konversi Tahun Berjalan, dan Jumlah Total AK yang diperoleh*).
   - **Laporan Konversi Predikat Kinerja ke Angka Kredit**: Penetapan konversi predikat tahunan ke angka kredit.
   - Dilengkapi Kop Surat Resmi Kemendikdasmen BBGTK Jawa Tengah, nomor dokumen, masa penilaian, keterangan perorangan 8 butir, tembusan, dan tanda tangan pejabat penilai.
   - Fitur **Edit Periode Cepat** (*preset dropdown, input teks manual, dan inline direct click-to-edit* pada pratinjau lembar cetak).

4. **Manajemen Biodata & Kepegawaian**:
   - Database terintegrasi 63 ASN JFT.
   - Profil lengkap (*NIP, NIK, Nomor Seri Karpeg, TTL, Usia, Pangkat/Golongan, TMT, Jabatan, Satker, Kontak*).
   - Form penambahan individu baru dan form edit profil.

---

## 🛠️ Struktur Berkas Proyek

```text
├── index.html       # Tampilan antarmuka utama (Dashboard, Perhitungan AK, Laporan, Biodata, Modal)
├── app.js           # Logika aplikasi, simulasi konversi PermenPAN-RB 1/2023, filter, generator laporan cetak
├── style.css        # Desain visual responsif dan format cetak dokumen resmi (@media print A4)
├── data.js          # Database pegawai JFT dan data angka kredit
├── logo-*.png       # Aset logo resmi Kemendikdasmen dan aplikasi
├── .gitignore       # Proteksi keamanan data raw dan file rahasia
└── README.md        # Dokumentasi dan panduan penggunaan
```

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi ini bersifat *client-side* murni (HTML5, CSS3, Vanilla JavaScript) sehingga sangat ringan dan dapat langsung dijalankan tanpa perlu instalasi server atau database terpisah:

1. **Buka Langsung di Browser**:
   - Cukup *double-click* file `index.html` pada browser apa pun (Google Chrome, Microsoft Edge, Mozilla Firefox).

2. **Menggunakan Local Server (Opsional)**:
   ```bash
   # Menggunakan Python
   python -m http.server 8000
   
   # Buka http://localhost:8000 di browser
   ```

---

## ⚖️ Dasar Regulasi

* **PermenPAN-RB No. 1 Tahun 2023** tentang Jabatan Fungsional.
* **Peraturan BKN No. 3 Tahun 2023** tentang Petunjuk Teknis Periodisasi Kenaikan Pangkat dan Angka Kredit Konversi.
* Koefisien Angka Kredit Tahunan:
  * **Ahli Utama**: 50,0
  * **Ahli Madya**: 37,5
  * **Ahli Muda / Penyelia**: 25,0
  * **Ahli Pertama / Mahir**: 12,5
  * **Terampil**: 5,0
