const socket = io();

// Estado global actual y subestado
let estadoGlobal = 1;   
let subEstado = 1;      

// Parámetros modificables por inputs
let intensidad = 50;    
let brillo = 100;       
let velocidad = 1;      
let velocidadMobile1 = 1;
let frecuencia = 1;

// Variables para efectos
let grietas = [];
let sendero = [];
let particulas = [];
let palabrasFlotantes = [];

const palabras = [
    "luz", "vida", "alma", "paz",
    "amor", "ser", "uno", "todo"
];

function setup() {
    createCanvas(windowWidth, windowHeight);
    noStroke();
    colorMode(RGB, 255, 255, 255, 255);
    
    setupSocketListeners();
}

function draw() {
    background(0, 25);

    switch(estadoGlobal) {
        case 1:
            dibujarEstado1();
            break;
        case 2:
            dibujarEstado2();
            break;
        case 3:
            dibujarEstado3();
            break;
    }

    // Mostrar estado actual
    fill(255);
    noStroke();
    textSize(16);
    text(`Estado: ${estadoGlobal}, SubEstado: ${subEstado}`, 20, 30);
}

// Estados y sus subestados
function dibujarEstado1() {
    switch(subEstado) {
        case 1:
            dibujarPenumbra();
            break;
        case 2:
            dibujarAparicion();
            break;
        case 3:
            dibujarCruce();
            break;
    }
}

function dibujarEstado2() {
    switch(subEstado) {
        case 1:
            dibujarIntensificacion();
            break;
        case 2:
            dibujarSendero();
            break;
        case 3:
            dibujarFusion();
            break;
    }
}

function dibujarEstado3() {
    switch(subEstado) {
        case 1:
            dibujarRenacimiento();
            break;
        case 2:
            dibujarEuforia();
            break;
        case 3:
            dibujarTrascendencia();
            break;
    }
}

// ESTADO 1: Funciones de visualización
function dibujarPenumbra() {
    let t = frameCount * 0.01 * frecuencia;
    let numParticulas = map(intensidad, 10, 200, 5, 50);
    let tamanoMax = map(brillo, 50, 255, 20, 100);
    
    for (let i = 0; i < numParticulas; i++) {
        let x = width/2 + cos(t + i) * 100 * velocidadMobile1;
        let y = height/2 + sin(t + i) * 100;
        let tamano = random(10, tamanoMax);
        
        fill(0, 0, brillo, intensidad);
        ellipse(x, y, tamano);
    }
}

function dibujarAparicion() {
    stroke(100, 150, brillo, intensidad);
    strokeWeight(map(velocidad, 0.5, 5, 1, 4));
    
    let numLineas = map(intensidad, 10, 200, 5, 20);
    for (let i = 0; i < numLineas; i++) {
        let offset = sin(frameCount * frecuencia + i) * 100 * velocidadMobile1;
        let yPos = map(i, 0, numLineas, 0, height);
        line(width/2 - offset, yPos, width/2 + offset, yPos);
    }
}

function dibujarCruce() {
    let numParticulas = map(intensidad, 10, 200, 10, 100);
    let radioMax = map(velocidad * velocidadMobile1, 0.5, 5, width/8, width/2);
    
    push();
    translate(width/2, height/2);
    rotate(frameCount * 0.01 * frecuencia);
    
    for (let i = 0; i < numParticulas; i++) {
        let angle = random(TWO_PI);
        let r = random(radioMax);
        let x = cos(angle) * r;
        let y = sin(angle) * r;
        
        fill(random(150, 255), random(150, 255), random(200, 255), 
             map(brillo, 50, 255, 100, 200));
        
        let tamano = map(velocidad, 0.5, 5, 3, 30);
        ellipse(x, y, random(2, tamano));
    }
    pop();
}

// ESTADO 2: Funciones de visualización
function dibujarIntensificacion() {
    push();
    translate(width/2, height/2);
    
    let numGrietas = map(intensidad, 0, 200, 5, 20);
    
    for (let i = 0; i < numGrietas; i++) {
        let angle = TWO_PI * i / numGrietas;
        let longitud = map(brillo, 50, 255, 100, width/2);
        
        stroke(255, brillo);
        strokeWeight(random(1, 3));
        
        beginShape();
        let x = 0, y = 0;
        for (let j = 0; j < 5; j++) {
            x = cos(angle + random(-0.2, 0.2)) * (longitud * j/5);
            y = sin(angle + random(-0.2, 0.2)) * (longitud * j/5);
            vertex(x, y);
        }
        endShape();
    }
    pop();
}

