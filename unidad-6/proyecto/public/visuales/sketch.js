const socket = io();

// Estado global actual
let estadoGlobal = 1;         

// Parámetros estado 1
let intensidad = 50;    
let velocidad = 1;      
let nivelMicrofono = 0; 
let mouseX_norm = 0;    
let mouseY_norm = 0;    
let anguloBase = 0;

// Variables estado 2
let grietas = [];
let amplitudGrietas = 50;
let direccionGrietas = 0;
let ultimoTiempoGrieta = 0;
const MAX_GRIETAS = 10;
const PERIODO_GRIETAS = 2000;
let grietasEnPeriodo = 0;

let cancion ;

let analizer;

function preload() {
  cancion = loadSound('../assets/cancion.mp3');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(RGB, 255, 255, 255, 255);
    setupSocketListeners();

    // Configuración del analizador de audio
    analizer = new p5.Amplitude();
    analizer.setInput(cancion);
}

function draw() {
    background(0, 25);

    if (estadoGlobal === 1) {
        anguloBase += 0.01 * velocidad;
        dibujarCorazonEstado1();
    } else if (estadoGlobal === 2) {
        dibujarCorazonEstado2();
    }

    mostrarDebug();
}

function dibujarCorazonEstado1() {
    push();
    translate(width/2, height/2);
    
    let rotacionMouse = map(mouseX_norm, 0, 1, -0.5, 0.5);
    rotate(anguloBase + rotacionMouse);

    let pulsoBase = sin(frameCount * 0.02 * velocidad);
    let pulsoRapido = sin(frameCount * 0.1 * velocidad);
    let pulso = (pulsoBase * 0.8) + (pulsoRapido * 0.2);
    
    let tamanoBase = map(intensidad, 0, 100, 100, height * 0.8);
    let tamano = tamanoBase * (1 + pulso * 0.5);

    let auraSize = map(mouseY_norm, 0, 1, 1, 2.5);
    let auraAlpha = map(nivelMicrofono, 0, 1, 30, 200);
    
    // Aura
    noStroke();
    for(let i = 6; i > 0; i--) {
        let size = tamano * (1 + (i * 0.2 * auraSize));
        fill(255, 0, 0, auraAlpha / (i * 1.2));
        dibujarFormaCorazon(size);
    }

    // Corazón principal
    fill(255, 0, 0);
    stroke(255, 150, 150);
    strokeWeight(3 + pulso * 2);
    dibujarFormaCorazon(tamano);

    pop();
}

function dibujarCorazonEstado2() {
    push();
    translate(width/2, height/2);
    
    // Corazón base
    fill(255, 0, 0);
    noStroke();
    dibujarFormaCorazon(200);

    // Grietas
    stroke(255);
    strokeWeight(2);
    for (let grieta of grietas) {
        grieta.update();
        grieta.draw();
    }
    
    pop();
}

function dibujarFormaCorazon(size) {
    beginShape();
    for(let a = 0; a < TWO_PI; a += 0.01) {
        let r = size * heartShape(a);
        let x = r * cos(a);
        let y = r * sin(a);
        vertex(x, y - size/4);
    }
    endShape(CLOSE);
}

function heartShape(angle) {
    return 2 - 2 * sin(angle) + sin(angle) * sqrt(abs(cos(angle))) / (sin(angle) + 1.4);
}

class Grieta {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.angulo = direccionGrietas + random(-PI/4, PI/4);
        this.longitud = 0;
        this.maxLongitud = amplitudGrietas;
        this.velocidad = random(2, 5);
        this.ramificaciones = [];
        this.activa = true;
        this.color = color(255, random(150, 255));
    }

    update() {
        if (!this.activa) return;

        if (this.longitud < this.maxLongitud) {
            this.longitud += this.velocidad;
            
            if (random(1) < 0.05 && this.ramificaciones.length < 3) {
                this.ramificaciones.push(new Grieta(
                    this.pos.x + cos(this.angulo) * this.longitud,
                    this.pos.y + sin(this.angulo) * this.longitud
                ));
            }
        } else {
            this.activa = false;
        }

        this.ramificaciones.forEach(r => r.update());
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.angulo);
        
        stroke(this.color);
        line(0, 0, this.longitud, 0);
        
        this.ramificaciones.forEach(r => r.draw());
        pop();
    }
}

