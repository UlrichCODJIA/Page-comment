//To detect get UID button click action on popup
chrome.runtime.onMessage.addListener(async (response, callback) => {
  if (response.message === "open_mfacebook") {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { message: "start" });
  }
});

//To open new tab
chrome.runtime.onMessage.addListener(async (response, callback) => {
  if (response.message === "start Page-Comment") {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["./scripts/getuid.js"],
    });
  }
});

chrome.runtime.onMessage.addListener((response, callback) => {
  if (response.message === "start Page-Comment origin") {
    chrome.runtime.sendMessage({ message: "start_origin" });
  }
});

chrome.runtime.onMessage.addListener((response, callback) => {
  if (response.message === "open_new_tab") {
    switch (response.error) {
      case false:
        chrome.tabs.create({ url: response.url }, function (tab) {});
        break;
      case true:
        chrome.runtime.sendMessage({
          message: "error",
          error_msg: response.error_message,
        });
        break;
    }
  }
});

// //To kill new Tab
chrome.runtime.onMessage.addListener(async (response, callback) => {
  if (response.message === "close_current_tab") {
    chrome.tabs.remove(new_tab_id);
  }
});
