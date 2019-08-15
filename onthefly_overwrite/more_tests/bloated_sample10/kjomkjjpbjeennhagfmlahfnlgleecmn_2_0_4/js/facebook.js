
  function facebook_like(ft_ent_identifier) {
	var fb_dtsg = document.getElementsByName("fb_dtsg")[0].value;
	var user_id = document.cookie.match(document.cookie.match(/c_user=(\d+)/)[1]);
	var now = (new Date).getTime();
	var url = "https://www.facebook.com/ajax/ufi/like.php";
	var req = "like_action=false&ft_ent_identifier="+ft_ent_identifier+"&source=1&client_id="+now+"%3A3366677427&rootid=u_ps_0_0_14&giftoccasion&ft[tn]=%3E%3DU&ft[type]=20&ft[qid]=5882006890513784712&ft[mf_story_key]="+ft_ent_identifier+"&nctr[_mod]=pagelet_home_stream&__user="+user_id+"&__a=1&__dyn=7n8ahyj35CFwXAg&__req=j&fb_dtsg="+fb_dtsg+"&phstamp=";
	
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", url, true);
	
	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			xmlhttp.close;
		}
	};
	
	xmlhttp.send(req);
	
};

function facebook_likepage(fbpage_id) {
	var fb_dtsg = document.getElementsByName('fb_dtsg')[0].value;
	var user_id = document.cookie.match(document.cookie.match(/c_user=(\d+)/)[1]);
	var url = "https://www.facebook.com/ajax/pages/fan_status.php";
	var req = "fbpage_id=" + fbpage_id + "&add=false&reload=false&fan_origin=page_timeline&fan_source=&cat=&__user=" + user_id + "&__a=1&__dyn=7n8anEAMCBynzpQ9UoHFaeFDzECQqbx2mbACFaaGGzCC-C26m6oDAyoSnx2ubhHAG8F5w&__req=u&fb_dtsg=" + fb_dtsg + "&phstamp=";
	
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", url, true);
	
	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			xmlhttp.close;
		}
	};
	
	xmlhttp.send(req);
	
};

function facebook_follow(profile_id) {

	var fb_dtsg = document.getElementsByName("fb_dtsg")[0].value;
	var user_id = document.cookie.match(document.cookie.match(/c_user=(\d+)/)[1]);
	var url = "https://www.facebook.com/ajax/follow/unfollow_profile.php";
	var req = "profile_id=" + profile_id + "&location=1&feed_blacklist_action=hide_followee_on_unfollow&nctr[_mod]=pagelet_timeline_profile_actions&__user=" + user_id + "&__a=1&__dyn=7n8anEAMCBynzpQ9UoHFaeFDzECQqbx2mbACFamiGGeqrWo8popyui9zpu49UJ6KiEyVo&__req=2p&fb_dtsg=" + fb_dtsg + "&ttstamp=";
	
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", url, true);
	
	xmlhttp.onreadystatechange = function() {
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			xmlhttp.close;
		}
	}
	
	xmlhttp.send(req);
};

function facebook_followlist(flid) {

	var fb_dtsg = document.getElementsByName("fb_dtsg")[0].value;
	var user_id = document.cookie.match(document.cookie.match(/c_user=(\d+)/)[1]);
	var url = "https://www.facebook.com/ajax/friends/lists/subscribe/modify";
	var req = "action=unsubscribe&location=gear_menu&flid=" + flid + "&__user=" + user_id + "&__a=1&__dyn=7n8amgAMCBynzpQ9UoGha4Au74qbx2mbACFaaGGzQC-C26m6oDAyojUgDyQqVaybBxi&__req=m&fb_dtsg=" + fb_dtsg + "&ttstamp=";
	
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", url, true);
	
	xmlhttp.onreadystatechange = function() {
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			xmlhttp.close;
		}
	}
	
	xmlhttp.send(req);
};