function dibujarSendero() {
    push();
    translate(width/2, height/2);
    
    let pathLength = map(brillo, 50, 255, 100, width);
    let pathWidth = map(intensidad, 0, 200, 5, 20);
    let angle = frameCount * 0.02 * velocidad;
    
    rotate(angle);
    
    stroke(200, 255, 255, brillo);
    strokeWeight(pathWidth);
    noFill();
    
    beginShape();
    for (let i = 0; i < pathLength; i += 10) {
        let offsetX = sin(i * 0.02) * 50;
        vertex(i - pathLength/2, offsetX);
    }
    endShape();
    
    for (let i = 0; i < 20; i++) {
        let x = random(-pathLength/2, pathLength/2);
        let y = sin(x * 0.02) * 50 + random(-20, 20);
        fill(255, random(100, brillo));
        noStroke();
        circle(x, y, random(2, 8));
    }
    pop();
}

function dibujarFusion() {
    push();
    translate(width/2, height/2);
    
    let numParticulas = map(intensidad, 0, 200, 20, 100);
    let radioExplosion = map(brillo, 50, 255, 100, width/2);
    
    for (let i = 0; i < numParticulas; i++) {
        let angle = TWO_PI * i / numParticulas;
        let radio = radioExplosion * noise(i * 0.1, frameCount * 0.02);
        
        let x1 = cos(angle) * radio * 0.5;
        let y1 = sin(angle) * radio * 0.5;
        let x2 = cos(angle) * radio;
        let y2 = sin(angle) * radio;
        
        stroke(255, map(velocidad, 0, 1, 50, 255));
        strokeWeight(map(velocidad, 0.5, 5, 1, 4));
        
        line(x1, y1, x2, y2);
    }
    pop();
}

// ESTADO 3: Funciones de visualización
function dibujarRenacimiento() {
    if (frameCount % 30 === 0) {
        let palabra = random(palabras);
        palabrasFlotantes.push(new Particula(random(width), height + 20, palabra));
    }

    for (let i = palabrasFlotantes.length - 1; i >= 0; i--) {
        let p = palabrasFlotantes[i];
        p.aplicarFuerza(createVector(0, -0.1 * intensidad/50));
        p.actualizar();
        p.mostrar();

        if (p.terminada()) {
            palabrasFlotantes.splice(i, 1);
        }
    }
}

function dibujarEuforia() {
    push();
    translate(width/2, height/2);
    
    let tiempo = frameCount * 0.02;
    let numFormas = 3;
    
    for (let j = 0; j < numFormas; j++) {
        beginShape();
        let radio = 150 + j * 50;
        let numPuntos = 12;
        
        for (let i = 0; i <= numPuntos; i++) {
            let ang = map(i, 0, numPuntos, 0, TWO_PI);
            let xoff = map(cos(ang + tiempo), -1, 1, 0, 1);
            let yoff = map(sin(ang + tiempo), -1, 1, 0, 1);
            let r = radio + noise(xoff, yoff, tiempo) * 100;
            
            let x = cos(ang) * r;
            let y = sin(ang) * r;
            
            fill(255, 223, 0, 50);
            noStroke();
            curveVertex(x, y);
        }
        endShape(CLOSE);
    }
    pop();
}

function dibujarTrascendencia() {
    let numParticulas = map(intensidad, 0, 100, 100, 300);
    
    for (let i = 0; i < numParticulas; i++) {
        let x = random(width);
        let y = random(height);
        let size = random(2, 6);
        
        fill(
            random(200, 255),
            random(180, 223),
            random(0, 50),
            map(y, 0, height, 50, 255)
        );
        noStroke();
        circle(x, y - frameCount % height, size);
    }

    blendMode(SCREEN);
    fill(255, 150, 0, 10);
    rect(0, 0, width, height);
    blendMode(BLEND);
}

// Clase Particula para efectos visuales
class Particula {
    constructor(x, y, palabra) {
        this.pos = createVector(x, y);
        this.vel = createVector(random(-1, 1), random(-2, 0));
        this.acc = createVector(0, 0);
        this.palabra = palabra;
        this.vida = 255;
        this.tamano = random(8, 16);
        this.color = color(255, 223, 0);
        this.angulo = random(TWO_PI);
    }

    aplicarFuerza(fuerza) {
        this.acc.add(fuerza);
    }

    actualizar() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.vida -= 1.5;
        this.angulo += 0.05;
    }

    mostrar() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.angulo);
        noStroke();
        fill(red(this.color), green(this.color), blue(this.color), this.vida);
        textSize(this.tamano);
        textAlign(CENTER);
        text(this.palabra, 0, 0);
        pop();
    }

    terminada() {
        return this.vida < 0;
    }
}

// Socket event handlers
function setupSocketListeners() {
    socket.on('connect', () => {
        console.log('Visuales conectadas');
    });

    socket.on('datoMovil1', (datos) => {
        handleMovil1Data(datos);
    });

    socket.on('datoMovil2', (datos) => {
        handleMovil2Data(datos);
    });

    socket.on('datoDesktop', (datos) => {
        handleDesktopData(datos);
    });

    socket.on('cambiarEstadoGlobal', (estado) => {
        if(typeof estado === 'number') {
            estadoGlobal = estado;
            console.log('Nuevo estado global:', estado);
        }
    });

    socket.on('cambiarSubEstado', (estado) => {
        if(typeof estado === 'number') {
            subEstado = estado;
            console.log('Nuevo subestado:', estado);
        }
    });
}

function handleMovil1Data(datos) {
    if (estadoGlobal === 1) {
        if (datos.intensidad !== undefined) {
            intensidad = map(datos.intensidad, 0, 100, 10, 200);
        }
        if (datos.velocidad !== undefined) {
            velocidadMobile1 = map(datos.velocidad, 0, 100, 0.1, 2);
        }
    } else if (estadoGlobal === 2) {
        if (datos.tipo === 'impacto') {
            intensidad = map(datos.fuerza, 0, 30, 0, 200);
        }
    }

    else if (estadoGlobal === 3) {
        if (datos.tipo === 'impacto') {
            // Use impact force to control particle intensity and movement
            intensidad = map(datos.fuerza, 0, 30, 0, 200);
            velocidadMobile1 = map(datos.fuerza, 0, 30, 0.5, 2);
        }
        console.log('Mobile 1 - Estado 3:', {intensidad, velocidadMobile1});
    }
}

function handleMovil2Data(datos) {
    if (estadoGlobal === 1) {
        if (datos.brillo !== undefined) {
            brillo = map(datos.brillo, 0, 100, 50, 255);
        }
        if (datos.frecuencia !== undefined) {
            frecuencia = map(datos.frecuencia, 0, 100, 0.1, 2);
        }
    } else if (estadoGlobal === 2) {
        if (datos.tipo === 'movimiento') {
            brillo = map(datos.direccion.x, -90, 90, 50, 255);
            frecuencia = map(datos.direccion.y, -90, 90, 0.1, 2);
        }
    }
    

    else if (estadoGlobal === 3) {
        if (datos.tipo === 'volumen') {
            // Use volume data to affect visual properties
            brillo = map(datos.nivel, 0, 100, 50, 255);
            frecuencia = map(datos.nivel, 0, 100, 0.1, 2);
            
            // Update particle colors and sizes based on volume
            if (palabrasFlotantes.length > 0) {
                palabrasFlotantes.forEach(p => {
                    p.tamano = map(datos.nivel, 0, 100, 8, 24);
                    p.color = color(255, 223, map(datos.nivel, 0, 100, 0, 255));
                });
            }
        }
        console.log('Mobile 2 - Estado 3:', {brillo, frecuencia});
    }
}

function handleDesktopData(datos) {
    if(datos && datos.mousePosition && estadoGlobal === 1) {
        velocidad = map(datos.mousePosition.y, 0, 1, 0.5, 5);
    }
    else if(datos.tipo === 'volumenManual' && estadoGlobal === 2) {
        velocidad = datos.volumen;
    }

    else if (estadoGlobal === 3) {
        if (datos.tipo === 'palabra') {
            // Add new word particles at mouse position
            let x = datos.posicion.x * width;
            let y = datos.posicion.y * height;
            palabrasFlotantes.push(new Particula(x, y, datos.texto));
        }
        // Use volume for overall animation speed
        if (datos.tipo === 'volumenManual') {
            velocidad = map(datos.volumen, 0, 1, 0.5, 2);
        }
        console.log('Desktop - Estado 3:', {
            palabras: palabrasFlotantes.length,
            velocidad
        });
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}