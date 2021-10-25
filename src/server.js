// 백엔드
import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + '/views');
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req,res) => res.render("home"));
app.get("/*", (req,res) => res.redirect("/"));


const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
    // wsServer.socketJoin("공지방");
    // 서버에 들어오는 모든 socket들을 공지방에 입장시킨다
    socket["nickname"] = "Anon";
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    })
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname);
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname));
    })
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    })
    // socket.nickname을 함께 보낸다
    socket.on("nickname", (nickname) => {socket["nickname"] = nickname})
    // nickname을 받으면 socket의 nickname property를 변경
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


