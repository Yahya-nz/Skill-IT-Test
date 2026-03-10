import { NavLink, Outlet } from 'react-router-dom';
import './MainLayout.css';

const navItems = [
  { path: '/', label: 'Dashboard', exact: true },
  { path: '/residents', label: 'Penghuni' },
  { path: '/houses', label: 'Rumah' },
  { path: '/payments', label: 'Pembayaran' },
  { path: '/expenses', label: 'Pengeluaran' },
  { path: '/reports', label: 'Laporan' },
];

export default function MainLayout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">RT</span>
          <div>
            <p className="brand-title">Admin RT</p>
            <p className="brand-sub">Perumahan Elite</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p>v1.0.0</p>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
