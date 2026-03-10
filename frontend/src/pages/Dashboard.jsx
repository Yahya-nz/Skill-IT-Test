import { useState, useEffect } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import { formatCurrency, MONTHS } from '../utils/format';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/dashboard'),
      api.get(`/reports/summary?year=${year}`),
    ]).then(([d, r]) => {
      setStats(d.data);
      setChartData(r.data.months.map(m => ({
        name: MONTHS[m.month - 1].slice(0, 3),
        Pemasukan: m.income,
        Pengeluaran: m.expense,
        Saldo: m.balance,
      })));
    }).finally(() => setLoading(false));
  }, [year]);

  if (loading) return <div className="loading-state">Memuat data...</div>;

  return (
    <div className="dashboard">
      <PageHeader title="Dashboard" subtitle={`Ringkasan administrasi bulan ini`} />

      <div className="stats-grid">
        <StatCard label="Total Rumah" value={stats?.total_houses} sub={`${stats?.occupied_houses} dihuni · ${stats?.empty_houses} kosong`} accent />
        <StatCard label="Total Penghuni" value={stats?.total_residents} sub="Warga terdaftar" />
        <StatCard label="Pemasukan Bulan Ini" value={formatCurrency(stats?.monthly_income)} sub={`${stats?.pending_payments} tagihan belum lunas`} accent />
        <StatCard label="Pengeluaran Bulan Ini" value={formatCurrency(stats?.monthly_expense)} sub={`Saldo: ${formatCurrency(stats?.monthly_balance)}`} />
      </div>

      <Card className="chart-card">
        <div className="chart-header">
          <div>
            <h2 className="chart-title">Arus Kas</h2>
            <p className="chart-sub">Pemasukan &amp; pengeluaran sepanjang tahun</p>
          </div>
          <select
            className="year-select"
            value={year}
            onChange={e => setYear(+e.target.value)}
          >
            {[2023, 2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 20 }}>
            <defs>
              <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => `${v/1000}k`} />
            <Tooltip
              contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }}
              formatter={v => formatCurrency(v)}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
            <Area type="monotone" dataKey="Pemasukan" stroke="#4f46e5" strokeWidth={2} fill="url(#colorIn)" />
            <Area type="monotone" dataKey="Pengeluaran" stroke="#ef4444" strokeWidth={2} fill="url(#colorOut)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
