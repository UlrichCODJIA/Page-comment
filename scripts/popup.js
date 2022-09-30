function start() {
  chrome.runtime.sendMessage(
    { message: "start Page Comment" },
    function (response) {
      console.log("start Page Comment");
    }
  );
}

function open_new_tab() {
  chrome.runtime.sendMessage(
    { message: "open_mfacebook" },
    function (response) {
    }
  );
}

document.getElementById("open_mfacebook").addEventListener("click", open_new_tab);
document.getElementById("get_uid").addEventListener("click", start);
