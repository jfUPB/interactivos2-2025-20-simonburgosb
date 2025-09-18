const socket = io();
let estadoGlobal = 1;

const intensidadSlider = document.getElementById('intensidad');
const velocidadSlider = document.getElementById('velocidad');
const btnEnviar = document.getElementById('enviar');

// Actualizar valores en tiempo real
intensidadSlider.addEventListener('input', function(e) {
    document.getElementById('valorIntensidad').textContent = e.target.value;
});

velocidadSlider.addEventListener('input', function(e) {
    document.getElementById('valorVelocidad').textContent = e.target.value;
});

// Enviar datos al servidor
btnEnviar.addEventListener('click', function() {
    const datos = {
        tipo: 'control',
        intensidad: parseInt(intensidadSlider.value),
        velocidad: parseInt(velocidadSlider.value),
        timestamp: Date.now()
    };
    
    socket.emit('datoMovil1', datos);
    console.log('Datos enviados:', datos);
    document.getElementById('lastSentTime').textContent = new Date().toLocaleTimeString();
    
    // Feedback visual del botón
    btnEnviar.style.backgroundColor = '#00a0cc';
    setTimeout(() => btnEnviar.style.backgroundColor = '', 200);
});

// Manejo de cambios de estado
socket.on('cambiarEstadoGlobal', (estado) => {
    estadoGlobal = estado;
    document.getElementById('estadoActual').textContent = estado;
    console.log('Estado global actualizado:', estado);
});

// Manejo de conexión
socket.on('connect', () => {
    console.log('Conectado al servidor');
});

socket.on('disconnect', () => {
    console.log('Desconectado del servidor');
});