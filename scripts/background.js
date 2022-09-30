var new_tab_id

//To detect get UID button click action on popup
chrome.runtime.onMessage.addListener(async (response, callback) => {
  if (response.message === "open_mfacebook") {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { message: "start" });
  }
});

//To open new tab
chrome.runtime.onMessage.addListener(async (response, callback) => {
  if (response.message === "start Page Comment") {
    chrome.scripting.executeScript(
      {
        target: { tabId: new_tab_id },
        files: ["getuid.js"],
      }
    );
  }
});

chrome.runtime.onMessage.addListener(async (response, callback) => {
  if (response.message === "open_new_tab" && response.error === false) {
    chrome.tabs.create({ url: response.url }, function (tab) {
      new_tab_id = tab.id;
    });
  } 
  // else {
  //   chrome.runtime.sendMessage({ message: "error", message: response.error_message });
  // }
});

// //To kill new Tab
// chrome.runtime.onMessage.addListener(async (response, callback) => {
//   if (response.message === "close_current_tab") {
//     let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     chrome.tabs.remove(tab.id);
//   }
// });
