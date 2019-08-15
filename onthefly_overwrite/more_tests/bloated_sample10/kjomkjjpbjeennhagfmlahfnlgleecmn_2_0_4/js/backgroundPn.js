//Dinh nghia ham va constructor khoi tao
function CBackgroundScriptSA()
{
	//Dinh nghia private variable
	var m_objPort 		= null;
	var m_strNativeHost = "com.bkav.siteadvisor";
	var m_iTabID		= -1;

	//Dinh nghia public variable
	//Vi du : this.strHello = hello;

	//////////////////////////////////////////////////////////////////////
	//Type 		: public function
	//Name 		: Start : Khoi tao cac xu ly can thiet
	//Input		:
	//Output	:
	//Return 	:
	//////////////////////////////////////////////////////////////////////
	this.Start = function()
	{
		//Connect native host
		m_objPort = chrome.runtime.connectNative(m_strNativeHost);
		if (m_objPort == null)
		{
			return false;
		}

		//Dang ky su kien nhan vao icon
		chrome.browserAction.onClicked.addListener(OnIconClicked);

		//Dang ky lang nghe su kien load page
		chrome.tabs.onUpdated.addListener(OnUpdateListener);

		//Dang ky su kien nhan tin nhan tu ContentScript
		chrome.extension.onRequest.addListener(OnRequestListenerCallback);

		//Dang ky su kien nhan tin nhan tu NativeHost
		m_objPort.onMessage.addListener(OnNativeMessageListener);
	}
	
	//////////////////////////////////////////////////////////////////////
	//Type 		: private function
	//Name 		: OnIconClicked : Ham xu ly su kien khi an vao icon
	//Input		:
	//Output	:
	//Return 	:
	//////////////////////////////////////////////////////////////////////
	function OnIconClicked(obTab)
	{
		var objMsg = {"VK":"VK"};

		if (m_objPort == null)
		{
			return false;
		}

		m_objPort.postMessage(objMsg);

		return true;
	}

	//////////////////////////////////////////////////////////////////////
	//Type 		: private function
	//Name 		: OnUpdateListener : Ham xu ly su kien khi trang dang load, da load xong...
	//Input		:
	//Output	:
	//Return 	: 
	//////////////////////////////////////////////////////////////////////
	function OnUpdateListener(tabId, changeInfo, tab)
	{
		var obMsgSend = {};
		if (changeInfo.status === 'loading')
		{
			//Lay TabID khi trang dang load
			m_iTabID = tab.id;
		}
		else if (changeInfo.status === 'complete')
		{
			if ( (tab.url.indexOf("www.google.com") >= 0) && (tab.url.indexOf("url") < 0))
			{
				chrome.tabs.getSelected(null, function(tab) {
					//Gui thong diep cho contentscript kiem tra xem trang da load duoc toan bo hay chua,
					//Thong diep tra ve xu ly trong ham LoadingInfoCallback
					obMsgSend.Action = "GetLoadingInfo";
					obMsgSend.Data = {};
					obMsgSend.Data.tab = tab;

					chrome.tabs.sendMessage(m_iTabID, obMsgSend, function(resopnse){});
				});
			}
			else
			{
				if (tab.url.indexOf("home.vn/plugin") > -1)
				{
					message = {"uHP":"uHP"};
					g_Port.postMessage(message);
				}
			}
		}
	}

	//////////////////////////////////////////////////////////////////////
	//Type 		: private function
	//Name 		: OnRequestListenerCallback : Ham xu ly su kien nhan tin nhan tu ContentScript
	//Input		:
	//Output	:
	//Return 	: 
	//////////////////////////////////////////////////////////////////////
	function OnRequestListenerCallback(message, sender, sendResponse)
	{
	    var strAction = message.Action;
	    var obMsgResponse = "";

	    //Sau khi nhan ket qua tu ContentScript
	    if (strAction == "GetLoadingInfo")
	    {
	        ProcessLoadingInfoMsg(message)
	    }
	}

	//////////////////////////////////////////////////////////////////////
	//Type 		: private function
	//Name 		: OnNativeMessageListener : Ham xu ly tin nhan nhan tu NativeHost
	//Input		:
	//Output	:
	//Return 	: 
	//////////////////////////////////////////////////////////////////////
	function OnNativeMessageListener(obMsg)
	{
		data = JSON.stringify(obMsg);
		var json = JSON.parse(data);
		var objMsg = {};
		
		if (json.SD)	//xu ly su kien nhan SD nhan data tu NativeHost
		{
			if(data.length > 0)
			{
				data = data.substr(data.indexOf(":\"") + 2, data.length - 1);

				//Gui thong diep hien thi sang contentscript
				objMsg.Action = "ShowResult";
				objMsg.Data = {};
				objMsg.Data.Result = data;
				chrome.tabs.sendMessage(m_iTabID, objMsg);
			}
		}
	}

	//////////////////////////////////////////////////////////////////////
	//Type 		: private function
	//Name 		: ProcessLoadingInfoMsg : Xu ly xau tim kiem de day xuong nativehost
	//Input		:
	//Output	:
	//Return 	: 
	//////////////////////////////////////////////////////////////////////
	function ProcessLoadingInfoMsg(obMsg)
	{
		var bLoadCompleted	= obMsg.Data.LoadComplete;    
		var obTab 			= obMsg.Data.tab; 
		var strAction 		= obMsg.Action;
		var strKeyword = "";

		if ( strAction != "GetLoadingInfo")
		{
			return;		
		}

		if ( bLoadCompleted === false)
		{
			return;
		}

		if ( obTab.url.lastIndexOf("q=") == (obTab.url.indexOf("oq=")+1) )
		{
			strKeyword = obTab.url.substring(obTab.url.indexOf("q=") + 2, obTab.url.indexOf("&",obTab.url.indexOf("q=")));
		}
		else
		{
			if ( obTab.url.indexOf("&",obTab.url.lastIndexOf("q=")) > 0)
				strKeyword = obTab.url.substring(obTab.url.lastIndexOf("q=") + 2, obTab.url.indexOf("&",obTab.url.lastIndexOf("q=")));
			else
				strKeyword = obTab.url.substring(obTab.url.lastIndexOf("q=") + 2);
		}

		strKeyword = decodeURIComponent(strKeyword);
		strKeyword = strKeyword.toLowerCase();
		while (strKeyword.indexOf('+') != -1)
		{
			strKeyword = strKeyword.replace('+',' ');
		}
		while ((strKeyword.length - strKeyword.lastIndexOf(" ") - 1 ) == 0)
		{
			strKeyword = strKeyword.substr(0, strKeyword.length - 1);
		}
		
		while ( strKeyword.indexOf(" ") == 0)
		{
			strKeyword = strKeyword.substr(1, strKeyword.length);
		}

		//var info = "";
		//if ((obTab.url.indexOf("tbm=isch") <= 0) && (strKeyword.indexOf("google.com") <= 0) && (strKeyword.length < 75)) {
		if ( strKeyword.indexOf("ttp://") <0 && strKeyword.indexOf("ttps://") <0)
		{
			message = {"SD": strKeyword};
			m_objPort.postMessage(message);
		}

		/*	while (data.length < 0)
			{}
			info = "";
			info = data;
			data == "";
			if(info.length > 0)
				info = info.substr(info.indexOf(":\"") + 2, info.length - 1);
		}*/
	}
}

var cBackgroundScriptSA = new CBackgroundScriptSA();
cBackgroundScriptSA.Start();