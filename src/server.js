// 백엔드
import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + '/views');
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req,res) => res.render("home"));
app.get("/*", (req,res) => res.redirect("/"));

const handleListen = () => console.log('Listening on http://localhost:3000')

const server = http.createServer(app);
const wss = new WebSocket.Server({server}); 

const sockets = [];
// 연결된 브라우저를 담는 array
// socket은 연결되는 브라우저마다 새롭게 생긴다
// 서로 다른 브라우저끼리 연결하기 위해 사용
// sockets에 있는 모든 브라우저에 메세지가 전송됨

wss.on("connection", (socket) => {
    sockets.push(socket);
    // 브라우저가 연결되어 socket이 만들어지면 array에 담음
    console.log("Connerted to browser");
    socket.on("close", () => console.log("Disconnected from the browser"));
    socket.on("message", (message) => {
        sockets.forEach(aSocket => aSocket.send(message.toString('utf-8')));
        // 프론트엔드로부터 받은 메세지를 다시 똑같이 보냄
        // sockets에 있는 모든 소켓(브라우저)들에게 같은 메세지를 보낸다
    })
});

server.listen(3000, handleListen);

