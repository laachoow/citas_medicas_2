const express = require('express');
const router = express.Router();
const db = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Middleware verificar token y rol admin
function soloAdmin(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Acceso denegado.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.rol !== 'administrador' && decoded.rol !== 'medico') {
            return res.status(403).json({ error: 'No tienes permisos de administrador.' });
        }
        req.usuario = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Token inválido.' });
    }
}

// ── MÉDICOS ───────────────────────────────────────────────────

// GET /api/admin/medicos
router.get('/medicos', soloAdmin, async (req, res) => {
    try {
        const [medicos] = await db.query(`
            SELECT m.id_medico, u.nombre, u.apellido, u.correo,
                   u.numero_documento, u.telefono, m.especialidad, m.registro_medico
            FROM medico m
            JOIN usuario u ON m.id_usuario = u.id_usuario
            WHERE u.activo = 1
        `);
        res.json({ medicos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener médicos.' });
    }
});

// POST /api/admin/medicos
router.post('/medicos', soloAdmin, async (req, res) => {
    const { nombre, apellido, tipo_documento, numero_documento,
            telefono, correo, contrasena, especialidad, registro_medico } = req.body;

    if (!nombre || !apellido || !correo || !contrasena || !especialidad || !registro_medico) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const contrasenaHash = await bcrypt.hash(contrasena, salt);

        const [result] = await db.query(`
            INSERT INTO usuario (nombre, apellido, tipo_documento, numero_documento, telefono, correo, contrasena, rol)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'medico')
        `, [nombre, apellido, tipo_documento, numero_documento, telefono, correo, contrasenaHash]);

        await db.query(`
            INSERT INTO medico (id_usuario, especialidad, registro_medico)
            VALUES (?, ?, ?)
        `, [result.insertId, especialidad, registro_medico]);

        res.status(201).json({ mensaje: 'Médico creado exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear médico.' });
    }
});

// DELETE /api/admin/medicos/:id
router.delete('/medicos/:id', soloAdmin, async (req, res) => {
    try {
        await db.query(`
            UPDATE usuario u
            JOIN medico m ON u.id_usuario = m.id_usuario
            SET u.activo = 0
            WHERE m.id_medico = ?
        `, [req.params.id]);
        res.json({ mensaje: 'Médico desactivado exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al desactivar médico.' });
    }
});

// ── HORARIOS ──────────────────────────────────────────────────

// GET /api/admin/horarios/:id_medico
router.get('/horarios/:id_medico', soloAdmin, async (req, res) => {
    try {
        const [horarios] = await db.query(`
            SELECT * FROM horario_disponibilidad WHERE id_medico = ?
            ORDER BY FIELD(dia_semana,'lunes','martes','miercoles','jueves','viernes','sabado'), hora_inicio
        `, [req.params.id_medico]);
        res.json({ horarios });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener horarios.' });
    }
});

// POST /api/admin/horarios
router.post('/horarios', soloAdmin, async (req, res) => {
    const { id_medico, dia_semana, hora_inicio, hora_fin } = req.body;

    if (!id_medico || !dia_semana || !hora_inicio || !hora_fin) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
        await db.query(`
            INSERT INTO horario_disponibilidad (id_medico, dia_semana, hora_inicio, hora_fin)
            VALUES (?, ?, ?, ?)
        `, [id_medico, dia_semana, hora_inicio, hora_fin]);
        res.status(201).json({ mensaje: 'Horario creado exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear horario.' });
    }
});

// DELETE /api/admin/horarios/:id
router.delete('/horarios/:id', soloAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM horario_disponibilidad WHERE id_horario = ?', [req.params.id]);
        res.json({ mensaje: 'Horario eliminado exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar horario.' });
    }
});

// ── CITAS ─────────────────────────────────────────────────────

// GET /api/admin/citas
router.get('/citas', soloAdmin, async (req, res) => {
    try {
        const [citas] = await db.query(`
            SELECT c.id_cita, c.fecha, c.hora, c.estado, c.motivo_consulta,
                   p.nombre AS paciente_nombre, p.apellido AS paciente_apellido,
                   p.numero_documento AS paciente_documento,
                   p.telefono AS paciente_telefono,
                   u.nombre AS medico_nombre, u.apellido AS medico_apellido,
                   m.especialidad
            FROM cita_medica c
            JOIN usuario p ON c.id_paciente = p.id_usuario
            JOIN medico m ON c.id_medico = m.id_medico
            JOIN usuario u ON m.id_usuario = u.id_usuario
            ORDER BY c.fecha DESC, c.hora DESC
        `);
        res.json({ citas });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener citas.' });
    }
});

// PUT /api/admin/citas/:id/estado
router.put('/citas/:id/estado', soloAdmin, async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['programada', 'confirmada', 'atendida', 'cancelada', 'inasistencia'];
    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: 'Estado no válido.' });
    }

    try {
        await db.query('UPDATE cita_medica SET estado = ? WHERE id_cita = ?', [estado, id]);
        res.json({ mensaje: `Estado actualizado a ${estado} exitosamente.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar estado de la cita.' });
    }
});

// ── REPORTES ──────────────────────────────────────────────────

// GET /api/admin/reportes
router.get('/reportes', soloAdmin, async (req, res) => {
    try {
        const [total] = await db.query('SELECT COUNT(*) as total FROM cita_medica');
        const [programadas] = await db.query("SELECT COUNT(*) as total FROM cita_medica WHERE estado = 'programada'");
        const [atendidas] = await db.query("SELECT COUNT(*) as total FROM cita_medica WHERE estado = 'atendida'");
        const [canceladas] = await db.query("SELECT COUNT(*) as total FROM cita_medica WHERE estado = 'cancelada'");
        const [inasistencias] = await db.query("SELECT COUNT(*) as total FROM cita_medica WHERE estado = 'inasistencia'");

        res.json({
            total: total[0].total,
            programadas: programadas[0].total,
            atendidas: atendidas[0].total,
            canceladas: canceladas[0].total,
            inasistencias: inasistencias[0].total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener reportes.' });
    }
});

module.exports = router;