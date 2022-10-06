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

chrome.runtime.onMessage.addListener(async (response, callback) => {
  if (response.message === "start Page-Comment origin") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { message: "start_origin" },
        function (response) {
          console.log("message sent");
        }
      );
    });
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

// chrome.runtime.onMessage.addListener((response, callback) => {
//   switch (response.message) {
//     case "profile_href_loaded_origin":
//       const uid = get_uid(response.profiles_href);
//       download(uid[0], uid[1], "UID's list of people who had commented");
//       break;
//     case "error":
//       console.log(response.error_msg);
//       break;
//   }
// });

function onStartedDownload(id) {
  console.log(`Started downloading: ${id}`);
}

function onFailed(error) {
  console.log(`Download failed: ${error}`);
}

function download(profiles_hrefs, profiles_href_length) {
  var time = setInterval(() => {
    if (profiles_href_length == profiles_hrefs.length) {
      clearInterval(time);
      var allEntries = "";
      for (var j = 0; j < profiles_hrefs.length; j++) {
        allEntries = allEntries.concat(
          profiles_hrefs[j]["name"] + " : " + profiles_hrefs[j]["id"] + "\n"
        );
        const now = new Date();
        const blob = new Blob([allEntries], {
          type: "text/plain",
        });
        var url = URL.createObjectURL(blob);
        chrome.downloads
          .download({
            url: url,
            filename:
              "PageComment/" +
              "Report-" +
              now.getFullYear() +
              "-" +
              now.getMonth() +
              "-" +
              now.getDate() +
              " at " +
              now.getHours() +
              "_" +
              now.getMinutes() +
              "_" +
              now.getMilliseconds() +
              ".txt",
            conflictAction: "uniquify",
          })
          .then(onStartedDownload, onFailed);
      }
      // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      //   chrome.tabs.sendMessage(
      //     tabs[0].id,
      //     { message: "allEntries", allEntries: allEntries},
      //     function (response) {
      //       console.log("allEntries sent");
      //     }
      //   );
      // });
    }
  });
}

function get_uid(comments_list) {
  const profiles_href = comments_list;
  const profiles_hrefs = [];
  var profiles_href_length = profiles_href.length;
  for (var j = 0; j < profiles_href.length; j++) {
    if (profiles_href[j]["link"].search("http") != -1) {
      let new_comment = {
        name: profiles_href[j]["name"],
        id: "",
        comments_text: profiles_href[j]["comments_text"],
      };
      const myRequest = new Request(profiles_href[j]["link"]);
      fetch(myRequest)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error, status = ${response.status}`);
          }
          return response.text();
        })
        .then((data) => {
          let uid = /"userID":"([^"]+)"/.exec(data);
          if (uid != null) {
            new_comment["id"] = uid[1];
            profiles_hrefs.push(new_comment);
          } else {
            new_comment["id"] = "null";
            profiles_hrefs.push(new_comment);
          }
        })
        .catch((error) => {
          profiles_href_length -= 1;
          console.log(error);
        });
    } else {
      profiles_hrefs.push({
        name: profiles_href[j]["name"],
        id: profiles_href[j]["link"],
        comments_text: profiles_href[j]["comments_text"],
      });
    }
  }
  return [profiles_hrefs, profiles_href_length];
}
