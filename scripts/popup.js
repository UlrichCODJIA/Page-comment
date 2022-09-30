function start() {
  chrome.runtime.sendMessage(
    { message: "start Page Comment" },
    function (response) {
      console.log("start Page Comment");
    }
  );
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("get_uid").addEventListener("click", start);
});
