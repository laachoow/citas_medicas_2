const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, 'data/citas_db.json');
const data = JSON.parse(fs.readFileSync(p, 'utf8'));

const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const horasSemana = ['08:00:00', '08:30:00', '09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '11:30:00', '14:00:00', '14:30:00', '15:00:00', '15:30:00', '16:00:00', '16:30:00'];
const horasSabado = ['08:00:00', '08:30:00', '09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '11:30:00'];

let nextId = 1;
const nuevosHorarios = [];

const medicosIds = [1, 2, 3];
medicosIds.forEach(id_medico => {
    dias.forEach(dia => {
        const horas = dia === 'sabado' ? horasSabado : horasSemana;
        horas.forEach(hora => {
            const [h, m] = hora.split(':').map(Number);
            const finMin = m + 30;
            const horaFin = finMin >= 60 
                ? `${String(h + 1).padStart(2, '0')}:${String(finMin - 60).padStart(2, '0')}:00`
                : `${String(h).padStart(2, '0')}:${String(finMin).padStart(2, '0')}:00`;

            nuevosHorarios.push({
                id_horario: nextId++,
                id_medico,
                dia_semana: dia,
                hora_inicio: hora,
                hora_fin: horaFin,
                estado_disponibilidad: 'disponible'
            });
        });
    });
});

data.horario_disponibilidad = nuevosHorarios;
fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
console.log('✅ Horarios generados con éxito:', data.horario_disponibilidad.length);
