const form = document.getElementById('form-registro');
const btnRegistro = document.getElementById('btn-registro');
const alerta = document.getElementById('alerta');
const alertaTexto = document.getElementById('alerta-texto');
const alertaOk = document.getElementById('alerta-ok');
const alertaOkTexto = document.getElementById('alerta-ok-texto');

function mostrarError(mensaje) {
    alerta.className = 'alert alert-error visible';
    alertaTexto.textContent = mensaje;
    alerta.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function mostrarExito(mensaje) {
    alertaOk.className = 'alert alert-success visible';
    alertaOkTexto.textContent = mensaje;
    alertaOk.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function ocultarAlertas() {
    alerta.classList.remove('visible');
    alertaOk.classList.remove('visible');
}

function marcarError(id, mensaje) {
    const el = document.getElementById(id);
    const err = document.getElementById(`error-${id}`);
    if (el) el.classList.add('error');
    if (err) { err.textContent = mensaje; err.classList.add('visible'); }
}

function limpiarError(id) {
    const el = document.getElementById(id);
    const err = document.getElementById(`error-${id}`);
    if (el) el.classList.remove('error');
    if (err) err.classList.remove('visible');
}

['nombre','apellido','tipo_documento','numero_documento','correo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => { limpiarError(id); ocultarAlertas(); });
});

function validar() {
    let valido = true;

    const campos = {
        nombre: 'El nombre es obligatorio.',
        apellido: 'El apellido es obligatorio.',
        tipo_documento: 'Selecciona un tipo de documento.',
        numero_documento: 'El número de documento es obligatorio.',
        correo: 'El correo electrónico es obligatorio.',
    };

    Object.entries(campos).forEach(([id, msg]) => {
        const val = document.getElementById(id)?.value.trim();
        if (!val) { marcarError(id, msg); valido = false; }
    });

    const correo = document.getElementById('correo').value.trim();
    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        marcarError('correo', 'Ingresa un correo electrónico válido.');
        valido = false;
    }

    if (!document.getElementById('acepta_terminos').checked) {
        const err = document.getElementById('error-terminos');
        err.textContent = 'Debes aceptar el tratamiento de datos para continuar.';
        err.classList.add('visible');
        valido = false;
    } else {
        document.getElementById('error-terminos').classList.remove('visible');
    }

    return valido;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    ocultarAlertas();
    ['nombre','apellido','tipo_documento','numero_documento','correo'].forEach(limpiarError);

    if (!validar()) return;

    const rol = document.getElementById('rol').value;
    const datos = {
        rol,
        nombre: document.getElementById('nombre').value.trim(),
        apellido: document.getElementById('apellido').value.trim(),
        tipo_documento: document.getElementById('tipo_documento').value,
        numero_documento: document.getElementById('numero_documento').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        correo: document.getElementById('correo').value.trim(),
    };

    btnRegistro.classList.add('loading');
    btnRegistro.disabled = true;

    try {
        const response = await fetch('/api/auth/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const data = await response.json();

        if (!response.ok) {
            mostrarError(data.error || 'Error al registrarse. Intenta de nuevo.');
            return;
        }

        mostrarExito(`¡Cuenta creada con éxito con rol de ${rol}! Ingresando al sistema...`);

        // Iniciar sesión automáticamente
        const loginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo: datos.correo, rol })
        });
        const loginData = await loginRes.json();

        if (loginRes.ok && loginData.token) {
            localStorage.setItem('token', loginData.token);
            localStorage.setItem('usuario', JSON.stringify(loginData.usuario));

            setTimeout(() => {
                if (rol === 'administrador') {
                    window.location.href = '/dashboard?rol=admin';
                } else if (rol === 'medico') {
                    window.location.href = '/dashboard?rol=medico';
                } else {
                    window.location.href = '/dashboard?rol=paciente';
                }
            }, 1200);
        } else {
            setTimeout(() => {
                window.location.href = '/';
            }, 1800);
        }

    } catch (error) {
        console.error('Error de red:', error);
        mostrarError('No se pudo conectar con el servidor.');
    } finally {
        btnRegistro.classList.remove('loading');
        btnRegistro.disabled = false;
    }
});