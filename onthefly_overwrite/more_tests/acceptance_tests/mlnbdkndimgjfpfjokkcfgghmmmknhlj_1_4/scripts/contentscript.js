'use strict';


$(function(){
  $('html').addClass('kuku-io-extension-installed-in-this-browser');
});

var getDescription = function() {
  var text = window.top.$('p').first().text().substring(0, 200);
  return window.top.$('meta[property="og:description"]').text() ||  window.top.$('meta[name=description]').prop('content') || (text.length > 0 ? text + '...' : false) || '';
};

var getDetails = function() {
  var data = {
    title:  window.top.$('meta[property="og:title"]').prop('content') || window.top.document.title || window.top.$('h1').first().text() || '',
    description: getDescription(),
    url: window.top.document.location.href
  };
  return data;
};

var deleteParentClass = function() {
  var html = document.querySelector('html');
  html.classList.remove('changed-body-style');
};

var encodeData = function(data) {

  return Object.keys(data).map(function(k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
  }).join('&');
};

var createIframe = function() {
  var config = window.kukuConfig;
  //var iframe = body.find('.js-iframe-kuku').length;
  //arrayEvents.push(1);
  if (window === window.top) {
    var iframe = $('<iframe>');
    var data = getDetails();
    var urlData = encodeData(data);
    var src = config.iframeUrl + urlData;
    iframe.attr({'src': src, class: 'js-iframe-kuku iframe-kuku', scrolling: "yes"});
    iframe.appendTo('body');
  }
};

var expandReduce = function() {
  document.querySelector('.js-iframe-kuku').classList.toggle('reduce');
};

// var arrayEvents = [];
// var timerId;

var port = chrome.runtime.connect({name: "conversation"});

//listen events from background
chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {

  switch (message.type) {
    case "create-iframe":
      createIframe();
    break;

    case "change-css-style":
      var html = document.querySelector('html');
      html.classList.add('changed-body-style');
    break;

    case "check-loginization":
      var config = window.kukuConfig;
      $.ajax({
        url: config.isLoggedUrl,
        success: function(data) {
          if (data.logged === true) {
            if (!$('.js-iframe-kuku').length) createIframe();
          } else {
            port.postMessage({type: "create-window", url: config.windowUrl});
          }
        }
      });
    break;
  }
});

port.onMessage.addListener(function(msg) {
  switch (msg.type) {
    case 'close-iframe':
      break;
  }
});

var handleMessage = function(event) {
  //console.log(event.data.type);
  //alert(event.data.type);
  switch (event.data.type) {
    case 'authorization-complete':
      //if ($('.js-iframe-kuku').length) return;
      port.postMessage({type: "app-loaded"});
    break;

    case 'open-tab':
      $('.js-iframe-kuku').remove();
      deleteParentClass();
    break;

    case 'close-extension':
      if ($('.js-iframe-kuku').length) {
        $('.js-iframe-kuku').remove();
        deleteParentClass();
      //if from csp
      } else {
        //port.postMessage({type: "close-csp-tab"});
      }
    break;

    case 'csp-check':
     //port.postMessage({type: "csp-check"});
    break;

    case "expand-reduce-extension":
      expandReduce();
    break;
  }
  //window.removeEventListener("message", handleMessage, false);
};

//handle page events
window.addEventListener("message", handleMessage);