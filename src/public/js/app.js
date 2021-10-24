// 프론트엔드
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, (msg) => {
        console.log(`server say: ${msg}`);
    });
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);