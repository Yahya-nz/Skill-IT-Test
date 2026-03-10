# ERD - Aplikasi Admin RT

## Diagram (Text Representation)

```
┌─────────────────────────────────────────────────────────────┐
│                         RESIDENTS                           │
├──────────────┬───────────────────────────────────────────── │
│ id           │ BIGINT UNSIGNED AUTO_INCREMENT PK            │
│ full_name    │ VARCHAR(255)                                 │
│ phone_number │ VARCHAR(20)                                  │
│ ktp_photo    │ VARCHAR(255) NULLABLE  (path file)          │
│ status       │ ENUM('tetap', 'kontrak')                    │
│ is_married   │ BOOLEAN DEFAULT FALSE                        │
│ contract_start│ DATE NULLABLE                              │
│ contract_end │ DATE NULLABLE                               │
│ notes        │ TEXT NULLABLE                               │
│ created_at   │ TIMESTAMP                                   │
│ updated_at   │ TIMESTAMP                                   │
│ deleted_at   │ TIMESTAMP NULLABLE (soft delete)           │
└─────────────────────────────────────────────────────────────┘
         │ 1                                    │ 1
         │                                      │
         ▼ N                                    ▼ N
┌──────────────────────────────┐    ┌──────────────────────────┐
│       HOUSE_RESIDENTS        │    │         PAYMENTS         │
├──────────────┬───────────────┤    ├──────────────┬───────────┤
│ id           │ PK            │    │ id           │ PK        │
│ house_id     │ FK → houses   │    │ house_id     │ FK→houses │
│ resident_id  │ FK → residents│    │ resident_id  │ FK→resid. │
│ start_date   │ DATE          │    │ year         │ INT       │
│ end_date     │ DATE NULLABLE │    │ month        │ INT (1-12)│
│ is_active    │ BOOLEAN       │    │ payment_type │ ENUM      │
│ notes        │ TEXT NULLABLE │    │ months_paid  │ INT       │
│ created_at   │ TIMESTAMP     │    │ amount       │ DECIMAL   │
│ updated_at   │ TIMESTAMP     │    │ paid_at      │ DATE NULL │
└──────────────┴───────────────┘    │ status       │ ENUM      │
         ▲ N                        │ notes        │ TEXT NULL │
         │ 1                        │ created_at   │ TIMESTAMP │
         │                          │ updated_at   │ TIMESTAMP │
┌────────────────────────────────┐  └──────────────┴───────────┘
│            HOUSES              │            │ 1
├──────────────┬─────────────────┤            │
│ id           │ PK              │            ▼ N
│ house_number │ VARCHAR(20) UNQ │  ┌───────────────────────────┐
│ address      │ VARCHAR(255)    │  │       PAYMENT_ITEMS       │
│ status       │ ENUM            │  ├──────────────┬────────────┤
│ description  │ TEXT NULLABLE   │  │ id           │ PK         │
│ created_at   │ TIMESTAMP       │  │ payment_id   │ FK→payment │
│ updated_at   │ TIMESTAMP       │  │ type         │ ENUM       │
└────────────────────────────────┘  │ period_month │ INT        │
                                    │ period_year  │ INT        │
                                    │ amount       │ DECIMAL    │
                                    │ created_at   │ TIMESTAMP  │
                                    │ updated_at   │ TIMESTAMP  │
                                    └──────────────┴────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         EXPENSES                            │
├──────────────┬───────────────────────────────────────────── │
│ id           │ BIGINT UNSIGNED AUTO_INCREMENT PK            │
│ title        │ VARCHAR(255)                                 │
│ description  │ TEXT NULLABLE                               │
│ amount       │ DECIMAL(15,2)                               │
│ month        │ INT (1-12)                                  │
│ year         │ INT                                         │
│ expense_date │ DATE                                        │
│ category     │ ENUM(perbaikan_jalan, perbaikan_selokan,    │
│              │      gaji_satpam, listrik_pos, lainnya)     │
│ created_at   │ TIMESTAMP                                   │
│ updated_at   │ TIMESTAMP                                   │
└─────────────────────────────────────────────────────────────┘
```

## Relasi Antar Tabel

| Dari        | Ke              | Kardinalitas | Keterangan                              |
|-------------|-----------------|-------------|------------------------------------------|
| houses      | house_residents | 1 : N       | Satu rumah bisa punya banyak riwayat     |
| residents   | house_residents | 1 : N       | Satu penghuni bisa pindah rumah          |
| houses      | payments        | 1 : N       | Tagihan per rumah per bulan              |
| residents   | payments        | 1 : N       | Pembayaran oleh penghuni tertentu        |
| payments    | payment_items   | 1 : N       | Detail item per jenis iuran per bulan    |

## Keterangan Enum

### residents.status
- `tetap` — Penghuni tetap (wajib bayar setiap bulan)
- `kontrak` — Penghuni kontrak (ditagih jika aktif menghuni)

### houses.status
- `dihuni` — Rumah sedang ada penghuninya
- `tidak_dihuni` — Rumah kosong

### payments.payment_type
- `kebersihan` — Hanya iuran kebersihan (Rp 15.000)
- `satpam` — Hanya iuran satpam (Rp 100.000)
- `both` — Keduanya (Rp 115.000)

### payments.status
- `lunas` — Sudah dibayar
- `belum` — Belum dibayar

### expenses.category
- `perbaikan_jalan`
- `perbaikan_selokan`
- `gaji_satpam`
- `listrik_pos`
- `lainnya`
