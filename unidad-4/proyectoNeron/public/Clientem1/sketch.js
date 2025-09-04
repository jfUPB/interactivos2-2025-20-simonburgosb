const socket = io();
let accelX, accelY, accelZ;
let lastImpact = 0;
let estadoGlobal = 1;
const IMPACT_THRESHOLD = 15;
const MOVEMENT_THRESHOLD = 5;

// Solicitar permisos al inicio
async function requestMotionPermission() {
    if (typeof DeviceMotionEvent !== 'undefined' && 
        typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
            const permissionState = await DeviceMotionEvent.requestPermission();
            if (permissionState === 'granted') {
                initializeMotionListeners();
                updatePermissionStatus('✅ Permisos concedidos');
            } else {
                updatePermissionStatus('❌ Permisos denegados');
            }
        } catch (error) {
            console.error('Error al solicitar permisos:', error);
            updatePermissionStatus('❌ Error al solicitar permisos');
        }
    } else {
        initializeMotionListeners();
        updatePermissionStatus('✅ Permisos no requeridos');
    }
}

function updatePermissionStatus(message) {
    const statusText = document.querySelector('.permission-status .status-text');
    if (statusText) {
        statusText.textContent = message;
    }
}

// Inicializar listeners después de obtener permisos
function initializeMotionListeners() {
    window.addEventListener('devicemotion', handleMotionEvent, false);
}

// Manejar eventos de movimiento
function handleMotionEvent(event) {
    if (estadoGlobal === 2) {
        // Usar accelerationIncludingGravity para impactos
        const acceleration = event.accelerationIncludingGravity;
        if (!acceleration) return;

        accelX = acceleration.x || 0;
        accelY = acceleration.y || 0;
        accelZ = acceleration.z || 0;

        // Actualizar valores en la UI
        document.getElementById('accelX').textContent = accelX.toFixed(2);
        document.getElementById('accelY').textContent = accelY.toFixed(2);
        document.getElementById('accelZ').textContent = accelZ.toFixed(2);

        let impact = Math.sqrt(accelX * accelX + accelY * accelY + accelZ * accelZ);
        document.getElementById('currentImpact').textContent = impact.toFixed(2);
        
        // Actualizar indicador visual
        const indicator = document.getElementById('impactIndicator');
        if (indicator) {
            indicator.style.width = `${(impact / IMPACT_THRESHOLD) * 100}%`;
        }
        
        if (impact > IMPACT_THRESHOLD && Date.now() - lastImpact > 200) {
            socket.emit('datoMovil1', {
                tipo: 'impacto',
                fuerza: impact,
                aceleracion: {
                    x: accelX,
                    y: accelY,
                    z: accelZ
                },
                timestamp: Date.now()
            });
            lastImpact = Date.now();
            
            // Actualizar último tiempo de impacto
            document.getElementById('lastImpactTime').textContent = new Date().toLocaleTimeString();
            
            // Efecto visual en el círculo
            const circle = document.querySelector('.impact-circle');
            circle.classList.add('active');
            setTimeout(() => circle.classList.remove('active'), 500);
        }
    } 
    else if (estadoGlobal === 3) {
        const acceleration = event.acceleration;
        if (!acceleration) return;

        // Actualizar valores en la UI
        document.getElementById('movX').textContent = acceleration.x.toFixed(2);
        document.getElementById('movY').textContent = acceleration.y.toFixed(2);
        document.getElementById('movZ').textContent = acceleration.z.toFixed(2);

        const movement = Math.sqrt(
            Math.pow(acceleration.x || 0, 2) +
            Math.pow(acceleration.y || 0, 2) +
            Math.pow(acceleration.z || 0, 2)
        );
        
        document.getElementById('currentMovement').textContent = movement.toFixed(2);

        if (movement > MOVEMENT_THRESHOLD) {
            socket.emit('datoMovil1', {
                tipo: 'movimientoAmplio',
                magnitud: movement,
                direccion: {
                    x: acceleration.x || 0,
                    y: acceleration.y || 0,
                    z: acceleration.z || 0
                },
                timestamp: Date.now()
            });
            
            // Actualizar último tiempo de movimiento
            document.getElementById('lastMovementTime').textContent = new Date().toLocaleTimeString();
            
            // Efecto visual en el círculo
            const circle = document.querySelector('.movement-circle');
            if (circle) {
                circle.classList.add('active');
                setTimeout(() => circle.classList.remove('active'), 500);
            }
        }
    }
}

// Event listener for state changes
socket.on('cambiarEstadoGlobal', (estado) => {
    estadoGlobal = estado;
    document.getElementById('estadoActual').textContent = estado;
    
    document.querySelector('.estado1').classList.toggle('active', estado === 1);
    document.querySelector('.estado2').classList.toggle('active', estado === 2);
    document.querySelector('.estado3').classList.toggle('active', estado === 3);
    
    // Solicitar permisos cuando se cambia a estados que requieren movimiento
    if (estado === 2 || estado === 3) {
        requestMotionPermission();
    }
    
    console.log('Estado global actualizado:', estado);
});

// Estado 1: Control de sliders
const intensidadSlider = document.getElementById('intensidad');
const velocidadSlider = document.getElementById('velocidad');
const btnEnviar = document.getElementById('enviar');

intensidadSlider.addEventListener('input', function(e) {
    document.getElementById('valorIntensidad').textContent = e.target.value;
});

velocidadSlider.addEventListener('input', function(e) {
    document.getElementById('valorVelocidad').textContent = e.target.value;
});

btnEnviar.addEventListener('click', function() {
    const datos = {
        tipo: 'control',
        intensidad: parseInt(intensidadSlider.value),
        velocidad: parseInt(velocidadSlider.value),
        timestamp: Date.now()
    };
    
    socket.emit('datoMovil1', datos);
    document.getElementById('lastSentTime').textContent = new Date().toLocaleTimeString();
    
    // Feedback visual del botón
    btnEnviar.style.backgroundColor = '#00a0cc';
    setTimeout(() => btnEnviar.style.backgroundColor = '', 200);
});

// Inicialización
document.addEventListener('DOMContentLoaded', requestMotionPermission);