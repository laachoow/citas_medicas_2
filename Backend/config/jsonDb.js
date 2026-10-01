const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'citas_db.json');

// Base de datos inicial precargada
const defaultData = {
    usuario: [
        {
            id_usuario: 1,
            nombre: 'Carlos',
            apellido: 'Administrador',
            tipo_documento: 'CC',
            numero_documento: '1000000000',
            telefono: '3101112233',
            correo: 'admin@admin.com',
            contrasena: '',
            rol: 'administrador',
            activo: 1,
            fecha_registro: new Date().toISOString()
        },
        {
            id_usuario: 2,
            nombre: 'Elena',
            apellido: 'Ramos',
            tipo_documento: 'CC',
            numero_documento: '1000000001',
            telefono: '3122223344',
            correo: 'dra.ramos@latola.gov.co',
            contrasena: '',
            rol: 'medico',
            activo: 1,
            fecha_registro: new Date().toISOString()
        },
        {
            id_usuario: 3,
            nombre: 'Juan',
            apellido: 'Pérez',
            tipo_documento: 'CC',
            numero_documento: '1000000002',
            telefono: '3133334455',
            correo: 'dr.perez@latola.gov.co',
            contrasena: '',
            rol: 'medico',
            activo: 1,
            fecha_registro: new Date().toISOString()
        },
        {
            id_usuario: 4,
            nombre: 'María',
            apellido: 'Gómez',
            tipo_documento: 'CC',
            numero_documento: '1000000003',
            telefono: '3144445566',
            correo: 'maria.gomez@gmail.com',
            contrasena: '',
            rol: 'paciente',
            activo: 1,
            fecha_registro: new Date().toISOString()
        }
    ],
    medico: [
        {
            id_medico: 1,
            id_usuario: 2,
            especialidad: 'Medicina General',
            registro_medico: 'RM-10293'
        },
        {
            id_medico: 2,
            id_usuario: 3,
            especialidad: 'Pediatría',
            registro_medico: 'RM-48201'
        }
    ],
    horario_disponibilidad: [
        // Horarios para Dra. Elena Ramos (id_medico: 1)
        { id_horario: 1, id_medico: 1, dia_semana: 'lunes', hora_inicio: '08:00:00', hora_fin: '08:30:00', estado_disponibilidad: 'disponible' },
        { id_horario: 2, id_medico: 1, dia_semana: 'lunes', hora_inicio: '09:00:00', hora_fin: '09:30:00', estado_disponibilidad: 'disponible' },
        { id_horario: 3, id_medico: 1, dia_semana: 'lunes', hora_inicio: '10:00:00', hora_fin: '10:30:00', estado_disponibilidad: 'disponible' },
        { id_horario: 4, id_medico: 1, dia_semana: 'martes', hora_inicio: '08:00:00', hora_fin: '08:30:00', estado_disponibilidad: 'disponible' },
        { id_horario: 5, id_medico: 1, dia_semana: 'martes', hora_inicio: '10:00:00', hora_fin: '10:30:00', estado_disponibilidad: 'disponible' },
        { id_horario: 6, id_medico: 1, dia_semana: 'miercoles', hora_inicio: '08:00:00', hora_fin: '08:30:00', estado_disponibilidad: 'disponible' },
        { id_horario: 7, id_medico: 1, dia_semana: 'miercoles', hora_inicio: '09:00:00', hora_fin: '09:30:00', estado_disponibilidad: 'disponible' },
        { id_horario: 8, id_medico: 1, dia_semana: 'jueves', hora_inicio: '08:00:00', hora_fin: '08:30:00', estado_disponibilidad: 'disponible' },
        { id_horario: 9, id_medico: 1, dia_semana: 'viernes', hora_inicio: '08:00:00', hora_fin: '08:30:00', estado_disponibilidad: 'disponible' },
        { id_horario: 10, id_medico: 1, dia_semana: 'sabado', hora_inicio: '08:00:00', hora_fin: '08:30:00', estado_disponibilidad: 'disponible' },
        // Horarios para Dr. Juan Pérez (id_medico: 2)
        { id_horario: 11, id_medico: 2, dia_semana: 'lunes', hora_inicio: '14:00:00', hora_fin: '14:30:00', estado_disponibilidad: 'disponible' },
        { id_horario: 12, id_medico: 2, dia_semana: 'lunes', hora_inicio: '15:00:00', hora_fin: '15:30:00', estado_disponibilidad: 'disponible' },
        { id_horario: 13, id_medico: 2, dia_semana: 'martes', hora_inicio: '14:00:00', hora_fin: '14:30:00', estado_disponibilidad: 'disponible' },
        { id_horario: 14, id_medico: 2, dia_semana: 'miercoles', hora_inicio: '14:00:00', hora_fin: '14:30:00', estado_disponibilidad: 'disponible' },
        { id_horario: 15, id_medico: 2, dia_semana: 'jueves', hora_inicio: '14:00:00', hora_fin: '14:30:00', estado_disponibilidad: 'disponible' },
        { id_horario: 16, id_medico: 2, dia_semana: 'viernes', hora_inicio: '14:00:00', hora_fin: '14:30:00', estado_disponibilidad: 'disponible' }
    ],
    cita_medica: [
        {
            id_cita: 1,
            id_paciente: 4,
            id_medico: 1,
            id_horario: 2,
            fecha: '2026-10-05',
            hora: '09:00:00',
            estado: 'programada',
            motivo_consulta: 'Control médico general anual',
            fecha_creacion: new Date().toISOString()
        }
    ]
};

