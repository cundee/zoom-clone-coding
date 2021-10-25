// 프론트엔드
const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");

let myStream;
// stream은 비디오와 오디오의 결합
let muted = false;
let cameraOff = false;
// 음소거와 카메라 끄기의 상태를 위한 변수

async function getMedia() {
    try {
        myStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true,
            // constraints : 우리가 얻고싶은것
        });
        myFace.srcObject = myStream;
        // 카메라 화면이 나옴
    } catch (e) {
        console.log(e)
    }
}

getMedia();

function handleMuteClick() {
    if(!muted) {
        muteBtn.innerText = "Unmute";
        muted = true;
    } else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}
function handleCameraClick() {
    if (cameraOff) {
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    } else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);