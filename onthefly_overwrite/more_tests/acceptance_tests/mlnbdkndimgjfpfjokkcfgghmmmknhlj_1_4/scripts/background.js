'use strict';

//chrome.runtime.onInstalled.addListener(function (details) {
//  console.log('previousVersion', details.previousVersion);
//});

////listen when page loaded
//chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//  if (changeInfo.status === 'complete') {
//
//  }
//});

//add text to icon
//chrome.browserAction.setBadgeText({text: 'hello'});

//listen click of extension icon
chrome.browserAction.onClicked.addListener(function(tab) {
  //change body style of mother page
  chrome.tabs.sendMessage(tab.id, {type: "change-css-style"});
  //check user loginization
  chrome.tabs.sendMessage(tab.id, {type: "check-loginization"});

});

//listen events from content script
chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "conversation");
  port.onMessage.addListener(function(msg) {

    switch (msg.type) {
      case "app-loaded":
        chrome.windows.getLastFocused({populate: true, windowTypes: ["popup"]}, function(window) {
          //if (window.type === 'popup' && window.tabs.length === 1 && window.tabs[0].url.indexOf('kuku') > -1)
          if (window && window.tabs.length === 1) {
            chrome.windows.remove(window.id, function() {
              chrome.tabs.query({active: true}, function(tab) {
                if (tab[0]) {
                  //usually behavior
                  chrome.tabs.sendMessage(tab[0].id, {type: "create-iframe"});
                } else {
                  // if we logined and havn't active tabs will be find last window and download iframe
                  chrome.windows.getAll({populate: true, windowTypes: ["normal"]}, function(windows) {
                    var window = windows[windows.length - 1];
                    var tab = window.tabs[window.tabs - 1];
                    chrome.tabs.sendMessage(tab.id, {type: "create-iframe"});
                  });
                }
              });
            });
          }
        });
        //if (createdWindowId) {
        //  chrome.windows.remove(createdWindowId, function() {
        //    createdWindowId = '';
        //    chrome.tabs.sendMessage(tabId, {type: "create-iframe"});
        //  });
        //}
        break;

      //case "close-iframe":
      //  chrome.tabs.get(port.sender.tab.id, function(tab) {
      //      port.postMessage({type: 'close-iframe', data: port.sender.tab.id});
      //    }
      //  );
      //  break;

      case "create-iframe-new-tab":
        chrome.tabs.create({url: msg.url, active: true, openerTabId: port.sender.tab.id});
        break;

      //case "close-csp-tab":
      //  console.log('port', port);
      //  console.log('msg', msg);
      //  chrome.tabs.remove(port.sender.tab.id);
      //  break;

      //case "csp-check":
      //  chrome.tabs.sendMessage(port.sender.tab.id, {type: "create-iframe"});
      //  break;

      case "create-window":
        var width = 600;
        var height = 600;

        chrome.windows.create({
          "url": msg.url,
          "type": "popup",
          //tabId: tabId,
          width: width,
          height: height,
          left: Math.round((screen.availWidth - width) / 2),
          top: Math.round((screen.availHeight - height) / 2)
          //"focused": true
        }, function(createdWindow) {
          //console.log('createdWindow', createdWindow);
          //createdWindowId = createdWindow.id;
        });
        break;
    }
  });
});