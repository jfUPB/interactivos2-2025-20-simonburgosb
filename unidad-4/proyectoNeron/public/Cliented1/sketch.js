const socket = io();
let volHistory = [];
let estadoGlobal = 1;
let currentVolume = 0.5;
let ultimoEnvio = 0;
const INTERVALO_MINIMO = 2000;

// Array de palabras para estado 3
const palabras = [
    "muerte", "faz", "vivir", "llorar",
    "peso", "nadie", "nada","todo"
];

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // Volume slider setup
    const volumeSlider = document.getElementById('volumeSlider');
    volumeSlider.addEventListener('input', function() {
        currentVolume = this.value / 100;
        document.getElementById('volumeLevel').textContent = currentVolume.toFixed(2);
        volHistory.push(currentVolume);
        if (volHistory.length > 30) volHistory.shift();
    });

    socket.on('cambiarEstadoGlobal', (estado) => {
        estadoGlobal = estado;
        document.body.setAttribute('data-estado', estado);
        document.getElementById('estadoActual').textContent = estado;
        console.log('🔄 Global state updated:', estado);
    });
}

function draw() {
    background(0, 40);

    let mouseXNormalized = map(mouseX, 0, width, 0, 1);
    let mouseYNormalized = map(mouseY, 0, height, 0, 1);
    
    document.getElementById('mouseX').textContent = mouseXNormalized.toFixed(2);
    document.getElementById('mouseY').textContent = mouseYNormalized.toFixed(2);
    
    switch(estadoGlobal) {
        case 1:
            handleEstado1(mouseXNormalized, mouseYNormalized);
            break;
        case 2:
            handleEstado2(mouseXNormalized, mouseYNormalized);
            break;
        case 3:
            handleEstado3(mouseXNormalized, mouseYNormalized);
            break;
    }
}

function handleEstado1(mouseXNormalized, mouseYNormalized) {
    let t = millis() * 0.003;
    let scale = 0.8 + 0.2 * sin(t);
    
    const datosEstado1 = {
        clockValue: t,
        scale: scale,
        mousePosition: {
            x: mouseXNormalized,
            y: mouseYNormalized
        },
        trigger: dist(mouseX, mouseY, width/2, height/2) < 100
    };
    
    socket.emit('datoDesktop', datosEstado1);
    
    // Visualización estado 1
    push();
    translate(width/2, height/2);
    noFill();
    stroke(255);
    circle(0, 0, 200 * scale);
    pop();
}

function handleEstado2(mouseXNormalized, mouseYNormalized) {
    const datosEstado2 = {
        tipo: 'volumenManual',
        volumen: currentVolume,
        mouseX: mouseXNormalized,
        mouseY: mouseYNormalized,
        timestamp: Date.now()
    };
    
    socket.emit('datoDesktop', datosEstado2);
    drawVolumeVisualization();
}

function handleEstado3(mouseXNormalized, mouseYNormalized) {
    const ahora = Date.now();
    
    if (ahora - ultimoEnvio > INTERVALO_MINIMO && random() < 0.1) {
        const palabraAleatoria = palabras[floor(random(palabras.length))];
        
        const datosEstado3 = {
            tipo: 'palabra',
            texto: palabraAleatoria,
            posicion: {
                x: mouseXNormalized,
                y: mouseYNormalized
            },
            timestamp: ahora
        };
        
        socket.emit('datoDesktop', datosEstado3);
        console.log('📝 Palabra enviada:', datosEstado3);
        
        ultimoEnvio = ahora;
        drawWordEffect(palabraAleatoria, mouseX, mouseY);
    }
}

function drawVolumeVisualization() {
    stroke(0, 255, 0);
    strokeWeight(2);
    noFill();
    beginShape();
    for(let i = 0; i < volHistory.length; i++) {
        let x = map(i, 0, volHistory.length-1, 0, width);
        let y = map(volHistory[i], 0, 1, height, 0);
        vertex(x, y);
    }
    endShape();
}

function drawWordEffect(palabra, x, y) {
    push();
    fill(0, 255, 0, 200);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(32);
    text(palabra, x, y);
    pop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}