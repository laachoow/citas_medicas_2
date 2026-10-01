const mysql = require('mysql2');
require('dotenv').config();
const jsonDb = require('./jsonDb');

let useJsonDb = true; // Por defecto modo local mientras se configura MySQL
let poolPromise = null;

try {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'citas_medicas_latola',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 2000
    });

    pool.getConnection((err, connection) => {
        if (err) {
            console.log('⚡ MySQL no está activo. Utilizando almacenamiento local integrado (citas_db.json).');
            useJsonDb = true;
            return;
        }
        console.log('✅ Conexión a MySQL exitosa');
        useJsonDb = false;
        connection.release();
    });

    poolPromise = pool.promise();
} catch (e) {
    console.log('⚡ Utilizando almacenamiento local integrado (citas_db.json).');
    useJsonDb = true;
}

const db = {
    async query(sql, params) {
        if (!useJsonDb && poolPromise) {
            try {
                return await poolPromise.query(sql, params);
            } catch (err) {
                if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
                    useJsonDb = true;
                    return await jsonDb.query(sql, params);
                }
                throw err;
            }
        }
        return await jsonDb.query(sql, params);
    },
    async execute(sql, params) {
        return this.query(sql, params);
    }
};

module.exports = db;