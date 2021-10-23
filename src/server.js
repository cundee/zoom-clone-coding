// 백엔드
// express를 사용한 NodeJS 설정
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
app.listen(3000, handleListen);
