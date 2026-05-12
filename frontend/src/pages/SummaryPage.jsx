import { useState } from 'react';
import { getSummary, getFarms } from '../services/api';

function SummaryPage() {
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadFarms = async () => {
    if (loaded) return;
    try {
      const res = await getFarms();
      setFarms(res.data);
      setLoaded(true);
    } catch (err) {
      alert('Error loading farms: ' + err.message);
    }
  };

  const handleSummary = async () => {
    if (!selectedFarm) return;
    setLoading(true);
    try {
      const res = await getSummary(selectedFarm);
      setSummary(res.data);
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#c8a84b' }}>📊 AI Due Diligence Report</h2>
      <p style={{ color: '#aaa' }}>Select a farm and get a full AI-generated investment analysis</p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <select
          onFocus={loadFarms}
          onChange={e => setSelectedFarm(e.target.value)}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #c8a84b', background: '#1a3a1a', color: '#fff', fontSize: '16px' }}>
          <option value=''>-- Select a Farm --</option>
          {farms.map(farm => (
            <option key={farm.id} value={farm.id}>{farm.name}</option>
          ))}
        </select>
        <button onClick={handleSummary} disabled={loading}
          style={{ padding: '12px 24px', background: '#c8a84b', color: '#0a1f0a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Analyzing...' : 'Generate Report'}
        </button>
      </div>

      {summary && (
        <div style={{ background: '#1a3a1a', border: '1px solid #2a4a2a', borderRadius: '10px', padding: '25px' }}>
          <h3 style={{ color: '#c8a84b', marginTop: 0 }}>{summary.farmName || 'Farm Report'}</h3>
          <p style={{ color: '#ccc' }}>{summary.summary}</p>
          <div style={{ display: 'grid', gap: '15px' }}>
            {[
              { label: '⚠️ Risk Assessment', value: summary.riskAssessment },
              { label: '👨‍🌾 Operator Profile', value: summary.operatorProfile },
              { label: '🌱 Sustainability', value: summary.sustainability },
              { label: '📈 Market Outlook', value: summary.marketOutlook },
              { label: '💼 Investment Model', value: summary.investmentModel },
            ].map(item => (
              <div key={item.label} style={{ background: '#0a1f0a', padding: '15px', borderRadius: '8px' }}>
                <strong style={{ color: '#c8a84b' }}>{item.label}</strong>
                <p style={{ color: '#ccc', margin: '8px 0 0' }}>{item.value}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '20px', padding: '15px', background: '#0a1f0a', borderRadius: '8px', textAlign: 'center' }}>
            <strong style={{ color: '#c8a84b', fontSize: '18px' }}>{summary.recommendation}</strong>
            <p style={{ color: '#aaa', margin: '5px 0 0' }}>Investment Score: <strong style={{ color: '#c8a84b' }}>{summary.investmentScore}/100</strong></p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SummaryPage;