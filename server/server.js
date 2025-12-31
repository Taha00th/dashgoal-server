const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());

// Health check endpoint
app.get('/', (req, res) => {
    res.send('Dash Goal Server is running! 🎮⚽');
});

// Store active rooms
const rooms = new Map();

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // Create Room
    socket.on('create-room', (callback) => {
        const roomCode = Math.floor(100000 + Math.random() * 900000).toString();

        rooms.set(roomCode, {
            host: socket.id,
            clients: []
        });

        socket.join(roomCode);
        socket.roomCode = roomCode;
        socket.isHost = true;

        console.log(`Room created: ${roomCode} by ${socket.id}`);
        callback({ success: true, roomCode });
    });

    // Join Room
    socket.on('join-room', (roomCode, playerName, callback) => {
        const room = rooms.get(roomCode);

        if (!room) {
            callback({ success: false, error: 'Room not found' });
            return;
        }

        if (room.clients.length >= 1) {
            callback({ success: false, error: 'Room is full' });
            return;
        }

        room.clients.push(socket.id);
        socket.join(roomCode);
        socket.roomCode = roomCode;
        socket.isHost = false;

        console.log(`Player ${socket.id} joined room ${roomCode}`);

        // Notify host
        io.to(room.host).emit('player-joined', { playerId: socket.id, playerName });

        callback({ success: true });
    });

    // Send Input (Client -> Host)
    socket.on('send-input', (inputData) => {
        if (!socket.roomCode) return;

        const room = rooms.get(socket.roomCode);
        if (room && room.host) {
            io.to(room.host).emit('receive-input', {
                playerId: socket.id,
                input: inputData
            });
        }
    });

    // Send State (Host -> Clients)
    socket.on('send-state', (stateData) => {
        if (!socket.roomCode || !socket.isHost) return;

        socket.to(socket.roomCode).emit('receive-state', stateData);
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);

        if (socket.roomCode) {
            const room = rooms.get(socket.roomCode);

            if (room) {
                if (socket.isHost) {
                    // Host left, notify clients and close room
                    io.to(socket.roomCode).emit('host-disconnected');
                    rooms.delete(socket.roomCode);
                    console.log(`Room ${socket.roomCode} closed (host left)`);
                } else {
                    // Client left, notify host
                    room.clients = room.clients.filter(id => id !== socket.id);
                    io.to(room.host).emit('player-left', socket.id);
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Dash Goal Server running on port ${PORT}`);
});
