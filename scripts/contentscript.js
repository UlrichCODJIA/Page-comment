chrome.runtime.onMessage.addListener((response, callback) => {
  if (response.message == "start") {
    var currentHref = window.location.href;
    const targetHref = getTargetHref(currentHref);
    if (targetHref["error"] == false) {
      issueAlert("Redirecting to target page. Click 'OK' to proceed.");
      console.log("Attempting to load page: " + targetHref["targetHref"]);
      chrome.runtime.sendMessage({
        message: "open_new_tab",
        error: false,
        url: targetHref["targetHref"],
      });
    } else {
      chrome.runtime.sendMessage({
        message: "open_new_tab",
        error: true,
        error_message: targetHref["message"],
      });
    }
  }
});

chrome.runtime.onMessage.addListener((response, callback) => {
  if (response.message == "start_origin") {
    comment_section_open();
    console.log("EventListeners added");
  }
});

function getTargetHref(currentHref) {
  var context = { error: false, targetHref: "", message: "" };
  var matchOne = currentHref.match(
    /(?:https?\:\/\/|www\.)(?:facebook)(?:.com\/)/i
  );
  if (matchOne) {
    context["targetHref"] = currentHref.replace(
      "www.facebook.com",
      "m.facebook.com"
    );
  } else {
    context["message"] = "Your current page must start by 'www'";
    context["error"] = true;
  }
  return context;
}

function issueAlert(msg) {
  console.log("RaisedAlert: " + msg);
  alert(msg);
}

function get_posts() {
  var posts_list = [];
  const y = document.querySelectorAll("div");
  for (var i = 0; i < y.length; i++) {
    try {
      if (
        y[i].parentElement.getAttribute("role") == "feed" &&
        y[i].children[0].children[0].children[0].children[0].getAttribute(
          "role"
        ) == "article"
      ) {
        posts_list.push(y[i]);
      }
    } catch (err) {}
  }
  return posts_list;
}

function getElementsByXPath(xpath, parent) {
  let results = [];
  let query = document.evaluate(
    xpath,
    parent || document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );
  for (let i = 0, length = query.snapshotLength; i < length; ++i) {
    results.push(query.snapshotItem(i));
  }
  return results;
}

function get_comments(post_index) {
  var post = get_posts()[post_index];
  var comments_container;
  const ul_elmts = getElementsByXPath(
    "div/div/div/div/div/div/div/div/div/div[2]/div/div[4]/div/div/div[2]",
    post
  )[0].querySelectorAll("ul");
  try {
    for (var i = 0; i < ul_elmts.length; i++) {
      if (ul_elmts[i].attributes.length == 0) {
        comments_container = ul_elmts[i];
      }
    }
  } catch (err) {}
  var comments = comments_container.querySelectorAll("li");

  return comments;
}

function findChildComments(comment, list) {
  let index = 0;
  // Process comment
  let i = comment.querySelector("a");
  let newComment = {};
  if (i !== null) {
    let name = i.innerText;
    let raw_link = i.getAttribute("href");
    let link;
    if (raw_link.indexOf("profile.php?id") != -1) {
      var url = new URL(raw_link);
      var uid = url.searchParams.get("id");
      link = uid;
    } else {
      if (raw_link.indexOf("?comment_id") != -1) {
        link = raw_link.slice(0, raw_link.indexOf("?comment_id"));
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
    newComment["name"] = name;
    newComment["link"] = link;
    let comments_text;
    let all_div = comment.querySelectorAll("div");
    for (var j = 0; j < all_div.length; j++) {
      if (
        all_div[j].getAttribute("dir") == "auto" &&
        all_div[j].getAttribute("style") == "text-align: start;"
      ) {
        comments_text = all_div[j].innerText;
      }
    }
    newComment["comments_text"] = comments_text;
    newComment["child"] = [];
    list.push(newComment);
  }

  let childComments_list = comment.children[1].querySelector("ul");
  let childComments = childComments_list.querySelectorAll("li");
  if (childComments !== "undefined") {
    childComments.forEach((childComment) => {
      index += findChildComments(childComment, newComment.child);
    });
  }

  return index + 1;
}

function load(post_index) {
  //to click more
  try {
    const all_comments = getElementsByXPath(
      "div/div/div/div/div/div/div/div/div/div[2]/div/div[4]/div/div/div[2]/div[4]/div[1]/div[2]/span/span",
      get_posts()[post_index]
    )[0];
    if (all_comments) {
      all_comments.click();
    }
  } catch (err) {}
  // click on subcomments
  try {
    const sub_comments = getElementsByXPath(
      "div/div/div/div/div/div/div/div/div/div[2]/div/div[4]/div/div/div[2]/ul/li/div[2]/div/div[2]/div[2]/span[2]/span",
      get_posts()[post_index]
    );
    if (sub_comments) {
      sub_comments.forEach((elmt) => elmt.click());
    }
  } catch (err) {}
}

function loadTillEnd(post_index) {
  var comments = get_comments(post_index);
  load(post_index);
  var time = setInterval(function () {
    if (get_comments(post_index).length != comments.length) {
      load(post_index);
      comments = get_comments(post_index);
    } else {
      clearInterval(time);
      let list = [];
      var comments = get_comments(post_index);
      //Find all comments on page
      for (var i = 0; i < comments.length; ) {
        i += findChildComments(comments[i], list); // Comments processing and hierarchy creation
      }
      const comments_list = [];
      for (var i = 0; i < list.length; i++) {
        comments_list.push({
          name: list[i]["name"],
          link: list[i]["link"],
          comments_text: list[i]["comments_text"],
        });
        if (list[i]["child"].length != 0) {
          const childs = list[i]["child"];
          for (var j = 0; j < childs.length; j++) {
            comments_list.push({
              name: childs[j]["name"],
              link: childs[j]["link"],
              comments_text: childs[j]["comments_text"],
            });
          }
        }
      }
      console.log(Object.keys(comments_list).length);
      chrome.runtime.sendMessage(
        { message: "profile_href_loaded", profiles_href: comments_list },
        function (response) {
          console.log("profile_href_loaded");
        }
      );
    }
  }, 5000);
}

function comment_section_open() {
  const posts_list = get_posts();
  for (var i = 0; i < posts_list.length; i++) {
    const all_comments = getElementsByXPath(
      "div/div/div/div/div/div/div/div/div/div[2]/div/div[4]/div/div/div[2]/div[4]/div[1]/div[2]/span/span",
      posts_list[i]
    )[0];
    all_comments.addEventListener("click", loadTillEnd(i));
  }
}
