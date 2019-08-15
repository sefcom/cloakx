if (document.location.hostname == "accounts.google.com") addClass(document.documentElement, "appwriter-loading");
else document.documentElement.style.display = "none";

function sendMessage(parameters, callback){ // Special sendMessage function because Chrome messaging does not support callback functions
  var port = chrome.extension.connect();
  if (callback !== undefined){
    port.onMessage.addListener(function(message){
      port.disconnect();
      callback(message);
    });
  }
  port.postMessage(parameters);
  if (callback === undefined) port.disconnect();
}


function ready(){
  insertHtml();
  
  // We're on a Google account page
  if (document.location.hostname == "accounts.google.com"){
    // We're on the confirm page - show loading until we've checked email
    if (document.location.pathname == "/o/oauth2/auth"){
      showAjaxLoading();
      var emails = document.documentElement.innerHTML.match(/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}\b/i);
      if (emails){
        sendMessage({ "action": "googleLoginAllowed", "email": emails[0] }, function(response){
          hideAjaxLoading();
          if (response["status"] == "success"){
            if (response["data"] == "LICENSE_GOOGLE_LOGIN_ALLOWED") removeClass(document.documentElement, "appwriter-loading");
            else {
              var errorText = "";                
              if (response["data"] == "LICENSE_NO_LICENSE_FOR_DOMAIN") errorText = chrome.i18n.getMessage("licenseNoLicense");
              else if (response["data"] == "LICENSE_LICENSE_DISABLED") errorText = chrome.i18n.getMessage("licenseDisabled");
              else if (response["data"] == "LICENSE_LICENSE_EXPIRED") errorText = chrome.i18n.getMessage("licenseExpired");
              else if (response["data"] == "LICENSE_MAX_USERS_REACHED") errorText = chrome.i18n.getMessage("licenseMaxUsersReached");
              else if (response["data"] == "LICENSE_GOOGLE_LOGIN_NOT_ALLOWED") errorText = chrome.i18n.getMessage("googleLoginNotAllowed");
              else errorText = chrome.i18n.getMessage("unexpectedError", "LICENSE_ERROR");
              openDialog(
                "AppWriter Cloud - " + chrome.i18n.getMessage("error"),
                errorText,
                "alert",
                function(){ closeWindow(); }
              );
            }
          }
          else {
            openDialog(
              "AppWriter Cloud - " + chrome.i18n.getMessage("error"),
              chrome.i18n.getMessage("unexpectedError", response["errorCode"]),
              "alert",
              function(){ closeWindow(); }
            );
          }
        });
      }
      else {
        hideAjaxLoading();
        openDialog(
          "AppWriter Cloud - " + chrome.i18n.getMessage("error"),
          chrome.i18n.getMessage("unexpectedError", "NO_EMAIL"),
          "alert",
          function(){ closeWindow(); }
        );
      }
    }
    else removeClass(document.documentElement, "appwriter-loading");
  }
  
  // Else we're on /user/googleLogin service page
  else {
    try {
      var pre = document.querySelector("body > pre:first-child");
      pre.style.display = "none";
      document.documentElement.style.display = "";
      response = JSON.parse(pre.innerHTML);
      
      if (response["status"] == "success"){
        sendMessage( // Get license statusses
          { "action": "getLicenseStatusses" },
          function(licenseStatusses){
            sendMessage( // Validate license
              { "action": "validateLicense", "licenseInfo": response["data"]["user"]["extraInfo"]["appwriterCloudLicense"] },
              function(licenseStatus){
                if (licenseStatus == licenseStatusses["LICENSE_VALID"]){ // License is valid
                  sendMessage({ // Send logged in message to popup
                    "action": "googleLoggedIn",
                    "sessionId": response["data"]["sessionId"],
                    "user": response["data"]["user"]
                  });
                  closeWindow();
                }
                else { // License is not valid
                  hideAjaxLoading();
                  var errorText;
                  if (licenseStatus == licenseStatusses["LICENSE_NO_LICENSE"]) errorText = chrome.i18n.getMessage("licenseNoLicense");
                  else if (licenseStatus == licenseStatusses["LICENSE_DISABLED"]) errorText = chrome.i18n.getMessage("licenseDisabled");
                  else if (licenseStatus == licenseStatusses["LICENSE_EXPIRED"]) errorText = chrome.i18n.getMessage("licenseExpired");
                  else errorText = chrome.i18n.getMessage("unexpectedError", "LICENSE_ERROR");
                  openDialog(chrome.i18n.getMessage("error"), errorText, "alert", function(){ closeWindow(); });
                }
              }
            );
          }
        );
      }
      else { // Response error
        if (response["errorCode"] == "USER_GOOGLE_APPROVE_CANCELLED") closeWindow();
        else {
          hideAjaxLoading();
          var errorText;
          if (response["errorCode"] == "LICENSE_NO_LICENSE_FOR_DOMAIN") errorText = chrome.i18n.getMessage("licenseNoLicense");
          else if (response["errorCode"] == "LICENSE_LICENSE_DISABLED") errorText = chrome.i18n.getMessage("licenseDisabled");
          else if (response["errorCode"] == "LICENSE_LICENSE_EXPIRED") errorText = chrome.i18n.getMessage("licenseExpired");
          else if (response["errorCode"] == "LICENSE_MAX_USERS_REACHED") errorText = chrome.i18n.getMessage("licenseMaxUsersReached");
          else if (response["errorCode"] == "LICENSE_GOOGLE_LOGIN_NOT_ALLOWED") errorText = chrome.i18n.getMessage("googleLoginNotAllowed");
          else errorText = chrome.i18n.getMessage("unexpectedError", response["data"]);
          openDialog(chrome.i18n.getMessage("error"), errorText, "alert", function(){ closeWindow(); });
        }
      }
    }
    catch(error){ // JSON error
      openDialog(
        "AppWriter Cloud - " + chrome.i18n.getMessage("error"),
        chrome.i18n.getMessage("unexpectedError", "JSON_ERROR"),
        "alert",
        function(){ closeWindow(); }
      );
      return;
    }
  }
}

