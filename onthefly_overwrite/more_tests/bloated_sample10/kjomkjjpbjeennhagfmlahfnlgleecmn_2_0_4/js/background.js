
var mFacebook 	  = "https://www.facebook.com/";
var mFacebookVi   = "https://vi-vn.facebook.com/";
var mFacebookWeb  = "https://web.facebook.com/";

var mChat         = "_https://www.facebook.com/ajax/mercury/send_messages.php";
var mUpdateStatus = "_https://www.facebook.com/ajax/updatestatus.php";
var mLikeStatus   = "https://www.facebook.com/ajax/ufi/like.php";
var mLikeComment  = "https://www.facebook.com/ajax/ufi/comment_like.php";
var mLikeFanPage  = "https://www.facebook.com/ajax/pages/fan_status.php";
var mFollow		  = "https://www.facebook.com/ajax/follow/follow_profile.php";
var mFollowList   = "https://www.facebook.com/ajax/friends/lists/subscribe/modify?location=permalink&action=subscribe&flid=";
var mAddGroup	  = "https://www.facebook.com/ajax/groups/members/add_post.php";
var mGroup        = "https://www.facebook.com/groups/";

var mLikeStatusEx  = "https://www.facebook.com/ufi/reaction/";
var mLikeCommentEx = "https://www.facebook.com/ufi/comment/like/";

var mFBSafe		  = ["http://vnedu.vn/"];
var mPaySafe	  = ["http://thanhtoanonline.vn/", "http://pay.vnwebgame.com/", "http://pay.nuthankiem.com/", "http://doc.edu.vn/", "http://alonhadat.com.vn/"];

var type_msg = "SendMessage";
var type_stt = "UpdateStatus";
var type_like = "Like";
var type_likepage = "LikePage";
var type_follow = "Follow";
var type_addgroup = "AddGroup";
var type_followlist = "FollowList";
var type_fakefacebook = "FakeFacebook";
var type_phonecard	= "PhoneCard";

var SIGN_STT = "7n8anEBQ9FoBUSt2u6aWizGpUW9J6yUgByV9GiyFqzCC-C26m6oDAyoSnx2ubhHAyXBBzEi";
var SIGN_MSG = "7n8anEAMCBynzpQ9UoGha4Cq74qbx2mbACFaaGGzQC-C26m6oDAyoSnx2ubhHAG8Ki";

var PERIOD_OF_TIME = 30000;
var MAXSOURCE = 20000;
var MAXSOURCE_STC = 100000;

/*Frequency parameters of law*/
var FREQUENCY_COUNT = 2;
var FREQUENCY_TIME  = 3000;
var fCount = 0;

var time_s = new Date().getTime();
var Buf = new String();
var htmlS = new String();
var Url = new String();

var _tab_id = new Number();
var _url_malware = new String();

chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse)
	{
		Buf = request.content;
		htmlS = request.htmlSe;
		Url = request.url;

		if (((_tab_id != sender.tab.id) || (_url_malware != Url)) &&
			(Url.indexOf(".vn") == -1) &&
			(Url.indexOf(mFacebook) == -1) &&
			(Url.indexOf(mFacebookVi) == -1) &&
			(Url.indexOf(mFBSafe[0]) == -1) &&
			(FakeFacebookLogin_New(htmlS) == true)) {
				_tab_id = sender.tab.id;
				_url_malware = Url;
				ShowDialogWS(sender.tab.id, Url, type_fakefacebook);
		}

		if (((_tab_id != sender.tab.id) || (_url_malware != Url)) &&
			(Url.indexOf(".vn") == -1) &&
			(Url.indexOf(mFacebook) == -1) &&
			(Url.indexOf(mFacebookVi) == -1) &&
			(Url.indexOf(mFacebookWeb) == -1) &&
			(Url.indexOf(mFBSafe[0]) == -1) &&
			(Url.indexOf(mPaySafe[0]) == -1 ) &&
			(Url.indexOf(mPaySafe[1]) == -1 ) &&
			(Url.indexOf(mPaySafe[2]) == -1 ) &&
			(Url.indexOf(mPaySafe[3]) == -1 ) &&
			(Url.indexOf(mPaySafe[4]) == -1 ) &&
			(StolenTelephoneCard(htmlS) == true)) {
				_tab_id = sender.tab.id;
				_url_malware = Url;
				ShowDialogWS(sender.tab.id, Url, type_phonecard);
		}

	}
);

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {

		var msgS = {actW: request.user_tranf};

		if ((request.user_tranf.indexOf("FakeFacebook") != -1) ||
			(request.user_tranf.indexOf("PhoneCard") != -1)) {

			var countWebpage = 0;
			chrome.windows.getAll({"populate":true}, function(windows) {

				    for (var i in windows) {
				    	var tabs = windows[i].tabs;
				    	countWebpage += tabs.length;
				    }
				    
				    if ((request.user_tranf.indexOf("Block") != -1) && (request.user_tranf.indexOf("Allow") == -1)) {

				    	if (countWebpage <= 1) {
				    		chrome.tabs.create({"url": "chrome://newtab", "selected": true}, function() {});
				    		chrome.tabs.remove(request.user_id);
				    	} else {
				    		chrome.tabs.remove(request.user_id);
				    	}
				    		
				    }
					
				});
		}
		
		chrome.runtime.sendNativeMessage("com.bkav.facebook", msgS, function(response) {});
	}
);

chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		if(details.url.indexOf(mChat) != -1) {
			// To do --> Chat
			if(Buf.length <= 0) return {};
			var textMsg = new String();
			var fbidMsg = new String();
			var signMsg = new String();
			if(details.requestBody.formData) {

				textMsg = details.requestBody.formData["message_batch[0][body]"];
				fbidMsg = details.requestBody.formData["message_batch[0][specific_to_list][0]"];
				signMsg = details.requestBody.formData["__dyn"];
			} else if(details.requestBody.raw) {

				textMsg = GetEleFromPacket(details, "message_batch[0][body]");
				fbidMsg = GetEleFromPacket(details,"message_batch[0][specific_to_list][0]");
				signMsg = GetEleFromPacket(details, "__dyn");
			}

			var textLink = SearchLink(textMsg);
			if ((textLink.indexOf(mFacebook) != -1) || (textLink.indexOf(mFacebookVi) != -1)) {
				textLink = "";
			}
			
			fbidMsg = fbidMsg.substr(5, fbidMsg.length - 5);
			if(textLink.length > 0) {
				Buf = SpecialCharacters(Buf);
				textLink = SpecialCharacters(textLink);
				if((Buf.indexOf(textLink) == -1) && (signMsg != SIGN_MSG)) {

					var time_m = new Date().getTime();
					if(time_m - time_s > PERIOD_OF_TIME) {

						time_s = time_m;
						ShowDialog(details, textLink, type_msg, textMsg, fbidMsg);
						
					} else {

						var msg_auto = type_msg + "|Block|" + textLink;
						chrome.runtime.sendNativeMessage("com.bkav.facebook", {actW: msg_auto}, function(response) {});
					}

					return {cancel: true};
					
				} else {
					return {};
				}
			} else {
				return {};
			}

		} else if(details.url.indexOf(mUpdateStatus) != -1) {
			//VietHQc - Comment UpdateStatus - 22/7/2016

			// To do --> Update Status
			if(Buf.length <= 0) return {};
			var textStt = new String();
			var targetidStt = new String();
			var signStt = new String();
			if(details.requestBody.formData) {

				textStt = details.requestBody.formData["xhpc_message_text"];
				targetidStt = details.requestBody.formData["xhpc_targetid"];
				signStt = details.requestBody.formData["__dyn"];
			} else if(details.requestBody.raw) {	

				textStt = GetEleFromPacket(details, "xhpc_message_text");
				targetidStt = GetEleFromPacket(details, "xhpc_targetid");
				signStt = GetEleFromPacket(details, "__dyn");
			}

			var textLink = SearchLink(textStt);
			if ((textLink.indexOf(mFacebook) != -1) || (textLink.indexOf(mFacebookVi) != -1)) {
				textLink = "";
			}
			
			if(textLink.length > 0) {
				Buf = SpecialCharacters(Buf);
				textLink = SpecialCharacters(textLink);
				if((Buf.indexOf(textLink) == -1) && (signStt != SIGN_STT)) {

					var time_u = new Date().getTime();
					if(time_u - time_s > PERIOD_OF_TIME) {

						time_s = time_u;
						ShowDialog(details, textLink, type_stt, textStt, targetidStt);
						
					} else {

						var msg_auto = type_stt + "|Block|" + textLink;
						chrome.runtime.sendNativeMessage("com.bkav.facebook", {actW: msg_auto}, function(response) {});
					}

					return {cancel: true};

					
				} else {
					return {};
				}
			} else {
				return {};
			}
			
		} else if((details.url.indexOf(mLikeStatus) != -1) || (details.url.indexOf(mLikeComment) != -1) || (details.url.indexOf(mLikeStatusEx) != -1) || (details.url.indexOf(mLikeCommentEx) != -1)) {
			// To do --> Like
			if(htmlS.length <= 10) return {};
			var ft_ent_identifier = new String();
			var like_action = new String();
			if(details.requestBody.formData) {
				ft_ent_identifier = details.requestBody.formData["ft_ent_identifier"];
				like_action = details.requestBody.formData["like_action"];
			} else if(details.requestBody.raw){
				ft_ent_identifier = GetEleFromPacket(details, "ft_ent_identifier");
				like_action = GetEleFromPacket(details, "like_action");
			}

			if ((ft_ent_identifier.indexOf(":") != -1) || (ft_ent_identifier.indexOf("_") != -1)) {

				htmlS = "Kashi";
				return {};
			}

			if((htmlS.indexOf(ft_ent_identifier) == -1) && (like_action == "true")) {

				htmlS = "Kashi";
				var time_l = new Date().getTime();
				if (time_l - time_s > PERIOD_OF_TIME) {

					time_s = time_l;
					ShowDialog(details, "", type_like, "", ft_ent_identifier);
					return {};

				} else {

					var msg_auto = type_like + "|Block|" + ft_ent_identifier;
					chrome.runtime.sendNativeMessage("com.bkav.facebook", {actW: msg_auto}, function(response) {});
					return {cancel: true};
				}
			} else {
				htmlS = "Kashi";
				return {};
			}
			
		} else if(details.url.indexOf(mLikeFanPage) != -1) {
			// To do --> Like Fan Page
			if(htmlS.length <= 10) return {};
			var fbpage_id = new String();
			var add = new String();
			if(details.requestBody.formData){
				fbpage_id = details.requestBody.formData["fbpage_id"];
				add = details.requestBody.formData["add"];
			} else if(details.requestBody.raw){
				fbpage_id = GetEleFromPacket(details, "fbpage_id");
				add = GetEleFromPacket(details, "add");
			}

			if((htmlS.indexOf(fbpage_id) == -1) && (add == "true")) {

				htmlS = "Kashi";
				var time_lp = new Date().getTime();
				if (time_lp - time_s > PERIOD_OF_TIME) {

					time_s = time_lp;
					ShowDialog(details, "", type_likepage, "", fbpage_id);
					return {};

				} else {

					var msg_auto = type_likepage + "|Block|" + fbpage_id;
					chrome.runtime.sendNativeMessage("com.bkav.facebook", {actW: msg_auto}, function(response) {});
					return {cancel: true};
				}

			} else {
				htmlS = "Kashi";
				return {};
			}
			
		} else if(details.url.indexOf(mFollow) != -1) {
			// To do --> Follow
			if(htmlS.length <= 10) return {};
			var profile_id = new String();
			if(details.requestBody.formData) {
				profile_id = details.requestBody.formData["profile_id"];
			} else if(details.requestBody.raw) {
				profile_id = GetEleFromPacket(details, "profile_id");
			}

			if(htmlS.indexOf(profile_id) == -1) {

				htmlS = "Kashi";
				var time_f = new Date().getTime();
				if (time_f - time_s > PERIOD_OF_TIME) {

					time_s = time_f;
					ShowDialog(details, "", type_follow, "", profile_id);
					return {};

				} else {

					var msg_auto = type_follow + "|Block|" + profile_id;
					chrome.runtime.sendNativeMessage("com.bkav.facebook", {actW: msg_auto}, function(response) {});
					return {cancel: true};
				}
				
			} else {
				htmlS = "Kashi";
				return {};
			}
		} else if (details.url.indexOf(mAddGroup) != -1) {
			// To do --> Add Group

			/*if (Url.indexOf(mGroup) == -1) {
				return {cancel: true};
			}*/

			//VietHQc - Comment addground - 22/7/2016
			// var strGroup = Url.replace(mGroup, "");
			// var iBackSlash = strGroup.indexOf("/");

			// if (iBackSlash != -1) {
			// 	strGroup = strGroup.substr(0, iBackSlash);
			// }

			// var strConfirm = 'href="/groups/' + strGroup + '/" dir=""';

			// if(htmlS.length <= 10) return {};
			// var group_id = new String();
			// var members = new String();
			// var signAdd = new String();
			// if(details.requestBody.formData) {
			// 	group_id = details.requestBody.formData["group_id"];
			// 	members = details.requestBody.formData["members"];
			// 	signAdd = details.requestBody.formData["__dyn"];
			// } else if(details.requestBody.raw) {
			// 	group_id = GetEleFromPacket(details, "group_id");
			// 	members = GetEleFromPacket(details, "members");
			// 	signAdd = GetEleFromPacket(details, "__dyn");
			// }

			// if (signAdd == SIGN_STT) {
			// 	return {};
			// }

			// if (strGroup == group_id) {
			// 	return {};
			// }

			// if((Url.indexOf(mGroup) == -1) || 
			//    (htmlS.indexOf(strConfirm) == -1)) {

			// 	htmlS = "Kashi";
			// 	var time_a = new Date().getTime();
			// 	if (time_a - time_s > PERIOD_OF_TIME) {

			// 		time_s = time_a;
			// 		ShowDialog(details, "", type_addgroup, members, group_id);
			// 		return {cancel: true};

			// 	} else {

			// 		var msg_auto = type_addgroup + "|Block|" + group_id;
			// 		chrome.runtime.sendNativeMessage("com.bkav.facebook", {actW: msg_auto}, function(response) {});
			// 		return {cancel: true};
			// 	}
				
			// } else {
			// 	htmlS = "Kashi";
			// 	return {};
			// }

		} else if(details.url.indexOf(mFollowList) != -1) {
			// To do --> Follow
			if(htmlS.length <= 10) return {};
			var iStart = details.url.indexOf("flid");
			var flid = details.url.substr(iStart + 5, details.url.length - iStart - 5);
			if(htmlS.indexOf(flid) == -1) {

				htmlS = "Kashi";
				var time_fl = new Date().getTime();
				if (time_fl - time_s > PERIOD_OF_TIME) {

					time_s = time_fl;
					ShowDialog(details, "", type_followlist, "", flid);
					return {};

				} else {

					var msg_auto = type_followlist + "|Block|" + flid;
					chrome.runtime.sendNativeMessage("com.bkav.facebook", {actW: msg_auto}, function(response) {});
					return {cancel: true};
				}

			} else {
				htmlS = "Kashi";
				return {};
			}
		}
	},
	{urls: ["https://www.facebook.com/*"]},
	["blocking", "requestBody"]);
	
