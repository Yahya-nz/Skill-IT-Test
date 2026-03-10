<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentItem extends Model
{
    protected $fillable = [
        'payment_id', 'type', 'period_month', 'period_year', 'amount',
    ];

    public function payment() { return $this->belongsTo(Payment::class); }
}
