<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\PaymentItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['house', 'resident', 'items']);

        if ($request->status) $query->where('status', $request->status);
        if ($request->month) $query->where('month', $request->month);
        if ($request->year) $query->where('year', $request->year);
        if ($request->house_id) $query->where('house_id', $request->house_id);

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'house_id' => 'required|exists:houses,id',
            'resident_id' => 'required|exists:residents,id',
            'year' => 'required|integer|min:2000|max:2100',
            'month' => 'required|integer|min:1|max:12',
            'payment_type' => 'required|in:kebersihan,satpam,both',
            'months_paid' => 'required|integer|min:1|max:12',
            'paid_at' => 'required|date',
            'status' => 'required|in:lunas,belum',
            'notes' => 'nullable|string',
        ]);

        // Calculate amount
        $rates = ['kebersihan' => 15000, 'satpam' => 100000];
        if ($validated['payment_type'] === 'both') {
            $amount = ($rates['kebersihan'] + $rates['satpam']) * $validated['months_paid'];
        } elseif ($validated['payment_type'] === 'kebersihan') {
            $amount = $rates['kebersihan'] * $validated['months_paid'];
        } else {
            $amount = $rates['satpam'] * $validated['months_paid'];
        }
        $validated['amount'] = $amount;

        $payment = DB::transaction(function () use ($validated) {
            $payment = Payment::create($validated);

            // Create payment items per month
            $types = $validated['payment_type'] === 'both'
                ? ['kebersihan', 'satpam']
                : [$validated['payment_type']];

            for ($m = 0; $m < $validated['months_paid']; $m++) {
                $periodMonth = (($validated['month'] - 1 + $m) % 12) + 1;
                $periodYear = $validated['year'] + intdiv($validated['month'] - 1 + $m, 12);

                foreach ($types as $type) {
                    PaymentItem::create([
                        'payment_id' => $payment->id,
                        'type' => $type,
                        'period_month' => $periodMonth,
                        'period_year' => $periodYear,
                        'amount' => $type === 'kebersihan' ? 15000 : 100000,
                    ]);
                }
            }

            return $payment;
        });

        return response()->json($payment->load(['house', 'resident', 'items']), 201);
    }

    public function show(Payment $payment)
    {
        return response()->json($payment->load(['house', 'resident', 'items']));
    }

    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:lunas,belum',
            'paid_at' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $payment->update($validated);
        return response()->json($payment->load(['house', 'resident', 'items']));
    }

    public function destroy(Payment $payment)
    {
        $payment->delete();
        return response()->json(['message' => 'Pembayaran berhasil dihapus']);
    }
}
