import ext from "./utils/ext";
import QRCode from "qrcode";

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  const { url } = message;
  var canvas = document.getElementById("canvas");
  QRCode.toCanvas(canvas, url);
});
ext.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  var activeTab = tabs[0];
  chrome.tabs.sendMessage(activeTab.id, { action: "process-page" });
});
