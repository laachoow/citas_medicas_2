const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/database');
require('dotenv').config();

// POST /api/auth/registro
router.post('/registro', async (req, res) => {
    const { nombre, apellido, tipo_documento, numero_documento, telefono, correo, rol } = req.body;

    if (!nombre || !apellido || !tipo_documento || !numero_documento || !correo) {
        return res.status(400).json({ error: 'Nombre, apellido, tipo/número de documento y correo son obligatorios.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        return res.status(400).json({ error: 'El correo electrónico no es válido.' });
    }

    const rolAsignado = ['paciente', 'medico', 'administrador'].includes(rol) ? rol : 'paciente';

    try {
        const [correoExiste] = await db.query(
            'SELECT id_usuario FROM usuario WHERE correo = ?', [correo]
        );
        if (correoExiste.length > 0) {
            return res.status(409).json({ error: 'Ya existe una cuenta con ese correo electrónico.' });
        }

        const [docExiste] = await db.query(
            'SELECT id_usuario FROM usuario WHERE numero_documento = ?', [numero_documento]
        );
        if (docExiste.length > 0) {
            return res.status(409).json({ error: 'Ya existe una cuenta con ese número de documento.' });
        }

        const [result] = await db.query(
            `INSERT INTO usuario (nombre, apellido, tipo_documento, numero_documento, telefono, correo, contrasena, rol)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombre, apellido, tipo_documento, numero_documento, telefono || null, correo, '', rolAsignado]
        );

        const id_usuario = result.insertId;

        // Si es médico, registrarlo también en la tabla médico
        if (rolAsignado === 'medico') {
            await db.query(
                `INSERT INTO medico (id_usuario, especialidad, registro_medico)
                 VALUES (?, ?, ?)`,
                [id_usuario, 'Medicina General', `RM-${Math.floor(10000 + Math.random() * 90000)}`]
            );
        }

        res.status(201).json({
            mensaje: `¡Registro exitoso como ${rolAsignado}! Ya puedes ingresar.`,
            id_usuario
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor. Intenta de nuevo.' });
    }
});

// POST /api/auth/login
// Modo sin contraseña: Permite ingresar eligiendo rol o correo
router.post('/login', async (req, res) => {
    let { correo, rol, nombre } = req.body;

    try {
        let usuario = null;

        // 1. Si especificó correo, buscar por correo
        if (correo) {
            const [usuarios] = await db.query(
                'SELECT * FROM usuario WHERE correo = ? AND activo = 1', [correo]
            );
            if (usuarios.length > 0) {
                usuario = usuarios[0];
                // Si además especificó un rol diferente, se lo actualizamos para su conveniencia
                if (rol && ['paciente', 'medico', 'administrador'].includes(rol) && usuario.rol !== rol) {
                    usuario.rol = rol;
                }
            }
        }

        // 2. Si no encontró por correo pero seleccionó rol, buscar o usar usuario demo de ese rol
        if (!usuario && rol) {
            const rolBuscado = ['paciente', 'medico', 'administrador'].includes(rol) ? rol : 'paciente';
            const [usuariosPorRol] = await db.query(
                'SELECT * FROM usuario WHERE rol = ? AND activo = 1', [rolBuscado]
            );
            if (usuariosPorRol.length > 0) {
                usuario = usuariosPorRol[0];
            } else {
                // Crear un usuario de ese rol al vuelo si no existiese
                const nombreNuevo = nombre || (rolBuscado === 'administrador' ? 'Admin' : rolBuscado === 'medico' ? 'Dr. Médico' : 'Paciente');
                const docNuevo = String(Date.now()).slice(-8);
                const correoNuevo = correo || `${rolBuscado}_${docNuevo}@latola.gov.co`;

                const [resInsert] = await db.query(
                    `INSERT INTO usuario (nombre, apellido, tipo_documento, numero_documento, telefono, correo, contrasena, rol)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [nombreNuevo, 'Demo', 'CC', docNuevo, '3000000000', correoNuevo, '', rolBuscado]
                );

                if (rolBuscado === 'medico') {
                    await db.query(
                        `INSERT INTO medico (id_usuario, especialidad, registro_medico)
                         VALUES (?, ?, ?)`,
                        [resInsert.insertId, 'Medicina General', `RM-${Math.floor(10000 + Math.random() * 90000)}`]
                    );
                }

                usuario = {
                    id_usuario: resInsert.insertId,
                    nombre: nombreNuevo,
                    apellido: 'Demo',
                    correo: correoNuevo,
                    rol: rolBuscado
                };
            }
        }

        // 3. Si ingresó con un correo nuevo y un nombre
        if (!usuario && correo) {
            const rolBuscado = rol && ['paciente', 'medico', 'administrador'].includes(rol) ? rol : 'paciente';
            const docNuevo = String(Date.now()).slice(-8);
            const [resInsert] = await db.query(
                `INSERT INTO usuario (nombre, apellido, tipo_documento, numero_documento, telefono, correo, contrasena, rol)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [nombre || 'Usuario', 'Demo', 'CC', docNuevo, '3000000000', correo, '', rolBuscado]
            );

            usuario = {
                id_usuario: resInsert.insertId,
                nombre: nombre || 'Usuario',
                apellido: 'Demo',
                correo: correo,
                rol: rolBuscado
            };
        }

        if (!usuario) {
            return res.status(400).json({ error: 'Por favor selecciona un rol o ingresa un correo.' });
        }

        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                correo: usuario.correo,
                rol: usuario.rol,
                nombre: usuario.nombre
            },
            process.env.JWT_SECRET || 'citas_medicas_latola_secret_key_2026',
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
            mensaje: `Sesión iniciada con éxito como ${usuario.rol}.`,
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor. Intenta de nuevo.' });
    }
});

module.exports = router;