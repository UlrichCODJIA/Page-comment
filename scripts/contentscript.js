chrome.runtime.onMessage.addListener((response, callback) => {
    if (response.message == "start") {
        var currentHref = window.location.href;
        var targetHref = getTargetHref(currentHref);
        issueAlert("Redirecting to target page. Click 'OK' to proceed.");
        console.log("Attempting to load page: " + targetHref);
        chrome.runtime.sendMessage({ "message": "open_new_tab", "url": targetHref });
            window.open(window.location.href.replace("www.facebook.com", "m.facebook.com"), "_blank")
            //to click more
            document.querySelector("._108_").click()
            // click on subcomments
            document.querySelectorAll("._2b1h.async_elem > a").forEach(a => a.click())
            // click on loadmore subcomments
            document.querySelectorAll("._2b1l > a.async_elem").forEach(a => a.click())
            let list = [];
            let comments = document.querySelectorAll("._2b04"); //Find all comments on page
            for (var i = 0; i < comments.length; ) {
                i += findChildComments(comments[i],list); // Comments processing and hierarchy creation
            }
            download(JSON.stringify(list, null, 2), 'report.json', 'text/plain');
    }
})

function getTargetHref(firstHref) {
    var targetHref = '';
    var matchOne = firstHref.match(/(?:https?\:\/\/|www\.)(?:facebook)(?:.com\/)/i);
    if (matchOne) {
        targetHref = firstHref.replace("www.facebook.com", "m.facebook.com")
    }
    else {
        const error = "Your current page must start by 'www'"
    }
    return targetHref
}

function findChildComments(comment, list){
    let index = 0;
    // Process comment
    let i = comment.querySelector("._2b06");
    
    let newComment = {};

    if(i !== null){
        let name = i.children[0].innerText;
        let link = i.children[0].children[0] && i.children[0].children[0].attributes && (i.children[0].children[0].attributes[i.children[0].children[0].attributes.length - 1].textContent || "ERRORERROR")
        link = `https://www.facebook.com${link}`
        newComment[name] = link;
        newComment = { name, link, comment, postedIn,child:[] };
        list.push(newComment);
    }
    
    let childComments = comment.querySelectorAll("._2b04");

    if (childComments !== 'undefined'){
        childComments.forEach( childComment =>{
            index += findChildComments(childComment, newComment.child);
        });
    }
    
    return index + 1;
}

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.style.display = "none";
    a.target = '_blank';
    a.click();
}
