// MODULE 4 — Node.js + Express
// Topics: Express, REST API, Router, CORS, EventEmitter, File Upload

const express = require('express');
const cors    = require('cors');
const events  = require('events');
const multer  = require('multer');

const app  = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- EventEmitter (Module 4.1) ---
const emitter = new events.EventEmitter();
emitter.on('added',   (id) => console.log('Event: UAV added ->', id));
emitter.on('deleted', (id) => console.log('Event: UAV deleted ->', id));

// --- 7 Stage Names ---
const STAGES = [
  'Frame Assembly',
  'Motor & ESC Installation',
  'Wiring & Electronics',
  'Avionics Integration',
  'Software Configuration',
  'Ground Testing',
  'Final Inspection',
];

// --- In-memory Database (starts empty) ---
let uavList = [];
let nextId  = 1;

// --- Helper: make 7 blank stages ---
function makeStages() {
  return STAGES.map(name => ({
    name,
    status:  'Pending',
    defects: 0,
    rework:  0,
  }));
}

// --- Helper: calculate final result from stages ---
function calcResult(stages) {
  const done = stages.filter(s => s.status !== 'Pending').length;
  if (done < 7)                              return 'In Progress';
  if (stages.some(s => s.status === 'Fail')) return 'Fail';
  return 'Pass';
}

// --- multer: store uploaded file in memory ---
const upload = multer({ storage: multer.memoryStorage() });

// --- Helper: parse CSV text into rows ---
function parseCSV(text) {
  const lines  = text.trim().split('\n');
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  return lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      const vals = line.split(',').map(v => v.trim());
      const row  = {};
      header.forEach((h, i) => row[h] = vals[i] || '');
      return row;
    });
}

// =============================================
// EXPRESS ROUTER (Module 4.2)
// =============================================
const router = express.Router();

// GET all UAVs
router.get('/', (req, res) => {
  res.json(uavList);
});

// POST create one UAV — body: { uavId, techId }
router.post('/', (req, res) => {
  const { uavId, techId } = req.body;
  if (!uavId || !techId)
    return res.status(400).json({ error: 'uavId and techId are required' });
  if (uavList.find(u => u.uavId === uavId))
    return res.status(409).json({ error: 'UAV ID already exists' });

  const uav = {
    id:          nextId++,
    uavId,
    techId,
    stages:      makeStages(),
    finalResult: 'In Progress',
    date:        new Date().toLocaleDateString(),
  };
  uavList.push(uav);
  emitter.emit('added', uav.uavId);
  res.status(201).json(uav);
});

// PUT update one stage — /api/uav/:id/stage/:index
router.put('/:id/stage/:index', (req, res) => {
  const uav = uavList.find(u => u.id === parseInt(req.params.id));
  if (!uav) return res.status(404).json({ error: 'Not found' });

  const i = parseInt(req.params.index);
  const { status, defects, rework } = req.body;

  uav.stages[i].status  = status;
  uav.stages[i].defects = Number(defects) || 0;
  uav.stages[i].rework  = Number(rework)  || 0;
  uav.finalResult       = calcResult(uav.stages);

  res.json(uav);
});

// DELETE one UAV
router.delete('/:id', (req, res) => {
  const i = uavList.findIndex(u => u.id === parseInt(req.params.id));
  if (i === -1) return res.status(404).json({ error: 'Not found' });
  uavList.splice(i, 1);
  emitter.emit('deleted', req.params.id);
  res.json({ message: 'Deleted' });
});

app.use('/api/uav', router);

// =============================================
// FILE UPLOAD — POST /api/upload
// =============================================
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const text = req.file.buffer.toString('utf8');
  const rows = parseCSV(text);

  if (rows.length === 0)
    return res.status(400).json({ error: 'File empty or wrong format. Need columns: uavId, techId' });

  const created = [];
  const skipped = [];

  rows.forEach(row => {
    const uavId  = (row['uavid']  || row['uav id']  || '').trim();
    const techId = (row['techid'] || row['tech id'] || '').trim();

    if (!uavId || !techId) {
      skipped.push('Missing uavId or techId in one row');
      return;
    }
    if (uavList.find(u => u.uavId === uavId)) {
      skipped.push(uavId + ' already exists');
      return;
    }

    const uav = {
      id:          nextId++,
      uavId,
      techId,
      stages:      makeStages(),
      finalResult: 'In Progress',
      date:        new Date().toLocaleDateString(),
    };
    uavList.push(uav);
    created.push(uav);
  });

  res.json({
    message: created.length + ' created, ' + skipped.length + ' skipped',
    created,
    skipped,
  });
});

// Sample CSV download
app.get('/api/sample-csv', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename=sample.csv');
  res.send('uavId,techId\nUAV-001,TECH-01\nUAV-002,TECH-02\n');
});

// =============================================
// ANALYTICS — GET /api/analytics
// =============================================
app.get('/api/analytics', (req, res) => {
  const total      = uavList.length;
  const passed     = uavList.filter(u => u.finalResult === 'Pass').length;
  const failed     = uavList.filter(u => u.finalResult === 'Fail').length;
  const inProgress = uavList.filter(u => u.finalResult === 'In Progress').length;

  // Defects per stage across all UAVs
  const stageData = STAGES.map((name, i) => ({
    name,
    defects: uavList.reduce((s, u) => s + u.stages[i].defects, 0),
    rework:  uavList.reduce((s, u) => s + u.stages[i].rework,  0),
    failed:  uavList.filter(u => u.stages[i].status === 'Fail').length,
  }));

  // Technician stats
  const techMap = {};
  uavList.forEach(u => {
    if (!techMap[u.techId])
      techMap[u.techId] = { techId: u.techId, total: 0, passed: 0, defects: 0 };
    techMap[u.techId].total++;
    if (u.finalResult === 'Pass') techMap[u.techId].passed++;
    u.stages.forEach(s => { techMap[u.techId].defects += s.defects; });
  });

  // ✅ UAV list for frontend filtering
  const uavs = uavList.map(u => ({
    id:     u.uavId,
    techId: u.techId,
    status: u.finalResult,   // 'Pass' | 'Fail' | 'In Progress'
    date:   u.date,
  }));

  res.json({
    total,
    passed,
    failed,
    inProgress,
    passRate:  total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0',
    stageData,
    techStats: Object.values(techMap),
    uavs,                    // ✅ THIS was missing before
  });
});

// Start server
app.listen(PORT, () => {
  console.log('Backend running at http://localhost:' + PORT);
});