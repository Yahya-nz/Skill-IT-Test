import { useState, useEffect } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import { Table, Th, Td } from '../../components/Table';
import { formatCurrency, formatDate, MONTHS } from '../../utils/format';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import './ReportsPage.css';

const CATEGORIES = {
  perbaikan_jalan: 'Perbaikan Jalan',
  perbaikan_selokan: 'Perbaikan Selokan',
  gaji_satpam: 'Gaji Satpam',
  listrik_pos: 'Listrik Pos',
  lainnya: 'Lainnya',
};

const now = new Date();

export default function ReportsPage() {
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [summary, setSummary] = useState(null);
  const [detail, setDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    api.get(`/reports/summary?year=${year}`).then(r => setSummary(r.data));
  }, [year]);

  useEffect(() => {
    api.get(`/reports/detail?month=${month}&year=${year}`).then(r => setDetail(r.data));
  }, [month, year]);

  const chartData = summary?.months?.map(m => ({
    name: MONTHS[m.month - 1].slice(0, 3),
    Pemasukan: m.income,
    Pengeluaran: m.expense,
    Saldo: m.cumulative_balance,
  })) || [];

  return (
    <div className="reports-page">
      <PageHeader title="Laporan" subtitle="Ringkasan keuangan dan arus kas RT" />

      <div className="report-controls">
        <div className="tab-bar">
          <button className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>Ringkasan Tahunan</button>
          <button className={`tab-btn ${activeTab === 'detail' ? 'active' : ''}`} onClick={() => setActiveTab('detail')}>Detail Bulanan</button>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {activeTab === 'detail' && (
            <select className="ctrl-select" value={month} onChange={e => setMonth(+e.target.value)}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          )}
          <select className="ctrl-select" value={year} onChange={e => setYear(+e.target.value)}>
            {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {activeTab === 'summary' && summary && (
        <div>
          <div className="summary-stats">
            <StatCard label="Total Pemasukan" value={formatCurrency(summary.total_income)} accent />
            <StatCard label="Total Pengeluaran" value={formatCurrency(summary.total_expense)} />
            <StatCard label="Saldo Bersih" value={formatCurrency(summary.net_balance)} accent={summary.net_balance >= 0} />
          </div>

          <Card style={{ marginBottom: 24 }}>
            <h3 className="chart-section-title">Pemasukan vs Pengeluaran ({year})</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => `${v/1000}k`} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={v => formatCurrency(v)} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Bar dataKey="Pemasukan" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="chart-section-title">Saldo Kumulatif ({year})</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => `${v/1000}k`} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={v => formatCurrency(v)} />
                <Line type="monotone" dataKey="Saldo" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {activeTab === 'detail' && detail && (
        <div>
          <div className="summary-stats">
            <StatCard label="Total Pemasukan" value={formatCurrency(detail.total_income)} accent />
            <StatCard label="Total Pengeluaran" value={formatCurrency(detail.total_expense)} />
            <StatCard label="Saldo Bulan Ini" value={formatCurrency(detail.balance)} />
            <StatCard label="Tagihan Lunas / Belum" value={`${detail.paid_count} / ${detail.pending_count}`} sub="Transaksi" />
          </div>

          <Card className="detail-section">
            <h3 className="section-title">Pemasukan — {MONTHS[month - 1]} {year}</h3>
            <Table>
              <thead><tr><Th>Rumah</Th><Th>Penghuni</Th><Th>Jenis</Th><Th>Nominal</Th><Th>Status</Th></tr></thead>
              <tbody>
                {detail.payments.length === 0 ? <tr><Td colSpan={5}><div className="empty-state">Tidak ada pembayaran bulan ini</div></Td></tr>
                 : detail.payments.map(p => (
                  <tr key={p.id}>
                    <Td><span className="house-tag">{p.house?.house_number}</span></Td>
                    <Td>{p.resident?.full_name}</Td>
                    <Td>{p.payment_type === 'both' ? 'Kebersihan + Satpam' : p.payment_type}</Td>
                    <Td>{formatCurrency(p.amount)}</Td>
                    <Td><Badge variant={p.status === 'lunas' ? 'success' : 'warning'}>{p.status}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>

          <Card className="detail-section">
            <h3 className="section-title">Pengeluaran — {MONTHS[month - 1]} {year}</h3>
            <Table>
              <thead><tr><Th>Judul</Th><Th>Kategori</Th><Th>Tanggal</Th><Th>Nominal</Th></tr></thead>
              <tbody>
                {detail.expenses.length === 0 ? <tr><Td colSpan={4}><div className="empty-state">Tidak ada pengeluaran bulan ini</div></Td></tr>
                 : detail.expenses.map(e => (
                  <tr key={e.id}>
                    <Td>{e.title}</Td>
                    <Td><Badge variant="default">{CATEGORIES[e.category] ?? e.category}</Badge></Td>
                    <Td>{formatDate(e.expense_date)}</Td>
                    <Td className="expense-amount">{formatCurrency(e.amount)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
