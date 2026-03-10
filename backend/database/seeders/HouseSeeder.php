<?php

namespace Database\Seeders;

use App\Models\House;
use Illuminate\Database\Seeder;

class HouseSeeder extends Seeder
{
    public function run(): void
    {
        // 20 unit rumah: 15 dihuni, 5 tidak dihuni
        $houses = [];

        for ($i = 1; $i <= 20; $i++) {
            $houses[] = [
                'house_number' => 'A' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'address'      => "Jl. Perumahan Elite No. {$i}, Blok A",
                'status'       => $i <= 15 ? 'dihuni' : 'tidak_dihuni',
                'description'  => $i <= 15 ? 'Rumah tipe 45 dua lantai' : 'Rumah tipe 45, saat ini kosong',
            ];
        }

        foreach ($houses as $data) {
            House::create($data);
        }
    }
}
