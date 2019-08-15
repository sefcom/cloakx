function sendMessage(parameters, callback){ // Special sendMessage function because Chrome messaging does not support callback functions
  var port = chrome.extension.connect();
  if (callback != undefined){
  	port.onMessage.addListener(function(message){
  		port.disconnect();
			callback(message);
		});
	}
  port.postMessage(parameters);
  if (callback == undefined) port.disconnect();
}

(function(){
  if (document.location.hostname == "login.emu.dk"){
    sendMessage({ "action": "popupHideAjaxLoading" });
    sendMessage({
      "action": "unicHeight",
      "height": document.body.parentNode.offsetHeight
    });
    
    var forms = document.querySelectorAll("form[action*='login.emu.dk']");
    if (!forms.length) return;
    
    forms[0].addEventListener("submit", function(){
      sendMessage({
        "action": "popupShowAjaxLoading",
        "timeout": 15000
      });
    });
  }
  else {
    document.body.style.display = "none";
    try {
      response = JSON.parse(document.body.innerText);
      sendMessage({
        "action": "unicLogin",
        "response": response
      });
    }
    catch(err){
      sendMessage({ "action": "popupHideAjaxLoading" });
      return;
    }
  }
})();