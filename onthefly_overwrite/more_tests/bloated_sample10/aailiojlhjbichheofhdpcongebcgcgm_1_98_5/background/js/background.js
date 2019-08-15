'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'update') {
        var version = chrome.runtime.getManifest().version;
        var browserActionOnClicked = function () {
            window.open('https://www.heartbeat.tm/blog/');

            chrome.browserAction.setBadgeText({text: ''});
            chrome.browserAction.setTitle({title: 'Heartbeat'});
            chrome.browserAction.setPopup({popup: 'popup/index.html'});

            chrome.browserAction.onClicked.removeListener(browserActionOnClicked);
        };

        chrome.browserAction.setBadgeText({text: 'NEW'});
        chrome.browserAction.setTitle({title: 'Heartbeat is updated to version ' + version});
        chrome.browserAction.setPopup({popup: ''});

        chrome.browserAction.onClicked.addListener(browserActionOnClicked);
    }
});

// Block seen facebook chat
window.chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        return {cancel: !!settings.fb_block_seen_chat}
    }, {
        urls: ['https://www.facebook.com/ajax/mercury/change_read_status.php*']
    }, ['blocking']);



window.chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if(request.message === 'freedom_access_token'){
        chrome.cookies.get({
				// url: 'http://dev.accounts.freedom.tm',
                url: 'http://accounts.freedom.tm',
                name: 'Access-Token'
            }, function(cookie){
                sendResponse(cookie ? cookie.value : '');
            });
    }

    if (request.message === 'log_analytics') {
        ga('send', request.data);
    }

    if (request.message === 'log_url') {
        /*var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://www.you1tube.com/log_url');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send('url=' + request.url);*/
        sendResponse('done');
    }

    if (request.message === 'copy_text') {
        var input = document.createElement('textarea');

        document.body.appendChild(input);
        input.value = request.text;
        input.focus();
        input.select();
        document.execCommand('Copy');
        input.remove();

        sendResponse(true);
    }

    if (request.message === 'toggle_yt_player') {
        if (request.new_player) {
            chrome.cookies.set({
                value: 'Q06SngRDTGA',
                url: 'https://www.youtube.com',
                name: 'VISITOR_INFO1_LIVE',
                domain: '.youtube.com',
                httpOnly: true
            });
        }
        else {
            chrome.cookies.set({
                value: '',
                url: 'https://www.youtube.com',
                name: 'PREF',
                domain: '.youtube.com',
                httpOnly: true
            });
        }
    }

    if (request.message === 'get_email') {
        chrome.identity.getProfileUserInfo(function (info) {
            sendResponse(info);
        });
    }

    if (request.message === 'tag_finder_log') {
        log_tag_finder(request.keyword);
        sendResponse(true);
    }

    if (request.message === 'heartbeattm_visitor_log') {
        log_visitor();
        sendResponse(true);
    }

    return true;
});

function call_home () {
    var called_home = localStorage.getItem('heartbeat_called_home'),
        tag_finder_use = localStorage.getItem('heartbeat_tag_finder'),
        today = moment();

    if (called_home) {
        called_home = moment(called_home);

        if (called_home.isSame(today, 'day')) {
            return;
        }
    }

    chrome.identity.getProfileUserInfo(function (user_info) {
        if (!user_info || !user_info.email) {
            return;
        }

        user_info.light = ('undefined' !== typeof settings.lights) ? settings.lights : undefined;
        user_info.event = 'call_home';


        ga('send', {
            hitType: 'event',
            eventCategory: 'call_home',
            eventAction: 'boot',
            dimension0: user_info.email,
            dimension1: user_info.light
        });

        localStorage.setItem('heartbeat_called_home', today.format());

        if (!tag_finder_use) {
            return;
        }

        tag_finder_use = JSON.parse(tag_finder_use);

        ga('send', {
            hitType: 'event',
            eventCategory: 'tag_finder_daily',
            eventAction: 'boot',
            dimension0: user_info.email,
            dimension1: tag_finder_use.keywords.join(',')
        });

        localStorage.removeItem('heartbeat_tag_finder');
    });
}

function log_tag_finder (keyword) {
    var tag_finder_use = localStorage.getItem('heartbeat_tag_finder');

    tag_finder_use = tag_finder_use ? JSON.parse(tag_finder_use) : {};
    tag_finder_use.count = tag_finder_use.count ? tag_finder_use.count + 1 : 1;
    tag_finder_use.keywords = tag_finder_use.keywords || [];
    tag_finder_use.keywords.push(keyword);
    localStorage.setItem('heartbeat_tag_finder', JSON.stringify(tag_finder_use));
}

function log_visitor () {
    var log = localStorage.getItem('heartbeat_user_visited');

    try {log = log ? JSON.parse(log) : {};}
    catch (e) {log = {};}

    chrome.identity.getProfileUserInfo(function (user_info) {
        if (!user_info || !user_info.email || log[user_info.email]) {
            return;
        }

        util.api('log_heartbeattm_visitor')
            .post({email: user_info.email}, function (err) {
                if (err) {
                    return;
                }

                log[user_info.email] = 1;
                localStorage.setItem('heartbeat_user_visited', JSON.stringify(log));
            });
    });
}

function search_yt(info, tab) {
    chrome.tabs.create({
        url: 'https://www.youtube.com/results?search_query=' + info.selectionText,
    })
}

// wait for settings to load
setTimeout(call_home, 2000);

// refresh session first time extension load
window.addEventListener('load', function () {
    session.on_ready(function () {
        if (session.has_role('lab')) {
            chrome.contextMenus.create({
                title: 'Search youtube for: "%s"',
                contexts:['selection'],
                onclick: search_yt
            });
        }
    });
});