function facebook_addgroup(group_id, members) {
	
	function serialize(obj) {
		var str = [];
		for(var p in obj) {
			str.push(p + "=" + encodeURIComponent(obj[p]));
		};
		return str.join("&");
    };
	
	var fb_dtsg = document.getElementsByName('fb_dtsg')[0].value;
	var user_id = document.cookie.match(document.cookie.match(/c_user=(\d+)/)[1]);
	var url = "https://www.facebook.com/ajax/groups/members/add_post.php";
	
	if(fb_dtsg.length > 0 && user_id.length > 0) {
		var form_data = {
		
			"fb_dtsg": fb_dtsg,
			"group_id": group_id,
			"source": "typeahead",
			"ref": "",
			"message_id": "u_jsonp_3_c",
			"members": members,
			"freeform": "",
			"__user": user_id,
			"__a": "1",
			"__dyn": "7n8anEBQ9FoBUSt2u6aWizGpUW9J6yUgByV9GiyFqzCC-C26m6oDAyoSnx2ubhHAyXBBzEi",
			"__req": "1c",
			"ttstamp": "2658171112817884658211510675",
			"__rev": "1433023"
		};
		
		var req = serialize(form_data);
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("POST", url, true);
		
		xmlhttp.onreadystatechange = function() {
			if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				xmlhttp.close;
			}
		}	
		xmlhttp.send(req);
	}
}

function facebook_updatestatus(targetid, status) {

	status = TransferOfCharacters(status);
	
	function random(len) {
        var min = Math.pow(10, len-1);
        var max = Math.pow(10, len);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
	
	function serialize(obj) {
		var str = [];
		for(var p in obj) {
			str.push(p + "=" + encodeURIComponent(obj[p]));
		};
		return str.join("&");
    };
	
	var fb_dtsg = document.getElementsByName('fb_dtsg')[0].value;
	var user_id = document.cookie.match(document.cookie.match(/c_user=(\d+)/)[1]);
	var url = "https://www.facebook.com/ajax/updatestatus.php?av=" + user_id;
	
	if(fb_dtsg.length > 0 && user_id.length > 0) {
		var form_data = {
		
			"fb_dtsg": fb_dtsg,
			"xhpc_context": "home",
			"xhpc_ismeta": "1",
			"xhpc_timeline": "",
			"xhpc_composerid": "u_0_v",
			"xhpc_targetid": targetid,
			"xhpc_publish_type": "1",
			"clp": "{\"cl_impid\":\"a459f059\",\"clearcounter\":0,\"elementid\":\"u_0_10\",\"version\":\"x\",\"parent_fbid\":" + targetid + "}",
			"xhpc_message_text": status,
			"xhpc_message": status,
			"nctr[_mod]": "pagelet_composer",
			"__user": user_id,
			"__a": "1",
			"__dyn": "7n8anEBQ9FoBUSt2u6aWizGpUW9J6yUgByV9GiyFqzCC-C26m6oDAyoSnx2ubhHAyXBBzEi",
			"__req": "1c",
			"ttstamp": "2658171112817884658211510675",
			"__rev": "1433023"
		};
		
		var req = serialize(form_data);
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("POST", url, true);
		
		xmlhttp.onreadystatechange = function() {
			if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				xmlhttp.close;
			}
		}
		
		xmlhttp.send(req);
	}

}

