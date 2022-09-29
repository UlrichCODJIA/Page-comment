console.log('****This is the background script executing****')
console.log('****This is used in a situation where there is no pop-up****')
console.log('****In this case the user just clicks the browser extension icon and something happens behind the scenes****')


chrome.runtime.onMessage.addListener(async (response, callback) => {
    if (response.message === "start Page Comment") {
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.sendMessage(tab.id, { message: "start" });
    }
});