const socket = io();
let estadoGlobal = 1;

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    socket.on('cambiarEstadoGlobal', (estado) => {
        estadoGlobal = estado;
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
    
    const datosEstado1 = {
        mousePosition: {
            x: mouseXNormalized,
            y: mouseYNormalized
        }
    };
    
    socket.emit('datoDesktop', datosEstado1);
    
    // Visualización simple de la posición del mouse
    push();
    translate(width/2, height/2);
    noFill();
    stroke(255);
    circle(mouseX - width/2, mouseY - height/2, 20);
    pop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}