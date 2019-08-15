// Load settings
var randomUsername = "Guest_" + Math.floor((Math.random() * 9999) + 1111);
var name = "";
var room = "";
var picture = "";
var autoopen = "false";
var sound = "true";


chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (key in changes) {
        var storageChange = changes[key];
        if (key == "username") {
            document.getElementById("talk_name").value = storageChange.newValue;
        } else if (key == "room") {
            document.getElementById("talk_room").value = storageChange.newValue;
        } else if (key == "autoopen") {
            document.getElementById("talk_autoopen").value = storageChange.newValue;
        } else if (key == "sound") {
            document.getElementById("talk_sound").value = storageChange.newValue.toString();
        } else if (key == "picture") {
            document.getElementById("talk_picture").value = storageChange.newValue;
        }
        console.log(key + " CHANGED FOR " + storageChange.newValue.toString());
    }
});


chrome.storage.sync.get({

    username: randomUsername
    , room: ''
    , picture: ''
    , autoopen: "false"
    , sound: "true"

}, function (items) {

    name = items.username;
    room = items.room;
    picture = items.picture;
    autoopen = items.autoopen;
    sound = items.sound;
    console.log(name + " - " + room + " (auto=" + autoopen + ", sound=" + sound + ")");

    InjectJQuery();
    setTimeout(InjectJQueryUI, 1000);
    setTimeout(LoadApp, 2000);

});

function LoadApp() {
    InjectFonts();
    InjectChat();
    //InjectContainer();
    InjectHTML();
}

function InjectContainer() {
    var div = document.createElement("div");
    div.id = "talk_container";

    // Move the body's children into this wrapper
    while (document.body.firstChild) {
        div.appendChild(document.body.firstChild);
    }

    // Append the wrapper to the body
    document.body.appendChild(div);
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function InjectFonts() {
    var styleNode = document.createElement("style");
    styleNode.type = "text/css";
    styleNode.textContent = "@font-face { font-family: 'Roboto Condensed'; font-weight:normal; font-stretch:condensed; src: url('" + chrome.extension.getURL("RobotoCondensed-Regular.ttf") + "'); }";
    document.head.appendChild(styleNode);
    var styleNode = document.createElement("style");
    styleNode.type = "text/css";
    styleNode.textContent = "@font-face { font-family: 'Roboto Condensed'; font-weight:lighter; font-stretch:condensed; src: url('" + chrome.extension.getURL("RobotoCondensed-Light.ttf") + "'); }";
    document.head.appendChild(styleNode);
    var styleNode = document.createElement("style");
    styleNode.type = "text/css";
    styleNode.textContent = "@font-face { font-family: 'Roboto Condensed'; font-weight:bold; font-stretch:condensed; src: url('" + chrome.extension.getURL("RobotoCondensed-Bold.ttf") + "'); }";
    document.head.appendChild(styleNode);
}

function CreateFragment(htmlStr) {
    var frag = document.createDocumentFragment()
        , temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}

function InjectHTML() {
    var fragment = CreateFragment('<div id="talk_background"></div><input id="talk_name" type="hidden" value="' + name + '" /><input id="talk_settingsurl" type="hidden" value="' + chrome.extension.getURL('options.html') + '" /> <input id="talk_autoopen" type="hidden" value="' + autoopen + '" /><input id="talk_picture" type="hidden" value="' + picture + '" /><input id="talk_sound" type="hidden" value="' + sound + '" /><input id="talk_room" type="hidden" value="' + room + '" /> <div id="talkify" onmouseover="" onmouseout="" class="no_blur" style="bottom:-328px;"><div id="talk_drag" style="overflow:hidden;"> <div id="talk_titlebar" class="titlebar"> <div class="titlebar_inner" onclick=""> <div id="talk_title" style="max-width:60%;" onclick="TalkToggle(true)">Talkify Beta</div> <img id="talk_toggle_icon" src="https://performetudes.ca/chat/Images/imgOpen.png" class="toggle" onclick="TalkToggle(true)" /><img id="talk_settings_icon" src="https://performetudes.ca/chat/Images/imgSettings.png" class="toggle" onclick="OpenSettings()" style="right: 36px;background-color: #f37936;"><img id="talk_enlarge_icon" src="https://performetudes.ca/chat/Images/imgEnlarge.png" class="toggle" onclick="ChangeChatSize()" style="right: 70px;"> </div> <div class="titlebar_under"></div> </div> <div id="talk_formSend"> <div id="talk_chat" class="textarea"></div> <div id="talk_updated" style="margin-left:7px;font-size:11px;font-family:\'Roboto Condensed\';font-weight:lighter;color:rgba(200, 200, 200, 1);">Ready</div><div class="input" id="talk_outerinput"><input id="talk_message" maxlength="400" type="text" class="input_send" name="message" autocomplete="off" value="" onkeyup="RegisterEnter(event)" /></div> <div id="talk_send" type="button" name="send" class="send"></div> </div></div> </div> <link href="https://performetudes.ca/chat/Content/style.css" rel="stylesheet" type="text/css" />');
    document.body.insertBefore(fragment, document.body.childNodes[0]);
}

function InjectChat() {
    var s = document.createElement('script');
    s.src = chrome.extension.getURL('chat.js');
    s.onload = function () {
        this.parentNode.removeChild(this);
    };
    (document.head || document.documentElement).appendChild(s);
}

function InjectJQuery() {
    var s = document.createElement('script');
    s.src = chrome.extension.getURL('jquery-2.2.3.js');
    s.onload = function () {
        this.parentNode.removeChild(this);
    };
    (document.head || document.documentElement).appendChild(s);
}

function InjectJQueryUI() {
    var s = document.createElement('script');
    s.src = chrome.extension.getURL('jquery-ui.js');
    s.onload = function () {
        this.parentNode.removeChild(this);
    };
    (document.head || document.documentElement).appendChild(s);
}