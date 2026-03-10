<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ResidentController extends Controller
{
    public function index(Request $request)
    {
        $query = Resident::with(['houseResidents.house']);

        if ($request->search) {
            $query->where('full_name', 'like', "%{$request->search}%")
                  ->orWhere('phone_number', 'like', "%{$request->search}%");
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->paginate(15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'status' => 'required|in:tetap,kontrak',
            'is_married' => 'boolean',
            'contract_start' => 'nullable|date',
            'contract_end' => 'nullable|date|after_or_equal:contract_start',
            'notes' => 'nullable|string',
            'ktp_photo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('ktp_photo')) {
            $validated['ktp_photo'] = $request->file('ktp_photo')->store('ktp', 'public');
        }

        $resident = Resident::create($validated);
        return response()->json($resident, 201);
    }

    public function show(Resident $resident)
    {
        $resident->load(['houseResidents.house', 'payments.items']);
        return response()->json($resident);
    }

    public function update(Request $request, Resident $resident)
    {
        $validated = $request->validate([
            'full_name' => 'sometimes|string|max:255',
            'phone_number' => 'sometimes|string|max:20',
            'status' => 'sometimes|in:tetap,kontrak',
            'is_married' => 'boolean',
            'contract_start' => 'nullable|date',
            'contract_end' => 'nullable|date',
            'notes' => 'nullable|string',
            'ktp_photo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('ktp_photo')) {
            if ($resident->ktp_photo) {
                Storage::disk('public')->delete($resident->ktp_photo);
            }
            $validated['ktp_photo'] = $request->file('ktp_photo')->store('ktp', 'public');
        }

        $resident->update($validated);
        return response()->json($resident);
    }

    public function destroy(Resident $resident)
    {
        $resident->delete();
        return response()->json(['message' => 'Penghuni berhasil dihapus']);
    }
}
