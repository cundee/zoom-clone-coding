// 프론트엔드
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("input");
    const value = input.value;
    // 따로 저장해두는 이유: 백엔드가 콜백함수를 실행시킬 때는 이미 마지막 줄에 의해 input.value가 비워져 버림
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You : ${value}`);
    });
    input.value = "";
    // 메세지를 입력받으면 백엔드에 new_message라는 이벤트를 emit. 메세지 내용과 방 번호를 보냄
    // 마지막의 함수는 백엔드에서 실행시킬 수 있는 함수(실제 실행되는건 해당 socket의 프론트)
}

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const form = room.querySelector("form");
    form.addEventListener("submit", handleMessageSubmit);
    // 메세지 입력받기
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", () => {
   addMessage("someone joined!");
})

socket.on("bye", () => {
    addMessage("someon left ㅠㅠ");
 })

 socket.on("new_message", addMessage);
 // socket.on("new_message", (msg) => {addMessage(msg)}); 와 같음