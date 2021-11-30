// 프론트엔드
const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const initialConstraints = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstraints
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.className = "off";
    muted = true;
  } else {
    muteBtn.className = "on";
    muted = false;
  }
}
function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.className = "on";
    cameraOff = false;
  } else {
    cameraBtn.className = "off";
    cameraOff = true;
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTrack()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form (join a room)

const welcome = document.getElementById("welcome");
const nameForm = welcome.querySelector("#name");
const roomNameForm = welcome.querySelector("#roomname");

function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = welcome.querySelector("#name input");
  socket.emit("nickname", input.value);
  const button = welcome.querySelector("#name button");
  button.className = "save";
  button.innerText = "Save";
}

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
  handleMuteClick();
  handleCameraClick();
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = roomNameForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}
nameForm.addEventListener("submit", handleNicknameSubmit);
roomNameForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Call

function addMessage(message, user, sender) {
  const div = call.querySelector("#chatbox");
  const chat = document.createElement("div");
  const name = document.createElement("div");
  const bubble = document.createElement("div");

  if (sender === "friend") {
    bubble.className = "friend-bubble bubble";
    name.innerText = user;
  } else {
    bubble.className = "my-bubble bubble";
  }
  bubble.innerText = message;
  chat.className = "chatbox";
  name.className = "namebox";
  chat.appendChild(name);
  chat.appendChild(bubble);
  div.appendChild(chat);
}

// function handleMessageSubmit(event) {
//   event.preventDefault();
//   const input = call.querySelector("#msg input");
//   const value = input.value;
//   myDataChannel.send(JSON.stringify({"nickname": user, "msg": value}));
//   addMessage(`${value}`, "my");
//   input.value = "";
// }

socket.on("welcome", async (user, newCount) => {
  myDataChannel = myPeerConnection.createDataChannel("chat");
  myDataChannel.addEventListener("open", () => {
    console.log("open!");
    gameStart();
    const msgForm = call.querySelector("#msg");
    const content = call.querySelector("#textarea");
    msgForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = call.querySelector("#msg input");
      const value = input.value;
      myDataChannel.send(JSON.stringify({ type:'message',nickname: user, msg: value }));
      addMessage(`${value}`, user, "my");
      input.value = "";
    });
    content.addEventListener("compositionupdate", (event) => {
      event.preventDefault();
      const value = content.value;
      myDataChannel.send(JSON.stringify({ type: 'content',content: value }));
      console.log(value);
      console.log(JSON.stringify({ content: value }));
    });
  });
  myDataChannel.addEventListener("message", (event) => {
    console.log(event.data);
    const data = JSON.parse(event.data);
    if (data.type == 'content') {
      const content = call.querySelector("#textarea");
      content.value = data.content;
    } else if (data.type == "bot") {
      addMessage(`${user} joined!`, "Bot", "friend");
    } else if (data.type == 'message'){
      addMessage(`${data.msg}`, user, "friend");
    }
  });
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer, user, newCount) => {
  console.log("I'm Offer!");
  myPeerConnection.addEventListener("datachannel", (event) => {
    myDataChannel = event.channel;
    gameStart();
    myDataChannel.send(JSON.stringify({ type:"bot"}));
    myDataChannel.addEventListener("open", () => {
      console.log("open!");
      const msgForm = call.querySelector("#msg");
      const content = call.querySelector("#textarea");
      msgForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = call.querySelector("#msg input");
        const value = input.value;
        myDataChannel.send(JSON.stringify({ type:"message",nickname: user, msg: value }));
        addMessage(`${value}`, user, "my");
        input.value = "";
      });
      content.addEventListener("compositionupdate", (event) => {
        event.preventDefault();
        const value = content.value;
        myDataChannel.send(JSON.stringify({ type:"content",content: value }));
      });
    });
    myDataChannel.addEventListener("message", (event) => {
      console.log(event.data);
      const data = JSON.parse(event.data);
      if (data.type == "content") {
        const content = call.querySelector("#textarea");
        content.value = data.content;
      } else if(data.type=='message') {
        addMessage(`${data.msg}`, user, "friend");
      }
    });
  });
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
});

socket.on("answer", (answer) => {
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  myPeerConnection.addIceCandidate(ice);
});

socket.on("room_change", (count, rooms) => {
  const roomList = welcome.querySelector("#roomList ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    roomList.innerHTML = "";
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = `${room} (${count})`;
    roomList.append(li);
  });
});

// RTC Code

function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
  socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
  const peerFace = document.getElementById("peerFace");
  peerFace.srcObject = data.stream;
}

