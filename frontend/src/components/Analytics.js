// MODULE 3 — Analytics.js
// Topics: Component, useState, useEffect, .map()

import React, { useState, useEffect } from 'react';

function Analytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!data)   return <p style={{ color: 'red' }}>Start backend server.</p>;

  const maxDefects = Math.max(...data.stageData.map(s => s.defects), 1);

  return (
    <div>
      <h2>Analytics</h2>

      {/* KPI Summary */}
      <div style={{ display: 'flex', gap: '12px', margin: '12px 0', flexWrap: 'wrap' }}>
        {[
          { label: 'Total',       value: data.total,          color: 'blue'   },
          { label: 'Passed',      value: data.passed,         color: 'green'  },
          { label: 'Failed',      value: data.failed,         color: 'red'    },
          { label: 'In Progress', value: data.inProgress,     color: 'orange' },
          { label: 'Pass Rate',   value: data.passRate + '%', color: 'purple' },
        ].map(k => (
          <div key={k.label} style={{ border: '2px solid ' + k.color, padding: '10px 16px', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '12px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {data.total === 0
        ? <p>No data yet. Add UAVs and update stages first.</p>
        : (
          <>
            {/* Defects per stage bar chart */}
            <div style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '14px', marginBottom: '16px' }}>
              <h3 style={{ marginBottom: '12px' }}>Defects Per Stage</h3>
              {data.stageData.map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ width: '200px', fontSize: '13px' }}>{s.name}</span>
                  <div style={{ flex: 1, background: '#eee', borderRadius: '4px', height: '20px' }}>
                    <div style={{
                      width:        (s.defects / maxDefects) * 100 + '%',
                      minWidth:     s.defects > 0 ? '30px' : '0',
                      background:   s.defects > 3 ? 'red' : s.defects > 0 ? 'orange' : '#eee',
                      height:       '20px',
                      borderRadius: '4px',
                      display:      'flex',
                      alignItems:   'center',
                      paddingLeft:  '6px',
                      color:        'white',
                      fontSize:     '12px',
                      fontWeight:   'bold',
                    }}>
                      {s.defects > 0 ? s.defects : ''}
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#666', width: '130px' }}>
                    D:{s.defects} R:{s.rework} F:{s.failed}
                  </span>
                </div>
              ))}
              <p style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>
                D = Defects &nbsp;|&nbsp; R = Rework &nbsp;|&nbsp; F = Stage Failures
              </p>
            </div>

            {/* Stage health table */}
            <div style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '14px', marginBottom: '16px' }}>
              <h3 style={{ marginBottom: '10px' }}>Stage Health</h3>
              <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', fontSize: '13px' }}>
                <thead style={{ background: '#333', color: 'white' }}>
                  <tr><th>Stage</th><th>Defects</th><th>Rework</th><th>Failures</th><th>Health</th></tr>
                </thead>
                <tbody>
                  {data.stageData.map(s => {
                    const health = s.defects === 0 ? 'Good' : s.defects <= 2 ? 'Monitor' : 'Critical';
                    const hColor = s.defects === 0 ? 'green' : s.defects <= 2 ? 'orange' : 'red';
                    return (
                      <tr key={s.name}>
                        <td>{s.name}</td>
                        <td style={{ color: s.defects > 0 ? 'red'    : 'green' }}>{s.defects}</td>
                        <td style={{ color: s.rework  > 0 ? 'orange' : 'green' }}>{s.rework}</td>
                        <td style={{ color: s.failed  > 0 ? 'red'    : 'green' }}>{s.failed}</td>
                        <td style={{ color: hColor, fontWeight: 'bold' }}>{health}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Technician table */}
            {data.techStats.length > 0 && (
              <div style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '14px' }}>
                <h3 style={{ marginBottom: '10px' }}>Technician Performance</h3>
                <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', fontSize: '13px' }}>
                  <thead style={{ background: '#333', color: 'white' }}>
                    <tr><th>Technician</th><th>UAVs</th><th>Passed</th><th>Defects</th><th>Pass Rate</th></tr>
                  </thead>
                  <tbody>
                    {data.techStats.map(t => {
                      const rate = t.total > 0 ? Math.round((t.passed / t.total) * 100) : 0;
                      return (
                        <tr key={t.techId}>
                          <td><b>{t.techId}</b></td>
                          <td>{t.total}</td>
                          <td style={{ color: 'green' }}>{t.passed}</td>
                          <td style={{ color: t.defects > 0 ? 'red' : 'green' }}>{t.defects}</td>
                          <td style={{ color: rate >= 80 ? 'green' : rate >= 50 ? 'orange' : 'red', fontWeight: 'bold' }}>
                            {rate}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )
      }
    </div>
  );
}

export default Analytics;