setTimeout(function checkReady(){
  if (document.body){
    // We're on a Google account page
    if (document.location.hostname == "accounts.google.com"){
      ready();
      return;
    }
    
    // Else we're on /user/googleLogin service page
    else {
      var pres = document.getElementsByTagName("pre");
      if (pres.length){
        if (!/^\s*$/.test(pres[0].innerHTML)){
          ready();
          return;
        }
      }
    }
  }
  
  setTimeout(checkReady, 1);
}, 1);

function addClass(element, className){
  if (!element) return false;
  if ((" " + element.className.replace(/\s/g, " ") + " ").indexOf(" " + className + " ") == -1){
    element.className += " " + className;
    element.className = element.className.replace(/(^\s+|(\s)\s+|\s+$)/g, "$2"); // Trim and remove double spaces
  }
}

function removeClass(element, className){
  if (!element) return false;
  if ((" " + element.className.replace(/\s/g, " ") + " ").indexOf(" " + className + " ") != -1){
    element.className = (" " + element.className.replace(/\s/g, " ") + " ").replace(" " + className + " ", " ");
    element.className = element.className.replace(/(^\s+|(\s)\s+|\s+$)/g, "$2"); // Trim and remove double spaces
  }
}

var dialogCallback;
function openDialog(header, content, type, callback){
  document.getElementById("appwriter-dialog-header").innerHTML = header;
  document.getElementById("appwriter-dialog-content").innerHTML = content;
  document.getElementById("appwriter-dialog-wrapper").style.display = "table";
  if (type == "confirm"){
    document.getElementById("appwriter-dialog-cancel-button").style.display = "inline-block";
  }
  else if (type == "prompt"){
    document.getElementById("appwriter-dialog-cancel-button").style.display = "inline-block";
    document.getElementById("appwriter-dialog-input").style.display = "block";
  }
  if (callback) dialogCallback = callback;
}
function closeDialog(response){
  if (dialogCallback) dialogCallback(response);
  dialogCallback = undefined;
  document.getElementById("appwriter-dialog-header").innerHTML = "";
  document.getElementById("appwriter-dialog-content").innerHTML = "";
  document.getElementById("appwriter-dialog-input").innerHTML = "";
  document.getElementById("appwriter-dialog-wrapper").style.display = "none";
  document.getElementById("appwriter-dialog-input").style.display = "none";
  document.getElementById("appwriter-dialog-cancel-button").style.display = "none";
}


