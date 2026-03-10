import { useState, useEffect } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { Table, Th, Td } from '../../components/Table';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import FormField from '../../components/FormField';
import { formatDate } from '../../utils/format';
import './ResidentsPage.css';

const empty = { full_name: '', phone_number: '', status: 'tetap', is_married: false, contract_start: '', contract_end: '', notes: '' };

export default function ResidentsPage() {
  const [residents, setResidents] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [ktpFile, setKtpFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const load = async () => {
    setFetching(true);
    const res = await api.get('/residents', { params: { page, search, status: filter } });
    setResidents(res.data.data);
    setMeta(res.data.meta);
    setFetching(false);
  };

  useEffect(() => { load(); }, [page, search, filter]);

  const openCreate = () => { setEditing(null); setForm(empty); setKtpFile(null); setModalOpen(true); };
  const openEdit = r => { setEditing(r); setForm({ ...r, contract_start: r.contract_start || '', contract_end: r.contract_end || '' }); setKtpFile(null); setModalOpen(true); };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''));
    if (ktpFile) fd.append('ktp_photo', ktpFile);
    try {
      if (editing) {
        fd.append('_method', 'PUT');
        await api.post(`/residents/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/residents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setModalOpen(false);
      load();
    } finally { setLoading(false); }
  };

  const handleDelete = async id => {
    if (!confirm('Hapus penghuni ini?')) return;
    await api.delete(`/residents/${id}`);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Penghuni"
        subtitle="Kelola data penghuni perumahan"
        action={<Button onClick={openCreate}>Tambah Penghuni</Button>}
      />

      <div className="filter-bar">
        <input
          className="search-input"
          placeholder="Cari nama / telepon..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select className="filter-select" value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}>
          <option value="">Semua Status</option>
          <option value="tetap">Tetap</option>
          <option value="kontrak">Kontrak</option>
        </select>
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Nama</Th>
            <Th>Telepon</Th>
            <Th>Status</Th>
            <Th>Menikah</Th>
            <Th>Masa Kontrak</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {fetching ? (
            <tr><Td colSpan={6}><div className="empty-state">Memuat...</div></Td></tr>
          ) : residents.length === 0 ? (
            <tr><Td colSpan={6}><div className="empty-state">Belum ada penghuni</div></Td></tr>
          ) : residents.map(r => (
            <tr key={r.id}>
              <Td>
                <div className="resident-name">{r.full_name}</div>
                {r.ktp_photo && <a href={`http://localhost:8000/storage/${r.ktp_photo}`} target="_blank" rel="noreferrer" className="ktp-link">Lihat KTP</a>}
              </Td>
              <Td>{r.phone_number}</Td>
              <Td><Badge variant={r.status === 'tetap' ? 'accent' : 'warning'}>{r.status}</Badge></Td>
              <Td>{r.is_married ? 'Menikah' : 'Belum'}</Td>
              <Td>{r.status === 'kontrak' ? `${formatDate(r.contract_start)} - ${formatDate(r.contract_end)}` : '-'}</Td>
              <Td>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button size="sm" variant="secondary" onClick={() => openEdit(r)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>Hapus</Button>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination meta={meta} onPage={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Penghuni' : 'Tambah Penghuni'} size="md">
        <form onSubmit={handleSubmit} className="resident-form">
          <FormField label="Nama Lengkap" required>
            <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
          </FormField>
          <FormField label="Nomor Telepon" required>
            <input value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} required />
          </FormField>
          <div className="form-row">
            <FormField label="Status" required>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="tetap">Tetap</option>
                <option value="kontrak">Kontrak</option>
              </select>
            </FormField>
            <FormField label="Status Pernikahan">
              <select value={form.is_married ? '1' : '0'} onChange={e => setForm(f => ({ ...f, is_married: e.target.value === '1' }))}>
                <option value="0">Belum Menikah</option>
                <option value="1">Sudah Menikah</option>
              </select>
            </FormField>
          </div>
          {form.status === 'kontrak' && (
            <div className="form-row">
              <FormField label="Mulai Kontrak">
                <input type="date" value={form.contract_start} onChange={e => setForm(f => ({ ...f, contract_start: e.target.value }))} />
              </FormField>
              <FormField label="Akhir Kontrak">
                <input type="date" value={form.contract_end} onChange={e => setForm(f => ({ ...f, contract_end: e.target.value }))} />
              </FormField>
            </div>
          )}
          <FormField label="Foto KTP">
            <input type="file" accept="image/*" onChange={e => setKtpFile(e.target.files[0])} />
          </FormField>
          <FormField label="Catatan">
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
          </FormField>
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" loading={loading}>Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
