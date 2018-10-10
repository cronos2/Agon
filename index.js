const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const GameRoom = require('./src/rooms.js').GameRoom;
const Player = require('./src/player.js');
const Server = require('./src/server.js')(io);
const server = new Server();


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client.html');
});

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
                server.disbandRoom(socket.player.gameRoom);  // TODO
            }
        }
    );

    socket.on(
        'disconnect', socket => server.handleDisconnectedPlayer(socket.player)
    );
});

http.listen(3000);
