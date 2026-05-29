require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const companiesRoutes = require('./routes/companies');
const quotesRoutes = require('./routes/quotes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/quotes', quotesRoutes);

// Route santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'DevisAI API' });
});

// Gestion des routes inconnues
app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✓ DevisAI API démarrée sur le port ${PORT}`);
  console.log(`  → http://localhost:${PORT}/api/health`);
});
