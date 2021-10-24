// 백엔드
import http from "http";
import SocketIO from "socket.io";
// SocketIO import
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + '/views');
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req,res) => res.render("home"));
app.get("/*", (req,res) => res.redirect("/"));


const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);
// Socket IO는 webSocket보다 더 많은 기능을 제공한다
// 기본 브라우저에 있는 webSocket만을 사용하는 것이 아니기 때문에 브라우저에도 socket IO를 설치해야한다
// '/socket.io/socket.io.js' url을 제공

wsServer.on("connection", (socket) => {
    console.log(socket);
    // webSocket이 아닌 socket IO의 socket이 불려온다
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


