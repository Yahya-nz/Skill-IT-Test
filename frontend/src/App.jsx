import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import ResidentsPage from './pages/residents/ResidentsPage';
import HousesPage from './pages/houses/HousesPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import ExpensesPage from './pages/expenses/ExpensesPage';
import ReportsPage from './pages/reports/ReportsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/residents" element={<ResidentsPage />} />
          <Route path="/houses" element={<HousesPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
