<?php

namespace Database\Seeders;

use App\Models\House;
use App\Models\HouseResident;
use App\Models\Payment;
use App\Models\PaymentItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentSeeder extends Seeder
{
    private int $year = 2026;

    public function run(): void
    {
        // Generate tagihan untuk penghuni aktif, bulan Jan–Mar 2026
        $activeLinks = HouseResident::with(['house', 'resident'])
            ->where('is_active', true)
            ->get();

        foreach ($activeLinks as $link) {
            // Bulan 1 & 2 sudah lunas, bulan 3 belum
            foreach ([1, 2, 3] as $month) {
                $isLunas  = $month < 3;
                $paidAt   = $isLunas ? "{$this->year}-" . str_pad($month, 2, '0', STR_PAD_LEFT) . '-05' : null;

                DB::transaction(function () use ($link, $month, $isLunas, $paidAt) {
                    $payment = Payment::create([
                        'house_id'     => $link->house_id,
                        'resident_id'  => $link->resident_id,
                        'year'         => $this->year,
                        'month'        => $month,
                        'payment_type' => 'both',
                        'months_paid'  => 1,
                        'amount'       => 115000,
                        'paid_at'      => $paidAt,
                        'status'       => $isLunas ? 'lunas' : 'belum',
                        'notes'        => $isLunas ? 'Pembayaran tepat waktu' : null,
                    ]);

                    foreach (['kebersihan', 'satpam'] as $type) {
                        PaymentItem::create([
                            'payment_id'   => $payment->id,
                            'type'         => $type,
                            'period_month' => $month,
                            'period_year'  => $this->year,
                            'amount'       => $type === 'kebersihan' ? 15000 : 100000,
                        ]);
                    }
                });
            }
        }

        // Contoh 1 penghuni bayar iuran kebersihan setahun penuh (12 bulan)
        $firstLink = HouseResident::with(['house', 'resident'])
            ->where('is_active', true)
            ->first();

        if ($firstLink) {
            DB::transaction(function () use ($firstLink) {
                $payment = Payment::create([
                    'house_id'     => $firstLink->house_id,
                    'resident_id'  => $firstLink->resident_id,
                    'year'         => 2025,
                    'month'        => 1,
                    'payment_type' => 'kebersihan',
                    'months_paid'  => 12,
                    'amount'       => 15000 * 12,
                    'paid_at'      => '2025-01-03',
                    'status'       => 'lunas',
                    'notes'        => 'Bayar iuran kebersihan 1 tahun sekaligus',
                ]);

                for ($m = 1; $m <= 12; $m++) {
                    PaymentItem::create([
                        'payment_id'   => $payment->id,
                        'type'         => 'kebersihan',
                        'period_month' => $m,
                        'period_year'  => 2025,
                        'amount'       => 15000,
                    ]);
                }
            });
        }
    }
}
