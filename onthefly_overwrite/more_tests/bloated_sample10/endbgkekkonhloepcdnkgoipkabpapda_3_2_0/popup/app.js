
var URL = "https://chrome.google.com/webstore/detail/" + chrome.runtime.id;
var SHARE_URL = URL;
var REVIEW_URL = URL + "/reviews";

function updateCount() {
    document.getElementById("count-value").innerHTML = Math.min(Storage.get("count", 0), 999999999999);
}

window.addEventListener("load", function()
{
    // set the count
    Storage.load(function() {
        updateCount();
        setInterval(updateCount, 100);
    });
    // set the review url
    document.getElementById("links-review").setAttribute("href", REVIEW_URL);
    // set the share url
    document.getElementById("links-page").setAttribute("href", SHARE_URL);
    // stop share url click from navigating
    // and instead open a new window
    document.getElementById("links").addEventListener("click", function(e) {
        e.preventDefault();
        if (e.target.getAttribute("href")) {
            window.open(e.target.getAttribute("href"));
        }
    });
    // listen to share buttons
    document.getElementById("share").addEventListener("click", function(e) {
        var type = e.target.getAttribute("data-service");
        // stop if no type
        if (!type) {
            return;
        }
        var url = "";
        var width = 600;
        var height = 600;
        if (type === "facebook") {
            url     = "https://www.facebook.com/sharer/sharer.php?u=SHARE";
            width   = 615;
            height  = 575;
        }
        else if(type == "twitter") {
            url = "https://twitter.com/intent/tweet?url=URL&text=NAME";
        }
        else if( type == "google" ) {
            url = "https://plus.google.com/share?url=SHARE";
        }
        else {
            url = "mailto:?subject=NAME&body=URL";
        }
        var top = (screen.availHeight - height) / 3;
        var left = (screen.availWidth - width) / 2;
        // complete the url by replacing parts
        url = url
            .replace("SHARE", encodeURIComponent(SHARE_URL))
            .replace("URL", encodeURIComponent(SHARE_URL))
            .replace("NAME", encodeURIComponent(chrome.runtime.getManifest().name))
        // open the popup
        window.open(url, "_ext_share", "height=" + height + ",width=" + width + ",left=" + left + ",top=" + top);
    });
});