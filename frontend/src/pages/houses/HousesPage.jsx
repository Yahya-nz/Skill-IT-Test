import { useState, useEffect } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import Pagination from '../../components/Pagination';
import { Table, Th, Td } from '../../components/Table';
import { formatDate } from '../../utils/format';
import './HousesPage.css';

const emptyHouse = { house_number: '', address: '', status: 'tidak_dihuni', description: '' };
const emptyAssign = { resident_id: '', start_date: '', end_date: '', notes: '' };

export default function HousesPage() {
  const [houses, setHouses] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [houseModal, setHouseModal] = useState(false);
  const [editingHouse, setEditingHouse] = useState(null);
  const [houseForm, setHouseForm] = useState(emptyHouse);

  const [assignModal, setAssignModal] = useState(false);
  const [assignHouse, setAssignHouse] = useState(null);
  const [assignForm, setAssignForm] = useState(emptyAssign);

  const [historyModal, setHistoryModal] = useState(false);
  const [historyHouse, setHistoryHouse] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  const [residents, setResidents] = useState([]);

  const load = async () => {
    setFetching(true);
    const res = await api.get('/residents', { params: { per_page: 100 } });
    setResidents(res.data.data);
    const h = await api.get('/houses', { params: { page, search, status: filter } });
    setHouses(h.data.data);
    setMeta(h.data.meta);
    setFetching(false);
  };

  useEffect(() => { load(); }, [page, search, filter]);

  const openCreate = () => { setEditingHouse(null); setHouseForm(emptyHouse); setHouseModal(true); };
  const openEdit = h => { setEditingHouse(h); setHouseForm({ house_number: h.house_number, address: h.address, status: h.status, description: h.description || '' }); setHouseModal(true); };

  const saveHouse = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingHouse) await api.put(`/houses/${editingHouse.id}`, houseForm);
      else await api.post('/houses', houseForm);
      setHouseModal(false); load();
    } finally { setLoading(false); }
  };

  const openAssign = h => { setAssignHouse(h); setAssignForm(emptyAssign); setAssignModal(true); };
  const saveAssign = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/houses/${assignHouse.id}/assign-resident`, assignForm);
      setAssignModal(false); load();
    } finally { setLoading(false); }
  };

  const removeResident = async house => {
    if (!confirm(`Keluarkan penghuni dari ${house.house_number}?`)) return;
    await api.delete(`/houses/${house.id}/remove-resident`);
    load();
  };

  const openHistory = async h => {
    setHistoryHouse(h);
    const res = await api.get(`/houses/${h.id}/history`);
    setHistoryData(res.data);
    setHistoryModal(true);
  };

  const deleteHouse = async id => {
    if (!confirm('Hapus rumah ini?')) return;
    await api.delete(`/houses/${id}`);
    load();
  };

  const activeResident = h => {
    const hr = h.house_residents?.find(r => r.is_active);
    return hr?.resident;
  };

  return (
    <div>
      <PageHeader title="Rumah" subtitle="Kelola data 20 unit rumah" action={<Button onClick={openCreate}>Tambah Rumah</Button>} />

      <div className="filter-bar">
        <input className="search-input" placeholder="Cari nomor / alamat..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select className="filter-select" value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}>
          <option value="">Semua</option>
          <option value="dihuni">Dihuni</option>
          <option value="tidak_dihuni">Tidak Dihuni</option>
        </select>
      </div>

      <Table>
        <thead>
          <tr>
            <Th>No. Rumah</Th>
            <Th>Alamat</Th>
            <Th>Status</Th>
            <Th>Penghuni Aktif</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {fetching ? <tr><Td colSpan={5}><div className="empty-state">Memuat...</div></Td></tr>
           : houses.length === 0 ? <tr><Td colSpan={5}><div className="empty-state">Belum ada rumah</div></Td></tr>
           : houses.map(h => {
            const resident = activeResident(h);
            return (
              <tr key={h.id}>
                <Td><span className="house-number">{h.house_number}</span></Td>
                <Td>{h.address}</Td>
                <Td><Badge variant={h.status === 'dihuni' ? 'success' : 'default'}>{h.status === 'dihuni' ? 'Dihuni' : 'Kosong'}</Badge></Td>
                <Td>{resident ? <span className="resident-chip">{resident.full_name}</span> : <span className="empty-resident">-</span>}</Td>
                <Td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Button size="sm" variant="secondary" onClick={() => openEdit(h)}>Edit</Button>
                    {h.status === 'tidak_dihuni'
                      ? <Button size="sm" variant="ghost" onClick={() => openAssign(h)}>+ Penghuni</Button>
                      : <Button size="sm" variant="ghost" onClick={() => removeResident(h)}>Keluarkan</Button>}
                    <Button size="sm" variant="ghost" onClick={() => openHistory(h)}>Riwayat</Button>
                    <Button size="sm" variant="danger" onClick={() => deleteHouse(h.id)}>Hapus</Button>
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <Pagination meta={meta} onPage={setPage} />

      {/* House Form Modal */}
      <Modal open={houseModal} onClose={() => setHouseModal(false)} title={editingHouse ? 'Edit Rumah' : 'Tambah Rumah'}>
        <form onSubmit={saveHouse} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField label="No. Rumah" required><input value={houseForm.house_number} onChange={e => setHouseForm(f => ({ ...f, house_number: e.target.value }))} required /></FormField>
            <FormField label="Status" required>
              <select value={houseForm.status} onChange={e => setHouseForm(f => ({ ...f, status: e.target.value }))}>
                <option value="dihuni">Dihuni</option>
                <option value="tidak_dihuni">Tidak Dihuni</option>
              </select>
            </FormField>
          </div>
          <FormField label="Alamat" required><input value={houseForm.address} onChange={e => setHouseForm(f => ({ ...f, address: e.target.value }))} required /></FormField>
          <FormField label="Keterangan"><textarea value={houseForm.description} onChange={e => setHouseForm(f => ({ ...f, description: e.target.value }))} rows={2} /></FormField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button type="button" variant="secondary" onClick={() => setHouseModal(false)}>Batal</Button>
            <Button type="submit" loading={loading}>Simpan</Button>
          </div>
        </form>
      </Modal>

      {/* Assign Resident Modal */}
      <Modal open={assignModal} onClose={() => setAssignModal(false)} title={`Tambah Penghuni - ${assignHouse?.house_number}`}>
        <form onSubmit={saveAssign} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormField label="Pilih Penghuni" required>
            <select value={assignForm.resident_id} onChange={e => setAssignForm(f => ({ ...f, resident_id: e.target.value }))} required>
              <option value="">-- Pilih --</option>
              {residents.map(r => <option key={r.id} value={r.id}>{r.full_name} ({r.status})</option>)}
            </select>
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField label="Tanggal Masuk" required><input type="date" value={assignForm.start_date} onChange={e => setAssignForm(f => ({ ...f, start_date: e.target.value }))} required /></FormField>
            <FormField label="Tanggal Keluar"><input type="date" value={assignForm.end_date} onChange={e => setAssignForm(f => ({ ...f, end_date: e.target.value }))} /></FormField>
          </div>
          <FormField label="Catatan"><textarea value={assignForm.notes} onChange={e => setAssignForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></FormField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button type="button" variant="secondary" onClick={() => setAssignModal(false)}>Batal</Button>
            <Button type="submit" loading={loading}>Simpan</Button>
          </div>
        </form>
      </Modal>

      {/* History Modal */}
      <Modal open={historyModal} onClose={() => setHistoryModal(false)} title={`Riwayat Penghuni - ${historyHouse?.house_number}`} size="lg">
        <Table>
          <thead><tr><Th>Penghuni</Th><Th>Masuk</Th><Th>Keluar</Th><Th>Status</Th></tr></thead>
          <tbody>
            {historyData.length === 0 ? <tr><Td colSpan={4}><div className="empty-state">Belum ada riwayat</div></Td></tr>
             : historyData.map(h => (
              <tr key={h.id}>
                <Td>{h.resident?.full_name}</Td>
                <Td>{formatDate(h.start_date)}</Td>
                <Td>{h.end_date ? formatDate(h.end_date) : <Badge variant="success">Aktif</Badge>}</Td>
                <Td><Badge variant={h.is_active ? 'success' : 'default'}>{h.is_active ? 'Aktif' : 'Selesai'}</Badge></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal>
    </div>
  );
}
