// 프론트엔드
const socket = new WebSocket(`ws://${window.location.host}`);
// 백엔드와 실시간으로 연결할 socket을 만듬. 프로토콜을 ws로 바꿔줘야 한다
// 다른 기기에서도 볼 수 있도록 host 주소로 지정