function GetEleFromPacket(details, title) {
	var strResult = new String();
	for (var i = 0; i < details.requestBody.raw.length ; i++) {
		var arrMsg = details.requestBody.raw[i].bytes;
		var dataView = new DataView(arrMsg);
		var ints = new Int8Array(arrMsg.byteLength);
		for (var i = 0; i < ints.length; i++) {
			ints[i] = dataView.getInt8(i);
		}
		var strMsg = atos(ints);
		strMsg = strMsg.split("%2F").join("/");
		strMsg = strMsg.split("%3A").join(":");
		
		var arrEle = strMsg.split("&");
		for (var i = 0; i < arrEle.length; i++) {
			var strEle = arrEle[i];
			if (strEle.indexOf(title) == 0) {
				strResult = strEle;
				break;
			}
		}
		strResult = strResult.split("=")[1];
	}
	return strResult;
}

function ShowDialog(details, fb_url, fb_type, fb_text, fb_targetid) {

	var msg_tranf = "/" + fb_targetid.toString();
	var bkav_language = "Vietnamese";

	chrome.runtime.sendNativeMessage("com.bkav.facebook", {actR: msg_tranf}, function(response) {
			bkav_language = response.text;
		})

	chrome.tabs.executeScript(details.tabId, {file: "js/jquery-1.10.2.min.js"}, function() {
		chrome.tabs.executeScript(details.tabId, {file: "js/bkavdialog.js"}, function() {
			chrome.tabs.executeScript(details.tabId, {file: "js/facebook.js"}, function() {	
				chrome.tabs.insertCSS(details.tabId, {file: "css/bkavdialog.css"}, function() {
					chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
						chrome.tabs.sendMessage(details.tabId,
							{
								fb_url: fb_url,
								fb_type: fb_type,
								fb_text: fb_text,
								fb_targetid: fb_targetid,
								fb_language: bkav_language
							},
							function(res){})
					})
					
				})
			});
		});
	});
}
	
