// MODULE 3 — Dashboard.js
// Topics: Component, Props, useEffect, useState, .map()

import React, { useEffect, useState } from 'react';

function Dashboard({ uavList, setUavList }) {

  // useEffect: fetch all UAVs from backend when page loads
  useEffect(() => {
    fetch('http://localhost:5000/api/uav')
      .then(r => r.json())
      .then(data => setUavList(data))
      .catch(() => alert('Start the backend server first!'));
  }, []);

  const total    = uavList.length;
  const passed   = uavList.filter(u => u.finalResult === 'Pass').length;
  const failed   = uavList.filter(u => u.finalResult === 'Fail').length;
  const ongoing  = uavList.filter(u => u.finalResult === 'In Progress').length;

  return (
    <div>
      <h2>Dashboard</h2>

      {/* Summary boxes */}
      <div style={{ display: 'flex', gap: '12px', margin: '12px 0' }}>
        <Box label="Total"       value={total}   color="blue"   />
        <Box label="Passed"      value={passed}  color="green"  />
        <Box label="Failed"      value={failed}  color="red"    />
        <Box label="In Progress" value={ongoing} color="orange" />
      </div>

      {/* UAV cards */}
      {uavList.length === 0
        ? <p>No records. Click + Add UAV to start.</p>
        : uavList.map(uav => (
            <UAVCard key={uav.id} uav={uav} setUavList={setUavList} />
          ))
      }
    </div>
  );
}

// Small colored summary box
function Box({ label, value, color }) {
  return (
    <div style={{ border: '2px solid ' + color, padding: '12px 20px', borderRadius: '6px', textAlign: 'center' }}>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color }}>{value}</div>
      <div style={{ fontSize: '12px' }}>{label}</div>
    </div>
  );
}

// Shows one UAV with its 7 stages
function UAVCard({ uav, setUavList }) {
  const [openIdx, setOpenIdx] = useState(-1);
  const [form,    setForm]    = useState({ status: '', defects: 0, rework: 0 });

  const statusColor = { Pass: 'green', Fail: 'red', Pending: 'gray', 'In Progress': 'orange' };

  // Save stage — PUT to backend
  function saveStage(idx) {
    fetch('http://localhost:5000/api/uav/' + uav.id + '/stage/' + idx, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    })
      .then(r => r.json())
      .then(updated => {
        setUavList(prev => prev.map(u => u.id === updated.id ? updated : u));
        setOpenIdx(-1);
      });
  }

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '12px', marginBottom: '12px' }}>

      {/* UAV header */}
      <b>UAV: {uav.uavId}</b> &nbsp;|&nbsp;
      Tech: {uav.techId} &nbsp;|&nbsp;
      Date: {uav.date} &nbsp;|&nbsp;
      <b style={{ color: statusColor[uav.finalResult] }}>{uav.finalResult}</b>

      {/* 7 stages */}
      {uav.stages.map((stage, idx) => (
        <div key={idx} style={{ marginTop: '6px', padding: '6px 10px', background: '#f9f9f9', borderRadius: '4px' }}>

          <span style={{ color: '#888', marginRight: '8px' }}>{idx + 1}.</span>
          <span style={{ marginRight: '20px' }}>{stage.name}</span>
          <b style={{ color: statusColor[stage.status], marginRight: '20px' }}>{stage.status}</b>
          <span style={{ fontSize: '13px', color: '#666', marginRight: '12px' }}>
            Defects: {stage.defects} | Rework: {stage.rework}
          </span>
          <button
            style={{ fontSize: '12px' }}
            onClick={() => {
              setOpenIdx(openIdx === idx ? -1 : idx);
              setForm({ status: '', defects: stage.defects, rework: stage.rework });
            }}
          >
            {openIdx === idx ? 'Cancel' : 'Update'}
          </button>

          {/* Inline form — only shows for open stage */}
          {openIdx === idx && (
            <div style={{ marginTop: '6px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="">-- Status --</option>
                <option>Pass</option>
                <option>Fail</option>
              </select>
              <label>Defects:
                <input type="number" min="0" value={form.defects}
                  onChange={e => setForm({ ...form, defects: e.target.value })}
                  style={{ width: '55px', marginLeft: '4px' }} />
              </label>
              <label>Rework:
                <input type="number" min="0" value={form.rework}
                  onChange={e => setForm({ ...form, rework: e.target.value })}
                  style={{ width: '55px', marginLeft: '4px' }} />
              </label>
              <button onClick={() => saveStage(idx)}>Save</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Dashboard;