function gameStart() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const margin = 20;
  const cw = (ch = canvas.width = canvas.height = 400 + margin * 2);
  const row = 18; // 바둑판 선 개수
  const rowSize = 400 / row; // 한 칸의 너비
  const dolSize = 9; // 바둑돌 크기

  let count = 0;
  let turn = true;
  let msg = document.querySelector(".message");
  let btn1 = document.querySelector("#reload");
  let board = new Array(Math.pow(row + 1, 2)).fill(-1);
  let history = new Array();
  let checkDirection = [
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
  ];
  const blackWinScreen = document.querySelector(".winShow1");
  const whiteWinScreen = document.querySelector(".winShow2");

  // 리로드
  function handleReload() {
    board = new Array(Math.pow(row + 1, 2)).fill(-1);
    draw();
    blackWinScreen.style.visibility = "hidden";
    blackWinScreen.style.zIndex = -1;
    whiteWinScreen.style.visibility = "hidden";
    whiteWinScreen.style.zIndex = -1;
    turn = true;
    count = 0;
  }
  btn1.addEventListener("click", () => {
    handleReload();
    myDataChannel.send(JSON.stringify({ type:'reload' }));
  });

  draw(); // 빈 바둑판 그리기

  let xyToIndex = (x, y) => {
    return x + y * (row + 1);
  };

  let indexToXy = (i) => {
    w = Math.sqrt(board.length);
    x = i % w;
    y = Math.floor(i / w);
    return [x, y];
  };

  function draw() {
    ctx.fillStyle = "#e38d00";
    ctx.fillRect(0, 0, cw, ch);
    for (let x = 0; x < row; x++) {
      for (let y = 0; y < row; y++) {
        let w = (cw - margin * 2) / row;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.strokeRect(w * x + margin, w * y + margin, w, w);
      }
    }

    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        ctx.fillStyle = "black";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(
          (3 + a) * rowSize + margin + a * 5 * rowSize,
          (3 + b) * rowSize + margin + b * 5 * rowSize,
          dolSize / 3,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }

  drawRect = (x, y) => {
    let w = rowSize / 2;
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.strokeRect(
      x * rowSize + margin - w,
      y * rowSize + margin - w,
      w + rowSize / 2,
      w + rowSize / 2
    );
  };

  drawCircle = (x, y) => {
    draw();
    drawRect(x, y);
    for (i = 0; i < board.length; i++) {
      let a = indexToXy(i)[0];
      let b = indexToXy(i)[1];

      if (board[xyToIndex(a, b)] == 1) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(
          a * rowSize + margin,
          b * rowSize + margin,
          dolSize,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      if (board[xyToIndex(a, b)] == 2) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(
          a * rowSize + margin,
          b * rowSize + margin,
          dolSize,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
    checkWin(x, y);
  };

  function checkWin(x, y) {
    let thisColor = board[xyToIndex(x, y)];
    for (k = 0; k < 4; k++) {
      winBlack = 1;
      winWhite = 1;
      for (j = 0; j < 2; j++) {
        for (i = 1; i < 5; i++) {
          let a = x + checkDirection[k + 4 * j][0] * i;
          let b = y + checkDirection[k + 4 * j][1] * i;

          if (board[xyToIndex(a, b)] == thisColor) {
            switch (thisColor) {
              case 1:
                winBlack++;
                break;
              case 2:
                winWhite++;
                break;
            }
          } else {
            break;
          }
        }
      }
      if (winBlack == 5) {
        winShow(1);
      }
      if (winWhite == 5) {
        winShow(2);
      }
    }
  }

  function winShow(x) {
    switch (x) {
      case 1:
        setTimeout(() => {
          blackWinScreen.style.visibility = "visible";
          blackWinScreen.style.zIndex = 2;
        }, 150);
        break;
      case 2:
        setTimeout(() => {
          whiteWinScreen.style.visibility = "visible";
          whiteWinScreen.style.zIndex = 2;
        }, 150);
        break;
    }
  }
  function drawDol(x, y) {
    if (board[xyToIndex(x, y)] != -1) {
      console.log("No!");
    } else {
      count % 2 == 0
        ? (board[xyToIndex(x, y)] = 1)
        : (board[xyToIndex(x, y)] = 2);
      count++;
      drawCircle(x, y);
    }
  }

  function handleDolClick(e) {
    if (e.target.id == "canvas") {
      let x = Math.round(Math.abs(e.offsetX - margin) / rowSize);
      let y = Math.round(Math.abs(e.offsetY - margin) / rowSize);
      console.log(e.offsetX, e.offsetY, x, y);

      if (
        e.offsetX > 10 &&
        e.offsetX < 640 &&
        e.offsetY > 10 &&
        e.offsetY < 640
      ) {
        if (board[xyToIndex(x, y)] != -1) {
          console.log("No!");
        } else if (turn == false) {
          console.log("Not your turn!");
        } else if (
          (blackWinScreen.style.visibility == "visible") |
          (whiteWinScreen.style.visibility == "visible")
        ) {
          console.log("Click Reload!");
        } else {
          count % 2 == 0
            ? (board[xyToIndex(x, y)] = 1)
            : (board[xyToIndex(x, y)] = 2);
          count++;
          drawCircle(x, y);

          myDataChannel.send(JSON.stringify({ type:'omok', x: x, y: y }));
          turn = false;
          console.log(x, y);
        }
      }
    }
  }

  canvas.addEventListener("mouseup", handleDolClick);
  myDataChannel.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    console.log(data);
    if (data.type == 'omok') {
      drawDol(data.x, data.y);
      turn = true;
    } else if (data.type == 'reload') {
      handleReload();
    }
  });
}