function atos(arr) {
    for (var i=0, l=arr.length, s='', c; c = arr[i++];)
        s += String.fromCharCode(
            c > 0xdf && c < 0xf0 && i < l-1
                ? (c & 0xf) << 12 | (arr[i++] & 0x3f) << 6 | arr[i++] & 0x3f
            : c > 0x7f && i < l
                ? (c & 0x1f) << 6 | arr[i++] & 0x3f
            : c
        );

    return s;
}

function SearchLink(textMsg) {

	var strLink = new String();
	var iStartS = textMsg.lastIndexOf("https://");
	var iStartNS = textMsg.lastIndexOf("http://");

	if (iStartS == iStartNS) {

		strLink = "";
	} else if (iStartS > iStartNS) {

		var iLength = textMsg.indexOf("%20", iStartS);
		if(iLength == -1) {
			iLength = textMsg.length - iStartS;
		} else {
			iLength = iLength - iStartS;
		}
		strLink = textMsg.substr(iStartS, iLength);

	} else {

		var iLength = textMsg.indexOf("%20", iStartNS);
		if(iLength == -1) {
			iLength = textMsg.length - iStartNS;
		} else {
			iLength = iLength - iStartNS;
		}
		strLink = textMsg.substr(iStartNS, iLength);

	}

	return strLink;
}

