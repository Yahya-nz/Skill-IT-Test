<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ResidentController;
use App\Http\Controllers\Api\HouseController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\ReportController;

Route::apiResource('residents', ResidentController::class);
Route::apiResource('houses', HouseController::class);
Route::post('houses/{house}/assign-resident', [HouseController::class, 'assignResident']);
Route::delete('houses/{house}/remove-resident', [HouseController::class, 'removeResident']);
Route::get('houses/{house}/history', [HouseController::class, 'history']);
Route::get('houses/{house}/payments', [HouseController::class, 'payments']);

Route::apiResource('payments', PaymentController::class);
Route::apiResource('expenses', ExpenseController::class);

Route::prefix('reports')->group(function () {
    Route::get('dashboard', [ReportController::class, 'dashboard']);
    Route::get('summary', [ReportController::class, 'summary']);
    Route::get('detail', [ReportController::class, 'detail']);
});
