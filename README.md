
<h1 align="center">
    <img src="/img/logo.gif" alt="Agon logo depicting a Greek athlete" />
    <p align="center"><b>Agon</b></p>
    <p align="center">
        A minimal, PoC game server for the Virtual Infrastructure subject's project using microservices.
    </p>
</h1>

[![Build Status](https://travis-ci.org/cronos2/Agon.svg?branch=master)](https://travis-ci.org/cronos2/Agon)


The implementation uses Node.js and socket.io. Amazon S3 will be used for persistent storage.

### Testing

Just `npm test`.

Several classes are tested (unit testing):

- `TicTacToe` and `Nim` are the engines for the games supported
- `Room` represents a generic room with players and is used for the lobby
- `GameRoom` includes an actual game going on
- `Server` represents the actual game server, which handles users connections and disconnections, room creation/destruction, etc.
