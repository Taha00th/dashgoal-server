
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
const leaderboard = {}; // { username: totalGoals }

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // Create Room
    socket.on('create-room', (data, callback) => {
        const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
        const duration = data.duration || 120;
        const password = data.password || "";

        rooms.set(roomCode, {
            host: socket.id,
            hostName: data.playerName || "Host",
            clients: [],
            duration: duration,
            password: password,
            isLocked: password !== ""
        });

        socket.join(roomCode);
        socket.roomCode = roomCode;
        socket.isHost = true;

        console.log(`Room created: ${roomCode} by ${socket.id} (Psw: ${password}, Dur: ${duration})`);
        io.emit('rooms-updated', getPublicRooms()); // Update global list
        callback({ success: true, roomCode });
    });

    // Join Room
    socket.on('join-room', (data, callback) => {
        const { roomCode, playerName, kitColor, password } = data;
        const room = rooms.get(roomCode);

        if (!room) {
            callback({ success: false, error: 'Oda bulunamadı' });
            return;
        }

        if (room.password && room.password !== password) {
            callback({ success: false, error: 'Yanlış şifre!' });
            return;
        }

        let role = 'player';
        if (room.clients.length >= 1) {
            role = 'spectator';
        }

        room.clients.push({ id: socket.id, role, name: playerName });
        socket.join(roomCode);
        socket.roomCode = roomCode;
        socket.isHost = false;
        socket.role = role;

        console.log(`Player ${socket.id} joined room ${roomCode} as ${role}`);
        io.to(room.host).emit('player-joined', {
            playerId: socket.id,
            playerName,
            role,
            kitColor,
            avatar: data.avatar // Passing avatar data
        });

        io.emit('rooms-updated', getPublicRooms()); // Update global list
        callback({ success: true, role, duration: room.duration });
    });

    // Get Active Rooms
    socket.on('get-rooms', (callback) => {
        callback(getPublicRooms());
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

    // Chat Relay
    socket.on('send-chat', (data) => {
        if (!socket.roomCode) return;
        socket.to(socket.roomCode).emit('receive-chat', {
            playerName: data.playerName,
            message: data.message,
            color: data.color
        });
    });

    // Goal Logged (Host -> Server)
    socket.on('goal-scored', (data) => {
        const { playerName } = data;
        if (playerName) {
            leaderboard[playerName] = (leaderboard[playerName] || 0) + 1;
            io.emit('leaderboard-update', leaderboard);
        }
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
                    io.emit('rooms-updated', getPublicRooms());
                    console.log(`Room ${socket.roomCode} closed (host left)`);
                } else {
                    // Client left, notify host
                    room.clients = room.clients.filter(c => c.id !== socket.id);
                    io.to(room.host).emit('player-left', socket.id);
                    io.emit('rooms-updated', getPublicRooms());
                }
            }
        }
    });
});

function getPublicRooms() {
    const list = [];
    rooms.forEach((room, code) => {
        list.push({
            code: code,
            host: room.hostName,
            playerCount: room.clients.length + 1,
            isLocked: room.isLocked
        });
    });
    return list;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Dash Goal Server running on port ${PORT}`);
});
