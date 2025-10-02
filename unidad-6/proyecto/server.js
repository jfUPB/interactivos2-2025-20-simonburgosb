const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = 3000;

app.use(express.static('public'));

app.get('*.js', function (req, res, next) {
    res.type('application/javascript');
    next();
});
io.on('connection', (socket) => {
    console.log('New client connected');

    // Escuchar datos del Móvil 1
    socket.on('datoMovil1', (datos) => {
        console.log('Datos recibidos de Móvil 1:', datos);
        io.emit('recibidoDatoMovil1', {
            tipo: datos.tipo,
            intensidad: datos.intensidad,
            velocidad: datos.velocidad,
            fuerza: datos.fuerza,
        });
        
    });

    socket.on('datoMovil2', (datos) => {
        console.log('Datos recibidos de Móvil 2:', datos);
        io.emit('recibidoDatoMovil2', {
            nivel: datos.micLevel,
            valor: datos.valor,
            tipo: datos.tipo,
        });
        
    });

    // Escuchar datos del Desktop
    socket.on('datoDesktop', (datos) => {
        console.log('Datos recibidos de Desktop:', datos);
        io.emit('datoDesktop', datos);
    });

    // Escuchar cambios del Control Remoto
    socket.on('changeGlobalState', (estado) => {
        console.log('Cambio de estado global:', estado);
        io.emit('cambiarEstadoGlobal', estado);
    });

    socket.on('changeSubState', (subestado) => {
        console.log('Cambio de subestado:', subestado);
        io.emit('cambiarSubEstado', subestado);
    });

    socket.on('updateParam', (param) => {
        console.log('Actualización de parámetro:', param);
        io.emit('actualizarParametro', param);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
    console.log('Rutas disponibles:');
    console.log(`- Desktop: http://localhost:${port}/desktop`);
    console.log(`- Mobile 1: http://localhost:${port}/mobile`);
    console.log(`- Mobile 2: http://localhost:${port}/mobile2`);
    console.log(`- Control Remoto: http://localhost:${port}/controlRemoto`);
    console.log(`- Visuales: http://localhost:${port}/visuales`);
});