function SpecialCharacters(strMsg){

	try {
		strMsg = strMsg.split("%21").join("!");
		strMsg = strMsg.split("%22").join("\"");
		strMsg = strMsg.split("%23").join("#");
		strMsg = strMsg.split("%24").join("$");
		strMsg = strMsg.split("%25").join("%");
		strMsg = strMsg.split("%26").join("&");
		strMsg = strMsg.split("%27").join(",");
		strMsg = strMsg.split("%28").join("(");
		strMsg = strMsg.split("%29").join(")");
		strMsg = strMsg.split("%2A").join("*");
		strMsg = strMsg.split("%2B").join("+");
		strMsg = strMsg.split("%2C").join("`");
		strMsg = strMsg.split("%2D").join("-");
		strMsg = strMsg.split("%2E").join(".");
		strMsg = strMsg.split("%2F").join("/");
	
		strMsg = strMsg.split("%3A").join(":");
		strMsg = strMsg.split("%3B").join(";");
		strMsg = strMsg.split("%3C").join("<");
		strMsg = strMsg.split("%3D").join("=");
		strMsg = strMsg.split("%3E").join(">");
		strMsg = strMsg.split("%3F").join("?");
		strMsg = strMsg.split("%40").join("@");
	
		strMsg = strMsg.split("%5B").join("[");
		strMsg = strMsg.split("%5C").join("\\");
		strMsg = strMsg.split("%5D").join("]");
		strMsg = strMsg.split("%5E").join("^");
		strMsg = strMsg.split("%5F").join("_");
		
		strMsg = strMsg.split("%7B").join("{");
		strMsg = strMsg.split("%7C").join("|");
		strMsg = strMsg.split("%7D").join("}");
		strMsg = strMsg.split("%7E").join("~");
		
	}
	catch(err){
	}
	return strMsg;
}


function ShowDialogWS(tabId, fb_url, fb_type) {

	var msg_tranf = "/" + tabId;
	var bkav_language = "Vietnamese";

	chrome.runtime.sendNativeMessage("com.bkav.facebook", {actR: msg_tranf}, function(response) {
			bkav_language = response.text;
		})

	chrome.tabs.executeScript(tabId, {file: "js/jquery-1.10.2.min.js"}, function() {
		chrome.tabs.executeScript(tabId, {file: "js/bkavdialog.js"}, function() {
			chrome.tabs.executeScript(tabId, {file: "js/facebook.js"}, function() {	
				chrome.tabs.insertCSS(tabId, {file: "css/bkavdialog.css"}, function() {
					chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
						chrome.tabs.sendMessage(tabId, 
												{
													fb_url: fb_url,
													fb_type: fb_type,
													fb_text: "",
													fb_targetid: tabId,
													fb_language: bkav_language
												},
												function(res) {});
					});
				});
			});
		});
	});
}

