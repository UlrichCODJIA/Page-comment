function findChildComments(comment, list) {
  let index = 0;
  // Process comment
  let i = comment.querySelector("._2b06");
  let newComment = {};
  if (i !== null) {
    let name = i.children[0].innerText;
    let link =
      i.children[0].children[0] &&
      i.children[0].children[0].attributes &&
      (i.children[0].children[0].attributes[
        i.children[0].children[0].attributes.length - 1
      ].textContent ||
        "ERRORERROR");
    link = `https://www.facebook.com${link}`;
    newComment[name] = link;
    newComment = { name, link, child: [] };
    list.push(newComment);
  }

  let childComments = comment.querySelectorAll("._2b04");
  if (childComments !== "undefined") {
    childComments.forEach((childComment) => {
      index += findChildComments(childComment, newComment.child);
    });
  }

  return index + 1;
}

function load() {
  //to click more
  if (document.querySelector("._108_")) {
    document.querySelector("._108_").click();
  }
  // click on subcomments
  if (document.querySelectorAll("._2b1h.async_elem > a")) {
    document
      .querySelectorAll("._2b1h.async_elem > a")
      .forEach((a) => a.click());
  }
  // click on loadmore subcomments
  if (document.querySelectorAll("._2b1l > a.async_elem")) {
    document
      .querySelectorAll("._2b1l > a.async_elem")
      .forEach((a) => a.click());
  }
}

function loadTillEnd() {
  var comments = document.querySelectorAll("._2b04");
  load();
  var time = setInterval(function () {
    if (document.querySelectorAll("._2b04").length != comments.length) {
      load();
      comments = document.querySelectorAll("._2b04");
    } else {
      clearInterval(time);
      let list = [];
      //Find all comments on page
      for (var i = 0; i < comments.length; ) {
        i += findChildComments(comments[i], list); // Comments processing and hierarchy creation
      }
      const comments_list = {};
      for (var i = 0; i < list.length; i++) {
        comments_list[list[i]["name"]] = list[i]["link"];
        if (list[i]["child"].length != 0) {
          const childs = list[i]["child"];
          for (var j = 0; j < childs.length; j++) {
            comments_list[childs[j]["name"]] = childs[j]["link"];
          }
        }
      }
      const uid = get_uid(comments_list);
      download(uid[0], uid[1], "UID's list of people who had commented");
    }
  });
}

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
      }
      const blob = new Blob([allEntries], {
        type: "text/plain",
      });
      var url = URL.createObjectURL(blob);
      chrome.downloads
        .download({
          url: url,
          filename: "PageComment/" + filename + ".txt",
          conflictAction: "uniquify",
        })
        .then(onStartedDownload, onFailed);
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
          console.log(error);
        });
    } else {
      profiles_hrefs[i] = profiles_href[i];
    }
  }
  return [profiles_hrefs, profiles_href_length];
}

loadTillEnd();
