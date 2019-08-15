function CContentScriptSA()
{
	//////////////////////////////////////////////////////////////////////
	//Type 		: public function
	//Name 		: Start : Khoi tao cac xu ly can thiet
	//Input		:
	//Output	:
	//Return 	: 
	//////////////////////////////////////////////////////////////////////
	this.Start = function()
	{
		chrome.runtime.onMessage.addListener(OnMessageListenerCallback);
	}

	//////////////////////////////////////////////////////////////////////
	//Type 		: private function
	//Name 		: OnMessageListenerCallback : Ham lang nghe su kien tu background gui sang
	//Input		:
	//Output	:
	//Return 	:
	//////////////////////////////////////////////////////////////////////
	function OnMessageListenerCallback(objMsg, sender, sendResponse)
	{
	    var strAction = objMsg.Action;
	    var obMsgResponse = "";

	    if (strAction == "GetLoadingInfo")
	    {
	        obMsgResponse = CheckPageLoadComleted(objMsg);
	    }
	    else if (strAction == "ShowResult")
	    {
	        ProcessMsgShowResult(objMsg);
	    }
	    chrome.extension.sendRequest(obMsgResponse, function(response) {});
	}

	//////////////////////////////////////////////////////////////////////
	//Type 		: private function
	//Name 		: CheckPageLoadComleted : Ham kiem tra trang load xong hay chua
	//Input		:
	//Output	:
	//Return 	: Tin nhan phan hoi cho background
	//////////////////////////////////////////////////////////////////////
	function CheckPageLoadComleted(obMsg)
	{
	    var bLoadComplete = true;
	    var spans = document.getElementsByTagName("td");
	    for (var i = 0; i < spans.length; i++)
	    {
	        if (spans[i].className == 'gssb_a gbqfsf')
	        {
	            bLoadComplete = false;
	        }
	    }

	    obMsg.Data.LoadComplete = bLoadComplete;
	    return obMsg;
	}

	//////////////////////////////////////////////////////////////////////
	//Type 		: private function
	//Name 		: ProcessMsgShowResult : Ham xu ly khi nhan tin nhan ShowResult
	//Input		:
	//Output	:
	//Return 	: Tin nhan phan hoi cho background
	//////////////////////////////////////////////////////////////////////
	function ProcessMsgShowResult(objMsg)
	{
	    var strData = objMsg.Data.Result;
	    
	    var iresHandle;
	    iresHandle = setInterval(function()
	    {
	        var iresChecker = document.getElementById('ires');
	        if (iresChecker != null && iresChecker != undefined)
	        {
	            AddSafeDownloadBox(strData);
	            clearInterval (iresHandle);
	        }
	    }, 500);    
	    //Check de chac chan rang da chen ket qua cua safeDownload vao
	    setTimeout(function()
	    {
	        var safeTest = document.getElementById("BkavSafeDownload");
	        if (safeTest == null || safeTest == undefined)
	            AddSafeDownloadBox(strData);
	    },1500);
	    
	    var LinkCheckerHandle;
	    var iCounter = 0;
	    LinkCheckerHandle = setInterval(function()
	    {
	        //alert("DKMM");
	        if (iCounter > 7)
	            clearInterval (LinkCheckerHandle);
	        iCounter ++;
	        var szLocation = document.location.href;
	        if (szLocation.indexOf("www.google.com") == -1)
	            clearInterval(LinkCheckerHandle);
	        else
	        {
	            var SafeDownloadId = document.getElementById("BkavSafeDownload");
	            if (SafeDownloadId != null)
	            {
	                var aTag = SafeDownloadId.getElementsByTagName("a");
	                var data = aTag[0].innerText;
	                //alert(aTag[1].innerText.toLowerCase());
	                if (aTag[1].innerText.toLowerCase().indexOf("khophanmem.vn") != -1)
	                {
	                    clearInterval (LinkCheckerHandle);
	                }
	                else
	                {
	                    //alert("clgt");
	                    aTag[0].addEventListener("click", function()
	                    {
	                        chrome.extension.sendRequest({Action:"click", data: data}, function(response){});
	                    });
	                    clearInterval (LinkCheckerHandle);
	                }
	            }
	        }
	    }, 500);
	}

	//////////////////////////////////////////////////////////////////////
	//Type 		: private function
	//Name 		: AddSafeDownloadBox : Chen quang cao vao google.com
	//Input		:
	//Output	:
	//Return 	:
	//////////////////////////////////////////////////////////////////////
	function AddSafeDownloadBox(strData) 
	{
	    //console.log("Draw");
	    var iCount = 0;
	    var i = 0;
	    var Pos = new Array();
	    while (true)
	    {
	        i = strData.indexOf('&&', i + 2);
	        Pos[iCount] = i;
	        iCount++;
	        if (i < 0)
	            break;
	    }

	    var title = new Array(iCount);
	    var icon = new Array(iCount);
	    var link = new Array(iCount);
	    var description = new Array(iCount);
	    var newtab = new Array(iCount);

	    for (i = 0; i < iCount; i++)
	    {
	        var data;
	        if (i == 0)
	        {
	            if (iCount > 1)
	                data = strData.substring(0, Pos[i]);
	            else
	                data = strData;
	        }
	        else if (i == iCount - 1)
	            data = strData.substring(Pos[i - 1] + 2);
	        else
	            data = strData.substring(Pos[i - 1] + 2, Pos[i]);

	        var i1 = data.indexOf(';');
	        var i2 = data.indexOf(';', i1 + 1);
	        var i3 = data.indexOf(';', i2 + 1);
	        var i4 = data.indexOf(';', i3 + 1);
	        title[i] = data.substring(0, i1);
	        icon[i] = data.substring(i1 + 1, i2);
	        link[i] = data.substring(i2 + 1, i3);
	        description[i] = data.substring(i3 + 1, i4);
	        newtab[i] = data.substring(i4 + 1);
	    }

	    var _head = document.getElementsByTagName("head")[0];
	    var _body = document.getElementsByTagName("body")[0];
	    var _OldElement = document.getElementById("BkavSafeDownload");
	    if (_OldElement)
	    {
	        document.getElementById("BkavSafeDownload").remove();
	    }
	    if (!_head || !_body)
	        return;

	    var _div = document.createElement("div");
	    if (!_div)
	        return;
	    _div.setAttribute("id", "BkavSafeDownload");
	    _div.setAttribute("style", "height:100%;width:556px;background-color:#ffede6;position:relative;z-index:10");

	    //var vFound = document.getElementById("tvcap");

	    //if (!vFound) {
	        var vFound = document.getElementById("ires");
	        if (!vFound)
	            return;
	    var parentDiv = vFound.parentNode;

	    parentDiv.insertBefore(_div, vFound);

	    var _BoxBkavSafeRun = document.getElementById("BkavSafeDownload");

	    var strHTML = "";

	    //Title 
	    for (i = 0; i < iCount; i++)
	    {
	        if ((title[i].length == 0) || (description[i].length == 0) || (icon[i].length == 0) || (link[i].length == 0))
	            continue;
	        var _link = link[i];
	        if (link[i].length > 55) {
	            link[i] = link.substr(0, 52);
	            link[i] += "...";
	        }
	        // Khophanmem.vn?
	        var _link1 = link[i].toLowerCase();
	        var bKPM = false;
	        if (_link1.indexOf("khophanmem.vn") > 0)
	            bKPM = true;
	        var SDDisp = true;
	        if (i > 0)
	            SDDisp = false;

	        link[i] = link[i].replace('http://', '');

	        strHTML += "<table cellspacing='9px'  width = '556px'><tr><td width = '50px'>"
	        strHTML += "<img src='" + icon[i] + "' width='32px' height='32px'>";
	        strHTML += "</td><td><div style='width:100%'><div style='float:left'>";
	        // old color code: 2518b5 F15C24 
	        strHTML += "<a style = 'color:#2518B5;font-size: medium;font-family: arial,sans-serif;text-decoration: underline;cursor: pointer;line-height:130%' href='";
	        if (_link.indexOf("http://") < 0 && _link.indexOf("https://") < 0)
	            strHTML += "http://";
	        strHTML += _link;
	        strHTML += "' onclick = '";
			if (bKPM)
	            strHTML += "window.open(\"http://www.google.com.vn/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&sqi=2&ved=0CBsQFjAA&url=http%3A%2F%2Fkhophanmem.vn%2F&ei=b3RdVN6cDKSzmAWN1IKoCA&usg=AFQjCNG-aDpTW6Pdos2oMlToeVjViyibqw&bvm=bv.79189006,d.dGY\",\"_blank\");";
	        strHTML += "'>";
	        if (bKPM)
	            strHTML += "Tải về ";
	        strHTML += "<b>";
	        strHTML += title[i];
	        strHTML += "</b>";
	        strHTML += "</a>";
	        //////////////////////////////////////////////////////////////

	        //link
	        strHTML += "<br><a style = 'color:#017501;font-style: normal;font-size: 15px;font-family: arial,sans-serif;'>";
			if (!bKPM)
			{
				if (link[i].indexOf("/?") != -1)
					link[i] = link[i].substring (0, link[i].indexOf("/?"));
				if (link[i].indexOf("https://") != -1)
					link[i] = link[i].substring (link[i].indexOf("https://") + 8);
				if (link[i].indexOf("http://") != -1)
					link[i] = link[i].substring (link[i].indexOf("http://") + 7);
			}
	        strHTML += link[i];

	        // SafeDownload
	        strHTML += "</a></div>";
	        if (bKPM && SDDisp)
	            strHTML += "<div style='float:right;margin-top:0px;color:#e6450b; font-size: 12px; font-family: arial, sans-serif'>Bkav <b>Safe Download</b></div>";
	        else
	            strHTML += "<div style='width:100px;float:right;margin-top:0px;color:#e6450b; font-size: 11px; font-family: arial, sans-serif'></div>";
	        //////////////////////////////////////////////////////////////

	        // description
	        strHTML += "</div></td></tr><tr><td></td><td >";
	        strHTML += "<h1 style = 'color:#383838;'>";
	        strHTML += description[i];
	        strHTML += "</h1>";
	        strHTML += "</td></tr></table>";
	        //////////////////////////////////////////////////////////////
	    }

	    // innerHTML
	    _BoxBkavSafeRun.innerHTML = strHTML;
	}
}

var cContentScriptSA = new CContentScriptSA();
cContentScriptSA.Start();