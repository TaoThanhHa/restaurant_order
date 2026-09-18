require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const { verifyToken } = require("./utils/jwt");
const socketService = require("./services/socket.service");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true,
    },
});

socketService.setIO(io);

io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(new Error("Chưa đăng nhập."));
        }

        socket.user = verifyToken(token);
        next();
    } catch (error) {
        next(new Error("Token không hợp lệ hoặc đã hết hạn."));
    }
});

io.on("connection", socket => {
    console.log(
        `WebSocket connected: ${socket.id} - ${socket.user.role}`
    );

    const { branchId } = socket.user;

    if (branchId) {
        const room = `branch:${Number(branchId)}`;

        socket.join(room);

        console.log(
            `Socket ${socket.id} joined ${room}`
        );
    }

    socket.on("disconnect", () => {
        console.log(
            `WebSocket disconnected: ${socket.id}`
        );
    });
});

module.exports = {
    app,
    server,
    io,
};

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});