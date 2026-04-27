// MODULE 3 — AddUAV.js
// Topics: Component, useState, Forms, Events (onChange, onSubmit)

import React, { useState } from 'react';

function AddUAV({ setUavList, setPage }) {
  const [uavId,  setUavId]  = useState('');
  const [techId, setTechId] = useState('');
  const [msg,    setMsg]    = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!uavId || !techId) { setMsg('Both fields are required.'); return; }

    fetch('http://localhost:5000/api/uav', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ uavId, techId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setMsg(data.error); return; }
        setUavList(prev => [...prev, data]);
        setMsg('Created! Redirecting...');
        setTimeout(() => setPage('dashboard'), 800);
      })
      .catch(() => setMsg('Cannot connect. Start backend.'));
  }

  return (
    <div>
      <h2>Add New UAV</h2>
      <p style={{ color: '#555', marginBottom: '12px' }}>7 stages are auto-created after adding.</p>

      {msg && <p style={{ color: msg.includes('Created') ? 'green' : 'red' }}>{msg}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '320px' }}>
        <label>UAV ID</label>
        <input value={uavId}  onChange={e => setUavId(e.target.value)}  placeholder="e.g. UAV-001" />
        <label>Technician ID</label>
        <input value={techId} onChange={e => setTechId(e.target.value)} placeholder="e.g. TECH-01" />
        <button type="submit">Create UAV</button>
      </form>

      <div style={{ marginTop: '16px', background: '#f5f5f5', padding: '12px', borderRadius: '6px', maxWidth: '320px' }}>
        <b>7 stages that will be created:</b>
        <ol style={{ marginTop: '8px', paddingLeft: '18px', lineHeight: '1.9' }}>
          <li>Frame Assembly</li>
          <li>Motor &amp; ESC Installation</li>
          <li>Wiring &amp; Electronics</li>
          <li>Avionics Integration</li>
          <li>Software Configuration</li>
          <li>Ground Testing</li>
          <li>Final Inspection</li>
        </ol>
      </div>
    </div>
  );
}

export default AddUAV;