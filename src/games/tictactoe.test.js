const _ = require('lodash');
const Maybe = require('maybe');

const TicTacToe = require('./tictactoe.js');

_.count = (list, x) => _.sumBy(list, y => y === x ? 1 : 0);
_.mergeLists = (...lists) => {
    if(lists.length <= 1){ return lists[0] || []; }
    const minLength = _.min(lists.map(l => l.length));
    const remaining = lists.filter(
        l => l.length > minLength
    ).map(
        l => l.slice(minLength)
    );

    return _.concat(
        ..._.zip(...lists).slice(0, minLength),
        _.mergeLists(...remaining)
    );
};
const coordsFromIndex = index => [Math.floor(index / 3), index % 3];
const movesFromBoard = (board) => {
    const xs = _.count(board, 'x'),
          os = _.count(board, 'o');
    var players;

    if(Math.abs(xs - os) > 1){
        throw 'The current board configuration is impossible';
    } else if(xs > os){
        players = ['x', 'o'];
    } else {
        players = ['o', 'x'];
    }

    return _.reduce(
        board.replace(/\|/g, ''),
        (moves, tile, i) => {
            if(tile == ' '){ return moves; }
            moves[players.indexOf(tile)].push(
                _.zipObject(
                    ['row', 'column'],
                    coordsFromIndex(i)
                )
            );
            return moves;
        },
        {0: [], 1: []}
    );
};
const gameFromMoves = moves => {
    const first = moves[0].length > moves[1].length ? 0 : 1,
          game = new TicTacToe();
    game.currentPlayer = first;

    _.mergeLists(moves[first], moves[1 - first]).forEach((move, i) => {
        game.makeMove((first + i) % 2, move);
    });

    return game;
};
const gameFromBoard = board => gameFromMoves(movesFromBoard(board));

describe('game setup', () => {
    test('currentPlayer', () => {
        expect([0, 1]).toContain(new TicTacToe().currentPlayer);
    });
});

test('full board is detected', () => {
    const fullDraw = gameFromBoard('xxo|xoo|oxx'),
          fullWin = gameFromBoard('xxx|oox|oox'),
    halfway = gameFromBoard('x o|oox| x ');

    expect(fullDraw.boardIsFull()).toBe(true);
    expect(fullWin.boardIsFull()).toBe(true);
    expect(halfway.boardIsFull()).toBe(false);
});

describe('move validation', () => {
    test('correct turn', () => {
        const game = new TicTacToe();

        expect(
            game.validateMove(game.currentPlayer, { row: 1, column: 1 })
        ).toBe(true);
    });

    test('wrong turn', () => {
        const game = new TicTacToe();

        expect(
            game.validateMove((game.currentPlayer + 1) % 2, { row: 1, column: 1 })
        ).toBe(false);
    });

    test('occupied cell', () => {
        const game = new TicTacToe(), move = { row: 1, column: 1 };
        game.makeMove(game.currentPlayer, move);

        expect(
            game.validateMove(game.currentPlayer, move)
        ).toBe(false);
    });
});

describe('game should end', () => {
    test('when board is full', () => {
        const fullDraw = gameFromBoard('xxo|xoo|oxx');
        const fullWin = gameFromBoard('xxx|oox|oox');

        expect(fullDraw.isFinished()).toBe(true);
        expect(fullWin.isFinished()).toBe(true);
    });

    test('when someone wins', () => {
        const win = gameFromBoard('xxx|oo |o  ');

        expect(win.isFinished()).toBe(true);
    });
});

describe('winner is correctly decided', () => {
    test('first wins', () => {
        const firstWins = gameFromBoard('xxx|xoo|oxo'),
              winner = Maybe(firstWins.getWinner.bind(firstWins));

        expect(winner.isJust()).toBe(true);
        expect(winner.value()).toBe(1 - firstWins.currentPlayer);
    });

    test('second wins', () => {
        const secondWins = gameFromBoard('xxo|x o|  o'),
              winner = Maybe(secondWins.getWinner.bind(secondWins));

        expect(winner.isJust()).toBe(true);
        expect(winner.value()).toBe(1 - secondWins.currentPlayer);
    });

    test('nobody wins', () => {
        const nobodyWins = gameFromBoard('xo |   |   '),
              winner = Maybe(nobodyWins.getWinner.bind(nobodyWins));

        expect(winner.isNothing()).toBe(true);
    });
});
