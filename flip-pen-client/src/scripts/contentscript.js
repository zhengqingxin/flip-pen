import ext from "./utils/ext";
import io from "socket.io-client";

const conf = {
  up: 38,
  down: 40,
  left: 37,
  right: 39
};
const URL = "https://pen.zhengqingxin.com";
var flipPen = {};
function onRequest(request) {
  if (request.action === "process-page") {
    if (flipPen.socket) {
      chrome.runtime.sendMessage({ url: flipPen.url });
      return;
    }
    var socket = io(URL);
    socket.on("connect", function() {
      // 获取建立成功的 socketId，生成带有 socketId 参数的链接，发送给 popup.html
      socket.emit("new");
      var rcUrl = `${URL}/index.html?id=${socket.id}`;
      chrome.runtime.sendMessage({ url: rcUrl });
      flipPen = {
        url: rcUrl,
        socket
      };
      // 实现向页面发送上，下，左，右的键盘消息
      socket.on("message", function(data) {
        if (data.action) {
          var keyCode = conf[data.action];
          var evt = new KeyboardEvent("keydown", {
            keyCode: keyCode,
            which: keyCode
          });
          document.dispatchEvent(evt);
        }
      });
    });
  }
}
// 接收从 popup.html 传来的消息，建立 websocket 连接
ext.runtime.onMessage.addListener(onRequest);
