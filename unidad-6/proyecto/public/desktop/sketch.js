const socket = io();
let estadoGlobal = 1;

// Variables para el estado 2
let lastKeyPressed = '';
let keyPressTime = 0;
const KEY_TIMEOUT = 1000;

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // Configuración inicial del estado
    document.body.setAttribute('data-estado', estadoGlobal);
    
    socket.on('cambiarEstadoGlobal', (estado) => {
        estadoGlobal = estado;
        document.getElementById('estadoActual').textContent = estado;
        document.body.setAttribute('data-estado', estado);
        console.log('🔄 Global state updated:', estado);
    });
}

function draw() {
    background(0, 40);

    if (estadoGlobal === 1) {
        handleEstado1();
    } else if (estadoGlobal === 2) {
        handleEstado2();
    }
}

function handleEstado1() {
    let mouseXNormalized = map(mouseX, 0, width, 0, 1);
    let mouseYNormalized = map(mouseY, 0, height, 0, 1);
    
    document.getElementById('mouseX').textContent = mouseXNormalized.toFixed(2);
    document.getElementById('mouseY').textContent = mouseYNormalized.toFixed(2);
    
    const datosEstado1 = {
        mousePosition: {
            x: mouseXNormalized,
            y: mouseYNormalized
        }
    };
    
    socket.emit('datoDesktop', datosEstado1);
    
    // Visualización del mouse
    push();
    translate(width/2, height/2);
    noFill();
    stroke(0, 255, 0);
    strokeWeight(2);
    circle(mouseX - width/2, mouseY - height/2, 20);
    pop();
}

function handleEstado2() {
    // Visualización de tecla en canvas
    if (millis() - keyPressTime < KEY_TIMEOUT && lastKeyPressed) {
        push();
        textSize(32);
        textAlign(CENTER, CENTER);
        fill(0, 255, 0);
        noStroke();
        text(lastKeyPressed, width/2, height/2);
        pop();
    }
}

function keyPressed() {
    if (estadoGlobal === 2) {
        lastKeyPressed = key;
        keyPressTime = millis();
        
        // Actualizar interfaz
        const keyDisplay = document.getElementById('lastKey');
        const keyCodeDisplay = document.getElementById('keyCode');
        const keyTimeDisplay = document.getElementById('keyTime');
        
        keyDisplay.textContent = key;
        keyCodeDisplay.textContent = keyCode;
        keyTimeDisplay.textContent = new Date().toLocaleTimeString();
        
        // Animación
        keyDisplay.classList.remove('key-press-animation');
        void keyDisplay.offsetWidth; // Trigger reflow
        keyDisplay.classList.add('key-press-animation');
        
        const datosEstado2 = {
            tipo: 'tecla',
            tecla: key,
            keyCode: keyCode,
            timestamp: Date.now()
        };
        
        socket.emit('datoDesktop', datosEstado2);
        console.log('Tecla enviada:', datosEstado2);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Manejo de conexión
socket.on('connect', () => {
    console.log('✅ Conectado al servidor');
});

socket.on('disconnect', () => {
    console.log('❌ Desconectado del servidor');
});