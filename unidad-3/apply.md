# Unidad 3


## 🛠 Fase: Apply

### codigo de control remoto
``` js
const socket = io();
let currentState = 0;
let lastDataMobile = null;
let lastDataDesktop = null;

// Conexión inicial
socket.on('connect', () => {
    console.log('Control Remoto conectado');
});

// Recibir datos de ambos clientes
socket.on('message', (data) => {
    // Procesar datos de mobile
    if (data.type === 'control') {
        lastDataMobile = data;
        console.log('Datos recibidos de mobile:', data);
    }
    // Procesar datos de desktop
    if (data.value === 'test from pc') {
        lastDataDesktop = data;
        console.log('Datos recibidos de desktop:', data);
    }
});

// Cambiar estado y reemitir datos cada 5 segundos
setInterval(() => {
    currentState = (currentState + 1) % 3;
    
    // Crear paquete de datos combinado
    const combinedData = {
        state: currentState,
        mobileSensor: lastDataMobile,
        desktopInput: lastDataDesktop,
        timestamp: Date.now()
    };

    // Reemitir datos combinados
    socket.emit('message', combinedData);
    console.log('Estado actual:', currentState);
    console.log('Datos reenviados:', combinedData);
}, 5000);

```

### codigo de visuales actualizado
``` js
const socket = io();
let currentState = 0;
let circleSize = 50;
let circleColor;

function setup() {
    createCanvas(800, 600);
    circleColor = color(255, 0, 0);
}

function draw() {
    background(51);
    
    // Visualización según el estado actual
    switch(currentState) {
        case 0: // Estado inicial
            drawState0();
            break;
        case 1: // Estado intermedio
            drawState1();
            break;
        case 2: // Estado final
            drawState2();
            break;
    }
}

function drawState0() {
    fill(circleColor);
    textSize(20);
    text("Estado 0: Datos Mobile", 20, 30);
    ellipse(width/2, height/2, circleSize, circleSize);
}

function drawState1() {
    fill(circleColor);
    textSize(20);
    text("Estado 1: Datos Desktop", 20, 30);
    rect(width/2 - circleSize/2, height/2 - circleSize/2, circleSize, circleSize);
}

function drawState2() {
    fill(circleColor);
    textSize(20);
    text("Estado 2: Datos Combinados", 20, 30);
    triangle(width/2, height/2 - circleSize, 
            width/2 - circleSize, height/2 + circleSize,
            width/2 + circleSize, height/2 + circleSize);
}

socket.on('connect', () => {
    console.log('Visuales conectadas');
});

socket.on('message', (data) => {
    console.log('Datos recibidos en visuales:', data);
    
    // Actualizar estado y parámetros visuales
    if (data.state !== undefined) {
        currentState = data.state;
    }

    // Procesar datos de mobile
    if (data.mobileSensor) {
        // Ajustar tamaño según coordenadas
        circleSize = map(data.mobileSensor.x, 0, 100, 20, 100);
    }

    // Procesar datos de desktop
    if (data.desktopInput) {
        // Cambiar color
        circleColor = color(random(255), random(255), random(255));
    }
});

socket.on('disconnect', () => {
    console.log('Visuales desconectadas');
});
```
[https://youtube.com/shorts/87VHL-nuadc?si=WLHoBngIaBzvlo8c] 