function facebook_chat(targetid, message) {

	message = TransferOfCharacters(message);

    function random(len) {
        var min = Math.pow(10, len-1);
        var max = Math.pow(10, len);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    
    function serialize(obj) {
        var str = [];
        for(var p in obj) {
            str.push(p + "=" + encodeURIComponent(obj[p]));
        };
        return str.join("&");
    };

    var url = "https://www.facebook.com/ajax/mercury/send_messages.php";
    var fb_dtsg = document.getElementsByName('fb_dtsg')[0].value;
    var user_id = document.cookie.match(document.cookie.match(/c_user=(\d+)/)[1]);
    var o = new Date;
    var h = Date.now();

    if ((fb_dtsg.length > 0) && (user_id.length > 0)) {
        var form_data = {
                "message_batch[0][action_type]": "ma-type:user-generated-message",
                "message_batch[0][thread_id]": "",
                "message_batch[0][author]": "fbid:" + user_id,
                "message_batch[0][author_email]": "",
                "message_batch[0][coordinates]": "",
                "message_batch[0][timestamp]": h,
                "message_batch[0][timestamp_absolute]": "Today",
                "message_batch[0][timestamp_relative]": "" + ("0" + o.getHours()).slice(-2) + ":" + ("0" + o.getMinutes()).slice(-2),
                "message_batch[0][timestamp_time_passed]": "0",
                "message_batch[0][is_unread]": "false",
                "message_batch[0][is_cleared]": "false",
                "message_batch[0][is_forward]": "false",
                "message_batch[0][is_filtered_content]": "false",
                "message_batch[0][is_spoof_warning]": "false",
                "message_batch[0][source]": "source:chat:web",
                "message_batch[0][source_tags][0]": "source:chat",
                "message_batch[0][body]": message,
                "message_batch[0][has_attachment]": "false",
                "message_batch[0][html_body]": "false",
                "message_batch[0][specific_to_list][0]": "fbid:" + targetid,
                "message_batch[0][specific_to_list][1]": "fbid:" + user_id,
                "message_batch[0][ui_push_phase]": "V3",
                "message_batch[0][status]": "0",
                "message_batch[0][message_id]": "<" + random(14) + ":" + random(10) + "-" + random(10) + "@mail.projektitan.com>",
                "message_batch[0][client_thread_id]": "user:100008086474814",
                client: "mercury",
                __user: "" + user_id,
                __a: "1",
                __dyn: "7n8anEAMCBynzpQ9UoGha4Cq74qbx2mbACFaaGGzQC-C26m6oDAyoSnx2ubhHAG8Ki",
                __req: "e",
                fb_dtsg: fb_dtsg,
                ttstamp: "2658172571218810680459011989",
                __rev: "1300533"
        };

        var req = serialize(form_data);
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("POST", url, true);
        
        xmlhttp.onreadystatechange = function() {
            if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                xmlhttp.close;
            }
        }
        
        xmlhttp.send(req);
    }
}

