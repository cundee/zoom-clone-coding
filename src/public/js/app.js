// 프론트엔드
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
    console.log("Connected to Server");
})
// 서버와 연결되었을 때 발생하는 이벤트
socket.addEventListener("message", (message) => {
    console.log("New message: ", message.data);
})
// 서버로부터 메세지를 받았을 때 발생하는 이벤트
socket.addEventListener("close", () => {
    console.log("Disconnected from Server");
})
// 서버와의 연결이 끊어졌을 때 발생하는 이벤트
setTimeout(() => {
    socket.send("hello from the brouser!");
    // 서버로 메세지를 보냄
},10000)