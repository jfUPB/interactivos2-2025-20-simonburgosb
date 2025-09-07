const socket = io();
let estadoGlobal = 1;

// Initialize UI elements
const brilloInput = document.getElementById('brillo');
const frecuenciaInput = document.getElementById('frecuencia');
const volumenInput = document.getElementById('volumen');
const valorBrillo = document.getElementById('valorBrillo');
const valorFrecuencia = document.getElementById('valorFrecuencia');
const valorVolumen = document.getElementById('valorVolumen');
const btnEnviar = document.getElementById('enviar');

// Estado 1: Control handlers
brilloInput.addEventListener('input', () => {
    const valor = brilloInput.value;
    valorBrillo.textContent = valor;
    console.log('Brillo actualizado:', valor);
});

frecuenciaInput.addEventListener('input', () => {
    const valor = frecuenciaInput.value;
    valorFrecuencia.textContent = valor;
    console.log('Frecuencia actualizada:', valor);
});

btnEnviar.addEventListener('click', () => {
    const datos = {
        dispositivo: 'movil2',
        tipo: 'ambiente',
        brillo: parseInt(brilloInput.value),
        frecuencia: parseInt(frecuenciaInput.value),
        timestamp: Date.now()
    };
    
    socket.emit('datoMovil2', datos);
    console.log('Datos enviados:', datos);
    
    const tiempo = new Date().toLocaleTimeString();
    document.getElementById('lastSentTime').textContent = tiempo;
    btnEnviar.classList.add('sending');
    setTimeout(() => btnEnviar.classList.remove('sending'), 500);
});

// Estado 2: Orientation handler
window.addEventListener('deviceorientation', (event) => {
    if (estadoGlobal !== 2) return;

    const beta = event.beta || 0;
    const gamma = event.gamma || 0;
    
    document.getElementById('rotationX').textContent = `${beta.toFixed(1)}°`;
    document.getElementById('rotationY').textContent = `${gamma.toFixed(1)}°`;
    
    const circle = document.querySelector('.orientation-circle');
    if (circle) {
        circle.style.transform = `rotate(${gamma}deg) translateY(${beta/2}px)`;
    }
    
    if (Date.now() % 100 < 50) {
        console.log('Orientación:', { beta, gamma });
    }
    
    socket.emit('datoMovil2', {
        dispositivo: 'movil2',
        tipo: 'orientacion',
        beta: beta,
        gamma: gamma,
        timestamp: Date.now()
    });
    
    document.getElementById('orientationUpdateTime').textContent = new Date().toLocaleTimeString();
});

// Estado 3: Volume Control
volumenInput.addEventListener('input', () => {
    const valor = volumenInput.value;
    valorVolumen.textContent = valor;
    
    // Update visual feedback
    document.getElementById('volumeLevel').style.width = `${valor}%`;
    
    // Send volume data
    const datos = {
        dispositivo: 'movil2',
        tipo: 'volumen',
        nivel: parseInt(valor),
        timestamp: Date.now()
    };
    
    socket.emit('datoMovil2', datos);
    console.log('Volumen enviado:', datos);
    
    // Update last sent time
    document.getElementById('lastVolumeTime').textContent = new Date().toLocaleTimeString();
});

// State change handler
socket.on('cambiarEstadoGlobal', (estado) => {
    console.log('Cambio de estado:', {
        anterior: estadoGlobal,
        nuevo: estado,
        tiempo: new Date().toLocaleTimeString()
    });
    
    estadoGlobal = estado;
    document.getElementById('estadoActual').textContent = estado;
    
    // Update active container
    document.querySelectorAll('.contenedor').forEach(cont => {
        cont.classList.remove('active');
    });
    document.querySelector(`.estado${estado}`).classList.add('active');
});

// Connection handlers
socket.on('connect', () => {
    console.log('Conectado al servidor');
    const status = document.getElementById('connectionStatus');
    status.textContent = 'Conectado';
    status.className = 'connected';
});

socket.on('disconnect', () => {
    console.log('Desconectado del servidor');
    const status = document.getElementById('connectionStatus');
    status.textContent = 'Desconectado';
    status.className = 'disconnected';
});

// Initialize values on load
document.addEventListener('DOMContentLoaded', () => {
    // Set initial values
    brilloInput.value = 50;
    frecuenciaInput.value = 10;
    volumenInput.value = 50;
    valorBrillo.textContent = brilloInput.value;
    valorFrecuencia.textContent = frecuenciaInput.value;
    valorVolumen.textContent = volumenInput.value;
    
    // Set initial volume level
    document.getElementById('volumeLevel').style.width = '50%';
    
    console.log('Aplicación inicializada');
});