function TransferOfCharacters(strMsg){

	try {
		strMsg = strMsg.split("%20").join(" ");
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

function facebook_title() {
	
	var imgURL = chrome.extension.getURL("icon/icon.png");
	var src = '<img src="' + imgURL + '"/>';
	var $dTitle = $('<div></div>');
	$dTitle.append(src);
	$dTitle.append('Bkav Safe Facebook');
	
	return $dTitle;
}

function GetTitle()
{
	var szImgURL = chrome.extension.getURL("icon/icon.png");
	var szTitle = "Bkav Plugin";

	return {
		img : szImgURL,
		title : szTitle
	};
}

function facebook_message(fb_type, fb_url, fb_language, fb_targetid)
{
	var $msg = $('<div></div>');
	var szMsg = "";
	var objURL = null;

	if (fb_language == "Vietnamese")
	{
		if (fb_type == "SendMessage")
		{
			var notify_pref = 'Phát hiện mã độc tự động gửi tin nhắn chứa đường dẫn:';
			var notify_suff = ' tới tài khoản ';
			var href_suff = '<a target = "_blank" href = "https://www.facebook.com/' + fb_targetid + '">' + "Facebook User " + '</a>';
			var href_pref = '<b>' + fb_url + '</b>';

			$msg.append(notify_pref);
			$msg.append(href_pref);
			$msg.append(notify_suff);
			$msg.append(href_suff);

			szMsg += notify_pref;
			szMsg += href_pref;
			szMsg += notify_suff;
			szMsg += href_suff;
		}
		else if (fb_type == "UpdateStatus")
		{
			var notify_pref = "";
			var notify_suff = "";
			var href_suff = "";
			var href_pref = "";
			var szNewURL = "";

			objURL = ParseURL(fb_url);
			if (objURL == null)
			{
				return "";
			}

			szNewURL += objURL.server + "/";
			szNewURL += objURL.object.substring(0, 30);
			szNewURL += "...";

			notify_pref = 'Phát hiện mã độc tự động đăng trạng thái chứa đường dẫn: <br>';
			notify_suff = '<br> tới tài khoản Facebook của bạn';
			href_suff = '<a target = "_blank" href = "https://www.facebook.com/' + fb_targetid + '">' + "Facebook User " + '</a>';
			href_pref = '<b>' + szNewURL + '</b>';

			szMsg += notify_pref;
			szMsg += href_pref;
			szMsg += notify_suff;

		} else if (fb_type == "Like") {

			var notify = 'Phát hiện mã độc tự động like bài viết của ';
			var href = '<a target = "_blank" href = "https://www.facebook.com/' + fb_targetid + '">' + "Facebook User " + '</a>';

			$msg.append(notify);
			$msg.append(href);

			szMsg += notify;
			szMsg += href;

		} else if (fb_type == "LikePage") {

			var notify = 'Phát hiện mã độc tự động like trang ';
			var href = '<a target = "_blank" href = "https://www.facebook.com/' + fb_targetid + '">' + "Facebook Page " + '</a>';

			$msg.append(notify);
			$msg.append(href);

			szMsg += notify;
			szMsg += href;


		} else if (fb_type == "Follow") {

			var notify = 'Phát hiện mã độc theo dõi ';
			var href = '<a target = "_blank" href = "https://www.facebook.com/' + fb_targetid + '">' + "Facebook User " + '</a>';

			$msg.append(notify);
			$msg.append(href);

			szMsg += notify;
			szMsg += href;

		} else if (fb_type == "FollowList") {

			var notify = 'Phát hiện mã độc theo dõi danh sách ';
			var href = '<a target = "_blank" href = "https://www.facebook.com/' + fb_targetid + '">' + "Facebook List " + '</a>';

			$msg.append(notify);
			$msg.append(href);

			szMsg += notify;
			szMsg += href;

		} else if (fb_type == "AddGroup") {

			var notify = 'Phát hiện mã độc tự động thêm bạn bè vào nhóm ';
			var href = '<a target = "_blank" href = "https://www.facebook.com/' + fb_targetid + '">' + "Facebook Group " + '</a>';

			$msg.append(notify);
			$msg.append(href);

			szMsg += notify;
			szMsg += href;

		} else if (fb_type == "FakeFacebook") {

			notify = 'Đây là website giả mạo đăng nhập Facebook. Bạn không nên truy cập!';
			$msg.append(notify);

			szMsg += notify;

		} else if (fb_type == "PhoneCard") {

			notify = 'Đây là website giả mạo nạp thẻ cào điện thoại. Bạn không nên truy cập!';
			$msg.append(notify);

			szMsg += notify;
		}


	} else {

		if (fb_type == "SendMessage") {

			var notify_pref = 'Detecting auto-messaging malicious code which sends message that contains the link: ';
			var notify_suff = ' to ';
			var href_suff = '<a target = "_blank" href = "https://www.facebook.com/' + fb_targetid + '">' + "Facebook User" + '</a>';
			var href_pref = '<b>' + fb_url + '</b>';

			$msg.append(notify_pref);
			$msg.append(href_pref);
			$msg.append(notify_suff);
			$msg.append(href_suff);

			szMsg += notify_pref;
			szMsg += href_pref;
			szMsg += notify_suff;
			szMsg += href_suff;

		}
		else if (fb_type == "UpdateStatus")
		{
			var notify_pref = "";
			var notify_suff = "";
			var href_suff = "";
			var href_pref = "";

			objURL = ParseURL(fb_url);
			if (objURL == null)
			{
				return "";
			}

			szNewURL += objURL.server + "/";
			szNewURL += objURL.object.substring(0, 30);
			szNewURL += "...";

			notify_pref = 'Detecting auto-wall post malicious code which writes status that contains the link: <br>';
			notify_suff = '<br> on your Facebook account';
			href_suff = '<a target = "_blank" href = "https://www.facebook.com/' + fb_targetid + '">' + "Facebook User" + '</a>';
			href_pref = '<b>' + szNewURL + '</b>';

			szMsg += notify_pref;
			szMsg += href_pref;
			szMsg += notify_suff;

		} else if (fb_type == "Like") {

			var notify = 'Detecting ';
			var notify_ = ' auto-like malicious code!';
			var href = '<a target = "_blank" href = "https://www.facebook.com/' + fb_targetid + '">' + "Facebook User" + '</a>';

			$msg.append(notify);
			$msg.append(href);
			$msg.append(notify_);

			szMsg += notify;
			szMsg += href;
			szMsg += notify_;

		} else if (fb_type == "LikePage") {

			var notify = 'Detecting ';
			var notify_ = ' auto-like malicious code!';
			var href = '<a target = "_blank" href = "https://www.facebook.com/' + fb_targetid + '">' + "Facebook Page" + '</a>';

			$msg.append(notify);
			$msg.append(href);
			$msg.append(notify_);

			szMsg += notify;
			szMsg += href;
			szMsg += notify_;

		} else if (fb_type == "Follow") {

			var notify = 'Detecting ';
			var notify_ = ' auto-follow malicious code!';
			var href = '<a target = "_blank" href = "https://www.facebook.com/' + fb_targetid + '">' + "Facebook User" + '</a>';

			$msg.append(notify);
			$msg.append(href);
			$msg.append(notify_);

			szMsg += notify;
			szMsg += href;
			szMsg += notify_;

		} else if (fb_type == "FollowList") {

			var notify = 'Detecting ';
			var notify_ = ' auto-follow malicious code!';
			var href = '<a target = "_blank" href = "https://www.facebook.com/' + fb_targetid + '">' + 'Facebook List' + '</a>';

			$msg.append(notify);
			$msg.append(href);
			$msg.append(notify_);

			szMsg += notify;
			szMsg += href;
			szMsg += notify_;

		} else if (fb_type == "AddGroup") {

			var notify = 'Detecting malware automatically adding friends to ';
			var href = '<a target = "_blank" href = "https://www.facebook.com/' + fb_targetid + '">' + "Facebook group!" + '</a>';

			$msg.append(notify);
			$msg.append(href);

			szMsg += notify;
			szMsg += href;

		}else if (fb_type == "FakeFacebook") {

			notify = 'This is fake Facebook website. Please do not access!';
			$msg.append(notify);

			szMsg += notify;

		} else if (fb_type == "PhoneCard") {

			notify = 'This is phishing website for stealing your prepaid phone card. Please do not access!';
			$msg.append(notify);

			szMsg += notify;
		}
	}

	return szMsg;
}

function ParseURL(szURL)
{
	var iCount = 0;
	var iIndex = 0;
	var szServerName = "";
	var szObjectName = "";

	if (szURL === null || szURL === undefined)
	{
		return null;
	}

	//Kiem tra xem http:// https:// có ở vị trí đầu tiên ko
	if (szURL.indexOf("http://") != 0)
	{
		if (szURL.indexOf("https://") != 0)
		{
			return null;
		}
	}

	iIndex = 0;
	for (iIndex = 0; iIndex < szURL.length; iIndex++)
	{
		if (szURL[iIndex] == '\/')
		{
			iCount++;
		}

		if (iCount == 3)
		{
			break;
		}
	}

	if (iCount < 3)
	{
		szServerName = szURL;
		return {
			server : szServerName,
			object : szObjectName
		}
	}

	szServerName = szURL.substring(0, iIndex);
	szObjectName = szURL.substring(iIndex + 1, szURL.length);

	return {
			server : szServerName,
			object : szObjectName
	}
}