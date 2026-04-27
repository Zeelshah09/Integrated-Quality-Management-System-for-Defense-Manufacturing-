// MODULE 3 — UploadFile.js
// Topics: Component, useState, Events (onChange, onClick), FormData

import React, { useState } from 'react';

function UploadFile({ setUavList, setPage }) {
  const [file,   setFile]   = useState(null);
  const [msg,    setMsg]    = useState('');
  const [result, setResult] = useState(null);

  function handleFileChange(e) {
    setFile(e.target.files[0]);
    setMsg('');
    setResult(null);
  }

  function handleUpload() {
    if (!file) { setMsg('Select a file first.'); return; }

    const fd = new FormData();
    fd.append('file', file);

    fetch('http://localhost:5000/api/upload', { method: 'POST', body: fd })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setMsg(data.error); return; }
        setResult(data);
        setUavList(prev => [...prev, ...data.created]);
      })
      .catch(() => setMsg('Cannot connect. Start backend.'));
  }

  return (
    <div>
      <h2>Upload CSV File</h2>

      <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', marginBottom: '16px', maxWidth: '360px' }}>
        <b>CSV format required:</b>
        <pre style={{ marginTop: '6px', fontSize: '13px' }}>
{`uavId,techId
UAV-001,TECH-01
UAV-002,TECH-02`}
        </pre>
        <button onClick={() => window.open('http://localhost:5000/api/sample-csv')} style={{ marginTop: '8px' }}>
          Download Sample CSV
        </button>
      </div>

      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload} style={{ marginLeft: '10px' }}>Upload</button>

      {msg && <p style={{ color: 'red', marginTop: '8px' }}>{msg}</p>}

      {result && (
        <div style={{ marginTop: '12px', background: '#e8f5e9', padding: '12px', borderRadius: '6px', maxWidth: '400px' }}>
          <p style={{ color: 'green', fontWeight: 'bold' }}>{result.message}</p>

          {result.created.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <b>Created:</b>
              <ul style={{ marginTop: '4px' }}>
                {result.created.map(u => <li key={u.id}>{u.uavId} — {u.techId}</li>)}
              </ul>
            </div>
          )}

          {result.skipped.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <b style={{ color: 'red' }}>Skipped:</b>
              <ul style={{ marginTop: '4px' }}>
                {result.skipped.map((s, i) => <li key={i} style={{ color: 'red' }}>{s}</li>)}
              </ul>
            </div>
          )}

          <button onClick={() => setPage('dashboard')} style={{ marginTop: '10px' }}>
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadFile;