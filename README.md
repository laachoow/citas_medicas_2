# 🏥 Sistema de Gestión de Citas Médicas - Centro de Salud La Tola

> **Trabajo de Grado para optar al título de Ingeniero en Sistemas**  
> **Institución Universitaria Antonio José Camacho (UNIAJC)**  
> **Facultad de Ingeniería**

**Proyecto:** Implementación de una aplicación web para la gestión de citas médicas en el Centro de Salud Nuestra Señora del Carmen de La Tola Nariño.  
**Autores:** Carlos Eduardo Ortiz Espinoza, Kevin Stiven Rubio Pillimue  
**Directora:** Paola Andrea Bedoya Toro  
**Año:** 2026

---

## 📌 Descripción del Proyecto

El Centro de Salud Nuestra Señora del Carmen en el municipio de La Tola, Nariño, atiende a una población en zonas rurales dispersas. Esta plataforma web digitaliza el proceso de agendamiento y administración de citas médicas, mitigando desplazamientos innecesarios, filas y tiempos de espera prolongados.

---

## 🚀 Funcionalidades Principales

### 👤 Módulo del Paciente
- **Agendamiento guiado en 4 pasos:** Selección de profesional, selección de fecha, elección de turno disponible y confirmación.
- **Filtro de disponibilidad en tiempo real:** Muestra únicamente horarios hábiles y turnos libres evitando duplicidades.
- **Confirmación con Recordatorio WhatsApp:** Generación de comprobante oficial con enlace directo para enviar recordatorio por WhatsApp o imprimir.
- **Mis Citas:** Consulta de historial, estado (programada, atendida, inasistencia, cancelada), reprogramación y cancelación.

### 🩺 Módulo Médico
- **Agenda diaria:** Consulta de citas programadas para el día.
- **Registro de atención:** Marcado de pacientes atendidos con registro de consulta.

### ⚙️ Módulo Administrativo y Asistente
- **Recepción en Sede Física:** Búsqueda rápida por documento del paciente para confirmar presencia en sala de espera.
- **Gestión de Médicos y Horarios:** Creación y administración de turnos disponibles de lunes a sábado.
- **Métricas y KPIs en tiempo real:** Tasa de inasistencia, volumen total, citas atendidas y canceladas.
- **Exportación de Reportes:** Descarga de reportes en **Excel (.CSV)** y generación de informes oficiales membretados para **PDF/Impresión**.

---

## 🛠️ Arquitectura Tecnológica

- **Frontend:** HTML5 semántico, CSS3 Vanilla (diseño adaptativo / responsive), JavaScript ES6+.
- **Backend:** Node.js con Express.js (Arquitectura modular de 3 capas y API REST).
- **Persistencia de Datos:** Compatible con MySQL / MariaDB (script `database.sql`) con motor de almacenamiento integrado para ejecución inmediata sin dependencias locales.
- **Seguridad:** JSON Web Tokens (JWT) para control de acceso y autorización por roles.

---

## 💻 Instalación y Ejecución Local

### Prerrequisitos
- [Node.js](https://nodejs.org/) (versión 18 o superior)

### Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd citas-medicas-master
   ```

2. **Instalar dependencias del Backend:**
   ```bash
   cd Backend
   npm install
   ```

3. **Iniciar el servidor:**
   ```bash
   npm start
   ```

4. **Acceder a la aplicación:**
   Abre tu navegador web e ingresa a:
   ```
   http://localhost:3000
   ```

---

## 👥 Perfiles de Prueba Disponibles

El sistema cuenta con tarjetas de acceso rápido sin contraseñas para pruebas ágiles:
- **Paciente:** Acceso a agendamiento y consulta de citas.
- **Médico:** Acceso a agenda de consultas.
- **Administrador:** Acceso al panel de control, recepción física y reportes.

---

## 📜 Licencia

Proyecto académico desarrollado para la Institución Universitaria Antonio José Camacho y el Centro de Salud Nuestra Señora del Carmen de La Tola Nariño.
