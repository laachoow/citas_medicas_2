const form = document.getElementById('form-login');
const btnLogin = document.getElementById('btn-login');
const btnText = document.getElementById('btn-text');
const alerta = document.getElementById('alerta');
const alertaTexto = document.getElementById('alerta-texto');
const roleCards = document.querySelectorAll('.role-card');
const quickButtons = document.querySelectorAll('.btn-quick');

let rolSeleccionado = 'paciente';

// Nombres para mostrar en el botón
const nombresRol = {
    paciente: 'Paciente',
    medico: 'Médico',
    administrador: 'Administrador'
};

// Manejo de selección de rol con las tarjetas
roleCards.forEach(card => {
    card.addEventListener('click', () => {
        roleCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        rolSeleccionado = card.dataset.rol;
        btnText.textContent = `Ingresar como ${nombresRol[rolSeleccionado]}`;
        ocultarAlerta();
    });
});

// Botones de acceso rápido con un clic
quickButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const rol = btn.dataset.quick;
        iniciarSesion(rol, '');
    });
});

function mostrarAlerta(mensaje) {
    alerta.className = 'alert alert-error visible';
    alertaTexto.textContent = mensaje;
}

function ocultarAlerta() {
    alerta.classList.remove('visible');
}

async function iniciarSesion(rol, correo) {
    btnLogin.classList.add('loading');
    btnLogin.disabled = true;
    ocultarAlerta();

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rol, correo })
        });

        const data = await response.json();

        if (!response.ok) {
            mostrarAlerta(data.error || 'Error al iniciar sesión. Intenta de nuevo.');
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));

        const userRol = data.usuario.rol;
        if (userRol === 'administrador') {
            window.location.href = '/dashboard?rol=admin';
        } else if (userRol === 'medico') {
            window.location.href = '/dashboard?rol=medico';
        } else {
            window.location.href = '/dashboard?rol=paciente';
        }

    } catch (error) {
        console.error('Error de red:', error);
        mostrarAlerta('No se pudo conectar con el servidor.');
    } finally {
        btnLogin.classList.remove('loading');
        btnLogin.disabled = false;
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const correo = document.getElementById('correo').value.trim();
    await iniciarSesion(rolSeleccionado, correo);
});