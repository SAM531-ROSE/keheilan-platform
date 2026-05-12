import { useState } from 'react';
import KYCPage from './pages/KYCPage';
import SearchPage from './pages/SearchPage';
import SummaryPage from './pages/SummaryPage';
import OperatorPage from './pages/OperatorPage';
import AdminPage from './pages/AdminPage';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('search');
  const [activeRole, setActiveRole] = useState('investor');

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#0a1f0a' }}>
      <nav style={{ background: '#1a3a1a', padding: '15px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
          <h1 style={{ color: '#c8a84b', margin: 0, fontSize: '22px' }}>Farmaora</h1>
          {['investor', 'operator', 'admin'].map(role => (
            <button key={role} onClick={() => { setActiveRole(role); setActivePage(role === 'investor' ? 'search' : role); }}
              style={{ background: activeRole === role ? '#c8a84b' : 'transparent', color: activeRole === role ? '#0a1f0a' : '#c8a84b', border: '1px solid #c8a84b', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'capitalize' }}>
              {role === 'investor' ? 'Investor' : role === 'operator' ? 'Farm Operator' : 'Admin'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {activeRole === 'investor' && (
            <>
              <button onClick={() => setActivePage('search')} style={navBtn(activePage === 'search')}>Search Farms</button>
              <button onClick={() => setActivePage('summary')} style={navBtn(activePage === 'summary')}>Due Diligence</button>
              <button onClick={() => setActivePage('kyc')} style={navBtn(activePage === 'kyc')}>KYC Verification</button>
            </>
          )}
          {activeRole === 'operator' && (
            <button onClick={() => setActivePage('operator')} style={navBtn(activePage === 'operator')}>Harvest Reports</button>
          )}
          {activeRole === 'admin' && (
            <button onClick={() => setActivePage('admin')} style={navBtn(activePage === 'admin')}>Platform Overview</button>
          )}
        </div>
      </nav>
      <div style={{ padding: '30px' }}>
        {activePage === 'search'   && <SearchPage />}
        {activePage === 'summary'  && <SummaryPage />}
        {activePage === 'kyc'      && <KYCPage />}
        {activePage === 'operator' && <OperatorPage />}
        {activePage === 'admin'    && <AdminPage />}
      </div>
    </div>
  );
}

const navBtn = (active) => ({
  background: active ? '#c8a84b' : 'transparent',
  color: active ? '#0a1f0a' : '#c8a84b',
  border: '1px solid #c8a84b',
  padding: '8px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold'
});

export default App;