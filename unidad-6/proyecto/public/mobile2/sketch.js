const socket = io();
let estadoGlobal = 1;
let mic;
let micLevel = 0;
let lastSendTime = 0;
const SEND_INTERVAL = 100; // Enviar cada 100ms

// Variables Estado 2
const amplitudSlider = document.getElementById('amplitudSlider');
let lastAmplitudSend = 0;

function setup() {
    createCanvas(200, 100);
    
    userStartAudio().then(() => {
        mic = new p5.AudioIn();
        mic.start();
    });

    setupEventListeners();
    document.body.setAttribute('data-estado', estadoGlobal);
}

function setupEventListeners() {
    // Estado 2: Slider de amplitud
    amplitudSlider.addEventListener('input', function(e) {
        document.getElementById('valorAmplitud').textContent = e.target.value;
        
        const now = Date.now();
        if (now - lastAmplitudSend > SEND_INTERVAL) {
            const datos = {
                dispositivo: 'movil2',
                tipo: 'amplitud',
                valor: parseInt(e.target.value),
                timestamp: now
            };
            
            socket.emit('datoMovil2', datos);
            document.getElementById('lastAmplitudTime').textContent = new Date().toLocaleTimeString();
            lastAmplitudSend = now;
        }
    });
}

function draw() {
    background(0);
    
    if (mic && estadoGlobal === 1) {
        // Estado 1: Visualización del micrófono
        micLevel = mic.getLevel();
        
        let barHeight = map(micLevel, 0, 1, 0, height);
        fill(255);
        rect(0, height - barHeight, width, barHeight);
        
        document.getElementById('micLevel').textContent = micLevel.toFixed(3);
        
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

socket.on('cambiarEstadoGlobal', (estado) => {
    estadoGlobal = estado;
    document.getElementById('estadoActual').textContent = estado;
    document.body.setAttribute('data-estado', estado);
    
    if (estado !== 1 && mic) {
        mic.stop();
    } else if (estado === 1 && mic) {
        mic.start();
    }
    
    console.log('Estado global actualizado:', estado);
});

socket.on('connect', () => {
    console.log('Conectado al servidor');
});

socket.on('disconnect', () => {
    console.log('Desconectado del servidor');
});