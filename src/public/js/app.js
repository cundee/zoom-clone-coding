// 프론트엔드
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", {payload: input.value}, () => {
        console.log("server is done!");
    });
    // 'room' 이라는 이벤트를 emit(보낸다)
    // 이름은 마음대로. 어떤 이벤트든 보낼 수 있다
    // 단순한 string만이 아닌 object를 보낼 수 있음
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);