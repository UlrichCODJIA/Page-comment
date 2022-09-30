chrome.runtime.onMessage.addListener((response, callback) => {
  if (response.message == "start") {
    var currentHref = window.location.href;
    const targetHref = getTargetHref(currentHref);
    if (targetHref["error"] == false) {
      issueAlert("Redirecting to target page. Click 'OK' to proceed.");
      console.log("Attempting to load page: " + targetHref);
      chrome.runtime.sendMessage({ message: "open_new_tab", error: false, url: targetHref });
    } else {
      chrome.runtime.sendMessage(
        {
          message: "open_new_tab",
          error: true,
          error_message: targetHref["message"],
        },
        function (response) {}
      );
    }
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
