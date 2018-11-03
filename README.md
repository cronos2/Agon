<h1 align="center">
    <img src="/img/logo.gif" alt="Agon logo depicting a Greek athlete" />
    <p align="center"><b>Agon</b></p>
    <p align="center">
        A minimal, PoC game server for the Virtual Infrastructure subject's project using microservices.
    </p>
</h1>

[![Build Status](https://travis-ci.org/cronos2/Agon.svg?branch=master)](https://travis-ci.org/cronos2/Agon)


The implementation uses Node.js and socket.io. Amazon S3 will be used for persistent storage.

### Documentation

#### Server

Represents an instance of an Agon game server. Handles incoming requests (e.g. new players, match requests, etc.) and dispatches them to the corresponding classes.

The constructor expects a Socket.io instance, which will handle the actual communication with the clients.

#### GameRoom

Represents a room with players where a game is taking place. It has a reference to a `Game` instance and a list of the participating players. It's also the responsible of interfacing the server and the game.

The constructor expects a `BaseGame` subclass, a Socket.io instance and a list of players.

#### BaseGame

Abstract class representing a certain match. Subclasses must implement the following method:

- `setupGame()`: called in the constructor, it should initialize the game state
- `validateMove(player, move) : boolean`: decides whether a move made by a certain player is valid, and thus should be taking into account, or not
- `makeMove(player, move)`: updates the game state with the new move
- `isFinished() : boolean`: decides whether the game has already finished or not
- `getWinner() : int|null`: returns the winner of the game or `null` if there isn't one (e.g. draw)

### Testing

Just `npm test`.

Several classes are tested (unit testing):

- `TicTacToe` and `Nim`, the game engines for the games supported
- `Room` and `GameRoom`
- `Server`
