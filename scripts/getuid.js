function findChildComments(comment, list) {
  let index = 0;
  // Process comment
  let i = comment.querySelector("._2b06");
  let newComment = {};
  if (i !== null) {
    let name;
    let parent_element_name_childnodes = i.children[0].children[0].childNodes;
    if (parent_element_name_childnodes.length > 1) {
      for (var j = 0; j < parent_element_name_childnodes.length; j++) {
        if (parent_element_name_childnodes[j].nodeName == "#test") {
          name = parent_element_name_childnodes[j].nodeValue.trim();
        }
      }
    } else {
      name = i.children[0].innerText;
    }
    let raw_link =
      i.children[0].children[0] &&
      i.children[0].children[0].attributes &&
      (i.children[0].children[0].attributes[
        i.children[0].children[0].attributes.length - 1
      ].textContent ||
        "ERRORERROR");
    raw_link = `https://www.facebook.com${raw_link}`;
    let link;
    if (raw_link.indexOf("profile.php?id") != -1) {
      var url = new URL(raw_link);
      var uid = url.searchParams.get("id");
      link = uid;
    } else {
      if (raw_link.indexOf("?__cft__") != -1) {
        link = raw_link.slice(0, raw_link.indexOf("?__cft__"));
      } else if (raw_link.indexOf("?eav=") != -1) {
        link = raw_link.slice(0, raw_link.indexOf("?eav="));
      } else {
        if (
          (raw_link,
          /(?:(?:http|https):\/\/)?(?:www.)?facebook.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w\-]*)?/.test(
            raw_link
          ) == true)
        ) {
          link =
            /(?:(?:http|https):\/\/)?(?:www.)?facebook.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w\-]*)?/.exec(
              raw_link
            )[0];
        }
      }
    }
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
      chrome.runtime.sendMessage(
        { message: "profile_href_loaded", profiles_href: comments_list },
        function (response) {
          console.log("profile_href_loaded");
        }
      );
    }
  });
}

loadTillEnd();