function setupSocketListeners() {
    // Mobile 1 data
    socket.on('recibidoDatoMovil1', (datos) => {
        if (estadoGlobal === 2 && datos.tipo === 'impacto') {
            if (typeof datos.fuerza === 'number' && !isNaN(datos.fuerza)) {
                direccionGrietas = map(datos.fuerza, 0, 30, -PI, PI);
                console.log('Nueva dirección:', degrees(direccionGrietas));
            }
        } else if (estadoGlobal === 1 && datos.tipo === 'control') {
            if (typeof datos.intensidad === 'number') intensidad = datos.intensidad;
            if (typeof datos.velocidad === 'number') velocidad = datos.velocidad;
        }
        console.log('Datos Mobile 1:', datos);
    });

    socket.on('recibidoDatoMovil2', (datos) => {
        if (estadoGlobal === 2 && datos.tipo === 'amplitud') {
            if (typeof datos.valor === 'number' && !isNaN(datos.valor)) {
                amplitudGrietas = map(datos.valor, 0, 100, 20, 150);
                console.log('Nueva amplitud:', amplitudGrietas);
            }
        } else if (estadoGlobal === 1 && datos.tipo === 'microfono') {
            nivelMicrofono = datos.nivel;
            
        }
        console.log('Datos Mobile 2:', datos);
    });
    // Desktop data
    socket.on('datoDesktop', (datos) => {
        if (estadoGlobal === 1 && datos.mousePosition) {
            mouseX_norm = datos.mousePosition.x;
            mouseY_norm = datos.mousePosition.y;
        } else if (estadoGlobal === 2 && datos.tipo === 'tecla') {
            const ahora = Date.now();
            if (ahora - ultimoTiempoGrieta > PERIODO_GRIETAS) {
                grietasEnPeriodo = 0;
                ultimoTiempoGrieta = ahora;
            }

            if (grietasEnPeriodo < MAX_GRIETAS) {
                const nuevaGrieta = new Grieta(
                    random(-100, 100),
                    random(-100, 100)
                );
                grietas.push(nuevaGrieta);
                grietasEnPeriodo++;
                console.log(`Grieta creada (${grietasEnPeriodo}/${MAX_GRIETAS})`);
            }
        }
        console.log('Datos Desktop:', datos);
    });

    // State change
    socket.on('cambiarEstadoGlobal', (estado) => {
        estadoGlobal = estado;
        if (estado === 2) {
            grietas = [];
            amplitudGrietas = 50;
            direccionGrietas = 0;
            ultimoTiempoGrieta = 0;
            grietasEnPeriodo = 0;
        }
        console.log('Cambio estado:', estado);
    });
}

function mostrarDebug() {
    fill(255);
    noStroke();
    textSize(16);
    textAlign(LEFT);
    
    text(`Estado: ${estadoGlobal}`, 20, 30);
    
    if (estadoGlobal === 2) {
        text(`Grietas: ${grietas.length}`, 20, 50);
        text(`Grietas en período: ${grietasEnPeriodo}/${MAX_GRIETAS}`, 20, 70);
        text(`Amplitud: ${amplitudGrietas.toFixed(2)}`, 20, 90);
        text(`Dirección: ${degrees(direccionGrietas).toFixed(1)}°`, 20, 110);
    } else {
        text(`Intensidad: ${intensidad.toFixed(2)}`, 20, 50);
        text(`Velocidad: ${velocidad.toFixed(2)}`, 20, 70);
        text(`Micrófono: ${nivelMicrofono.toFixed(3)}`, 20, 90);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

document.addEventListener('click', () => {
  if (cancion.isPlaying()) {
    cancion.pause();
  } else {
    cancion.play();
  }
});