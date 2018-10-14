const _ = require('lodash');
const Maybe = require('maybe');

const Nim = require('./nim.js');

const toMove = (r, c) => {
    return { 'row': r, 'count': c };
};

const gameFromMoves = moves => {
    let game = new Nim();

    moves.forEach(move => game.makeMove(game.currentPlayer, move));

    return game;
};

describe('game setup', () => {
    test('initial player', () => {
        expect([0, 1]).toContain(new Nim().currentPlayer);
    });
});

describe('move validation', () => {
    test('correct turn', () => {
        const game = new Nim();

        expect(game.validateMove(game.currentPlayer, toMove(1, 1))).toBe(true);
    });

    test('wrong turn', () => {
        const game = new Nim();

        expect(
            game.validateMove((game.currentPlayer + 1) % 2, toMove(1, 1))
        ).toBe(false);
    });

    test('too many objects removed', () => {
        const game = new Nim(), move = toMove(1, 10);

        expect(
            game.validateMove(game.currentPlayer, move)
        ).toBe(false);
    });

    test('number of objects removed is strictly positive', () => {
        const game = new Nim(), move = toMove(1, 0);

        expect(
            game.validateMove(game.currentPlayer, move)
        ).toBe(false);
    });
});

describe('game should end', () => {
    test('when board is empty', () => {
        const game = new Nim();
        game.board = [0, 0, 0, 0];

        expect(game.isFinished()).toBe(true);
    });
});

describe('winner is correctly decided', () => {
    test('first wins', () => {
        const firstWins = gameFromMoves(
            [[0, 1], [1, 3], [2, 5], [3, 7]].map(
                m => toMove(...m)
            )
        ), winner = Maybe(firstWins.getWinner.bind(firstWins));

        expect(winner.isJust()).toBe(true);
        expect(winner.value()).toBe(1 - firstWins.currentPlayer);
    });

    test('second wins', () => {
        const secondWins = gameFromMoves(
            [[0, 1], [1, 3], [2, 5], [3, 6], [3, 1]].map(
                m => toMove(...m)
            )
        ), winner = Maybe(secondWins.getWinner.bind(secondWins));

        expect(winner.isJust()).toBe(true);
        expect(winner.value()).toBe(1 - secondWins.currentPlayer);
    });
});
