<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ResidentSeeder::class,
            HouseSeeder::class,
            HouseResidentSeeder::class,
            PaymentSeeder::class,
            ExpenseSeeder::class,
        ]);
    }
}
