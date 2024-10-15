import { Server } from 'socket.io';

class SocketConnection {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
                credentials: true,
                allowedHeaders: ['Authorization', 'Content-Type'],
            },
        });

        this.init();
    }

    init() {
        this.io.on('connection', (socket) => {
            socket.on('join', (userId) => {
                socket.join(userId);
                global.userSockets[userId] = socket.id;
            });

            socket.on('disconnect', () => {
                for (const userId in global.userSockets) {
                    if (global.userSockets[userId] === socket.id) {
                        delete global.userSockets[userId];
                        break;
                    }
                }
            });
        });
    }
}

export default SocketConnection;
