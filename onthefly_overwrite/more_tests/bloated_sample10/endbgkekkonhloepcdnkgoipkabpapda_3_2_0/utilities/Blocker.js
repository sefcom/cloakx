function Blocker() {}

var _BLACKLIST = [
    /\/ad/,
    /\/ads/,
    /fwmrm\.net/,
    /fwnrm/,
    /stickyadstv\.com/,
    /ads-pd\.nbcuni\.com/,
    /googleads/,
    /doubleclick/,
    /pageads/,
    /googleadservices/,
    /adServer/,
    /vevo/,
    /innovid/,
    /vindicosuite/,
    /imrworldwide/,
    /adsafeprotected/,
    /pulse\.mcdonalds\.com/,
    /bs\.serving-sys\.com/,
];

Blocker._TRAY_COUNT_RESET_TIME = 10000;
Blocker._BLOCKING_FLAG_RESET_TIME = 3000;
Blocker._running = false;
Blocker._blockingFlag = false;
Blocker._blockingTimer = null;
Blocker._trayCountValue = 0;
Blocker._trayCountTimer = null;
Blocker._curPageUrl = "";
Blocker._curVideoId = "";
Blocker._events = {};

Blocker.start = function() {
    if (Blocker._running) {
        return;
    }
    Blocker._running = true;
    // start listening for url requests on all urls
    chrome.webRequest.onBeforeRequest.addListener(Blocker._onRequest.bind(Blocker), { urls:[ "*://*/*" ] }, ["blocking"]);
}

Blocker.listen = function(type, callback) {
    Blocker._events[type] = Blocker._events[type] || [];
    Blocker._events[type].push(callback);
}

Blocker._fire = function(type, e) {
    var list = Blocker._events[type] || [];
    var data = { type:type, data:e };
    for (let i = 0; i < list.length; ++i) {
        list[i](data);
    }
}

Blocker._onRequest = function(e) {
    var type = e.type;
    var url = e.url;
    var block = 0;
    // if this is a main page request
    // OR this is a youtube-navigation using browserHistory
    // to change the page
    // treat this as a main page load
    if (type === "main_frame" || (type === "xmlhttprequest" && /^.+?:\/\/(www\.)?youtube\..+?\/watch/.test(url))) {
        // save the current page url for reference on next requests
        Blocker._curPageUrl = url;
        // try to set the current video url for reference later
        Blocker._curVideoId = (url.match(/^.+?:\/\/(www\.)?youtube\..+?\/watch\?v=([^&]+)/) || [])[2] || "";
    }
    // don't block anything on the youtube homepage
    if (/^.+?:\/\/(www\.)?youtube\..+?\/$/.test(Blocker._curPageUrl)) {
        return;
    }
    // restart blocking-listening if we see a youtube request
    if (!Blocker._blockingFlag && /^.+?\/\/.*?\.youtube\./.test(url)) {
        Blocker._blockingFlag = true;
        Blocker._resetBlockingTimer();
    }
    // do not block anything but these types
    if (!/^(other|script|xmlhttprequest)$/.test(type)) {
        return;
    }
    // stop here if we are not currently listening
    if (!Blocker._blockingFlag) {
        return;
    }
    // regular advertisements by google's network
    for (var i = 0; i < _BLACKLIST.length; ++i) {
        if (_BLACKLIST[i].test(url)) {
            block = 1;
            break;
        }
    }
    // Youtube is trying to load data about a video that is not the one in the address-url-bar
    // and that is probably an ad.
    // These urls are for metadata about a video:
    // https://www.googleapis.com/youtube/v3/videos?id=yfu35za9nRU)
    // https://www.youtube.com/get_video_metadata?video_id=yfu35za9nRU
    // https://www.youtube.com/get_video_info?html5=1&video_id=yfu35za9nRU&
    if (!block && Blocker._curVideoId && type === "xmlhttprequest") {
        if (/^https?:\/\/www\.googleapis\.com\/youtube\/v3\/videos/.test(url)) {
            if (!(new RegExp("\\?id=" + Blocker._curVideoId)).test(url)) {
                block = 9;
            }
        }
        else if (/https?:\/\/www\.youtube\.com\/get_video_/.test(url)) {
            if (!(new RegExp("\\?video_id=" + Blocker._curVideoId)).test(url)) {
                block = 9;
            }
        }
    }
    // nothing to block
    if(!block ) {
        return;
    }
    // we use a new thread so that we do not block the return statement
    setTimeout(Blocker._onBlocked.bind(Blocker, e));
    // reset the blocking timer
    Blocker._resetBlockingTimer();
    // tell browser to block url request
    return { "cancel": true };
}

Blocker._onBlocked = function(e) {
    // increase the count
    ++Blocker._trayCountValue;
    // set the tray icon bubble count
    Blocker._updateTrayIconText();
    // reset the clear timer
    Blocker._trayCountTimer = clearTimeout(Blocker._trayCountTimer);
    Blocker._trayCountTimer = setTimeout(Blocker._onTrayCountTimer.bind(Blocker), Blocker._TRAY_COUNT_RESET_TIME);
    // fire the event
    Blocker._fire("block", e);
}

Blocker._resetBlockingTimer = function() {
    Blocker._blockingTimer = clearTimeout(Blocker._blockingTimer);
    Blocker._blockingTimer = setTimeout(Blocker._onBlockingTimer.bind(Blocker), Blocker._BLOCKING_FLAG_RESET_TIME);
}

Blocker._onBlockingTimer = function() {
    Blocker._blockingTimer = null;
    Blocker._blockingFlag = false;
}
    
Blocker._onTrayCountTimer = function() {
    Blocker._trayCountTimer = null;
    Blocker._trayCountValue = 0;
    Blocker._updateTrayIconText();
}
    
Blocker._updateTrayIconText = function() {
    // NOTE: value must be a string
    var value = (Blocker._trayCountValue || "") + "";
    chrome.browserAction.setBadgeText({ text: value });
}