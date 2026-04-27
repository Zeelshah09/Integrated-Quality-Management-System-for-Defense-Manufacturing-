// MODULE 3 — App.js
// Topics: Component, useState, Props, Events

import React, { useState } from 'react';
import Dashboard  from './components/Dashboard';
import AddUAV     from './components/AddUAV';
import UploadFile from './components/UploadFile';
import UAVList    from './components/UAVList';
import Analytics  from './components/Analytics';

function App() {
  const [page,    setPage]    = useState('dashboard');
  const [uavList, setUavList] = useState([]);

  return (
    <div style={{ fontFamily: 'Arial' }}>

      {/* Nav bar */}
      <div style={{ background: '#333', padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <b style={{ color: 'white', marginRight: '10px' }}>UAV QMS</b>
        <button onClick={() => setPage('dashboard')}>Dashboard</button>
        <button onClick={() => setPage('add')}>+ Add UAV</button>
        <button onClick={() => setPage('upload')}>Upload CSV</button>
        <button onClick={() => setPage('list')}>All Records</button>
        <button onClick={() => setPage('analytics')}>Analytics</button>
      </div>

      {/* Page content */}
      <div style={{ padding: '20px' }}>
        {page === 'dashboard' && <Dashboard  uavList={uavList} setUavList={setUavList} />}
        {page === 'add'       && <AddUAV     setUavList={setUavList} setPage={setPage} />}
        {page === 'upload'    && <UploadFile setUavList={setUavList} setPage={setPage} />}
        {page === 'list'      && <UAVList    uavList={uavList} setUavList={setUavList} />}
        {page === 'analytics' && <Analytics />}
      </div>

    </div>
  );
}

export default App;