<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'house_id', 'resident_id', 'year', 'month',
        'payment_type', 'months_paid', 'amount', 'paid_at', 'status', 'notes',
    ];

    protected $casts = [
        'paid_at' => 'date',
        'amount' => 'decimal:2',
    ];

    public function house() { return $this->belongsTo(House::class); }
    public function resident() { return $this->belongsTo(Resident::class); }
    public function items() { return $this->hasMany(PaymentItem::class); }
}