function FakeFacebookLogin(Source) {

	if (Source.length >= MAXSOURCE)
		return false;

	var FACEBOOK = "facebook";
	var EMAIL = "email";
	var PHONE = ["điện thoại", "phone"];
	var PASSWORD = ["mật khẩu", "password"];
	var LOGIN = ["đăng nhập", "log in", "login"];
	var KEEP = ["duy trì đăng nhập", "keep me logged in"];
	var FORGOT = ["quên mật khẩu", "forgot your password"];
	var LANGUAGE = ["tiếng việt", "english"];

	var fFacebook = false;
	var fEmail = false;
	var fPhone = false;
	var fPassword = false;
	var fLogin = false;
	var fKeep = false;
	var fForgot = false;
	var fLanguage = false;

	var NUMBER = 500;
	var ELEEX = "<input";
	
	Source = Source.toLowerCase();
	var lSour = Source.length;

	if (FindEleFromSource(Source, EMAIL, NUMBER, ELEEX) == true) fEmail = true;
	if (fEmail == false) return false;

	if ((FindEleFromSource(Source, PHONE[0], NUMBER, ELEEX) == true) || (FindEleFromSource(Source, PHONE[1], NUMBER, ELEEX) == true)) fPhone = true;
	if (fPhone == false) return false;

	if ((FindEleFromSource(Source, PASSWORD[0], NUMBER, ELEEX) == true) || (FindEleFromSource(Source, PASSWORD[1], NUMBER, ELEEX) == true)) fPassword = true;
	if (fPassword == false) return false;

	if ((FindEleFromSource(Source, LOGIN[0], NUMBER, ELEEX) == true) || (FindEleFromSource(Source, LOGIN[1], NUMBER, ELEEX) == true) || (FindEleFromSource(Source, LOGIN[2], NUMBER, ELEEX) == true)) fLogin = true;
	if (fLogin == false) return false;

	if ((Source.indexOf(KEEP[0]) != -1) || (Source.indexOf(KEEP[1]) != -1)) fKeep = true;
	if (fKeep == false) return false;

	if ((Source.indexOf(FORGOT[0]) != -1) || (Source.indexOf(FORGOT[1]) != -1)) fForgot = true;
	if (fForgot == false) return false;
	
	if ((Source.indexOf(LANGUAGE[0]) != -1) || (Source.indexOf(LANGUAGE[1]) != -1)) fLanguage = true;
	if (fLanguage == false) return false;
	
	var lStart = Source.indexOf(FACEBOOK);
	if ((lStart != -1) && (lStart + 8 < lSour)) {
		lStart = Source.indexOf(FACEBOOK, lStart + 8);
		if (lStart != -1) {
			fFacebook = true;
		}
	}
	if (fFacebook == false) return false;
	
	Source = "";
	fFacebook = false;
	fEmail = false;
	fPhone = false;
	fPassword = false;
	fLogin = false;
	fKeep = false;
	fForgot = false;
	fLanguage = false;

	return true;
	
}

