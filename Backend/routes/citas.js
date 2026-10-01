const express = require('express');
const router = express.Router();
const db = require('../config/database');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware para verificar token
function verificarToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Acceso denegado. Inicia sesión.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Token inválido o expirado.' });
    }
}

// GET /api/citas/horarios?id_medico=1&fecha=2026-03-20
router.get('/horarios', verificarToken, async (req, res) => {
    const { id_medico, fecha } = req.query;
    if (!id_medico || !fecha) {
        return res.status(400).json({ error: 'Se requiere id_medico y fecha.' });
    }

    try {
        const diasSemana = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
        const [y, m, d] = fecha.split('-').map(Number);
        const diaSemana = diasSemana[new Date(y, m - 1, d).getDay()];

        const [horarios] = await db.query(`
            SELECT h.id_horario, h.hora_inicio, h.hora_fin, h.estado_disponibilidad
            FROM horario_disponibilidad h
            WHERE h.id_medico = ?
            AND h.dia_semana = ?
            AND h.estado_disponibilidad = 'disponible'
            AND h.id_horario NOT IN (
                SELECT id_horario FROM cita_medica
                WHERE fecha = ? AND estado != 'cancelada'
            )
            ORDER BY h.hora_inicio ASC
        `, [id_medico, diaSemana, fecha]);

        // Filtrar horarios que ya pasaron si la fecha seleccionada es hoy
        const hoy = new Date();
        const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
        const horaActualStr = `${String(hoy.getHours()).padStart(2, '0')}:${String(hoy.getMinutes()).padStart(2, '0')}:00`;

        const disponibles = horarios.filter(h => {
            if (fecha === hoyStr) {
                return h.hora_inicio > horaActualStr;
            }
            return true;
        });

        res.json({
            dia_semana: diaSemana,
            fecha,
            horarios: disponibles
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener horarios.' });
    }
});

// GET /api/citas/medicos
router.get('/medicos', verificarToken, async (req, res) => {
    try {
        const [medicos] = await db.query(`
            SELECT m.id_medico, u.nombre, u.apellido, m.especialidad
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

// POST /api/citas/agendar
router.post('/agendar', verificarToken, async (req, res) => {
    const { id_medico, id_horario, fecha, motivo_consulta } = req.body;
    const id_paciente = req.usuario.id_usuario;

    if (!id_medico || !id_horario || !fecha) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
        // Verificar que el horario sigue disponible
        const [ocupado] = await db.query(`
            SELECT id_cita FROM cita_medica
            WHERE id_horario = ? AND fecha = ? AND estado != 'cancelada'
        `, [id_horario, fecha]);

        if (ocupado.length > 0) {
            return res.status(409).json({ error: 'Este horario ya fue reservado. Elige otro.' });
        }

        // Obtener hora del horario
        const [horario] = await db.query(
            'SELECT hora_inicio FROM horario_disponibilidad WHERE id_horario = ?', [id_horario]
        );

        const [result] = await db.query(`
            INSERT INTO cita_medica (id_paciente, id_medico, id_horario, fecha, hora, motivo_consulta)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [id_paciente, id_medico, id_horario, fecha, horario[0].hora_inicio, motivo_consulta || null]);

        res.status(201).json({
            mensaje: '¡Cita agendada exitosamente!',
            id_cita: result.insertId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agendar la cita.' });
    }
});

// GET /api/citas/mis-citas
router.get('/mis-citas', verificarToken, async (req, res) => {
    const id_paciente = req.usuario.id_usuario;

    try {
        const [citas] = await db.query(`
            SELECT c.id_cita, c.fecha, c.hora, c.estado, c.motivo_consulta,
                   u.nombre AS medico_nombre, u.apellido AS medico_apellido,
                   m.especialidad
            FROM cita_medica c
            JOIN medico m ON c.id_medico = m.id_medico
            JOIN usuario u ON m.id_usuario = u.id_usuario
            WHERE c.id_paciente = ?
            ORDER BY c.fecha DESC, c.hora DESC
        `, [id_paciente]);

        res.json({ citas });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las citas.' });
    }
});

// PUT /api/citas/cancelar/:id
router.put('/cancelar/:id', verificarToken, async (req, res) => {
    const id_cita = req.params.id;
    const id_paciente = req.usuario.id_usuario;
    const rol = req.usuario.rol;
    const nuevoEstado = req.body.estado || 'cancelada';

    try {
        let cita;
        if (rol === 'administrador' || rol === 'medico') {
            const [rows] = await db.query('SELECT * FROM cita_medica WHERE id_cita = ?', [id_cita]);
            cita = rows;
        } else {
            const [rows] = await db.query(
                'SELECT * FROM cita_medica WHERE id_cita = ? AND id_paciente = ?',
                [id_cita, id_paciente]
            );
            cita = rows;
        }

        if (!cita || cita.length === 0) {
            return res.status(404).json({ error: 'Cita no encontrada.' });
        }

        await db.query(
            'UPDATE cita_medica SET estado = ? WHERE id_cita = ?',
            [nuevoEstado, id_cita]
        );

        res.json({ mensaje: `Cita actualizada a ${nuevoEstado} exitosamente.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la cita.' });
    }
});

// PUT /api/citas/reprogramar/:id
router.put('/reprogramar/:id', verificarToken, async (req, res) => {
    const id_cita = req.params.id;
    const id_paciente = req.usuario.id_usuario;
    const { id_horario, fecha } = req.body;

    if (!id_horario || !fecha) {
        return res.status(400).json({ error: 'Se requiere nuevo horario y fecha.' });
    }

    try {
        const [cita] = await db.query(
            'SELECT * FROM cita_medica WHERE id_cita = ? AND id_paciente = ?',
            [id_cita, id_paciente]
        );

        if (cita.length === 0) {
            return res.status(404).json({ error: 'Cita no encontrada.' });
        }

        // Verificar que el nuevo horario esté disponible
        const [ocupado] = await db.query(`
            SELECT id_cita FROM cita_medica
            WHERE id_horario = ? AND fecha = ? AND estado != 'cancelada' AND id_cita != ?
        `, [id_horario, fecha, id_cita]);

        if (ocupado.length > 0) {
            return res.status(409).json({ error: 'Este horario ya está ocupado. Elige otro.' });
        }

        const [horario] = await db.query(
            'SELECT hora_inicio FROM horario_disponibilidad WHERE id_horario = ?', [id_horario]
        );

        await db.query(`
            UPDATE cita_medica SET id_horario = ?, fecha = ?, hora = ?, estado = 'programada'
            WHERE id_cita = ?
        `, [id_horario, fecha, horario[0].hora_inicio, id_cita]);

        res.json({ mensaje: 'Cita reprogramada exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al reprogramar la cita.' });
    }
});

module.exports = router;