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

function addMessage(message, sender) {
  const div = call.querySelector("#chatbox");
  const bubble = document.createElement("div");
  if (sender === "friend") {
    bubble.className = "friend-bubble bubble";
  } else {
    bubble.className = "my-bubble bubble";
  }
  bubble.innerText = message;
  div.appendChild(bubble);
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
    const msgForm = call.querySelector("#msg");
    msgForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = call.querySelector("#msg input");
      const value = input.value;
      myDataChannel.send(JSON.stringify({ nickname: user, msg: value }));
      addMessage(`${value}`, "my");
      input.value = "";
    });
  });
  myDataChannel.addEventListener("message", (event) => {
    console.log(event.data);
    const data = JSON.parse(event.data);
    addMessage(`${data.nickname} : ${data.msg}`, "friend");
  });
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer, user, newCount) => {
  myPeerConnection.addEventListener("datachannel", (event) => {
    myDataChannel = event.channel;
    myDataChannel.send(
      JSON.stringify({ nickname: "bot", msg: `${user} joined!` })
    );
    myDataChannel.addEventListener("open", () => {
      console.log("open!");
      const msgForm = call.querySelector("#msg");
      msgForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = call.querySelector("#msg input");
        const value = input.value;
        myDataChannel.send(JSON.stringify({ nickname: user, msg: value }));
        addMessage(`${value}`, "my");
        input.value = "";
      });
    });
    myDataChannel.addEventListener("message", (event) => {
      console.log(event.data);
      const data = JSON.parse(event.data);
      addMessage(`${data.nickname} : ${data.msg}`, "friend");
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
