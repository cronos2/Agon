require('dotenv').config();

const http = require('http');
const socketio = require('socket.io');

const app = http.createServer((req, res) => {
    const playersCount = server.lobby.players.length + server.gameRooms.reduce(
        (count, room) => count + room.players.length,
        0
    );

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
        'status': 'OK',
        'rooms': server.gameRooms.length,
        'players': playersCount
    }));
});
const io = socketio(app);
const Server = require('./src/server.js');


const server = new Server(io);

app.listen(process.env.PORT);