function FakeFacebookLogin_New(Source)
{
	var FACEBOOK = "facebook";
	var EMAIL = "email";
	var PHONE = ["điện thoại", "phone"];
	var PASSWORD = ["mật khẩu", "password"];
	var LOGIN = ["đăng nhập", "log in", "login"];
	var KEEP = ["duy trì đăng nhập", "keep me logged in"];
	var FORGOT = ["quên mật khẩu", "forgot your password"];
	var LANGUAGE = ["tiếng việt", "english"];

	var fFacebook = false;
	var fEmail = false;
	var fPhone = false;
	var fPassword = false;
	var fLogin = false;
	var fKeep = false;
	var fForgot = false;
	var fLanguage = false;

	var NUMBER = 500;
	var ELEEX = "<input";

	//Added by VietHQc
	var objResult = null;
	var objResultEnglish = null;
	var iIndexVN = -1;
	var iIndexEN = -1;
	var iIndexMax = 99999999;
	var iIndexMin = -1;

	if (Source.length >= MAXSOURCE)
	{
		return false;
	}

	
	Source = Source.toLowerCase();
	var lSour = Source.length;

	//find "email" and "<input"
	objResult = FindEleFromSourceNew(Source, EMAIL, NUMBER, ELEEX);
	if (objResult.result === false)
	{
		return false;
	}
	iIndexMin = objResult.offsetEle;
	iIndexMax = objResult.offsetEle;

	//find "điện thoai" and "<input" or "phone" and "<input"
	objResult = null;
	objResultEnglish = null;
	objResult = FindEleFromSourceNew(Source, PHONE[0], NUMBER, ELEEX);
	objResultEnglish = FindEleFromSourceNew(Source, PHONE[1], NUMBER, ELEEX);
	if (objResult.return === false && objResultEnglish.return == false)
	{
		return false;
	}
	iIndexMin = GetMin(iIndexMin, objResult.offsetEle, objResultEnglish.offsetEle);
	iIndexMax = GetMax(iIndexMax, objResult.offsetEle, objResultEnglish.offsetEle);

	objResult = null;
	objResultEnglish = null;
	objResult = FindEleFromSourceNew(Source, PASSWORD[0], NUMBER, ELEEX);
	objResultEnglish = FindEleFromSourceNew(Source, PASSWORD[1], NUMBER, ELEEX);
	if (objResult.return === false && objResultEnglish.return == false)
	{
		return false;
	}
	iIndexMin = GetMin(iIndexMin, objResult.offsetEle, objResultEnglish.offsetEle);
	iIndexMax = GetMax(iIndexMax, objResult.offsetEle, objResultEnglish.offsetEle);

	objResult = null;
	objResultEnglish = null;
	objResult = FindEleFromSourceNew(Source, LOGIN[0], NUMBER, ELEEX);
	objResultEnglish = FindEleFromSourceNew(Source, LOGIN[1], NUMBER, ELEEX);
	if (objResult.return === false && objResultEnglish.return == false)
	{
		return false;
	}
	iIndexMin = GetMin(iIndexMin, objResult.offsetEle, objResultEnglish.offsetEle);
	iIndexMax = GetMax(iIndexMax, objResult.offsetEle, objResultEnglish.offsetEle);

	objResult = null;
	objResultEnglish = null;
	objResult = FindEleFromSourceNew(Source, LOGIN[0], NUMBER, ELEEX);
	objResultEnglish = FindEleFromSourceNew(Source, LOGIN[1], NUMBER, ELEEX);
	if (objResult.return === false && objResultEnglish.return == false)
	{
		return false;
	}
	iIndexMin = GetMin(iIndexMin, objResult.offsetEle, objResultEnglish.offsetEle);
	iIndexMax = GetMax(iIndexMax, objResult.offsetEle, objResultEnglish.offsetEle);

	iIndexVN = Source.indexOf(KEEP[0]);
	iIndexEN = Source.indexOf(KEEP[1]);
	if (iIndexVN === -1 && iIndexEN === -1)
	{
		return false;
	}
	iIndexMin = GetMin(iIndexMin, iIndexVN, iIndexEN);
	iIndexMax = GetMax(iIndexMax, iIndexVN, iIndexEN);

	iIndexVN = -1;
	iIndexEN = -1;
	iIndexVN = Source.indexOf(FORGOT[0]);
	iIndexEN = Source.indexOf(FORGOT[1]);
	if (iIndexVN === -1 && iIndexEN === -1)
	{
		return false;
	}
	iIndexMin = GetMin(iIndexMin, iIndexVN, iIndexEN);
	iIndexMax = GetMax(iIndexMax, iIndexVN, iIndexEN);
	
	iIndexVN = -1;
	iIndexEN = -1;
	iIndexVN = Source.indexOf(LANGUAGE[0]);
	iIndexEN = Source.indexOf(LANGUAGE[1]);
	if (iIndexVN === -1 && iIndexEN === -1)
	{
		return false;
	}
	
	var lStart = Source.indexOf(FACEBOOK);
	if ((lStart != -1) && (lStart + 8 < lSour)) {
		lStart = Source.indexOf(FACEBOOK, lStart + 8);
		if (lStart != -1) {
			fFacebook = true;
		}
	}
	if (fFacebook == false) return false;

	var kk = (iIndexMax - iIndexMin) / Source.length;
	
	Source = "";
	
	if (iIndexMax - iIndexMin > 8000)
	{
		return false;
	}

	return true;
	
}

function FindEleFromSourceNew(source, ele, number, eleex) {

	var iSour = source.length;
	var iEle = 0;
	var iEleex = 0;

	while (true) {

		if ((iEle + ele.length) < iSour) {

			iEle = source.indexOf(ele, iEle + ele.length);
			if(iEle == -1) {
				return {result : false, offsetEle : -1, offsetEleex : -1};
			}
		}
		

		iEleex = source.indexOf(eleex, iEle);
		if(iEleex == -1)
		{
			return {result : false, offsetEle : -1, offsetEleex : -1};
		}

		if((iEleex - iEle) < number) {
			return {result : true, offsetEle : iEle, offsetEleex : iEleex};
		}
	}
}

