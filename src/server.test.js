const _ = require('lodash');
const io = require('socket.io')();

const BaseGame = require('./games/basegame.js');
const Player = require('./player.js');
const { Room } = require('./rooms.js');
const Server = require('./server.js');

let player, server;
const gameName = 'TicTacToe';

beforeEach(() => {
    server = new Server(io);
    player = new Player({
        'emit': jest.fn(),
        'join': jest.fn(),
        'leave': jest.fn(),
        'on': jest.fn(),
    });
    player.socket.player = player;
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
