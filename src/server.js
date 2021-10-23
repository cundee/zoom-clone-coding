// 백엔드
// express를 사용한 NodeJS 설정
import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + '/views');
app.use("/public", express.static(__dirname + "/public"));
// 유저가 볼 수 있는 폴더를 따로 지정
app.get("/", (req,res) => res.render("home"));
app.get("/*", (req,res) => res.redirect("/"));
// '/'뒤에 다른것을 입력해도 home으로 이동

const handleListen = () => console.log('Listening on http://localhost:3000')

const server = http.createServer(app);
// express app으로부터 서버 만들기
const wss = new WebSocket.Server({server}); 
// http 서버 위에 webSocket 서버를 만듬
// 같은 서버에서 http와 ws가 같은 포트에서 작동
// 뒤의 Server는 http를 사용하고 싶지 않으면 쓰지 않는다(필수가 아님)
server.listen(3000, handleListen);

