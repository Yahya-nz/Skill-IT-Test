<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    // Summary per month for 1 year (chart data)
    public function summary(Request $request)
    {
        $year = $request->year ?? now()->year;

        $payments = Payment::select(
                DB::raw('month, SUM(amount) as total_income, COUNT(*) as count_paid')
            )
            ->where('year', $year)
            ->where('status', 'lunas')
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $expenses = Expense::select(
                DB::raw('month, SUM(amount) as total_expense, COUNT(*) as count_expense')
            )
            ->where('year', $year)
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $months = [];
        $cumulativeBalance = 0;
        for ($m = 1; $m <= 12; $m++) {
            $income = isset($payments[$m]) ? (float) $payments[$m]->total_income : 0;
            $expense = isset($expenses[$m]) ? (float) $expenses[$m]->total_expense : 0;
            $cumulativeBalance += ($income - $expense);
            $months[] = [
                'month' => $m,
                'income' => $income,
                'expense' => $expense,
                'balance' => $income - $expense,
                'cumulative_balance' => $cumulativeBalance,
            ];
        }

        $totalIncome = array_sum(array_column($months, 'income'));
        $totalExpense = array_sum(array_column($months, 'expense'));

        return response()->json([
            'year' => $year,
            'months' => $months,
            'total_income' => $totalIncome,
            'total_expense' => $totalExpense,
            'net_balance' => $totalIncome - $totalExpense,
        ]);
    }

    // Detail for a specific month
    public function detail(Request $request)
    {
        $month = $request->month ?? now()->month;
        $year = $request->year ?? now()->year;

        $payments = Payment::with(['house', 'resident', 'items'])
            ->where('month', $month)
            ->where('year', $year)
            ->get();

        $expenses = Expense::where('month', $month)
            ->where('year', $year)
            ->get();

        $totalIncome = $payments->where('status', 'lunas')->sum('amount');
        $totalExpense = $expenses->sum('amount');

        return response()->json([
            'month' => $month,
            'year' => $year,
            'payments' => $payments,
            'expenses' => $expenses,
            'total_income' => $totalIncome,
            'total_expense' => $totalExpense,
            'balance' => $totalIncome - $totalExpense,
            'pending_count' => $payments->where('status', 'belum')->count(),
            'paid_count' => $payments->where('status', 'lunas')->count(),
        ]);
    }

    // Dashboard stats
    public function dashboard()
    {
        $thisMonth = now()->month;
        $thisYear = now()->year;

        $totalHouses = \App\Models\House::count();
        $occupiedHouses = \App\Models\House::where('status', 'dihuni')->count();
        $totalResidents = \App\Models\Resident::count();

        $monthlyIncome = Payment::where('month', $thisMonth)
            ->where('year', $thisYear)
            ->where('status', 'lunas')
            ->sum('amount');

        $monthlyExpense = Expense::where('month', $thisMonth)
            ->where('year', $thisYear)
            ->sum('amount');

        $pendingPayments = Payment::where('month', $thisMonth)
            ->where('year', $thisYear)
            ->where('status', 'belum')
            ->count();

        return response()->json([
            'total_houses' => $totalHouses,
            'occupied_houses' => $occupiedHouses,
            'empty_houses' => $totalHouses - $occupiedHouses,
            'total_residents' => $totalResidents,
            'monthly_income' => (float) $monthlyIncome,
            'monthly_expense' => (float) $monthlyExpense,
            'monthly_balance' => (float) ($monthlyIncome - $monthlyExpense),
            'pending_payments' => $pendingPayments,
        ]);
    }
}
