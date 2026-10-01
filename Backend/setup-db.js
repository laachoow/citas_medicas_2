const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setup() {
    console.log('Iniciando configuración de base de datos...');
    
    // Conexión inicial sin especificar base de datos para crearla si no existe
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    });

    console.log('✅ Conectado al servidor MySQL/MariaDB');

    // Leer y ejecutar database.sql
    const sqlPath = path.join(__dirname, '../database.sql');
    if (fs.existsSync(sqlPath)) {
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await connection.query(sql);
        console.log('✅ Tablas y base de datos creadas desde database.sql');
    }

    await connection.changeUser({ database: process.env.DB_NAME || 'citas_medicas_latola' });

    // Verificar si ya existe un administrador
    const [admins] = await connection.query("SELECT * FROM usuario WHERE rol = 'administrador'");

    if (admins.length === 0) {
        const passwordPlain = 'Admin1234*';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(passwordPlain, salt);

        await connection.query(`
            INSERT INTO usuario (nombre, apellido, tipo_documento, numero_documento, telefono, correo, contrasena, rol)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, ['Admin', 'Sistema', 'CC', '1000000000', '3000000000', 'admin@admin.com', hash, 'administrador']);

        console.log('\n===========================================');
        console.log('🎉 Usuario Administrador Creado con Éxito:');
        console.log('📧 Correo: admin@admin.com');
        console.log('🔑 Contraseña: Admin1234*');
        console.log('===========================================\n');
    } else {
        console.log(`ℹ️ Ya existe un administrador registrado: ${admins[0].correo}`);
    }

    await connection.end();
}

setup().catch(err => {
    console.error('❌ Error configurando la base de datos:', err.message);
});
