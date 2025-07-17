
# 🤖 AGENTS.md - Dokumentasi Agen & Infrastruktur Proyek RekberX

---

## 🧠 Fungsi Utama Agen Sistem
Proyek ini menggunakan Supabase sebagai backend dengan sistem berbasis agen yang mencakup:

- Autentikasi pengguna menggunakan Supabase Auth
- Real-time chat dengan Supabase subscription
- Sistem undangan Rekber antar pengguna
- Panel admin dengan pengelolaan user, topik game, dan rekber
- Sistem laporan pengguna dan rekber

---

## ⚙️ Setup Agen (Supabase + Environment)

### 1. Buat Project Supabase
1. Masuk ke https://supabase.com/dashboard → "New Project"
2. Isi nama proyek: `RekberX`
3. Tentukan password, region Southeast Asia
4. Tunggu 2–3 menit hingga proyek aktif

### 2. Dapatkan Kunci Akses
Masuk ke **Settings > API**, lalu salin:
- `Project URL`: `https://[ref].supabase.co`
- `anon/public key`: `eyJ...` (token JWT)

### 3. Tambahkan `.env`
```env
VITE_SUPABASE_URL=https://[ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ[your-token]
```

> ⚠️ Semua variabel harus diawali dengan `VITE_` agar Vite dapat membacanya

---

## 🧱 Skema Database Agen

Jalankan SQL di Supabase SQL Editor:

- Tipe Enum: `user_role`, `room_type`, `message_type`, `invite_status`, `report_reason`, `report_status`
- Tabel:
  - `users`, `game_topics`, `chat_rooms`
  - `messages`, `rekber_invites`, `user_reports`
- Indexing dan RLS (Row Level Security) diaktifkan untuk semua tabel

Contoh agen:
- `rekber_invites`: mengelola undangan transaksi antar user
- `user_reports`: sistem laporan dengan verifikasi dan status

---

## 🔒 Autentikasi & Keamanan

- Supabase Auth dengan PKCE flow
- Session management & input sanitization
- RLS policies untuk membatasi akses hanya oleh user yang sah

---

## 💬 Fitur Real-time Agen

- Chat langsung & live typing
- Notifikasi undangan
- Tracking status pengguna (online/offline)
- Real-time edit/delete pesan & update room

---

## ✅ Fitur Siap Pakai

### Pengguna:
- Register/Login
- Chat & undang transaksi (rekber)
- Kirim laporan pengguna

### Admin:
- CRUD topik game
- Kelola user, grup rekber, laporan
- Monitoring sistem

---

## 🚀 Deployment Guide

### Platform:
- **Vercel**:
  ```bash
  npm run build
  vercel --prod
  ```
- **Netlify / cPanel**:
  ```bash
  npm run build
  # Upload folder dist/
  ```

### Checklist Sebelum Deploy:
- [x] `.env` lengkap
- [x] Database schema dijalankan
- [x] Tes semua fitur realtime

---

## 🧪 Monitoring

- Cek koneksi Supabase dari status bar UI
- Log error ditandai dengan emoji prefix
- Debug menggunakan browser console (F12)

---

**Agen siap digunakan untuk sistem rekber digital dengan Supabase sebagai motor utama backend dan event handler.** 🚀
