const _ = require('lodash');
const io = require('socket.io')();

const BaseGame = require('./games/basegame.js');
const Player = require('./player.js');
const { GameRoom, Room } = require('./rooms.js');
const Server = require('./server.js');
const TicTacToe = require('./games/tictactoe.js');

let player, server, socket;
const gameName = 'TicTacToe';

beforeEach(() => {
    server = new Server(io);
    socket = {
        'emit': jest.fn(),
        'join': jest.fn(),
        'leave': jest.fn(),
        'on': jest.fn(),
    };
    player = new Player(socket, '');
    socket.player = player;
});

describe('Initialization', () => {
    test('games are loaded', () => {
        expect(server.gameNames).toBeDefined();

        _.forOwn(server.gameNames, (Game, gameName) => {
            expect(new Game()).toBeInstanceOf(BaseGame);
        });
    });

    test('lobby is created', () => {
        expect(server.lobby).toBeDefined();
        expect(server.lobby).toBeInstanceOf(Room);
    });

    test('Socket.io setup', () => {
        const io_ = {
            'on': jest.fn(),
            'use': jest.fn(),
        };
        const server = new Server(io_);

        expect(io_.use).toBeCalled();
        expect(io_.on).toHaveBeenCalledWith(
            'connection', expect.any(Function)
        );
    });
});

describe('Connection handling', () => {
    it('should add the player to the lobby', () => {
        server.handleConnection(socket);
        expect(server.lobby.players).toContain(player);
    });

    it('should register a findMatch listener', () => {
        server.handleConnection(socket);
        expect(socket.on).toHaveBeenCalledWith(
            'findMatch', expect.any(Function)
        );
    });

    it('should register a move listener', () => {
        server.handleConnection(socket);
        expect(socket.on).toHaveBeenCalledWith(
            'move', expect.any(Function)
        );
    });

    it('should register a disconnect listener', () => {
        server.handleConnection(socket);
        expect(socket.on).toHaveBeenCalledWith(
            'disconnect', expect.any(Function)
        );
    });
});

describe('Disconnection handling', () => {
    it('should remove the player from the lobby', () => {
        server.handleConnection(socket);
        server.handleDisconnection(player);
        expect(server.lobby).not.toContain(player);
    });

    it('should disband game rooms in which the player is', () => {
        server.handleConnection(socket);

        const gameRoom = new GameRoom(TicTacToe, {}, [player, player]);
        gameRoom.disband = jest.fn();
        server.gameRooms = [gameRoom];

        server.handleDisconnection(player);

        expect(gameRoom.disband).toHaveBeenCalledWith(expect.any(String));
    });
});

describe('Room creation', () => {
    test('lobby holds waiting players', () => {
        server.handleConnection(player.socket);

        expect(server.lobby.players).toHaveLength(1);
        expect(server.gameRooms).toHaveLength(0);
    });

    test('new game room is created when there are enough players', () => {
        server.lobby.players.push(player);
        server.handleMatchRequest(player, gameName);

        expect(server.gameRooms).toHaveLength(0);

        server.lobby.players.push(player);
        server.handleMatchRequest(player, gameName);

        expect(server.gameRooms).toHaveLength(1);
        expect(server.gameRooms[0].players).toContain(player);
        expect(server.gameRooms[0].game)
            .toBeInstanceOf(server.gameNames[gameName]);
    });

    test('players in new room are removed from the lobby', () => {
        server.lobby.players = [player, player];
        server.handleMatchRequest(player, gameName);
        server.handleMatchRequest(player, gameName);

        expect(server.getPlayersWaitingForGame(gameName)).toHaveLength(0);
        expect(server.lobby.players).toHaveLength(0);
    });
});

describe('Room destruction', () => {
    test('room is disbanded when someone disconnects', () => {
        server.lobby.players = [player, player];
        server.handleMatchRequest(player, gameName);
        server.handleMatchRequest(player, gameName);

        expect(server.gameRooms).toHaveLength(1);

        server.disbandRoom = jest.fn();
        const room = server.gameRooms[0];
        server.handleDisconnection(player);

        expect(server.disbandRoom).toHaveBeenCalledWith(
            room, expect.any(String)
        );
    });

    test('disbanded rooms are actually destroyed', () => {
        server.lobby.players = [player, player];
        server.handleMatchRequest(player, gameName);
        server.handleMatchRequest(player, gameName);

        expect(server.gameRooms).toHaveLength(1);

        server.handleDisconnection(player);

        expect(server.gameRooms).toHaveLength(0);
    });
});
