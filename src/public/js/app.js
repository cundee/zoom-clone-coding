// 프론트엔드
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;
// 방에 들어가기 전에는 방을 숨긴다

let roomName;

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    // 방에 들어가면 방 번호 입력창을 가리고 방을 보여준다
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    // 방 제목에 변경된 roomName을 적는다
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    // 방에 입장하면 roomName을 변경
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);