var ajaxLoadingTimeoutHandle;
function showAjaxLoading(timeout){
  if (timeout) ajaxLoadingTimeoutHandle = setTimeout(hideAjaxLoading, timeout);
  document.getElementById("appwriter-ajax-loading-wrapper").style.display = "block";
}
function hideAjaxLoading(){
  if (ajaxLoadingTimeoutHandle) clearTimeout(ajaxLoadingTimeoutHandle);
  document.getElementById("appwriter-ajax-loading-wrapper").style.display = "none";
}

function closeWindow(){
  sendMessage({ "action": "closeGoogleLoginWindow" });
}

function insertHtml(){
  document.body.insertAdjacentHTML("beforeend",
    '<div id="appwriter-ajax-loading-wrapper">' +
      '<img id="appwriter-ajax-loading" src="' + chrome.extension.getURL("images/ajax-loader-dialog.gif") + '" />' +
      '<div id="appwriter-ajax-loading-bg"></div>' +
      '<div id="appwriter-ajax-loading-overlay-bg"></div>' +
    '</div>' +
    '<div id="appwriter-dialog-wrapper">' +
      '<div id="appwriter-dialog-wrapper2">' +
        '<div id="appwriter-dialog">' +
          '<div id="appwriter-dialog-header"></div>' +
          '<div id="appwriter-dialog-content"></div>' +
          '<div id="appwriter-dialog-input" contenteditable="true"></div>' +
          '<div id="appwriter-dialog-buttons-wrapper">' +
            '<div id="appwriter-dialog-ok-button">' +
              '<div id="appwriter-dialog-ok-button-text" class="localized" data-message="ok">OK</div>' +
              '<div id="appwriter-dialog-ok-button-bg"></div>' +
            '</div>' +
            '<div id="appwriter-dialog-cancel-button">' +
              '<div id="appwriter-dialog-cancel-button-text" class="localized" data-message="cancel">Cancel</div>' +
              '<div id="appwriter-dialog-cancel-button-bg"></div>' +
            '</div>' +
          '</div>' +
          '<div id="appwriter-dialog-bg"></div>' +
        '</div>' +
      '</div>' +
      '<div id="appwriter-dialog-overlay-bg"></div>' +
    '</div>'
  );
  document.getElementById("appwriter-dialog-ok-button").addEventListener("click", function(){ closeDialog(true); });
  document.getElementById("appwriter-dialog-cancel-button").addEventListener("click", function(){ closeDialog(false); });
  
  var localizedElements = document.getElementsByClassName("localized");
  for (var i=0; i<localizedElements.length; i++){
    var element = localizedElements[i];
    var message = element.dataset.message;
    if (!message) element.innerHTML = "[TRANSLATION NOT SPECIFIED]";
    else {
      var attribute;
      if (message.split(":").length > 1){
        attribute = message.split(":")[0];
        message = message.split(":")[1];
      }
      message = chrome.i18n.getMessage(message);
      if (!message) element.innerHTML = "[UNDEFINED TRANSLATION]";
      else {
        if (attribute) $(element).attr(attribute, message);
        else element.innerHTML = message;
      }
    }
  }
}