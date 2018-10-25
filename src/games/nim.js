const _ = require('lodash');
const BaseGame = require('./basegame.js');
const Maybe = require('maybe');


class Nim extends BaseGame {
    setupGame(){
        this.board = [1, 3, 5, 7];
        this.currentPlayer = _.random(0, 1);
    }

    validateMove(player, move){
        const { row, count } = move;

        return player == this.currentPlayer
            && count > 0
            && this.board[row] >= count;
    }

    makeMove(player, move){
        const { row, count } = move;

        this.board[row] -= count;

        this.nextTurn();
    }

    isFinished(){
        return this.boardIsEmpty();
    }

    boardIsEmpty(){
        return _.every(this.board, c => c == 0);
    }

    getWinner(){
        if(this.boardIsEmpty()){
            return this.currentPlayer;  // last to move loses
        }

        return null;
    }

    toggleCurrentPlayer(){
        this.currentPlayer = 1 - this.currentPlayer;
    }

    nextTurn(){ return this.toggleCurrentPlayer(); }
}

Nim.playersCount = 2;


module.exports = Nim;
