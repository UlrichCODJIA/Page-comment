function expand() {
  chrome.runtime.sendMessage({ expand: true, type: "start Page Comment" },function (response) {console.log("start Page Comment")});
}

function extract() {
  chrome.runtime.sendMessage({ extract: true, type: "extract" },function (response) {console.log("start Page Comment")});
}

function launch() {
  chrome.runtime.sendMessage({ launch: true, type: "start" },function (response) {console.log("start Page Comment")});
}
function exportFile() {
  chrome.runtime.sendMessage({ exportFile: true, type: "exportFile" },function (response) {console.log("start Page Comment")});
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("expand").addEventListener("click", expand);
  document.getElementById("extract").addEventListener("click", extract);
  document.getElementById("launch").addEventListener("click", launch);
  document.getElementById("export").addEventListener("click", exportFile);
});
