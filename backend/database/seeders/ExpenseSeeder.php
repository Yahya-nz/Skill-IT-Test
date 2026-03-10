<?php

namespace Database\Seeders;

use App\Models\Expense;
use Illuminate\Database\Seeder;

class ExpenseSeeder extends Seeder
{
    public function run(): void
    {
        $expenses = [
            // Pengeluaran rutin Januari 2026
            ['title' => 'Gaji Satpam - Januari 2026',      'category' => 'gaji_satpam',      'amount' => 2500000, 'expense_date' => '2026-01-01', 'description' => 'Gaji satpam pos perumahan bulan Januari'],
            ['title' => 'Token Listrik Pos Satpam - Jan',   'category' => 'listrik_pos',       'amount' => 150000,  'expense_date' => '2026-01-03', 'description' => 'Pengisian token listrik pos jaga'],
            // Pengeluaran tidak rutin Januari
            ['title' => 'Perbaikan Jalan Blok A',           'category' => 'perbaikan_jalan',   'amount' => 3500000, 'expense_date' => '2026-01-15', 'description' => 'Pengecoran jalan berlubang di depan A08'],
            // Pengeluaran rutin Februari 2026
            ['title' => 'Gaji Satpam - Februari 2026',     'category' => 'gaji_satpam',      'amount' => 2500000, 'expense_date' => '2026-02-01', 'description' => 'Gaji satpam pos perumahan bulan Februari'],
            ['title' => 'Token Listrik Pos Satpam - Feb',   'category' => 'listrik_pos',       'amount' => 135000,  'expense_date' => '2026-02-03', 'description' => 'Pengisian token listrik pos jaga'],
            // Pengeluaran tidak rutin Februari
            ['title' => 'Perbaikan Selokan Blok A',         'category' => 'perbaikan_selokan', 'amount' => 1800000, 'expense_date' => '2026-02-20', 'description' => 'Pembersihan dan perbaikan selokan tersumbat'],
            // Pengeluaran rutin Maret 2026
            ['title' => 'Gaji Satpam - Maret 2026',        'category' => 'gaji_satpam',      'amount' => 2500000, 'expense_date' => '2026-03-01', 'description' => 'Gaji satpam pos perumahan bulan Maret'],
            ['title' => 'Token Listrik Pos Satpam - Mar',   'category' => 'listrik_pos',       'amount' => 145000,  'expense_date' => '2026-03-03', 'description' => 'Pengisian token listrik pos jaga'],
            // Pengeluaran lainnya
            ['title' => 'Pembelian Sapu & Alat Kebersihan', 'category' => 'lainnya',          'amount' => 250000,  'expense_date' => '2026-03-10', 'description' => 'Sapu, pengki, dan kantong sampah'],
        ];

        foreach ($expenses as $data) {
            $date = \Carbon\Carbon::parse($data['expense_date']);
            Expense::create(array_merge($data, [
                'month' => $date->month,
                'year'  => $date->year,
            ]));
        }
    }
}
