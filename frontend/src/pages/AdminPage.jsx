import { useState, useEffect } from 'react';
import { getFarms } from '../services/api';
function AdminPage() {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFarms()
      .then(res => setFarms(res.data))
      .catch(err => alert('Error: ' + err.message))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status) => {
    if (status === 'approved') return '#4CAF50';
    if (status === 'pending') return '#FFC107';
    return '#f44336';
  };

  const getModelBadge = (model) => {
    const colors = {
      fractional_land: '#3a7a3a',
      farm_operations: '#3a3a7a',
      hybrid: '#7a3a7a'
    };
    return colors[model] || '#3a3a3a';
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#c8a84b' }}>Administrator Dashboard</h2>
      <p style={{ color: '#aaa' }}>Platform overview — compliance, risk monitoring, farm management</p>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
        {[
          { label: 'Total Farms', value: farms.length },
          { label: 'Approved', value: farms.filter(f => f.status === 'approved').length },
          { label: 'Pending Review', value: farms.filter(f => f.status === 'pending').length },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#1a3a1a', border: '1px solid #2a4a2a', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
            <h3 style={{ color: '#c8a84b', margin: 0, fontSize: '32px' }}>{stat.value}</h3>
            <p style={{ color: '#aaa', margin: '5px 0 0' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Investment Models Breakdown */}
      <div style={{ background: '#1a3a1a', border: '1px solid #2a4a2a', borderRadius: '10px', padding: '20px', marginBottom: '25px' }}>
        <h3 style={{ color: '#c8a84b', marginTop: 0 }}>Investment Models Breakdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {['fractional_land', 'farm_operations', 'hybrid'].map(model => (
            <div key={model} style={{ background: getModelBadge(model), padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ color: '#fff', margin: 0, fontWeight: 'bold' }}>{model.replace('_', ' ').toUpperCase()}</p>
              <p style={{ color: '#ddd', margin: '5px 0 0', fontSize: '24px', fontWeight: 'bold' }}>
                {farms.filter(f => f.investment_model === model).length}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Farms Table */}
      <div style={{ background: '#1a3a1a', border: '1px solid #2a4a2a', borderRadius: '10px', padding: '20px' }}>
        <h3 style={{ color: '#c8a84b', marginTop: 0 }}>All Farms — Risk & Compliance Monitor</h3>
        {loading ? (
          <p style={{ color: '#aaa' }}>Loading farms...</p>
        ) : (
          farms.map(farm => (
            <div key={farm.id} style={{ background: '#0a1f0a', border: '1px solid #2a4a2a', borderRadius: '8px', padding: '15px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: '#c8a84b', margin: '0 0 5px' }}>{farm.name}</h4>
                  <p style={{ color: '#aaa', margin: 0, fontSize: '13px' }}>
                    {farm.location}, {farm.country} | {farm.crop_type} | {farm.size_ha} ha
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: getStatusColor(farm.status), color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                    {farm.status?.toUpperCase()}
                  </span>
                  <p style={{ color: '#aaa', margin: '5px 0 0', fontSize: '12px' }}>
                    Model: <strong style={{ color: '#c8a84b' }}>{farm.investment_model}</strong>
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminPage;