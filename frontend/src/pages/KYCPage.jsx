import { useState } from 'react';
import { submitKYC } from '../services/api';

function KYCPage() {
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fullName || !idNumber || !file) {
      alert('Please fill all fields and upload an ID image');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('fullName', fullName);
      formData.append('idNumber', idNumber);
      const res = await submitKYC(formData);
      setResult(res.data);
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#c8a84b' }}>🪪 KYC Verification</h2>
      <p style={{ color: '#aaa' }}>Upload your ID document — AI will verify your identity instantly</p>

      <div style={{ background: '#1a3a1a', border: '1px solid #2a4a2a', borderRadius: '10px', padding: '25px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ color: '#c8a84b', display: 'block', marginBottom: '6px' }}>Full Name</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)}
            placeholder='Enter your full name'
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #2a4a2a', background: '#0a1f0a', color: '#fff', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ color: '#c8a84b', display: 'block', marginBottom: '6px' }}>ID Number</label>
          <input value={idNumber} onChange={e => setIdNumber(e.target.value)}
            placeholder='Enter your ID number'
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #2a4a2a', background: '#0a1f0a', color: '#fff', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: '#c8a84b', display: 'block', marginBottom: '6px' }}>ID Document Image</label>
          <input type='file' accept='image/*' onChange={e => setFile(e.target.files[0])}
            style={{ color: '#ccc' }} />
        </div>
        <button onClick={handleSubmit} disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#c8a84b', color: '#0a1f0a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
          {loading ? 'Verifying...' : 'Verify Identity'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '20px', background: '#1a3a1a', border: `1px solid ${result.verified ? '#2a8a2a' : '#8a2a2a'}`, borderRadius: '10px', padding: '25px' }}>
          <h3 style={{ color: result.verified ? '#4CAF50' : '#f44336', marginTop: 0 }}>
            {result.verified ? ' VERIFIED' : ' NOT VERIFIED'}
          </h3>
          <p style={{ color: '#ccc' }}> Extracted Name: <strong style={{ color: '#c8a84b' }}>{result.extractedName}</strong></p>
          <p style={{ color: '#ccc' }}>Extracted ID: <strong style={{ color: '#c8a84b' }}>{result.extractedId}</strong></p>
          <p style={{ color: '#ccc' }}> Document Type: <strong style={{ color: '#c8a84b' }}>{result.documentType}</strong></p>
          <p style={{ color: '#ccc' }}> Confidence: <strong style={{ color: '#c8a84b' }}>{result.confidence}%</strong></p>
          <p style={{ color: '#aaa', fontStyle: 'italic' }}>{result.reason}</p>
        </div>
      )}
    </div>
  );
}

export default KYCPage;