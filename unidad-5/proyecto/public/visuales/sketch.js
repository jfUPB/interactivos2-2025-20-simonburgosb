const socket = io();

// Estado global actual
let estadoGlobal = 1;         

// Parámetros modificables por inputs
let intensidad = 50;    // Del mobile1 - Afecta el tamaño del corazón
let velocidad = 1;      // Del mobile1 - Afecta la velocidad de pulsación
let nivelMicrofono = 0; // Del mobile2 - Afecta el brillo del aura
let mouseX_norm = 0;    // Del desktop - Afecta la rotación
let mouseY_norm = 0;    // Del desktop - Afecta la escala del aura

// Variables para efectos adicionales
let particulas = [];
let tiempoUltimaParticula = 0;
let anguloBase = 0;

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
        actualizarParticulas();
        dibujarCorazon();
        if (nivelMicrofono > 0.1) {
            crearParticulas();
        }
        anguloBase += 0.01 * velocidad; // Rotación base continua
    }

    // Mostrar estado actual y valores
    mostrarDebug();
}

function mostrarDebug() {
    fill(255);
    noStroke();
    textSize(16);
    text(`Estado: ${estadoGlobal}`, 20, 30);
    text(`Intensidad: ${intensidad.toFixed(2)}`, 20, 50);
    text(`Velocidad: ${velocidad.toFixed(2)}`, 20, 70);
    text(`Micrófono: ${nivelMicrofono.toFixed(2)}`, 20, 90);
}

function dibujarCorazon() {
    push();
    translate(width/2, height/2);
    
    // Rotación combinada (base + mouse)
    let rotacionMouse = map(mouseX_norm, 0, 1, -0.5, 0.5);
    rotate(anguloBase + rotacionMouse);

    // Pulsación más dramática
    let pulsoBase = sin(frameCount * 0.02 * velocidad);
    let pulsoRapido = sin(frameCount * 0.1 * velocidad);
    let pulso = (pulsoBase * 0.8) + (pulsoRapido * 0.2);
    
    // Tamaño más dinámico
    let tamanoBase = map(intensidad, 0, 100, 100, height * 0.8);
    let tamano = tamanoBase;

    let onda = analizer.getLevel();
    // Efectos de aura mejorados
    let auraSize = map(onda, 0, 1, 1, 2.5);
    let auraAlpha = map(nivelMicrofono, 0, 1, 30, 200);
    
    // Aura multicapa con gradiente dinámico
    noStroke();
    for(let i = 6; i > 0; i--) {
        let size = tamano * (1 + (i * 0.2 * auraSize));
        let intensidadColor = map(intensidad, 0, 100, 100, 255);
        fill(
            intensidadColor,
            map(i, 6, 0, 0, 100), 
            map(i, 6, 0, 0, 50),
            auraAlpha,
        );
        dibujarFormaCorazon(size);
    }

    // Corazón principal con efectos
    let brilloBase = map(nivelMicrofono, 0, 1, 100, 255);
    let colorIntensidad = map(intensidad, 0, 100, 100, 255);
    fill(colorIntensidad, brilloBase * 0.2, brilloBase * 0.1);
    stroke(255, 150, 150);
    strokeWeight(3 + pulso * 2);
    dibujarFormaCorazon(tamano);

    // Brillo superficial dinámico
    noStroke();
    let brilloSuperficial = map(nivelMicrofono, 0, 1, 50, 200);
    fill(255, brilloSuperficial * (1 + pulso * 0.3));
    dibujarFormaCorazon(tamano * 0.95);

    pop();
}


function crearParticulas() {
    let ahora = millis();
    if (ahora - tiempoUltimaParticula > 50) { // Control de frecuencia
        let numNuevasParticulas = floor(map(nivelMicrofono, 0, 1, 1, 5));
        for (let i = 0; i < numNuevasParticulas; i++) {
            particulas.push(new Particula(width/2, height/2));
        }
        tiempoUltimaParticula = ahora;
    }
}

function actualizarParticulas() {
    for (let i = particulas.length - 1; i >= 0; i--) {
        particulas[i].actualizar();
        particulas[i].mostrar();
        if (particulas[i].terminada()) {
            particulas.splice(i, 1);
        }
    }
}

class Particula {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D().mult(random(2, 5));
        this.acc = createVector(0, 0);
        this.vida = 255;
        this.color = color(255, random(100, 200), random(50, 150));
    }

    actualizar() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.vida -= 5;
        this.acc.mult(0);
    }

    mostrar() {
        noStroke();
        this.color.setAlpha(this.vida);
        fill(this.color);
        circle(this.pos.x, this.pos.y, map(this.vida, 255, 0, 8, 0));
    }

    terminada() {
        return this.vida <= 0;
    }
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

function setupSocketListeners() {
    socket.on('recibidoDatoMovil1', (datos) => {
        if (estadoGlobal === 1) {
            intensidad = datos.intensidad; // Mapeo directo
            velocidad = map(datos.velocidad, 0, 10, 0.2, 3);
        }
    });

    socket.on('recibidoDatoMovil2', (datos) => {
        if (estadoGlobal === 1 && datos.tipo === 'microfono') {
            nivelMicrofono = datos.nivel;
        }
    });

    socket.on('datoDesktop', (datos) => {
        if (estadoGlobal === 1 && datos.mousePosition) {
            mouseX_norm = datos.mousePosition.x;
            mouseY_norm = datos.mousePosition.y;
        }
    });

    socket.on('cambiarEstadoGlobal', (estado) => {
        estadoGlobal = estado;
    });
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