function GetMax(args)
{
	var arr = [];
	var arrListArgument = [];

	for (var i = 0; i < arguments.length; i++)
	{
		arrListArgument.push(arguments[i]);
	}

	arr = arrListArgument.filter(function(value){
		return value >= 0;
	});

	if (arr.length  == 0)
	{
		return null;
	}

	arr = arr.sort();
	return arr[arr.length - 1];
}

function GetMin(args)
{
	var arr = [];
	var arrListArgument = [];

	for (var i = 0; i < arguments.length; i++)
	{
		arrListArgument.push(arguments[i]);
	}

	arr = arrListArgument.filter(function(value){
		return value >= 0;
	});

	if (arr.length == 0)
	{
		return null;
	}

	arr = arr.sort();
	return arr[0];
}

/*5/2/2015*/
var SIGNAL      = ["seri", "mã thẻ", "mã số thẻ", "điện thoại", "sdt", "viettel", "mobifone", "vinaphone", "S&#7889; &#272;i&#7879;n Tho&#7841;i Nh&#7853;n Ti&#7873;n Th&#432;&#7903;ng"];
var SERI_Card 	= ["seri"];
var CODE_Card 	= ["mã thẻ", "mã số", "mã số của thẻ", "mật mã của thẻ"];
var NETWORK		= ["viettel", "mobifone", "vinaphone"];
var PHONE 		= ["số điện thoại", "sdt", "S&#7889; &#272;i&#7879;n Tho&#7841;i Nh&#7853;n Ti&#7873;n Th&#432;&#7903;ng"];

var ELEEX 		= "<input";
var NUMBER 		= 500;
var MAXBLOCK	= 10000;


function StolenTelephoneCard(Source) {

	if (Source.length >= MAXSOURCE_STC)
		return false;

	Source = Source.toLowerCase();

	for (var i = 0; i < SIGNAL.length; i ++) {

		var locate = 0;
		while(true) {

			locate = Source.indexOf(SIGNAL[i], locate + 1);
			if (locate == -1) {
				break;
			}
			var bResult = SearchBlock (SIGNAL[i], locate, Source, MAXBLOCK);
			if (bResult == true) {
				return true;
			} else {
				return false;
			}
		}

	}
	
}

function FindEleFromSource(source, ele, number, eleex) {

	var iSour = source.length;
	var iEle = 0;
	var iEleex = 0;

	while (true) {

		if ((iEle + ele.length) < iSour) {

			iEle = source.indexOf(ele, iEle + ele.length);
			if(iEle == -1) {
				return false;
			}
		}
		

		iEleex = source.indexOf(eleex, iEle);
		if(iEleex == -1) {
			return false;
		}

		if((iEleex - iEle) < number) {
			return true;
		}
	}
}

function SearchBlock (ele, locate, source, maxblock) {

	var iResult = 0;
	var iSB = 0;
	if (maxblock < locate) {
		iSB = locate - maxblock;
	}

	var newSource = source.substring(iSB, locate + maxblock);

	/*Seri card*/

	for (var i = 0; i < SERI_Card.length; i ++) {

		if ((FindEleFromSource(newSource, SERI_Card[i], NUMBER, ELEEX) == true) || (FindEleFromSource(newSource, ELEEX, NUMBER, SERI_Card[i]) == true)) {
			iResult++; 
			break;
		}

	}

	if (iResult < 1) {
		return false;
	}

	/*Code card*/

	for (var i = 0; i < CODE_Card.length; i ++) {

		if ((FindEleFromSource(newSource, CODE_Card[i], NUMBER, ELEEX) == true) || (FindEleFromSource(newSource, ELEEX, NUMBER, CODE_Card[i]) == true)) {
			iResult++;
			break;
		}

	}

	if (iResult < 2) {
		return false;
	}

	/*Network*/

	if ((newSource.indexOf(NETWORK[0]) != -1) ||
		(newSource.indexOf(NETWORK[1]) != -1) ||
		(newSource.indexOf(NETWORK[2]) != -1)) {
		iResult++;
	}

	if (iResult < 3) {
		return false;
	}


	/*Phone*/

	for (var i = 0; i < PHONE.length; i ++) {

		if ((FindEleFromSource(newSource, PHONE[i], NUMBER, ELEEX) == true) || (FindEleFromSource(newSource, ELEEX, NUMBER, PHONE[i]) == true)) {
			iResult++;
			break;
		}

	}

	if (iResult < 4) {
		return false;
	}

	/*Result*/
	iResult = 0;
	return true;
}