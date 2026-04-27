// MODULE 3 — UAVList.js
// Topics: Component, Props, useEffect, .map(), Events (onClick)

import React, { useEffect } from 'react';

function UAVList({ uavList, setUavList }) {

  useEffect(() => {
    fetch('http://localhost:5000/api/uav')
      .then(r => r.json())
      .then(data => setUavList(data));
  }, []);

  function del(id) {
    if (!window.confirm('Delete this UAV?')) return;
    fetch('http://localhost:5000/api/uav/' + id, { method: 'DELETE' })
      .then(() => setUavList(prev => prev.filter(u => u.id !== id)));
  }

  return (
    <div>
      <h2>All Records ({uavList.length})</h2>

      {uavList.length === 0
        ? <p>No records yet.</p>
        : (
          <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead style={{ background: '#333', color: 'white' }}>
              <tr>
                <th>#</th>
                <th>UAV ID</th>
                <th>Technician</th>
                <th>Stages Done</th>
                <th>Defects</th>
                <th>Result</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {uavList.map((uav, i) => {
                const done    = uav.stages.filter(s => s.status !== 'Pending').length;
                const defects = uav.stages.reduce((sum, s) => sum + s.defects, 0);
                return (
                  <tr key={uav.id}>
                    <td>{i + 1}</td>
                    <td><b>{uav.uavId}</b></td>
                    <td>{uav.techId}</td>
                    <td>{done} / 7</td>
                    <td style={{ color: defects > 0 ? 'red' : 'green' }}>{defects}</td>
                    <td style={{
                      color: uav.finalResult === 'Pass' ? 'green' : uav.finalResult === 'Fail' ? 'red' : 'orange',
                      fontWeight: 'bold'
                    }}>
                      {uav.finalResult}
                    </td>
                    <td>{uav.date}</td>
                    <td>
                      <button onClick={() => del(uav.id)} style={{ color: 'red' }}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )
      }
    </div>
  );
}

export default UAVList;