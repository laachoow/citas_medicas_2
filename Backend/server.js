const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas API
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const citasRoutes = require('./routes/citas');
app.use('/api/citas', citasRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Rutas de páginas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/registro.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/dashboard.html'));
});

app.get('/agendar', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/agendar.html'));
});

app.get('/mis-citas', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/mis_citas.html'));
});

app.get('/admin/medicos', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/admin_medicos.html'));
});

app.get('/admin/citas', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/admin_citas.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n🏥 Sistema de Citas Médicas - La Tola`);
    console.log(`🌐 Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`📋 Presiona Ctrl+C para detener\n`);
});
