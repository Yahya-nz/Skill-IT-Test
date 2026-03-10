<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\House;
use App\Models\HouseResident;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HouseController extends Controller
{
    public function index(Request $request)
    {
        $query = House::with([
            'houseResidents' => function ($q) {
                $q->where('is_active', true)->with('resident');
            }
        ]);

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->search) {
            $query->where('house_number', 'like', "%{$request->search}%")
                  ->orWhere('address', 'like', "%{$request->search}%");
        }

        return response()->json($query->orderBy('house_number')->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'house_number' => 'required|string|unique:houses',
            'address' => 'required|string',
            'status' => 'required|in:dihuni,tidak_dihuni',
            'description' => 'nullable|string',
        ]);

        $house = House::create($validated);
        return response()->json($house, 201);
    }

    public function show(House $house)
    {
        $house->load([
            'houseResidents.resident',
            'payments.resident',
            'payments.items',
        ]);
        return response()->json($house);
    }

    public function update(Request $request, House $house)
    {
        $validated = $request->validate([
            'house_number' => 'sometimes|string|unique:houses,house_number,' . $house->id,
            'address' => 'sometimes|string',
            'status' => 'sometimes|in:dihuni,tidak_dihuni',
            'description' => 'nullable|string',
        ]);

        $house->update($validated);
        return response()->json($house);
    }

    public function destroy(House $house)
    {
        $house->delete();
        return response()->json(['message' => 'Rumah berhasil dihapus']);
    }

    public function assignResident(Request $request, House $house)
    {
        $validated = $request->validate([
            'resident_id' => 'required|exists:residents,id',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($house, $validated) {
            // Deactivate previous active resident
            HouseResident::where('house_id', $house->id)
                ->where('is_active', true)
                ->update(['is_active' => false, 'end_date' => now()]);

            // Assign new
            HouseResident::create([
                'house_id' => $house->id,
                'resident_id' => $validated['resident_id'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'] ?? null,
                'is_active' => true,
                'notes' => $validated['notes'] ?? null,
            ]);

            $house->update(['status' => 'dihuni']);
        });

        return response()->json(['message' => 'Penghuni berhasil ditambahkan ke rumah']);
    }

    public function removeResident(House $house)
    {
        DB::transaction(function () use ($house) {
            HouseResident::where('house_id', $house->id)
                ->where('is_active', true)
                ->update(['is_active' => false, 'end_date' => now()]);

            $house->update(['status' => 'tidak_dihuni']);
        });

        return response()->json(['message' => 'Penghuni berhasil dikeluarkan']);
    }

    public function history(House $house)
    {
        $history = HouseResident::with('resident')
            ->where('house_id', $house->id)
            ->orderBy('start_date', 'desc')
            ->get();

        return response()->json($history);
    }

    public function payments(House $house)
    {
        $payments = $house->payments()->with(['resident', 'items'])->latest()->paginate(20);
        return response()->json($payments);
    }
}
