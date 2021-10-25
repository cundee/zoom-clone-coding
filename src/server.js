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
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    })
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome");
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye"));
    // 클라이언트와 서버의 연결이 끊어지면 room 안에 있는 socket들에게 bye이벤트를 보냄
    })
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", msg);
        done();
    })
    // 프론트로부터 new_message 이벤트를 받고, 함께 온 내용들을 사용해서 room에 있는 socket에게 새로운 이벤트를 emit
    // done()을 이용해 자신의 채팅창에도 메세지가 입력되게 실행시킴
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


