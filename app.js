require('dotenv').config();

const http = require('http');
const socketio = require('socket.io');

const app = http.createServer(function(){});
const io = socketio(app);

const Server = require('./src/server.js');


const server = new Server(io);

app.listen(process.env.PORT);
