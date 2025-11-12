const API = 'http://localhost:4000/api';
let map, markersLayer;

async function initMap() {
  map = L.map('map').setView([-23.4, -51.5], 13); // centralize em ARAPONGAS por padrão
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
  loadReports();
}

async function loadReports() {
  const res = await fetch(API + '/reports');
  const data = await res.json();
  markersLayer.clearLayers();
  data.forEach(r => {
    const marker = L.marker([r.lat, r.lng]).bindPopup(`<b>${r.title}</b><br/>${r.description}<br/><small>${r.status}</small>`);
    markersLayer.addLayer(marker);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('map')) initMap();

  const form = document.getElementById('reportForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Faça login antes de enviar ocorrências.');
        window.location.href = '/login.html';
        return;
      }
      const formData = new FormData(form);
      try {
        const res = await fetch(API + '/reports', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token },
          body: formData
        });
        const data = await res.json();
        if (!res.ok) {
          document.getElementById('msg').innerText = data.message || JSON.stringify(data);
        } else {
          document.getElementById('msg').innerText = 'Ocorrência registrada com sucesso!';
          form.reset();
          loadReports();
        }
      } catch (err) {
        document.getElementById('msg').innerText = 'Erro ao enviar.';
      }
    });
  }
});
const bcrypt = require('bcrypt');
bcrypt.hash('suaSenhaProf', 10).then(h => console.log(h));
const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const path = require('path');

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Registrar ocorrência (qualquer usuário autenticado)
router.post('/',
  auth(), // deve estar logado
  upload.single('photo'),
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('lat').isFloat(),
  body('lng').isFloat(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const db = req.app.locals.db;
    const { title, description, lat, lng } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : null;
    const userId = req.user.id;
    try {
      const [result] = await db.query('INSERT INTO reports (user_id, title, description, lat, lng, photo, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [userId, title, description, lat, lng, photo, 'pending']);
      return res.json({ id: result.insertId, title });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro ao salvar ocorrência' });
    }
  }
);

// Listar ocorrências públicas (qualquer)
router.get('/', async (req, res) => {
  const db = req.app.locals.db;
  try {
    const [rows] = await db.query('SELECT r.*, u.name as user_name FROM reports r LEFT JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC');
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Endpoint professor: relatórios (necessita role=professor)
router.get('/report/pdf', auth('professor'), async (req, res) => {
  // Aqui apenas retorna estatísticas simples; geração de PDF pode ser adicionada.
  const db = req.app.locals.db;
  try {
    const [tot] = await db.query('SELECT COUNT(*) as total FROM reports');
    const [byStatus] = await db.query('SELECT status, COUNT(*) as count FROM reports GROUP BY status');
    return res.json({ total: tot[0].total, byStatus });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao gerar relatório' });
  }
});

module.exports = router;
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Register (cidadão)
router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, email, password } = req.body;
    const db = req.app.locals.db;
    try {
      const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (rows.length) return res.status(400).json({ message: 'Email já cadastrado' });

      const hash = await bcrypt.hash(password, 10);
      const [result] = await db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hash, 'citizen']);
      const userId = result.insertId;
      return res.json({ id: userId, name, email });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro no servidor' });
    }
  }
);

// Login (citizen or professor)
router.post('/login',
  body('email').isEmail(),
  body('password').exists(),
  async (req, res) => {
    const db = req.app.locals.db;
    const { email, password } = req.body;
    try {
      const [rows] = await db.query('SELECT id, name, password, role FROM users WHERE email = ?', [email]);
      if (!rows.length) return res.status(400).json({ message: 'Credenciais inválidas' });
      const user = rows[0];
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(400).json({ message: 'Credenciais inválidas' });

      const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
      return res.json({ token, role: user.role, name: user.name });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro no servidor' });
    }
  }
);

module.exports = router;
const jwt = require('jsonwebtoken');

function auth(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token ausente' });

    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;
      if (requiredRole && payload.role !== requiredRole) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  }
}

module.exports = auth;
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2/promise');

const authRoutes = require('./routes/auth');
const reportsRoutes = require('./routes/reports');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conectar DB: cria pool e injeta via app.locals
async function initDB() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
  });
  app.locals.db = pool;
}
initDB().catch(err => {
  console.error('Erro ao conectar ao DB:', err);
  process.exit(1);
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`CiddApp backend rodando na porta ${port}`));
