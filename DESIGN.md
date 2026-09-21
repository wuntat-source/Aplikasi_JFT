# Design Direction: SI JFT (Sistem Informasi Jabatan Fungsional Tertentu)
Kementerian Pendidikan Dasar dan Menengah Republik Indonesia (BBGTK Jawa Tengah)

## 1. Identity & Purpose
- **System**: Sistem Informasi Jabatan Fungsional Tertentu (SI JFT)
- **Institution**: Balai Besar Guru Penggerak / Balai Besar Guru dan Tenaga Kependidikan (BBGTK) Provinsi Jawa Tengah, Kemendikdasmen RI.
- **Audience**: Administrator Kepegawaian, Pejabat Pembina Kepegawaian, dan Pejabat Fungsional Tertentu (Widyaiswara, PTP, Prakom, Arsiparis, Analis, Statistisi, Perencana).
- **Core Goal**: Memberikan visibilitas terstruktur terhadap data kepegawaian 63 ASN JFT, riwayat PAK Integrasi & Konversi, serta monitoring progres angka kredit kenaikan pangkat dan jenjang.

## 2. Visual Character & Mood
- **Tone**: Formal, Institusional, Bersih, Akurat, dan Transparan.
- **Aesthetic**: Modern Enterprise Public Sector Dashboard dengan hirarki visual fungsional tanpa ornamen yang berlebihan.

## 3. Color Palette & Contrast Standards
- **Primary**: `#1A5F7A` (Kemendikdasmen Deep Teal) - WCAG AA compliant 6.2:1 contrast ratio terhadap background putih/terang.
- **Primary Dark**: `#134B61` (Deep Navy) untuk hover states dan chart emphasis.
- **Primary Light**: `#EAF4F8` untuk subtle active background states.
- **Accent Amber/Gold**: `#F5A623` untuk penanda peringatan dan progress highlight.
- **Surface**: `#FFFFFF` (Light Mode), `#2D2D44` (Dark Mode).
- **Background**: `#F4F5F7` (Light Mode), `#1A1A2E` (Dark Mode).
- **Success / Status**: `#28A745` (Aktif / Memenuhi Syarat).

## 4. Typography
- **Primary Typeface**: `Inter` (sans-serif) - dipilih karena optimasi keterbacaan tinggi pada tampilan tabel data numerik, NIP/NIK, dan badge status.
- **Numerics**: Monospace tabular untuk NIP, NIK, dan nominal Angka Kredit.

## 5. Dials
- **ENERGY**: 2 (Focused, structured governmental enterprise UI)
- **RHYTHM**: 2 (Variasi hirarki antara KPI cards, grafik distribusi, tabel interaktif berpaginasi, dan multi-tab detail view)
- **MOTION**: 1 (Transisi halus 150ms untuk hover, tab switching, dan modal; tidak ada animasi dekoratif tanpa tujuan)
