import { useState } from 'react';
import { naturalSearch } from '../services/api';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await naturalSearch(query);
      setResults(res.data);
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#c8a84b' }}>🔍 Natural Language Farm Search</h2>
      <p style={{ color: '#aaa' }}>Ask in plain English — AI will find the right farms for you</p>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder='e.g. "low risk wheat farms in egypt"'
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #c8a84b', background: '#1a3a1a', color: '#fff', fontSize: '16px' }}
        />
        <button onClick={handleSearch} disabled={loading}
          style={{ padding: '12px 24px', background: '#c8a84b', color: '#0a1f0a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? '...' : 'Search'}
        </button>
      </div>
      {results && (
        <div>
          <p style={{ color: '#aaa' }}>Found <strong style={{ color: '#c8a84b' }}>{results.totalFound}</strong> farms</p>
          <div style={{ background: '#1a3a1a', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>
            <p style={{ color: '#aaa', margin: 0, fontSize: '13px' }}>AI Filters: {JSON.stringify(results.filtersDetected)}</p>
          </div>
          {results.farms.map(farm => (
            <div key={farm.id} style={{ background: '#1a3a1a', border: '1px solid #2a4a2a', borderRadius: '10px', padding: '20px', marginBottom: '15px' }}>
              <h3 style={{ color: '#c8a84b', margin: '0 0 10px' }}>{farm.name}</h3>
              <p style={{ color: '#ccc', margin: '4px 0' }}> {farm.location}, {farm.country}</p>
              <p style={{ color: '#ccc', margin: '4px 0' }}> {farm.crop_type} |  {farm.size_ha} ha</p>
              <p style={{ color: '#ccc', margin: '4px 0' }}> Min: ${farm.min_investment} |  {farm.lock_up_months} months</p>
              <p style={{ color: '#ccc', margin: '4px 0' }}> Model: <strong style={{ color: '#c8a84b' }}>{farm.investment_model}</strong></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchPage;