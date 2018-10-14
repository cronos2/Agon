require('dotenv').config();

const http = require('http');
const socketio = require('socket.io');

const app = http.createServer(function(){});
const io = socketio(app);


const GameRoom = require('./src/rooms.js').GameRoom;
const Player = require('./src/player.js');
const Server = require('./src/server.js')(io);
const server = new Server();


io.on('connection', (socket) => {
    socket.player = new Player(socket);

    socket.on(
        'findMatch', gameName => {
            console.log('find match');
            server.handleNewPlayer(socket.player, gameName);
        }
    );

    socket.on(
        'move', move => {
            console.log('move', move);
            const exit_code = socket.player.gameRoom.move(socket.player, move);

            if(exit_code == GameRoom.signals.EOG){
                server.disbandRoom(socket.player.gameRoom);
            }
        }
    );

    socket.on(
        'disconnect', socket => server.handleDisconnectedPlayer(socket.player)
    );
});

app.listen(process.env.PORT);
