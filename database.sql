-- ============================================
-- BASE DE DATOS: Centro de Salud La Tola
-- ============================================

CREATE DATABASE IF NOT EXISTS citas_medicas_latola
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE citas_medicas_latola;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    tipo_documento ENUM('CC', 'TI', 'CE', 'PA') NOT NULL,
    numero_documento VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(15),
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('paciente', 'medico', 'administrador') NOT NULL DEFAULT 'paciente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo TINYINT(1) DEFAULT 1
);

-- Tabla de médicos
CREATE TABLE IF NOT EXISTS medico (
    id_medico INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    registro_medico VARCHAR(50) NOT NULL UNIQUE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- Tabla de horarios disponibles
CREATE TABLE IF NOT EXISTS horario_disponibilidad (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    id_medico INT NOT NULL,
    dia_semana ENUM('lunes','martes','miercoles','jueves','viernes','sabado') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado_disponibilidad ENUM('disponible','ocupado','bloqueado') DEFAULT 'disponible',
    FOREIGN KEY (id_medico) REFERENCES medico(id_medico) ON DELETE CASCADE
);

-- Tabla de citas médicas
CREATE TABLE IF NOT EXISTS cita_medica (
    id_cita INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT NOT NULL,
    id_medico INT NOT NULL,
    id_horario INT NOT NULL UNIQUE,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado ENUM('programada','atendida','cancelada','inasistencia') DEFAULT 'programada',
    motivo_consulta VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_paciente) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_medico) REFERENCES medico(id_medico),
    FOREIGN KEY (id_horario) REFERENCES horario_disponibilidad(id_horario)
);