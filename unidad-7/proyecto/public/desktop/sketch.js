const socket = io();
let estadoGlobal = 1;

// Variables para el estado 2
let lastKeyPressed = '';
let keyPressTime = 0;
const KEY_TIMEOUT = 1000;

// Variables para el estado 3
let palabras = ['AMOR', 'PAZ', 'VIDA', 'LUZ', 'SOL', 'MAR', 'AIRE'];
let ultimoEnvio = 0;
const INTERVALO_MINIMO = 500;

// Variable para controlar la frecuencia de envío en estado 1
let lastMouseSend = 0;
const MOUSE_SEND_INTERVAL = 50;

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(RGB);
    
    // Configuración inicial del estado
    document.body.setAttribute('data-estado', estadoGlobal);
    
    // Asegurarse de que los controles estén visibles
    updateControls();
}

function draw() {
    background(0, 40);

    // Normalizar posición del mouse una vez
    let mouseXNormalized = constrain(map(mouseX, 0, width, 0, 1), 0, 1);
    let mouseYNormalized = constrain(map(mouseY, 0, height, 0, 1), 0, 1);

    switch(estadoGlobal) {
        case 1:
            handleEstado1(mouseXNormalized, mouseYNormalized);
            break;
        case 2:
            handleEstado2();
            break;
        case 3:
            handleEstado3(mouseXNormalized, mouseYNormalized);
            break;
    }
}

function handleEstado1(mouseXNormalized, mouseYNormalized) {
    // Limitar la frecuencia de envío
    const now = Date.now();
    if (now - lastMouseSend >= MOUSE_SEND_INTERVAL) {
        // Actualizar UI
        document.getElementById('mouseX').textContent = mouseXNormalized.toFixed(2);
        document.getElementById('mouseY').textContent = mouseYNormalized.toFixed(2);
        document.getElementById('lastSentTime').textContent = new Date().toLocaleTimeString();
        
        // Enviar datos
        const datosEstado1 = {
            tipo: 'mouse',
            mousePosition: {
                x: mouseXNormalized,
                y: mouseYNormalized
            },
            timestamp: now
        };
        socket.emit('datoDesktop', datosEstado1);
        lastMouseSend = now;
    }
    
    // Visualización
    push();
    noFill();
    stroke(255, 100, 255);
    strokeWeight(2);
    circle(mouseX, mouseY, 20);
    pop();
}

function handleEstado2() {
    if (millis() - keyPressTime < KEY_TIMEOUT && lastKeyPressed) {
        push();
        textSize(64);
        textAlign(CENTER, CENTER);
        fill(255, 255, 0);
        noStroke();
        text(lastKeyPressed, width/2, height/2);
        pop();
    }
}

function handleEstado3(mouseXNormalized, mouseYNormalized) {
    // Visualización constante
    push();
    noFill();
    stroke(0, 255, 0);
    strokeWeight(2);
    circle(mouseX, mouseY, 30);
    line(mouseX - 15, mouseY, mouseX + 15, mouseY);
    line(mouseX, mouseY - 15, mouseX, mouseY + 15);
    pop();

    // Manejo de click
    if (mouseIsPressed) {
        const ahora = Date.now();
        if (ahora - ultimoEnvio > INTERVALO_MINIMO) {
            const palabraAleatoria = palabras[floor(random(palabras.length))];
            
            // Actualizar UI
            document.getElementById('lastPalabra').textContent = palabraAleatoria;
            document.getElementById('palabraPos').textContent = 
                `x: ${mouseXNormalized.toFixed(2)}, y: ${mouseYNormalized.toFixed(2)}`;
            document.getElementById('palabraTime').textContent = new Date().toLocaleTimeString();
            
            // Enviar datos
            const datosEstado3 = {
                tipo: 'palabra',
                texto: palabraAleatoria,
                posicion: { x: mouseXNormalized, y: mouseYNormalized },
                timestamp: ahora
            };
            
            socket.emit('datoDesktop', datosEstado3);
            ultimoEnvio = ahora;

            // Animación
            const palabraDisplay = document.getElementById('lastPalabra');
            if (palabraDisplay) {
                palabraDisplay.classList.remove('palabra-nueva');
                void palabraDisplay.offsetWidth;
                palabraDisplay.classList.add('palabra-nueva');
            }
        }
    }
}

function keyPressed() {
    if (estadoGlobal === 2) {
        lastKeyPressed = key;
        keyPressTime = millis();
        
        // Actualizar UI
        document.getElementById('lastKey').textContent = key;
        document.getElementById('keyCode').textContent = keyCode;
        document.getElementById('keyTime').textContent = new Date().toLocaleTimeString();
        
        // Animación
        const keyDisplay = document.getElementById('lastKey');
        if (keyDisplay) {
            keyDisplay.classList.remove('key-nueva');
            void keyDisplay.offsetWidth;
            keyDisplay.classList.add('key-nueva');
        }
        
        // Enviar datos
        const datosEstado2 = {
            tipo: 'tecla',
            tecla: key,
            keyCode: keyCode,
            timestamp: Date.now()
        };
        
        socket.emit('datoDesktop', datosEstado2);
    }
}

function updateControls() {
    // Ocultar todos los controles
    document.querySelectorAll('.estado-controls').forEach(control => {
        control.style.display = 'none';
    });
    
    // Mostrar el control actual
    const currentControl = document.getElementById(`estado${estadoGlobal}Controls`);
    if (currentControl) {
        currentControl.style.display = 'block';
    }
    
    // Actualizar indicador de estado
    const estadoIndicator = document.getElementById('estadoActual');
    if (estadoIndicator) {
        estadoIndicator.textContent = estadoGlobal;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Manejo de estados y conexión
socket.on('cambiarEstadoGlobal', (estado) => {
    console.log('Cambio de estado recibido:', estado);
    estadoGlobal = estado;
    document.body.setAttribute('data-estado', estado);
    updateControls();
});

socket.on('connect', () => {
    console.log('Conectado al servidor');
});

socket.on('disconnect', () => {
    console.log('Desconectado del servidor');
});