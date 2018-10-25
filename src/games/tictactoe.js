const _ = require('lodash');
const BaseGame = require('./basegame.js');
const Maybe = require('maybe');


class TicTacToe extends BaseGame {
    setupGame(){
        this.board = [
            [TicTacToe.tiles.EMPTY, TicTacToe.tiles.EMPTY, TicTacToe.tiles.EMPTY],
            [TicTacToe.tiles.EMPTY, TicTacToe.tiles.EMPTY, TicTacToe.tiles.EMPTY],
            [TicTacToe.tiles.EMPTY, TicTacToe.tiles.EMPTY, TicTacToe.tiles.EMPTY]
        ];
        this.currentPlayer = _.random(0, 1);
    }

    validateMove(player, move){
        const { row, column } = move;

        return player == this.currentPlayer
            && this.board[row][column] == TicTacToe.tiles.EMPTY;
    }

    makeMove(player, move){
        const { row, column } = move;
        this.putMove(row, column);
        this.nextTurn();
    }

    isFinished(){
        return this.boardIsFull() || Maybe(this.getWinner.bind(this)).isJust();
    }

    boardIsFull(){
        for(const row of this.board){
            if(row.includes(0)){
                return false;
            }
        }

        return true;
    }

    getWinner(){
        var rows = [0, 1, 2].map(r => [0, 1, 2].map(c => [r, c])),
            cols = [0, 1, 2].map(c => [0, 1, 2].map(r => [r, c])),
            diagonal = [0, 1, 2].map(i => [i, i]),
            antidiagonal = [0, 1, 2].map(i => [i, 2 - i]);
        var lines = [...rows, ...cols, diagonal, antidiagonal];

        for(const line of lines){
            var winner = Maybe(this.checkLine(line));
            if(winner.isJust()){
                return this.getTilePlayer(winner.value());
            }
        }

        return null;
    }

    getPlayerTile(player){
        return player + 1;
    }

    getTilePlayer(tile){
        return tile - 1;
    }

    checkLine(line){
        var values = line.map(([r, c]) => this.board[r][c]);

        if(values[0] == values[1]
           && values[1] == values[2] &&
           values[2] != TicTacToe.tiles.EMPTY){
            return values[0];
        }

        return null;
    }

    putMove(row, column){
        this.board[row][column] = this.getPlayerTile(this.currentPlayer);
    }

    toggleCurrentPlayer(){
        this.currentPlayer = 1 - this.currentPlayer;
    }

    nextTurn(){ return this.toggleCurrentPlayer(); }
}

TicTacToe.playersCount = 2;
TicTacToe.tiles = {
    'EMPTY': 0,
    'FIRST': 1,
    'SECOND': 2
};


module.exports = TicTacToe;
