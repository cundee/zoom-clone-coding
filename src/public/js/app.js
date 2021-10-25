// 프론트엔드
const socket = io();

const welcome = document.getElementById("welcome");
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
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You : ${value}`);
    });
    input.value = "";
}

function handleNicknameSubmit(event) {
    event.preventDefault();
    const input = welcome.querySelector("#name input");
    const value = input.value;
    socket.emit("nickname", input.value);
    
}

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const msgForm = room.querySelector("#msg");
    
    msgForm.addEventListener("submit", handleMessageSubmit);
    
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = roomNameForm.querySelector("#roomname input");
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
}


const nameForm = welcome.querySelector("#name");
const roomNameForm = welcome.querySelector("#roomname");
nameForm.addEventListener("submit", handleNicknameSubmit);
roomNameForm.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {
   addMessage(`${user} joined!`);
})

socket.on("bye", (user) => {
    addMessage(`${user} left ㅠㅠ`);
 })
 // 어떤 user가 나가고 들어왔는지 알려준다

 socket.on("new_message", addMessage);
