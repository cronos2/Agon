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
    }

    disband(reason){
        this.io.to(this._id).emit('disbanded', reason);
        this.players.forEach(player => player.socket.leave(this._id));
    }
}


class GameRoom extends Room {
    constructor(Game, io, players){
        super(io, players);

        if(this.players.length < Game.playersCount){
            const reason = (
                'Insufficient number of players for the current game. ' +
                    'Disbanding room.'
            );
            this.disband(reason);

            return;
        }

        this.game = new Game();
        this.players[this.game.currentPlayer].socket.emit('yourTurn');
    }

    addPlayer(player){
        super.addPlayer(player);
        player.gameRoom = this;
    }

    disband(reason){
        super.disband(reason);
        this.players.forEach(player => player.gameRoom = null);
    }

    move(player, move){
        const playerIndex = this.players.indexOf(player);
        if(this.game.currentPlayer != playerIndex){
            player.socket.emit('notYourTurn');
            return GameRoom.signals.WRONG_TURN;
        }

        // right turn

        if(!this.game.validateMove(playerIndex, move)){
            player.socket.emit('invalidMove');
            return GameRoom.signals.INVALID_MOVE;
        }

        // valid move

        this.game.makeMove(playerIndex, move);
        this.io.to(this._id).emit('move', {
            'move': move, 'player': playerIndex
        });

        if(!this.game.isFinished()){
            this.players[this.game.currentPlayer].socket.emit('yourTurn');
            return GameRoom.signals.OK;
        }

        // game has finished

        var winner = Maybe(this.game.getWinner.bind(this.game));

        if(winner.isJust()){
            this.io.to(this._id).emit('winner', winner.value());
        } else {
            this.io.to(this._id).emit('draw');
        }

        return GameRoom.signals.EOG;
    }
}

GameRoom.signals = {
    'EOG': -1,
    'OK': 0,
    'INVALID_MOVE': 1,
    'WRONG_TURN': 2
};


module.exports = {
    'GameRoom': GameRoom,
    'Room': Room
};
