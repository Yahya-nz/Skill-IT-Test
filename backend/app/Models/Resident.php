<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Resident extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'full_name',
        'phone_number',
        'ktp_photo',
        'status',
        'is_married',
        'contract_start',
        'contract_end',
        'notes',
    ];

    protected $casts = [
        'is_married' => 'boolean',
        'contract_start' => 'date',
        'contract_end' => 'date',
    ];

    public function houseResidents()
    {
        return $this->hasMany(HouseResident::class);
    }

    public function activeHouse()
    {
        return $this->hasOneThrough(House::class, HouseResident::class, 'resident_id', 'id', 'id', 'house_id')
            ->where('house_residents.is_active', true);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
