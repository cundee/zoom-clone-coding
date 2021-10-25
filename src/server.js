// 백엔드
import http from "http";
import {Server} from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + '/views');
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req,res) => res.render("home"));
app.get("/*", (req,res) => res.redirect("/"));


const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true,
    },
    // 위의 url에서 localhost:3000에 액세스
    // 온라인 데모가 작동하는데 필요한 환경설정
});
instrument(wsServer, {
    auth: false,
});

function publicRooms() {
    const {
        sockets: {
            adapter: { sids, rooms },
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anon";
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    })
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname, countRoom(room) -1));
    })
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    })
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    })
    socket.on("nickname", (nickname) => {socket["nickname"] = nickname})
})




/* const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon"
    // 닉네임을 정하지 않은 익명의 이용자를 위해 socket 생성시 닉네임의 디폴트 값을 지정
    console.log("Connerted to browser");
    socket.on("close", () => console.log("Disconnected from the browser"));
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        // string을 다시 JavaScirpt Object로 바꾼다
        switch (message.type) {
            case "new_message":
                sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${message.payload}`));
                // "닉네임 : 메세지" 형식으로 전송
            case "nickname":
                socket["nickname"] = message.payload;
                // socket은 기본적으로 객체
                // socket의 "nickname" property를 새로운 닉네임으로 변경
        // JSON에서 type을 확인하고 그에 해당하는 payload를 보내준다
        }
    })
}); */

const handleListen = () => console.log('Listening on http://localhost:3000')
httpServer.listen(3000, handleListen);


