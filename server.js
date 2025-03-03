const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 3000;

app.use(express.static('./'));

const players = new Map();

io.on('connection', (socket) => {
    console.log('A user connected');
    
    // Create a new player
    players.set(socket.id, {
        x: Math.random() * 700 + 50,
        y: Math.random() * 500 + 50,
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        rotation: 0,
        speed: 0
    });

    // Broadcast updated player count
    io.emit('playerCount', players.size);

    // Handle player updates
    socket.on('updatePlayer', (data) => {
        const player = players.get(socket.id);
        if (player) {
            Object.assign(player, data);
            socket.broadcast.emit('playerMoved', {
                id: socket.id,
                ...player
            });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
        players.delete(socket.id);
        io.emit('playerLeft', socket.id);
        io.emit('playerCount', players.size);
    });

    // Send current players to new player
    socket.emit('currentPlayers', Array.from(players.entries()));
});

http.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 