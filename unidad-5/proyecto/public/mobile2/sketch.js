const socket = io();
let estadoGlobal = 1;
let mic;
let micLevel = 0;
let lastSendTime = 0;
const SEND_INTERVAL = 100; // Enviar cada 100ms

function setup() {
    // Crear un canvas pequeño para visualización
    createCanvas(200, 100);
    
    // Inicializar micrófono
    userStartAudio().then(() => {
        mic = new p5.AudioIn();
        mic.start();
    });
}

function draw() {
    background(0);
    
    if (mic && estadoGlobal === 1) {
        // Obtener nivel del micrófono
        micLevel = mic.getLevel();
        
        // Visualizar nivel
        let barHeight = map(micLevel, 0, 1, 0, height);
        fill(255);
        rect(0, height - barHeight, width, barHeight);
        
        // Actualizar display
        document.getElementById('micLevel').textContent = micLevel.toFixed(3);
        
        // Enviar datos cada SEND_INTERVAL ms
        if (millis() - lastSendTime > SEND_INTERVAL) {
            const datos = {
                dispositivo: 'movil2',
                tipo: 'microfono',
                nivel: micLevel,
                timestamp: Date.now()
            };
            
            socket.emit('datoMovil2', datos);
            document.getElementById('lastSentTime').textContent = new Date().toLocaleTimeString();
            lastSendTime = millis();
        }
    }
}

// Manejador de cambio de estado
socket.on('cambiarEstadoGlobal', (estado) => {
    estadoGlobal = estado;
    document.getElementById('estadoActual').textContent = estado;
    console.log('Estado global actualizado:', estado);
    
    // Si salimos del estado 1, detener el micrófono
    if (estado !== 1 && mic) {
        mic.stop();
    }
    // Si entramos al estado 1, iniciar el micrófono
    else if (estado === 1 && mic) {
        mic.start();
    }
});

// Manejadores de conexión
socket.on('connect', () => {
    console.log('Conectado al servidor');
});

socket.on('disconnect', () => {
    console.log('Desconectado del servidor');
});