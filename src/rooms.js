const Maybe = require('maybe');
const uuid = require('uuid/v4');


class Room {
    constructor(io, players){
        this._id = uuid();
        this.io = io;
        this.players = [];
        (players || []).forEach(player => this.addPlayer(player));
    }

    addPlayer(player){
        this.players.push(player);
        player.socket.join(this._id);
        player.gameRoom = this;
    }

    disband(reason){
        this.io.to(this._id).emit('disbanded', reason);
        this.players.forEach(player => player.socket.leave(this._id));
    }
}


class GameRoom extends Room {
    constructor(Game, io, players){
        super(io, players);

        this.game = new Game();

        if(this.players.length < Game.playersCount){
            const reason = (
                'Insufficient number of players for the current game. ' +
                    'Disbanding room.'
            );
            this.disband(reason);

            return;
        }

        this.players[this.game.currentPlayer].socket.emit('yourTurn');
    }

    move(player, move){
        const playerIndex = this.players.indexOf(player);
        if(this.game.currentPlayer != playerIndex){
            player.socket.emit('notYourTurn');
        }

        if(this.game.validateMove(playerIndex, move)){
            this.game.makeMove(playerIndex, move);
            this.io.to(this._id).emit('move', {
                'move': move, 'player': playerIndex
            });

            if(this.game.isFinished()){
                var winner = Maybe(this.game.getWinner.bind(this.game));

                if(winner.isJust()){
                    this.io.to(this._id).emit('winner', winner.value());
                } else {
                    this.io.to(this._id).emit('draw');
                }

                return GameRoom.signals.EOG;
            } else {
                this.players[this.game.currentPlayer].socket.emit('yourTurn');
            }
        } else {
            player.socket.emit('wrongMove');
        }

        return GameRoom.signals.OK;
    }
}

GameRoom.signals = {
    'EOG': -1,
    'OK': 0
};


module.exports = {
    'GameRoom': GameRoom,
    'Room': Room
};
