import { useState } from 'react';
import { validateHarvest, getFarms } from '../services/api';

function OperatorPage() {
  const [farms, setFarms] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({
    farm_id: '', yield_kg: '', price_per_kg: '', harvest_date: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadFarms = async () => {
    if (loaded) return;
    try {
      const res = await getFarms();
      setFarms(res.data);
      setLoaded(true);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleSubmit = async () => {
    if (!form.farm_id || !form.yield_kg || !form.price_per_kg || !form.harvest_date) {
      alert('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await validateHarvest({
        farm_id: form.farm_id,
        yield_kg: parseFloat(form.yield_kg),
        price_per_kg: parseFloat(form.price_per_kg),
        harvest_date: form.harvest_date
      });
      setResult(res.data);
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  const input = (placeholder, key, type = 'text') => (
    <input
      type={type}
      placeholder={placeholder}
      value={form[key]}
      onChange={e => setForm({ ...form, [key]: e.target.value })}
      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #2a4a2a', background: '#0a1f0a', color: '#fff', boxSizing: 'border-box', marginBottom: '12px' }}
    />
  );

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ color: '#c8a84b' }}>Farm Operator Dashboard</h2>
      <p style={{ color: '#aaa' }}>Submit harvest reports for AI validation</p>

      <div style={{ background: '#1a3a1a', border: '1px solid #2a4a2a', borderRadius: '10px', padding: '25px' }}>
        <h3 style={{ color: '#c8a84b', marginTop: 0 }}>Submit Harvest Report</h3>

        <label style={{ color: '#c8a84b', display: 'block', marginBottom: '6px' }}>Select Farm</label>
        <select
          onFocus={loadFarms}
          onChange={e => setForm({ ...form, farm_id: e.target.value })}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #2a4a2a', background: '#0a1f0a', color: '#fff', marginBottom: '12px', boxSizing: 'border-box' }}>
          <option value=''>-- Select your farm --</option>
          {farms.map(farm => (
            <option key={farm.id} value={farm.id}>{farm.name}</option>
          ))}
        </select>

        <label style={{ color: '#c8a84b', display: 'block', marginBottom: '6px' }}>Yield (kg)</label>
        {input('e.g. 12000', 'yield_kg', 'number')}

        <label style={{ color: '#c8a84b', display: 'block', marginBottom: '6px' }}>Price per kg ($)</label>
        {input('e.g. 0.30', 'price_per_kg', 'number')}

        <label style={{ color: '#c8a84b', display: 'block', marginBottom: '6px' }}>Harvest Date</label>
        {input('', 'harvest_date', 'date')}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#c8a84b', color: '#0a1f0a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
          {loading ? 'Validating...' : 'Submit for AI Validation'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '20px', background: '#1a3a1a', border: `1px solid ${result.status === 'approved' ? '#2a8a2a' : result.status === 'manual_review' ? '#8a8a2a' : '#8a2a2a'}`, borderRadius: '10px', padding: '25px' }}>
          <h3 style={{ color: result.status === 'approved' ? '#4CAF50' : result.status === 'manual_review' ? '#FFC107' : '#f44336', marginTop: 0 }}>
            {result.status === 'approved' ? ' APPROVED' : result.status === 'manual_review' ? ' MANUAL REVIEW' : ' REJECTED'}
          </h3>
          <p style={{ color: '#ccc' }}>Validation Score: <strong style={{ color: '#c8a84b' }}>{result.score}/100</strong></p>
          {result.flags?.length > 0 && (
            <div>
              <p style={{ color: '#aaa' }}>Flags:</p>
              {result.flags.map((flag, i) => (
                <p key={i} style={{ color: '#f44336', margin: '4px 0' }}>• {flag}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OperatorPage;