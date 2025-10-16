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

// Variables estado 3
const NUM_PARTICULAS = 100;  // Moved constant declaration up
let particulas = [];
let alphaParticulas = 127;
let direccionParticulas = Math.PI/2;  // Changed PI to Math.PI
let tamanoParticulas = 10;

let cancion;
let analizer;

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(RGB);
    
    // Inicializar sistema de partículas
    for (let i = 0; i < NUM_PARTICULAS; i++) {
        particulas.push(new Particula());
    }

    // Inicializar interfaz
    actualizarInterfaz(estadoGlobal);
}

// ... rest of the code using Math.PI instead of PI ...

function draw() {
    background(0, 25);

    switch(estadoGlobal) {
        case 1:
            anguloBase += 0.01 * velocidad;
            dibujarCorazonEstado1();
            actualizarInterfaz(1);
            break;
        case 2:
            dibujarCorazonEstado2();
            actualizarInterfaz(2);
            break;
        case 3:
            actualizarParticulas();
            dibujarParticulas();
            actualizarInterfaz(3);
            break;
    }
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
    // Ajuste del mapeo del micrófono para el aura
    let auraAlpha = map(nivelMicrofono, 0, 1, 30, 200);
    console.log('Aura Alpha:', auraAlpha, 'Nivel Micrófono:', nivelMicrofono);
    
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

class Particula {
    constructor() {
        this.reiniciar();
        this.y = random(-100, height);
    }

    reiniciar() {
        this.x = random(width);
        this.y = -20;
        this.velocidad = random(2, 6);
        this.tamano = tamanoParticulas;
    }

    actualizar() {
        this.x += cos(direccionParticulas) * this.velocidad;
        this.y += sin(direccionParticulas) * this.velocidad;

        if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
            this.reiniciar();
        }
    }

    dibujar() {
        push();
        noStroke();
        fill(255, 0, 0, alphaParticulas);
        circle(this.x, this.y, this.tamano);
        pop();
    }
}

function actualizarParticulas() {
    particulas.forEach(p => p.actualizar());
}

function dibujarParticulas() {
    particulas.forEach(p => p.dibujar());
}

function actualizarInterfaz(estado) {
    const infoPanel = document.querySelector('.info-panel');
    if (infoPanel) {
        infoPanel.setAttribute('data-estado', estado);
        
        switch(estado) {
            case 1:
                actualizarElemento('valorIntensidad', intensidad.toFixed(2));
                actualizarElemento('valorVelocidad', velocidad.toFixed(2));
                actualizarElemento('valorMicrofono', nivelMicrofono.toFixed(3));
                break;
            case 2:
                actualizarElemento('numGrietas', grietas.length);
                actualizarElemento('valorAmplitud', amplitudGrietas.toFixed(2));
                actualizarElemento('valorDireccion', `${degrees(direccionGrietas).toFixed(1)}°`);
                break;
            case 3:
                actualizarElemento('numParticulasActivas', particulas.length);
                actualizarElemento('valorAlpha', alphaParticulas);
                actualizarElemento('direccionParticulas', `${degrees(direccionParticulas).toFixed(1)}°`);
                actualizarElemento('tamanoParticulas', tamanoParticulas.toFixed(1));
                break;
        }
    }
}

function actualizarElemento(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = valor;
}

// Socket listeners
socket.on('cambiarEstadoGlobal', (estado) => {
    console.log('Cambio de estado:', estado);
    estadoGlobal = estado;
    
    switch(estado) {
        case 2:
            grietas = [];
            amplitudGrietas = 50;
            direccionGrietas = 0;
            ultimoTiempoGrieta = 0;
            grietasEnPeriodo = 0;
            break;
        case 3:
            particulas = [];
            alphaParticulas = 127;
            direccionParticulas = PI/2;
            tamanoParticulas = 10;
            for (let i = 0; i < NUM_PARTICULAS; i++) {
                particulas.push(new Particula());
            }
            break;
    }
    
    actualizarInterfaz(estado);
});

socket.on('recibidoDatoMovil1', (datos) => {
    console.log('Datos recibidos Mobile1:', datos);
    if (estadoGlobal === 3 && datos.tipo === 'movimiento') {
        let anguloX = map(datos.x, -10, 10, -PI/4, PI/4);
        direccionParticulas = PI/2 + anguloX;
    }
    else if (estadoGlobal === 2) {
        if (typeof datos.fuerza === 'number' && !isNaN(datos.fuerza)) {
            direccionGrietas = map(datos.fuerza, 0, 30, -PI, PI);
            console.log('Nueva dirección:', degrees(direccionGrietas));
        }
    } 
    else if (estadoGlobal === 1) {
        if (typeof datos.intensidad === 'number') {
            intensidad = datos.intensidad;
            console.log('Nueva intensidad:', intensidad);
        }
        if (typeof datos.velocidad === 'number') {
            velocidad = datos.velocidad;
            console.log('Nueva velocidad:', velocidad);
        }
    }
});

socket.on('recibidoDatoMovil2', (datos) => {
    console.log('Datos recibidos Mobile2:', datos);
    if (estadoGlobal === 3 && datos.tipo === 'alpha') {
        alphaParticulas = datos.valor;
    }
    else if (estadoGlobal === 2) {
        if (typeof datos.valor === 'number' && !isNaN(datos.valor)) {
            amplitudGrietas = map(datos.valor, 0, 100, 20, 150);
            console.log('Nueva amplitud:', amplitudGrietas);
        }
    } 
    else if (estadoGlobal === 1) {
        if (datos.tipo === 'microfono') {
            // Asegurar que el valor del micrófono esté entre 0 y 1
            if (typeof datos.micLevel === 'number') {
                nivelMicrofono = constrain(datos.micLevel, 0, 1);
                console.log('Nuevo nivel micrófono:', nivelMicrofono, 'Valor original:', datos.micLevel);
            }
        }
    }
});

socket.on('datoDesktop', (datos) => {
    if (estadoGlobal === 3 && datos.tipo === 'palabra') {
        tamanoParticulas = map(datos.texto.length, 2, 8, 5, 20);
        actualizarElemento('ultimaPalabra', datos.texto);
        particulas.forEach(p => p.tamano = tamanoParticulas);
    }
    else if (estadoGlobal === 1 && datos.mousePosition) {
            mouseX_norm = datos.mousePosition.x;
            mouseY_norm = datos.mousePosition.y;
    } 
    else if (estadoGlobal === 2 && datos.tipo === 'tecla') {
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
});

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}