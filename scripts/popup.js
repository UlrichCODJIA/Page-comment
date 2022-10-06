const loader = document.getElementById("load");
const open_mfacebook_btn = document.getElementById("open_mfacebook");
const get_uid_btn = document.getElementById("get_uid");
const get_uid_origin_btn = document.getElementById("get_uid_origin");
const switcher = document.getElementById("switcher");
const origin_fb_btn = document.getElementById("origin_fb_btn");
const m_fb_btn = document.getElementById("m_fb_btn");
const m_fb = document.getElementById("m_fb");
const origin_fb = document.getElementById("origin_fb");

function start() {
  loader.style.display = "block";
  chrome.runtime.sendMessage(
    { message: "start Page-Comment" },
    function (response) {
      console.log("start Page-Comment");
    }
  );
}

function start_origin() {
  chrome.runtime.sendMessage(
    { message: "start Page-Comment origin" },
    function (response) {
      console.log("start Page-Comment");
    }
  );
}

function open_new_tab() {
  chrome.runtime.sendMessage({ message: "open_mfacebook" });
}

origin_fb_btn.addEventListener("click", () => {
  switcher.style.display = "none";
  origin_fb.style.display = "block";
});
m_fb_btn.addEventListener("click", () => {
  switcher.style.display = "none";
  m_fb.style.display = "block";
});
open_mfacebook_btn.addEventListener("click", open_new_tab);
get_uid_btn.addEventListener("click", start);
get_uid_origin_btn.addEventListener("click", start_origin);


chrome.runtime.onMessage.addListener((response, callback) => {
  switch (response.message) {
    case "profile_href_loaded":
      const uid = get_uid(response.profiles_href);
      download(uid[0], uid[1], "UID's list of people who had commented");
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
    if (profiles_href_length == profiles_hrefs.length) {
      clearInterval(time);
      var allEntries = "";
      for (var j = 0; j < profiles_hrefs.length; j++) {
        allEntries = allEntries.concat(
          profiles_hrefs[j]["name"] + " : " + profiles_hrefs[j]["id"] + "\n"
        );
        var no = document.createElement("td");
        var no_text = document.createTextNode(profiles_hrefs[j]["name"]);
        no.appendChild(no_text);
        var uid = document.createElement("td");
        var uid_text = document.createTextNode(profiles_hrefs[j]["id"]);
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
      // chrome.runtime.sendMessage({ message: "close_current_tab" });
    }
  });
}

function get_uid(comments_list) {
  const profiles_href = comments_list;
  console.log(profiles_href);
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
            // profiles_href_length -= 1
          }
        })
        .catch((error) => {
          // profiles_hrefs.push({
          //   name: profiles_href[j]["name"],
          //   id: "Null",
          //   comments_text: profiles_href[j]["comments_text"],
          // });
          profiles_href_length -= 1;
          console.log(error);
          var h5 = document.createElement("h5");
          h5.appendChild(document.createTextNode(`Error: ${error.message}`));
          document.body.children[0].insertBefore(
            h5,
            document.body.children[0].children[5]
          );
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
