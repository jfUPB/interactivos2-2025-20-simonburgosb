const socket = io();
let estadoGlobal = 1;
let mic;
let micLevel = 0;
let lastSendTime = 0;
const SEND_INTERVAL = 100; // Enviar cada 100ms

// Variables Estado 2
const amplitudSlider = document.getElementById('amplitudSlider');
let lastAmplitudSend = 0;

// Variables Estado 3
const alphaSlider = document.getElementById('alphaSlider');
let lastAlphaSend = 0;

function setup() {
    createCanvas(200, 100);
    
    userStartAudio().then(() => {
        mic = new p5.AudioIn();
        mic.start();
    }).catch(error => {
        console.error('Error iniciando audio:', error);
    });

    setupEventListeners();
    document.body.setAttribute('data-estado', estadoGlobal);
}

function setupEventListeners() {
    // Estado 2: Slider de amplitud
    if (amplitudSlider) {
        amplitudSlider.addEventListener('input', function(e) {
            document.getElementById('valorAmplitud').textContent = e.target.value;
            
            const now = Date.now();
            if (now - lastAmplitudSend > SEND_INTERVAL) {
                const datos = {
                    tipo: 'amplitud',
                    valor: parseInt(e.target.value),
                    timestamp: now
                };
                
                socket.emit('datoMovil2', datos);
                lastAmplitudSend = now;
            }
        });
    }

    // Estado 3: Slider de alpha
    if (alphaSlider) {
        alphaSlider.addEventListener('input', function(e) {
            document.getElementById('valorAlpha').textContent = e.target.value;
            
            const now = Date.now();
            if (now - lastAlphaSend > SEND_INTERVAL) {
                const datos = {
                    tipo: 'alpha',
                    valor: parseInt(e.target.value),
                    timestamp: now
                };
                
                socket.emit('datoMovil2', datos);
                document.getElementById('lastAlphaTime').textContent = new Date().toLocaleTimeString();
                lastAlphaSend = now;
            }
        });
    }
}

function draw() {
    if (estadoGlobal === 1 && mic) {
        micLevel = mic.getLevel();
        
        const now = Date.now();
        if (now - lastSendTime > SEND_INTERVAL) {
            const datos = {
                tipo: 'microfono',
                nivel: micLevel,
                timestamp: now
            };
            
            socket.emit('datoMovil2', datos);
            
            document.getElementById('nivelMicrofono').textContent = micLevel.toFixed(3);
            document.getElementById('lastSentTime').textContent = new Date().toLocaleTimeString();
            
            lastSendTime = now;
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
    
    // Reset valores al cambiar estado
    if (estado === 2) {
        document.getElementById('valorAmplitud').textContent = amplitudSlider.value;
    } else if (estado === 3) {
        document.getElementById('valorAlpha').textContent = alphaSlider.value;
    }
    
    console.log('Estado global actualizado:', estado);
});

socket.on('connect', () => {
    console.log('Conectado al servidor');
});

socket.on('disconnect', () => {
    console.log('Desconectado del servidor');
});