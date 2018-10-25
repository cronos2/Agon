const Player = require('./player.js');
const { Room, GameRoom } = require('./rooms.js');

const G = jest.fn().mockImplementation(() => {
    return {
        'currentPlayer': 0,
        'validateMove': jest.fn(() => true),
        'makeMove': jest.fn(),
        'getWinner': jest.fn(),
        'isFinished': jest.fn(() => false)
    };
});
G.playersCount = 2;
const socket = {
    'emit': jest.fn(),
    'join': jest.fn(),
    'leave': jest.fn()
};
const emit = jest.fn();
const io = {
    'to': jest.fn(() => {
        return { 'emit': emit };
    })
};
const players = [new Player(socket), new Player(socket)];

beforeEach(() => {
    jest.clearAllMocks();
});

describe('Room creation', () => {
    test('players are added', () => {
        const room = new GameRoom(G, {}, players);

        expect(room.players).toBeDefined();
        expect(room.players.length).toBe(2);
        expect(socket.join).toHaveBeenCalled();
    });

    test('game is set up', () => {
        const room = new GameRoom(G, {}, players);

        expect(room.game).toBeDefined();
        expect(G).toHaveBeenCalledTimes(1);
    });
});

describe('Turn handling', () => {
    test("client can't move when it's not his turn", () => {
        const room = new GameRoom(G, {}, players);
        room.game.validateMove = () => false;

        room.move(players[1], null);

        expect(players[1].socket.emit).toHaveBeenCalledWith('notYourTurn');
    });

    test("next player is notified that it's their turn", () => {
        const room = new GameRoom(G, io, players);

        room.move(players[1], null);

        expect(players[room.game.currentPlayer].socket.emit)
            .toHaveBeenCalledWith('yourTurn');
    });
});

describe('Moves', () => {
    test('invalid moves are reported', () => {
        const room = new GameRoom(G, io, players);
        room.game.validateMove = () => false;

        room.move(players[0], 43);

        expect(players[0].socket.emit).toHaveBeenCalledWith('invalidMove');
    });

    test("clients receive their opponents' moves", () => {
        const room = new GameRoom(G, io, players);
        const move = 43;

        room.move(players[0], move);

        expect(io.to).toHaveBeenCalledWith(room._id);
        expect(room.game.makeMove).toHaveBeenCalledWith(0, move);
        expect(emit).toHaveBeenCalledWith('move', {
            'move': move, 'player': 0
        });
    });

    test('victories are reported', () => {
        const room = new GameRoom(G, io, players);
        room.game.isFinished = () => true;
        room.game.getWinner = () => 0;

        room.move(players[0], 43);

        expect(emit).toHaveBeenCalledWith('winner', 0);
    });

    test('draws are reported', () => {
        const room = new GameRoom(G, io, players);
        room.game.isFinished = () => true;
        room.game.getWinner = () => null;

        room.move(players[0], 43);

        expect(emit).toHaveBeenCalledWith('draw');
    });
});

describe('Signals', () => {
    test('end of game', () => {
        const room = new GameRoom(G, io, players);
        room.game.isFinished = () => true;
        room.game.getWinner = () => 0;

        expect(room.move(players[0], 43)).toBe(GameRoom.signals.EOG);
    });

    test('keep alive', () => {
        const room = new GameRoom(G, io, players);

        expect(room.move(players[0], 43)).toBe(GameRoom.signals.OK);
    });

    test('invalid move', () => {
        const room = new GameRoom(G, io, players);
        room.game.validateMove = () => false;

        expect(room.move(players[0], 43)).toBe(GameRoom.signals.INVALID_MOVE);
    });
});

describe('Disbandment', () => {
    test('disband makes sockets leave', () => {
        const room = new GameRoom(G, io, [players[0]]);

        expect(players[0].socket.leave).toHaveBeenCalledWith(room._id);
    });

    test('room is disbanded if there are not enough players', () => {
        const old = Room.prototype.disband;
        Room.prototype.disband = jest.fn();
        const room = new GameRoom(G, {}, []);

        expect(Room.prototype.disband).toHaveBeenCalled();
    });
});
