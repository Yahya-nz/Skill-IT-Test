<?php

namespace Database\Seeders;

use App\Models\Resident;
use Illuminate\Database\Seeder;

class ResidentSeeder extends Seeder
{
    public function run(): void
    {
        $residents = [
            // Penghuni Tetap (15 orang)
            ['full_name' => 'Budi Santoso',        'phone_number' => '081234567801', 'status' => 'tetap', 'is_married' => true],
            ['full_name' => 'Dewi Rahayu',          'phone_number' => '081234567802', 'status' => 'tetap', 'is_married' => true],
            ['full_name' => 'Ahmad Fauzi',          'phone_number' => '081234567803', 'status' => 'tetap', 'is_married' => true],
            ['full_name' => 'Siti Nurhaliza',       'phone_number' => '081234567804', 'status' => 'tetap', 'is_married' => false],
            ['full_name' => 'Hendra Gunawan',       'phone_number' => '081234567805', 'status' => 'tetap', 'is_married' => true],
            ['full_name' => 'Rina Kusuma',          'phone_number' => '081234567806', 'status' => 'tetap', 'is_married' => true],
            ['full_name' => 'Doni Prasetyo',        'phone_number' => '081234567807', 'status' => 'tetap', 'is_married' => false],
            ['full_name' => 'Lestari Wulandari',    'phone_number' => '081234567808', 'status' => 'tetap', 'is_married' => true],
            ['full_name' => 'Agus Setiawan',        'phone_number' => '081234567809', 'status' => 'tetap', 'is_married' => true],
            ['full_name' => 'Maya Anggraini',       'phone_number' => '081234567810', 'status' => 'tetap', 'is_married' => true],
            ['full_name' => 'Rizky Pratama',        'phone_number' => '081234567811', 'status' => 'tetap', 'is_married' => false],
            ['full_name' => 'Fitri Handayani',      'phone_number' => '081234567812', 'status' => 'tetap', 'is_married' => true],
            ['full_name' => 'Wahyu Hidayat',        'phone_number' => '081234567813', 'status' => 'tetap', 'is_married' => true],
            ['full_name' => 'Nurul Aini',           'phone_number' => '081234567814', 'status' => 'tetap', 'is_married' => false],
            ['full_name' => 'Bambang Irawan',       'phone_number' => '081234567815', 'status' => 'tetap', 'is_married' => true],
            // Penghuni Kontrak (5 orang)
            ['full_name' => 'Farhan Malik',         'phone_number' => '081234567816', 'status' => 'kontrak', 'is_married' => false, 'contract_start' => '2025-01-01', 'contract_end' => '2025-12-31'],
            ['full_name' => 'Indira Sari',          'phone_number' => '081234567817', 'status' => 'kontrak', 'is_married' => true,  'contract_start' => '2025-06-01', 'contract_end' => '2026-05-31'],
            ['full_name' => 'Teguh Wibowo',         'phone_number' => '081234567818', 'status' => 'kontrak', 'is_married' => false, 'contract_start' => '2025-03-01', 'contract_end' => '2026-02-28'],
            ['full_name' => 'Ayu Puspita',          'phone_number' => '081234567819', 'status' => 'kontrak', 'is_married' => false, 'contract_start' => '2026-01-01', 'contract_end' => '2026-12-31'],
            ['full_name' => 'Rendi Kurniawan',      'phone_number' => '081234567820', 'status' => 'kontrak', 'is_married' => true,  'contract_start' => '2025-09-01', 'contract_end' => '2026-08-31'],
        ];

        foreach ($residents as $data) {
            Resident::create($data);
        }
    }
}