function loadData() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
        return JSON.parse(JSON.stringify(defaultData));
    }
    try {
        const content = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(content);
    } catch {
        return JSON.parse(JSON.stringify(defaultData));
    }
}

function saveData(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error('Error guardando JSON db:', e);
    }
}

class JsonDb {
    constructor() {
        this.data = loadData();
    }

    async query(sql, params = []) {
        const cleanSql = sql.replace(/\s+/g, ' ').trim();
        const p = Array.isArray(params) ? [...params] : [params];

        // 1. SELECT * FROM usuario WHERE correo = ? AND activo = 1
        if (/SELECT \* FROM usuario WHERE correo = \? AND activo = 1/i.test(cleanSql)) {
            const correo = p[0];
            const rows = this.data.usuario.filter(u => u.correo.toLowerCase() === (correo || '').toLowerCase() && u.activo == 1);
            return [rows, []];
        }

        // 2. SELECT * FROM usuario WHERE correo = ?
        if (/SELECT \* FROM usuario WHERE correo = \?/i.test(cleanSql)) {
            const correo = p[0];
            const rows = this.data.usuario.filter(u => u.correo.toLowerCase() === (correo || '').toLowerCase());
            return [rows, []];
        }

        // 3. SELECT * FROM usuario WHERE rol = ? AND activo = 1
        if (/SELECT \* FROM usuario WHERE rol = \? AND activo = 1/i.test(cleanSql)) {
            const rol = p[0];
            const rows = this.data.usuario.filter(u => u.rol === rol && u.activo == 1);
            return [rows, []];
        }

        // 3b. SELECT * FROM usuario WHERE rol = ?
        if (/SELECT \* FROM usuario WHERE rol = \?/i.test(cleanSql)) {
            const rol = p[0];
            const rows = this.data.usuario.filter(u => u.rol === rol);
            return [rows, []];
        }

        // 3c. SELECT * FROM usuario WHERE rol = 'administrador'
        if (/SELECT \* FROM usuario WHERE rol = 'administrador'/i.test(cleanSql)) {
            const rows = this.data.usuario.filter(u => u.rol === 'administrador');
            return [rows, []];
        }

        // 4. SELECT id_usuario FROM usuario WHERE correo = ?
        if (/SELECT id_usuario FROM usuario WHERE correo = \?/i.test(cleanSql)) {
            const correo = p[0];
            const rows = this.data.usuario.filter(u => u.correo.toLowerCase() === (correo || '').toLowerCase()).map(u => ({ id_usuario: u.id_usuario }));
            return [rows, []];
        }

        // 5. SELECT id_usuario FROM usuario WHERE numero_documento = ?
        if (/SELECT id_usuario FROM usuario WHERE numero_documento = \?/i.test(cleanSql)) {
            const doc = p[0];
            const rows = this.data.usuario.filter(u => u.numero_documento === String(doc)).map(u => ({ id_usuario: u.id_usuario }));
            return [rows, []];
        }

        // 6. INSERT INTO usuario (...) VALUES (...)
        if (/INSERT INTO usuario/i.test(cleanSql)) {
            // [nombre, apellido, tipo_documento, numero_documento, telefono, correo, contrasenaHash, rol]
            const id = this.data.usuario.length > 0 ? Math.max(...this.data.usuario.map(u => u.id_usuario)) + 1 : 1;
            const nuevo = {
                id_usuario: id,
                nombre: p[0],
                apellido: p[1],
                tipo_documento: p[2],
                numero_documento: p[3],
                telefono: p[4] || null,
                correo: p[5],
                contrasena: p[6] || '',
                rol: p[7] || 'paciente',
                activo: 1,
                fecha_registro: new Date().toISOString()
            };
            this.data.usuario.push(nuevo);
            saveData(this.data);
            return [{ insertId: id, affectedRows: 1 }, []];
        }

        // 7. GET /api/citas/medicos: SELECT m.id_medico, u.nombre, u.apellido, m.especialidad FROM medico m JOIN usuario u ON m.id_usuario = u.id_usuario WHERE u.activo = 1
        if (/SELECT m\.id_medico, u\.nombre, u\.apellido, m\.especialidad FROM medico m/i.test(cleanSql)) {
            const rows = this.data.medico.map(m => {
                const u = this.data.usuario.find(usr => usr.id_usuario === m.id_usuario && usr.activo == 1);
                if (!u) return null;
                return {
                    id_medico: m.id_medico,
                    nombre: u.nombre,
                    apellido: u.apellido,
                    especialidad: m.especialidad
                };
            }).filter(Boolean);
            return [rows, []];
        }

        // 8. GET /api/admin/medicos: SELECT m.id_medico, u.nombre, u.apellido, u.correo, u.numero_documento, u.telefono, m.especialidad, m.registro_medico FROM medico m JOIN usuario u...
        if (/SELECT m\.id_medico, u\.nombre, u\.apellido, u\.correo/i.test(cleanSql)) {
            const rows = this.data.medico.map(m => {
                const u = this.data.usuario.find(usr => usr.id_usuario === m.id_usuario && usr.activo == 1);
                if (!u) return null;
                return {
                    id_medico: m.id_medico,
                    nombre: u.nombre,
                    apellido: u.apellido,
                    correo: u.correo,
                    numero_documento: u.numero_documento,
                    telefono: u.telefono,
                    especialidad: m.especialidad,
                    registro_medico: m.registro_medico
                };
            }).filter(Boolean);
            return [rows, []];
        }

        // 9. INSERT INTO medico (id_usuario, especialidad, registro_medico) VALUES (?, ?, ?)
        if (/INSERT INTO medico/i.test(cleanSql)) {
            const id = this.data.medico.length > 0 ? Math.max(...this.data.medico.map(m => m.id_medico)) + 1 : 1;
            const nuevo = {
                id_medico: id,
                id_usuario: Number(p[0]),
                especialidad: p[1],
                registro_medico: p[2]
            };
            this.data.medico.push(nuevo);
            saveData(this.data);
            return [{ insertId: id, affectedRows: 1 }, []];
        }

        // 10. UPDATE usuario u JOIN medico m ON u.id_usuario = m.id_usuario SET u.activo = 0 WHERE m.id_medico = ?
        if (/UPDATE usuario .* SET u\.activo = 0 WHERE m\.id_medico = \?/i.test(cleanSql)) {
            const id_medico = Number(p[0]);
            const m = this.data.medico.find(med => med.id_medico === id_medico);
            if (m) {
                const u = this.data.usuario.find(usr => usr.id_usuario === m.id_usuario);
                if (u) u.activo = 0;
                saveData(this.data);
            }
            return [{ affectedRows: 1 }, []];
        }

        // 11. SELECT * FROM horario_disponibilidad WHERE id_medico = ? ORDER BY ...
        if (/SELECT \* FROM horario_disponibilidad WHERE id_medico = \?/i.test(cleanSql)) {
            const id_medico = Number(p[0]);
            const diasOrden = ['lunes','martes','miercoles','jueves','viernes','sabado'];
            const rows = this.data.horario_disponibilidad
                .filter(h => h.id_medico === id_medico)
                .sort((a, b) => {
                    const diaDiff = diasOrden.indexOf(a.dia_semana) - diasOrden.indexOf(b.dia_semana);
                    if (diaDiff !== 0) return diaDiff;
                    return (a.hora_inicio || '').localeCompare(b.hora_inicio || '');
                });
            return [rows, []];
        }

        // 12. GET /api/citas/horarios (disponibles para medico, dia_semana y no ocupados en fecha)
        if (/FROM horario_disponibilidad h.*WHERE h\.id_medico = \?.*AND h\.dia_semana = \?/i.test(cleanSql)) {
            this.data = loadData();
            const id_medico = Number(p[0]);
            const dia_semana = p[1];
            const fecha = p[2];

            const ocupadosIds = this.data.cita_medica
                .filter(c => c.fecha === fecha && c.estado !== 'cancelada')
                .map(c => c.id_horario);

            const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

            const rows = this.data.horario_disponibilidad.filter(h =>
                h.id_medico === id_medico &&
                norm(h.dia_semana) === norm(dia_semana) &&
                h.estado_disponibilidad === 'disponible' &&
                !ocupadosIds.includes(h.id_horario)
            ).map(h => ({
                id_horario: h.id_horario,
                hora_inicio: h.hora_inicio,
                hora_fin: h.hora_fin,
                estado_disponibilidad: h.estado_disponibilidad
            })).sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''));

