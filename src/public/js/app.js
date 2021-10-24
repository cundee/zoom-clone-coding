// 프론트엔드
const messageList = document.querySelector("ul")
const nickForm = document.querySelector("#nick")
// nickname을 위한 form 생성
const messageForm = document.querySelector("#message")
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
    const msg = {type, payload}
    return JSON.stringify(msg);
    // 백엔드로 메세지를 보낼 때 string형식으로만 보낼 수 있기 때문에
    // JSON으로 만들고 이를 다시 string으로 바꾸어 보낸다
}

socket.addEventListener("open", () => {
    console.log("Connected to Server");
})
socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    // 메세지를 받으면 새로운 li 생성하기
    li.innerText = message.data;
    // li 안에 메세지 내용 넣기
    messageList.append(li);
    // 메세지가 담긴 li를 messageList에 추가
})
socket.addEventListener("close", () => {
    console.log("Disconnected from Server");
})

function handleSubmit(event){
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    //  type과 내용을 담은 JSON 메세지를 string으로 바꾸어 전송
    input.value = "";
}

function handleNickSubmit(event){
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);

{
    type:"message",
    payload:"hello everyone!"
}
{
    type:"nickname",
    payload:"nick"
}
// 두 가지 이상의 text 메세지를 구분하기 위해
// JSON 형식을 사용한다