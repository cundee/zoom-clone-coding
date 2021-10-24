// 프론트엔드
const messageList = document.querySelector("ul")
const messageForm = document.querySelector("form")
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
    console.log("Connected to Server");
})
socket.addEventListener("message", (message) => {
    console.log("New message: ", message.data);
})
socket.addEventListener("close", () => {
    console.log("Disconnected from Server");
})

function handleSubmit(event){
    event.preventDefault();
    const input = messageForm.querySelector("input");
    // input창으로부터 메세지 받아서 input 변수에 저장
    socket.send(input.value);
    // 백엔드에 메세지 전송
    input.value = "";
    // input창 초기화
}

messageForm.addEventListener("submit", handleSubmit);
// 메세지 입력창 form 으로부터 메세지 받아오기