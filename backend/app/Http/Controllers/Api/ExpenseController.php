<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::query();

        if ($request->month) $query->where('month', $request->month);
        if ($request->year) $query->where('year', $request->year);
        if ($request->category) $query->where('category', $request->category);

        return response()->json($query->latest('expense_date')->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'category' => 'required|in:perbaikan_jalan,perbaikan_selokan,gaji_satpam,listrik_pos,lainnya',
        ]);

        $date = \Carbon\Carbon::parse($validated['expense_date']);
        $validated['month'] = $date->month;
        $validated['year'] = $date->year;

        $expense = Expense::create($validated);
        return response()->json($expense, 201);
    }

    public function show(Expense $expense)
    {
        return response()->json($expense);
    }

    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'sometimes|numeric|min:0',
            'expense_date' => 'sometimes|date',
            'category' => 'sometimes|in:perbaikan_jalan,perbaikan_selokan,gaji_satpam,listrik_pos,lainnya',
        ]);

        if (isset($validated['expense_date'])) {
            $date = \Carbon\Carbon::parse($validated['expense_date']);
            $validated['month'] = $date->month;
            $validated['year'] = $date->year;
        }

        $expense->update($validated);
        return response()->json($expense);
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();
        return response()->json(['message' => 'Pengeluaran berhasil dihapus']);
    }
}
