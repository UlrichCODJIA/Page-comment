const loader = document.getElementById("load");
const open_mfacebook_btn = document.getElementById("open_mfacebook");
const get_uid_btn = document.getElementById("get_uid");

function start() {
  loader.style.display = "block";
  chrome.runtime.sendMessage(
    { message: "start Page Comment" },
    function (response) {
      console.log("start Page Comment");
    }
  );
}

function open_new_tab() {
  chrome.runtime.sendMessage({ message: "open_mfacebook" });
}

open_mfacebook_btn.addEventListener("click", open_new_tab);
get_uid_btn.addEventListener("click", start);

chrome.runtime.onMessage.addListener((response, callback) => {
  switch (response.message) {
    case "profile_href_loaded":
      const uid = get_uid(response.profiles_href);
      download(uid[0], uid[1], "UID's list of people who had commented");
      chrome.runtime.sendMessage({ message: "close_current_tab" });
      break;
    case "error":
      var h5 = document.createElement("h5");
      h5.appendChild(document.createTextNode(`Error: ${response.error_msg}`));
      document.body.children[0].insertBefore(
        h5,
        document.body.children[0].children[5]
      );
      break;
  }
});

function onStartedDownload(id) {
  console.log(`Started downloading: ${id}`);
}

function onFailed(error) {
  console.log(`Download failed: ${error}`);
}

function download(profiles_hrefs, profiles_href_length, filename) {
  var time = setInterval(() => {
    if (profiles_href_length == Object.keys(profiles_hrefs).length) {
      clearInterval(time);
      var allEntries = "";
      for (const i in profiles_hrefs) {
        allEntries = allEntries.concat(i + " : " + profiles_hrefs[i] + "\n");
        var no = document.createElement("td");
        var no_text = document.createTextNode(i);
        no.appendChild(no_text);
        var uid = document.createElement("td");
        var uid_text = document.createTextNode(profiles_hrefs[i]);
        uid.appendChild(uid_text);
        var tr = document.createElement("tr");
        tr.appendChild(no);
        tr.appendChild(uid);
        var element = document.getElementById("list_of_uid");
        element.appendChild(tr);
      }
      const now = new Date();
      loader.style.display = "none";
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
      /* Create worksheet from HTML DOM TABLE */
      var wb = XLSX.utils.table_to_book(document.getElementById("uid_table"));
      /* Export to file (start a download) */
      XLSX.writeFile(
        wb,
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
          ".xlsx"
      );
    }
  });
}

function get_uid(comments_list) {
  const profiles_href = comments_list;
  const profiles_hrefs = {};
  var profiles_href_length = Object.keys(profiles_href).length;
  for (const i in profiles_href) {
    if (profiles_href[i].search("http") != -1) {
      const myRequest = new Request(profiles_href[i]);
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
            profiles_hrefs[i] = uid[1];
          } else {
            profiles_hrefs[i] = "";
            // profiles_href_length -= 1
          }
        })
        .catch((error) => {
          var h5 = document.createElement("h5");
          h5.appendChild(document.createTextNode(`Error: ${error.message}`));
          document.body.children[0].insertBefore(
            h5,
            document.body.children[0].children[5]
          );
        });
    } else {
      profiles_hrefs[i] = profiles_href[i];
    }
  }
  return [profiles_hrefs, profiles_href_length];
}
