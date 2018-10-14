const _ = require('lodash');
const rooms = require('./rooms.js');


module.exports = function(io){
    class Server {
        constructor(){
            this.gameNames = {
                'Nim': require('./games/nim.js'),
                'TicTacToe': require('./games/tictactoe.js')
            };

            this.lobby = new rooms.Room(io);
            this.gameRooms = [];
        }

        getPlayersWaitingForGame(gameName){
            return this.lobby.players.filter(
                player => player.gameName == gameName
            );
        }

        handleNewPlayer(player, gameName){
            player.gameName = gameName;
            this.lobby.players.push(player);
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

        disbandRoom(room){
            console.log('room disbanded', room);

            room.disband();
            _.pull(this.gameRooms, room);
        }

        handleDisconnectedPlayer(player){
            console.log('player disconnected', player);

            this.gameRooms.filter(
                room => room.players.includes(player)
            ).forEach(
                room => this.disbandRoom(room)
            );
        }

        createRoom(gameName, players){
            const newRoom = new rooms.GameRoom(
                this.gameNames[gameName],
                io,
                players
            );
            this.gameRooms.push(newRoom);
            console.log('match found. creating new room');
        }
    }

    return Server;
};
