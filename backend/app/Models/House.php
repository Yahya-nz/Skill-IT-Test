<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class House extends Model
{
    protected $fillable = [
        'house_number',
        'address',
        'status',
        'description',
    ];

    public function houseResidents()
    {
        return $this->hasMany(HouseResident::class);
    }

    public function currentResident()
    {
        return $this->hasOneThrough(Resident::class, HouseResident::class, 'house_id', 'id', 'id', 'resident_id')
            ->where('house_residents.is_active', true);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
