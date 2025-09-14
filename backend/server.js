const http = require('http');
const fs = require('fs');
const path = require('path');

// Load data from JSON files at startup. In a production system you
// would query a database instead. Reading synchronously here is fine
// because it only happens once when the server starts.
function loadData(fileName) {
  const filePath = path.join(__dirname, 'data', fileName);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Unable to read ${fileName}:`, err);
    return null;
  }
}

const biography = loadData('biography.json');
const beats = loadData('beats.json');

const server = http.createServer((req, res) => {
  // Enable CORS for all origins so that the React frontend can make requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Route matching for API endpoints
  if (req.url === '/api/biography' && req.method === 'GET') {
    if (!biography) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Biography not available' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(biography));
    return;
  }

  if (req.url === '/api/beats' && req.method === 'GET') {
    if (!beats) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Beats not available' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(beats));
    return;
  }

  // Default 404 for any other path
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Backend API server is running on port ${port}`);
});