const socket = io();
let estadoGlobal = 1;

// Variables Estado 1
const intensidadSlider = document.getElementById('intensidad');
const velocidadSlider = document.getElementById('velocidad');
const btnEnviar = document.getElementById('enviar');

// Variables Estado 2 - Detección de impactos
let isListeningImpacts = false;
let lastImpact = 0;
const IMPACT_THRESHOLD = 15;
const MIN_IMPACT_INTERVAL = 200;

// Actualizar valores en tiempo real - Estado 1
intensidadSlider.addEventListener('input', function(e) {
    document.getElementById('valorIntensidad').textContent = e.target.value;
});

velocidadSlider.addEventListener('input', function(e) {
    document.getElementById('valorVelocidad').textContent = e.target.value;
});

// Enviar datos al servidor - Estado 1
btnEnviar.addEventListener('click', function() {
    if (estadoGlobal === 1) {
        const datos = {
            tipo: 'control',
            intensidad: parseInt(intensidadSlider.value),
            velocidad: parseInt(velocidadSlider.value),
            timestamp: Date.now()
        };
        
        socket.emit('datoMovil1', datos);
        document.getElementById('lastSentTime').textContent = new Date().toLocaleTimeString();
    }
});

// Funciones Estado 2 - Detección de impactos
function initImpactDetection() {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(response => {
                if (response == 'granted') {
                    window.addEventListener('devicemotion', handleMotion);
                    console.log('Permisos de movimiento concedidos');
                }
            })
            .catch(error => {
                console.error('Error al solicitar permisos:', error);
            });
    } else {
        window.addEventListener('devicemotion', handleMotion);
        console.log('Detector de movimiento iniciado');
    }
}

function handleMotion(event) {
    if (estadoGlobal !== 2 || !isListeningImpacts) return;

    const acceleration = event.acceleration;
    const totalAcceleration = Math.sqrt(
        Math.pow(acceleration.x || 0, 2) +
        Math.pow(acceleration.y || 0, 2) +
        Math.pow(acceleration.z || 0, 2)
    );

    const now = Date.now();
    if (totalAcceleration > IMPACT_THRESHOLD && now - lastImpact > MIN_IMPACT_INTERVAL) {
        lastImpact = now;
        
        const impactData = {
            tipo: 'impacto',
            fuerza: totalAcceleration,
            timestamp: now
        };

        socket.emit('datoMovil1', impactData);
        
        // Actualizar interfaz
        document.getElementById('impactForce').textContent = totalAcceleration.toFixed(2);
        document.getElementById('lastImpactTime').textContent = new Date().toLocaleTimeString();
        
        // Feedback visual
        const feedback = document.getElementById('impactFeedback');
        if (feedback) {
            feedback.classList.remove('impact-active');
            void feedback.offsetWidth; // Trigger reflow
            feedback.classList.add('impact-active');
        }
        
        console.log('Impacto detectado:', impactData);
    }
}

// Manejo de estados
socket.on('cambiarEstadoGlobal', (estado) => {
    estadoGlobal = estado;
    document.getElementById('estadoActual').textContent = estado;
    document.body.setAttribute('data-estado', estado);
    
    // Control de estado 2
    if (estado === 2 && !isListeningImpacts) {
        isListeningImpacts = true;
        initImpactDetection();
    } else {
        isListeningImpacts = false;
    }
    
    console.log('Estado global actualizado:', estado);
});

// Manejo de conexión
socket.on('connect', () => {
    console.log('Conectado al servidor');
});

socket.on('disconnect', () => {
    console.log('Desconectado del servidor');
});