const _ = require('lodash');
const { GameRoom, Room } = require('./rooms.js');
const Player = require('./player.js');


class Server {
    constructor(io){
        this.io = io;
        this.lobby = new Room(io);
        this.gameRooms = [];
        this.gameNames = {
            'Nim': require('./games/nim.js'),
            'TicTacToe': require('./games/tictactoe.js')
        };

        this.handleConnection = this.handleConnection.bind(this);
        this.setUpIO();
    }

    setUpIO(){
        this.io.use((socket, next) => {
            console.log('username', socket.handshake.query.username);
            socket.player = new Player(socket, socket.handshake.query.username);
            next();
        });

        this.io.on('connection', this.handleConnection);
    }

    handleConnection(socket){
        console.log('new player', socket.player.serialize());
        this.lobby.addPlayer(socket.player);

        socket.on('findMatch', gameName => {
            console.log('find match');
            this.handleMatchRequest(socket.player, gameName);
        });

        socket.on('move', move => {
            console.log('move', move);
            const exit_code = socket.player.gameRoom.move(socket.player, move);

            if(exit_code == GameRoom.signals.EOG){
                this.disbandRoom(socket.player.gameRoom);
            }
        });

        socket.on('disconnect', () => {
            this.handleDisconnection(socket.player);
        });
    }

    handleDisconnection(player){
        console.log('player disconnected', player.serialize());

        this.gameRooms.filter(
            room => room.players.includes(player)
        ).forEach(
            room => this.disbandRoom(room)
        );
    }

    disbandRoom(room){
        console.log('room disbanded', room);

        room.disband();
        _.pull(this.gameRooms, room);
    }

    getPlayersWaitingForGame(gameName){
        return this.lobby.players.filter(
            player => player.gameName == gameName
        );
    }

    handleMatchRequest(player, gameName){
        player.gameName = gameName;
        console.log('lobby', this.lobby.players.map(p => p.serialize()));

        this.attemptMatch(gameName);
    }

    attemptMatch(gameName){
        var waitingPlayers = this.getPlayersWaitingForGame(gameName);

        if(waitingPlayers.length >= this.gameNames[gameName].playersCount){
            var selectedPlayers = waitingPlayers.slice(
                0, this.gameNames[gameName].playersCount
            );

            this.createRoom(
                gameName,
                selectedPlayers
            );

            _.pull(this.lobby.players, ...selectedPlayers);
        }
    }

    createRoom(gameName, players){
        console.log('match found. creating new room');

        const newRoom = new GameRoom(
            this.gameNames[gameName],
            this.io,
            players
        );
        this.gameRooms.push(newRoom);

        players.forEach((player, i) => {
            player.socket.emit(
                'matchFound',
                players.map(p => p.serialize()),  // players
                i,                                // own
                newRoom.game.currentPlayer        // current
            );
        });

        console.log(players.map(p => p.serialize()));
    }
}


module.exports = Server;
