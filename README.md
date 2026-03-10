# Admin RT - Aplikasi Manajemen Perumahan

Aplikasi full-stack untuk mengelola administrasi RT perumahan, meliputi manajemen penghuni, rumah, pembayaran iuran, pengeluaran, dan laporan keuangan.

---

## Teknologi

|           | Teknologi        |
|-----------|-----------------|
| Backend   | Laravel 12 (PHP) |
| Frontend  | React 18 + Vite  |
| Database  | MySQL 8.0        |
| API Style | RESTful JSON     |

---

## Panduan Instalasi

### Prasyarat

Pastikan sistem Anda sudah terpasang:

| Software      | Versi Minimum | Catatan                        |
|---------------|---------------|-------------------------------|
| PHP           | **8.2+**      | Disarankan 8.2 atau 8.3       |

> **Catatan PHP:** Project ini menggunakan Laravel 12 yang kompatibel dengan PHP 8.2+. Jika versi PHP Anda lebih rendah dari 8.4 dan `composer install` gagal dengan error dependency, jalankan `composer update` sebagai gantinya (lihat Troubleshooting).

---

### 1. Clone Repository

```bash
git clone <URL_REPO>
cd Skill-IT-Test
```

---

### 2. Setup Database MySQL

Login ke MySQL dan buat database:

```sql
CREATE DATABASE rt_admin;
```

Atau via terminal/CMD:

```bash
mysql -u root -e "CREATE DATABASE ;"
```


---

### 3. Setup Backend (Laravel)

```bash
cd backend
```

**Install dependensi PHP:**

```bash
composer install
```

> Jika muncul error seperti `symfony/clock requires php >=8.4`, jalankan:
> ```bash
> composer update
> ```
> Biar bisa menyesuaikan versi package agar kompatibel dengan versi PHP Kita.

**Buat folder cache jika belum ada** (wajib, terutama di Windows):

```bash
# Linux / Mac
mkdir -p bootstrap/cache

# Windows (CMD)
mkdir bootstrap\cache
```

**Salin file environment:**

```bash
# Linux / Mac
cp .env.example .env

# Windows (CMD)
copy .env.example .env
```

**Edit file `.env`** — sesuaikan bagian database:

```env
APP_NAME="RT Admin"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rt_admin
DB_USERNAME=root
DB_PASSWORD=
```

**Lanjutkan setup:**

```bash
# Generate application key
php artisan key:generate

# Jalankan migrasi database
php artisan migrate

# (Opsional) Isi data contoh
php artisan db:seed

# Buat symlink storage untuk upload foto KTP
php artisan storage:link

# Jalankan development server
php artisan serve
```

Backend berjalan di: **http://localhost:8000**

---

### 4. Setup Frontend (React)

Buka terminal **baru** (jangan tutup terminal backend):

```bash
cd frontend
```

**Install dependensi Node:**

```bash
npm install
```

**Salin file environment:**

```bash
# Linux / Mac
cp .env.example .env

# Windows (CMD)
copy .env.example .env
```

Pastikan isi `.env` frontend:

```env
VITE_API_URL=http://localhost:8000/api
```

**Jalankan development server:**

```bash
npm run dev
```

Frontend berjalan di: **http://localhost:5173**

---

### 5. Verifikasi Instalasi

1. Buka browser, akses **http://localhost:5173** , harus muncul halaman Dashboard
2. Cek API backend: **http://localhost:8000/api/reports/dashboard** 

---

## Data Contoh (Seeder)

```bash
cd backend
php artisan db:seed
```

Atau reset database sekaligus:

```bash
php artisan migrate:fresh --seed
```

---

## Build Production (Opsional)

```bash
# Build frontend
cd frontend
npm run build
# Output ada di folder dist/

# Optimasi backend
cd backend
php artisan config:cache
php artisan route:cache
```

---

## Fitur Aplikasi

| Fitur              | Deskripsi                                               |
|--------------------|---------------------------------------------------------|
| Dashboard          | Statistik ringkas + grafik arus kas 12 bulan           |
| Kelola Penghuni    | CRUD penghuni dengan foto KTP, status, dan riwayat     |
| Kelola Rumah       | CRUD rumah, assign/lepas penghuni, riwayat penghuni    |
| Kelola Pembayaran  | Input iuran bulanan (kebersihan & satpam), toggle status|
| Kelola Pengeluaran | CRUD pengeluaran operasional RT dengan kategori        |
| Laporan Tahunan    | Grafik Bar + Line arus kas 12 bulan                    |
| Laporan Bulanan    | Detail pemasukan & pengeluaran per bulan               |

---

## Struktur Direktori

```
Skill-IT-Test/
├── backend/              # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   └── Models/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/api.php
│   └── .env.example
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── components/   # Komponen reusable
│   │   ├── layouts/      # Layout utama
│   │   ├── pages/        # Halaman per fitur
│   │   ├── services/     # API client (axios)
│   │   └── utils/        # Helper functions
│   └── .env.example
├── ERD.md                # Entity Relationship Diagram
└── README.md             # Panduan instalasi ini
```

---

## Troubleshooting

**Error: `symfony/clock requires php >=8.4` saat `composer install`**

PHP Anda di bawah 8.4. Jalankan `composer update` untuk menyesuaikan versi package:
```bash
composer update
```

---

**Error: `bootstrap/cache directory must be present and writable`**

Buat folder tersebut secara manual lalu ulangi perintah:
```bash
# Linux / Mac
mkdir -p bootstrap/cache

# Windows
mkdir bootstrap\cache
```

---


**`php artisan migrate` gagal — SQLSTATE connection error**

Pastikan MySQL sudah berjalan dan kredensial di `.env` benar:
```bash
mysql -u root -e "SHOW DATABASES;"
```

---

**Frontend tidak bisa connect ke backend (CORS / Network Error)**

Pastikan `VITE_API_URL` di `frontend/.env` sesuai port backend:
```env
VITE_API_URL=http://localhost:8000/api
```
Dan backend (`php artisan serve`) sudah berjalan di terminal terpisah.

---

**Upload foto KTP gagal**

Pastikan sudah menjalankan `php artisan storage:link`. Di Windows, jalankan CMD sebagai Administrator jika perintah tersebut gagal membuat symlink.

---