            return [rows, []];
        }

        // 13. SELECT id_cita FROM cita_medica WHERE id_horario = ? AND fecha = ? AND estado != 'cancelada' AND id_cita != ?
        if (/SELECT id_cita FROM cita_medica WHERE id_horario = \? AND fecha = \? AND estado != 'cancelada' AND id_cita != \?/i.test(cleanSql)) {
            const id_horario = Number(p[0]);
            const fecha = p[1];
            const excludeId = Number(p[2]);
            const rows = this.data.cita_medica.filter(c =>
                c.id_horario === id_horario && c.fecha === fecha && c.estado !== 'cancelada' && c.id_cita !== excludeId
            ).map(c => ({ id_cita: c.id_cita }));
            return [rows, []];
        }

        // 14. SELECT id_cita FROM cita_medica WHERE id_horario = ? AND fecha = ? AND estado != 'cancelada'
        if (/SELECT id_cita FROM cita_medica WHERE id_horario = \? AND fecha = \? AND estado != 'cancelada'/i.test(cleanSql)) {
            const id_horario = Number(p[0]);
            const fecha = p[1];
            const rows = this.data.cita_medica.filter(c =>
                c.id_horario === id_horario && c.fecha === fecha && c.estado !== 'cancelada'
            ).map(c => ({ id_cita: c.id_cita }));
            return [rows, []];
        }

        // 15. SELECT hora_inicio FROM horario_disponibilidad WHERE id_horario = ?
        if (/SELECT hora_inicio FROM horario_disponibilidad WHERE id_horario = \?/i.test(cleanSql)) {
            const id_horario = Number(p[0]);
            const h = this.data.horario_disponibilidad.find(item => item.id_horario === id_horario);
            return [h ? [{ hora_inicio: h.hora_inicio }] : [], []];
        }

        // 16. INSERT INTO cita_medica (id_paciente, id_medico, id_horario, fecha, hora, motivo_consulta) VALUES (...)
        if (/INSERT INTO cita_medica/i.test(cleanSql)) {
            const id = this.data.cita_medica.length > 0 ? Math.max(...this.data.cita_medica.map(c => c.id_cita)) + 1 : 1;
            const nueva = {
                id_cita: id,
                id_paciente: Number(p[0]),
                id_medico: Number(p[1]),
                id_horario: Number(p[2]),
                fecha: p[3],
                hora: p[4],
                motivo_consulta: p[5] || null,
                estado: 'programada',
                fecha_creacion: new Date().toISOString()
            };
            this.data.cita_medica.push(nueva);
            saveData(this.data);
            return [{ insertId: id, affectedRows: 1 }, []];
        }

        // 17. GET /api/citas/mis-citas: SELECT c.id_cita, c.fecha, c.hora, c.estado, c.motivo_consulta, u.nombre AS medico_nombre, u.apellido AS medico_apellido, m.especialidad FROM cita_medica c ... WHERE c.id_paciente = ?
        if (/FROM cita_medica c.*WHERE c\.id_paciente = \?/i.test(cleanSql)) {
            const id_paciente = Number(p[0]);
            const rows = this.data.cita_medica
                .filter(c => c.id_paciente === id_paciente)
                .map(c => {
                    const m = this.data.medico.find(med => med.id_medico === c.id_medico);
                    const u = m ? this.data.usuario.find(usr => usr.id_usuario === m.id_usuario) : null;
                    return {
                        id_cita: c.id_cita,
                        fecha: c.fecha,
                        hora: c.hora,
                        estado: c.estado,
                        motivo_consulta: c.motivo_consulta,
                        medico_nombre: u ? u.nombre : 'Médico',
                        medico_apellido: u ? u.apellido : '',
                        especialidad: m ? m.especialidad : 'General'
                    };
                })
                .sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora));
            return [rows, []];
        }

        // 18. SELECT * FROM cita_medica WHERE id_cita = ? AND id_paciente = ?
        if (/SELECT \* FROM cita_medica WHERE id_cita = \? AND id_paciente = \?/i.test(cleanSql)) {
            const id_cita = Number(p[0]);
            const id_paciente = Number(p[1]);
            const rows = this.data.cita_medica.filter(c => c.id_cita === id_cita && c.id_paciente === id_paciente);
            return [rows, []];
        }

        // 19. SELECT * FROM cita_medica WHERE id_cita = ?
        if (/SELECT \* FROM cita_medica WHERE id_cita = \?/i.test(cleanSql)) {
            const id_cita = Number(p[0]);
            const rows = this.data.cita_medica.filter(c => c.id_cita === id_cita);
            return [rows, []];
        }

        // 20. UPDATE cita_medica SET estado = ? WHERE id_cita = ?
        if (/UPDATE cita_medica SET estado = \? WHERE id_cita = \?/i.test(cleanSql)) {
            const nuevoEstado = p[0];
            const id_cita = Number(p[1]);
            const c = this.data.cita_medica.find(item => item.id_cita === id_cita);
            if (c) c.estado = nuevoEstado;
            saveData(this.data);
            return [{ affectedRows: 1 }, []];
        }

        // 21. UPDATE cita_medica SET id_horario = ?, fecha = ?, hora = ?, estado = 'programada' WHERE id_cita = ?
        if (/UPDATE cita_medica SET id_horario = \?, fecha = \?, hora = \?, estado = 'programada' WHERE id_cita = \?/i.test(cleanSql)) {
            const id_horario = Number(p[0]);
            const fecha = p[1];
            const hora = p[2];
            const id_cita = Number(p[3]);
            const c = this.data.cita_medica.find(item => item.id_cita === id_cita);
            if (c) {
                c.id_horario = id_horario;
                c.fecha = fecha;
                c.hora = hora;
                c.estado = 'programada';
                saveData(this.data);
            }
            return [{ affectedRows: 1 }, []];
        }

        // 22. INSERT INTO horario_disponibilidad (id_medico, dia_semana, hora_inicio, hora_fin) VALUES (?, ?, ?, ?)
        if (/INSERT INTO horario_disponibilidad/i.test(cleanSql)) {
            const id = this.data.horario_disponibilidad.length > 0 ? Math.max(...this.data.horario_disponibilidad.map(h => h.id_horario)) + 1 : 1;
            const nuevo = {
                id_horario: id,
                id_medico: Number(p[0]),
                dia_semana: p[1],
                hora_inicio: p[2],
                hora_fin: p[3],
                estado_disponibilidad: 'disponible'
            };
            this.data.horario_disponibilidad.push(nuevo);
            saveData(this.data);
            return [{ insertId: id, affectedRows: 1 }, []];
        }

        // 23. DELETE FROM horario_disponibilidad WHERE id_horario = ?
        if (/DELETE FROM horario_disponibilidad WHERE id_horario = \?/i.test(cleanSql)) {
            const id = Number(p[0]);
            this.data.horario_disponibilidad = this.data.horario_disponibilidad.filter(h => h.id_horario !== id);
            saveData(this.data);
            return [{ affectedRows: 1 }, []];
        }

        // 24. GET /api/admin/citas: SELECT c.id_cita, c.fecha, c.hora, c.estado, c.motivo_consulta, p.nombre AS paciente_nombre...
        if (/FROM cita_medica c.*JOIN usuario p ON c\.id_paciente = p\.id_usuario/i.test(cleanSql)) {
            const rows = this.data.cita_medica.map(c => {
                const paciente = this.data.usuario.find(u => u.id_usuario === c.id_paciente) || {};
                const medico = this.data.medico.find(m => m.id_medico === c.id_medico) || {};
                const medicoUsuario = this.data.usuario.find(u => u.id_usuario === medico.id_usuario) || {};
                return {
                    id_cita: c.id_cita,
                    fecha: c.fecha,
                    hora: c.hora,
                    estado: c.estado,
                    motivo_consulta: c.motivo_consulta,
                    paciente_nombre: paciente.nombre || 'Paciente',
                    paciente_apellido: paciente.apellido || '',
                    paciente_telefono: paciente.telefono || '',
                    medico_nombre: medicoUsuario.nombre || 'Médico',
                    medico_apellido: medicoUsuario.apellido || '',
                    especialidad: medico.especialidad || 'General'
                };
            }).sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora));
            return [rows, []];
        }

        // 25. Reportes counts
        if (/SELECT COUNT\(\*\) as total FROM cita_medica/i.test(cleanSql)) {
            if (/WHERE estado = 'programada'/i.test(cleanSql)) {
                return [[{ total: this.data.cita_medica.filter(c => c.estado === 'programada').length }], []];
            }
            if (/WHERE estado = 'atendida'/i.test(cleanSql)) {
                return [[{ total: this.data.cita_medica.filter(c => c.estado === 'atendida').length }], []];
            }
            if (/WHERE estado = 'cancelada'/i.test(cleanSql)) {
                return [[{ total: this.data.cita_medica.filter(c => c.estado === 'cancelada').length }], []];
            }
            if (/WHERE estado = 'inasistencia'/i.test(cleanSql)) {
                return [[{ total: this.data.cita_medica.filter(c => c.estado === 'inasistencia').length }], []];
            }
            return [[{ total: this.data.cita_medica.length }], []];
        }

        console.warn('⚠️ Consulta SQL no mapeada en JsonDb:', cleanSql);
        return [[], []];
    }
}

module.exports = new JsonDb();
