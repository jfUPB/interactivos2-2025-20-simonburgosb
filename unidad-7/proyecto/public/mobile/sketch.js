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

// Variables Estado 3 - Movimiento
let isListeningMovement = false;
let lastMovementData = { x: 0, y: 0, z: 0 };
let lastMovementSend = 0;
const MOVEMENT_INTERVAL = 50;

// Estado 1: Control Manual
if (intensidadSlider && velocidadSlider && btnEnviar) {
    intensidadSlider.addEventListener('input', function(e) {
        document.getElementById('valorIntensidad').textContent = e.target.value;
    });

    velocidadSlider.addEventListener('input', function(e) {
        document.getElementById('valorVelocidad').textContent = e.target.value;
    });

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
}

// Estado 2: Detección de impactos
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
    if (estadoGlobal === 2 && isListeningImpacts) {
        handleImpact(event);
    } else if (estadoGlobal === 3 && isListeningMovement) {
        handleMovement(event);
    }
}

function handleImpact(event) {
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
        
        document.getElementById('impactForce').textContent = totalAcceleration.toFixed(2);
        document.getElementById('lastImpactTime').textContent = new Date().toLocaleTimeString();
        
        const feedback = document.getElementById('impactFeedback');
        if (feedback) {
            feedback.classList.remove('impact-active');
            void feedback.offsetWidth;
            feedback.classList.add('impact-active');
        }
    }
}

// Estado 3: Movimiento
function handleMovement(event) {
    const now = Date.now();
    if (now - lastMovementSend < MOVEMENT_INTERVAL) return;

    const acceleration = event.accelerationIncludingGravity;
    
    const movementData = {
        tipo: 'movimiento',
        x: acceleration.x ? Number(acceleration.x.toFixed(2)) : 0,
        y: acceleration.y ? Number(acceleration.y.toFixed(2)) : 0,
        z: acceleration.z ? Number(acceleration.z.toFixed(2)) : 0,
        timestamp: now
    };

    if (isSignificantChange(movementData, lastMovementData)) {
        socket.emit('datoMovil1', movementData);
        lastMovementData = movementData;
        lastMovementSend = now;
        
        updateMovementUI(movementData);
    }
}

function isSignificantChange(current, last) {
    const threshold = 0.5;
    return Math.abs(current.x - last.x) > threshold ||
           Math.abs(current.y - last.y) > threshold ||
           Math.abs(current.z - last.z) > threshold;
}

function updateMovementUI(data) {
    const display = document.getElementById('movementValues');
    if (display) {
        display.textContent = `X: ${data.x.toFixed(1)} | Y: ${data.y.toFixed(1)} | Z: ${data.z.toFixed(1)}`;
    }
    document.getElementById('lastMovementTime').textContent = new Date().toLocaleTimeString();
}

// Manejo de estados
socket.on('cambiarEstadoGlobal', (estado) => {
    estadoGlobal = estado;
    document.getElementById('estadoActual').textContent = estado;
    document.body.setAttribute('data-estado', estado);
    
    isListeningImpacts = false;
    isListeningMovement = false;
    
    if (estado === 2) {
        isListeningImpacts = true;
        initImpactDetection();
    } else if (estado === 3) {
        isListeningMovement = true;
        initImpactDetection();
    }
});

// Inicializar estado
document.addEventListener('DOMContentLoaded', () => {
    document.body.setAttribute('data-estado', estadoGlobal);
});