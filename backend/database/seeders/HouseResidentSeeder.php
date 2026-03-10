<?php

namespace Database\Seeders;

use App\Models\House;
use App\Models\HouseResident;
use App\Models\Resident;
use Illuminate\Database\Seeder;

class HouseResidentSeeder extends Seeder
{
    public function run(): void
    {
        // Pasangkan 15 penghuni tetap ke rumah A01–A15
        for ($i = 1; $i <= 15; $i++) {
            $house    = House::where('house_number', 'A' . str_pad($i, 2, '0', STR_PAD_LEFT))->first();
            $resident = Resident::find($i);

            if ($house && $resident) {
                HouseResident::create([
                    'house_id'    => $house->id,
                    'resident_id' => $resident->id,
                    'start_date'  => '2023-01-01',
                    'end_date'    => null,
                    'is_active'   => true,
                    'notes'       => 'Penghuni tetap sejak 2023',
                ]);
            }
        }

        // Penghuni kontrak: A16 = Farhan (id 16), A17 = Indira (id 17),
        // A18 = Teguh (id 18, sudah keluar/histori), A19 = Ayu (id 19)
        // A20 = kosong, A18 ditempati Rendi (id 20) sebagai penghuni aktif terbaru

        // Riwayat A18: Teguh dulu, lalu Rendi sekarang
        $house18 = House::where('house_number', 'A18')->first();
        $teguh   = Resident::find(18);
        $rendi   = Resident::find(20);
        if ($house18 && $teguh) {
            HouseResident::create([
                'house_id'    => $house18->id,
                'resident_id' => $teguh->id,
                'start_date'  => '2025-03-01',
                'end_date'    => '2025-12-31',
                'is_active'   => false,
                'notes'       => 'Kontrak selesai',
            ]);
        }
        if ($house18 && $rendi) {
            HouseResident::create([
                'house_id'    => $house18->id,
                'resident_id' => $rendi->id,
                'start_date'  => '2026-01-01',
                'end_date'    => '2026-12-31',
                'is_active'   => true,
                'notes'       => 'Penghuni kontrak baru',
            ]);
            $house18->update(['status' => 'dihuni']);
        }

        // A16 = Farhan
        $house16 = House::where('house_number', 'A16')->first();
        $farhan  = Resident::find(16);
        if ($house16 && $farhan) {
            HouseResident::create([
                'house_id'    => $house16->id,
                'resident_id' => $farhan->id,
                'start_date'  => '2025-01-01',
                'end_date'    => '2025-12-31',
                'is_active'   => false,
                'notes'       => 'Kontrak sudah berakhir',
            ]);
            $house16->update(['status' => 'tidak_dihuni']);
        }

        // A17 = Indira (masih aktif)
        $house17 = House::where('house_number', 'A17')->first();
        $indira  = Resident::find(17);
        if ($house17 && $indira) {
            HouseResident::create([
                'house_id'    => $house17->id,
                'resident_id' => $indira->id,
                'start_date'  => '2025-06-01',
                'end_date'    => '2026-05-31',
                'is_active'   => true,
                'notes'       => 'Kontrak berlangsung',
            ]);
            $house17->update(['status' => 'dihuni']);
        }

        // A19 = Ayu (masih aktif)
        $house19 = House::where('house_number', 'A19')->first();
        $ayu     = Resident::find(19);
        if ($house19 && $ayu) {
            HouseResident::create([
                'house_id'    => $house19->id,
                'resident_id' => $ayu->id,
                'start_date'  => '2026-01-01',
                'end_date'    => '2026-12-31',
                'is_active'   => true,
                'notes'       => 'Kontrak 2026',
            ]);
            $house19->update(['status' => 'dihuni']);
        }
    }
}
