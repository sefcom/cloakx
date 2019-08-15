//initializing
var BoxButtonSubmitId		=	'drwebConfirmationSubmit';
var BoxButtonCloseId		= 	'drwebConfirmationClose';
var BoxLeftColumnId			= 	'drwebConfirmationLeftColumn';
var BoxRightColumnId		=	'drwebConfirmationRightColumn';
var BoxId					= 	'drwebConfirmation';
var BoxFormId				= 	'drwebConfirmationForm';
var LinkAttribute			=	'drweb_check_status';
var InfectionNameAttribute 	=	'drweb_check_infection_name';
var BoxDrWebDescriptionLink	= 	'drweb_description_link';
var BoxDrWebDescription		= 	'drweb_description';
var BoxTimeLabel			= 	0;
var LinksStatus = {};
var Options = {};
var Hostname = document.location.hostname;

var ads_enabled = false;
var analytics_enabled = false;
var social_enabled = false;
var track_enabled = false;
var flash_enabled = false;
var infoString = "";
var block_mode = false;
var manualHidingMode = false;
var baseURL = "";
var actualURL = "";
var blockedItems = "";

var blocks = new Array();
var socialPatterns = null;
var adsPatterns = null;
var specSocialBlocks = null;
var adsException = null;
var flashException = null;

var _BACK_SRC = chrome.extension.getURL('content/icons/back1.gif');

		//check href parameter
		var LinkFunction = function(link){
			if(link){
				link = link.replace(/\s+/, '');
				//php url link checking
				var result = this.linkRegexp.exec(link);
				if(result)
				{
				    //decoding url
					var url = DecodeURIComponentFix(result[1]);
					if(this.extLinkRegexp.test(url))
						return url;
				}
				else
				{
				    //href link checking
					result = this.extLinkRegexp.exec(link);
					if(result)
						return result[1];
				}
			}
			return false;
		}

	    //google+ link checking
		var GoogleLinkFunction = function(link)
		{
			if(link)
			{
				if(this.hostname == 'm.google.com')
				{
				    //decoding url
					link = DecodeURIComponentFix(link);
					link = link.replace(/\\\//ig, "/");
				}
				link = link.replace(/\s+/, '');
				var result = this.linkRegexp.exec(link);
				if(result)
				{
					return result[1];
				}
			}
			return false;
		}

        //find clicked element link
		var FindElement = function(el, eventObj){
			while(el.parentNode && el.parentNode.nodeName.toUpperCase() != 'BODY'){
				if(el.nodeName.toUpperCase() == 'A') { 
					if(el.getAttribute('class') == 'video' && Sites[Hostname].name == 'vkontakte'){
						break;
					}
					if(eventObj.type == 'click'){
						return this.linkFunction(el.href);
					}
				}
				el = el.parentNode;
			}
			return false;	
		}

		//find google+ clicked element link
		var GoogleFindElement = function(el, eventObj)
		{
			while(el.parentNode && el.parentNode.nodeName.toUpperCase() != 'BODY')
			{
				switch(el.nodeName.toUpperCase())
				{
					case 'A':
						if(eventObj.type == 'click')
						{
							return this.linkFunction(el.href);
						}
						break;
						
					case 'DIV':
						if(el.getAttribute('data-content-url') && el.getAttribute('data-content-type') != 'application/x-shockwave-flash')
							return this.linkFunction(el.getAttribute('data-content-url'));
						break;
				
				}
				el = el.parentNode;
			}
			
			return false;
		}

		// sites settings
		var Sites = 
		{
			'vkontakte.ru' :
			{
				'name' : 'vkontakte', 
				'linkRegexp' : /.*\/away\.php\?to=([^&]+)/i,
				'extLinkRegexp' : /^((?:https?:\/\/|ftp:\/\/)(?!(?:.+\.)?(?:vkontakte.ru|vk.com|vk.me)(?:\/|$))[^\s]+)/i,
				'linkFunction' : LinkFunction,
				'findElement'  : FindElement
			},
			'facebook.com' :
			{
				'name' : 'facebook', 
				'linkRegexp' : /^.*?\/(?:(?:l\.php\?u=)|(?:uiserver.php?.*?redirect_uri=))([^&]+)/i,
				'extLinkRegexp' : /^((?:https?:\/\/|ftp:\/\/)(?!(?:.+\.)?(?:facebook.com|fb.com|instagram.com)(?:\/|$))[^\s]+)/i,
				'linkFunction' : LinkFunction,
				'findElement'  : FindElement,
				'hostname'		: 'plus.google.com'
			},
			'plus.google.com' :
			{
				'name' : 'google',
				'linkRegexp' : /^((?:https?:\/\/|ftp:\/\/)(?!(?:.+\.)?google\.(?:ru|com)(?:\/|$)).+)/i,
				'linkFunction' : GoogleLinkFunction,
				'findElement'  : GoogleFindElement
			},
			'm.google.com' :
			{
				'name' : 'google',
				'linkRegexp' 	: /^(?:http:\/\/)?javascript:_window\('((?:https?:\/\/|ftp:\/\/)(?!(?:.+\.)?google\.(?:ru|com)(?:\/|$)).+)'\)/i,
				'linkFunction'	: GoogleLinkFunction,
				'findElement'	: GoogleFindElement,
				'hostname'		: 'm.google.com'
			}
		}
	
		Sites['vk.com'] 			= 	Sites['vkontakte.ru'];
		Sites['m.vk.com'] 			= 	Sites['vkontakte.ru'];
		Sites['0.vk.com'] 			= 	Sites['vkontakte.ru'];
		Sites['t.vk.com'] 			= 	Sites['vkontakte.ru'];
		Sites['m.vkontakte.ru'] 	= 	Sites['vkontakte.ru'];
		Sites['0.vkontakte.ru'] 	= 	Sites['vkontakte.ru'];
		Sites['t.vkontakte.ru'] 	= 	Sites['vkontakte.ru'];
		Sites['fb.com'] 			= 	Sites['facebook.com'];
		Sites['www.fb.com']			= 	Sites['facebook.com'];
		Sites['www.facebook.com'] 	= 	Sites['facebook.com'];
		Sites['m.facebook.com'] 	= 	Sites['facebook.com'];	
		Sites['0.facebook.com'] 	= 	Sites['facebook.com'];
		Sites['instagram.com'] 		= 	Sites['facebook.com'];
		

		var LinkInTextRegexp = /(https?:\/\/|ftp:\/\/)?(?:_*?)((?:[a-z0-9-.]+|[Ð°-Ñ0-9-.]+)\.(?:museum|aero|biz|coop|info|name|com|edu|int|net|org|ru|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|mg|mh|mil|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw|Ñ€Ñ„|xn--[^\/]+)(?:\/[^\s]+|\/?))/i;
		
		var LinkHrefRegexp = /^(https?:\/\/|ftp:\/\/)?(.+\.[^\.\/]+(?:\/.+$|\/$|$))/i;
		var _clickHandlerAdded = false;	
		//check settings
		HandleGetOptions = function(message){
			// console.log('STEP 2');
			// console.dir(message);

			message.tabURL = window.location.href;
			
		    callbackFunction(message);
            var update = message.update;
			
			
            if(typeof Sites[Hostname] != "undefined"){
                // update options
                if(!update || (update && Options[Sites[Hostname].name+'-check'] != message.options[Sites[Hostname].name+'-check'])){
					Options = message.options;
                    //Run(update);
                    if(!update){
						window.document.addEventListener('keydown', function(eventObj){
							if(eventObj.keyCode == '27'){
								RemoveDialog();
							}
						}, false);
					}

					if(Options[Sites[Hostname].name+'-check']){
						window.document.addEventListener('click', HandleClick, true);
						window.document.addEventListener('mouseup', HandleClick, true);
						_clickHandlerAdded = true;
					}else{
						window.document.removeEventListener('click', HandleClick, true);
						window.document.removeEventListener('mouseup', HandleClick, true);
						_clickHandlerAdded = false;
					}

                }
            }
		};
		
		
		
		

		//after checking ling response
		HandleDrWebCheckUrl = function(message){
			var dp = new window.DOMParser();
			var xmlDoc = dp.parseFromString(message.response, "text/xml");
			var status = xmlDoc.getElementsByTagName("status")[0].textContent;
			var dwreport = xmlDoc.getElementsByTagName('dwreport')[0].textContent.split('with')[1];
			var unreliability = xmlDoc.getElementsByTagName('pcontrol')[0]? true : false;
			status = (status != "infected" && unreliability)? 'unreliability' : status;
			if(status == "clean" || status == "infected" || status == "unreliability")
			{
				LinksStatus[message.url] = 
				{
					'status'  : status,
					'dwreport' : dwreport,
					'url' : message.url
				}
			}
			SetStatusForDialog({ 'status'  : status, 'dwreport' : dwreport,'url' : message.url, 'timelabel' : message.timelabel });
			return true;
		}

		//create dialog box appearance which depends on response data
		SetStatusForDialog = function(link){
			if(window.document.getElementById(BoxId) && link.timelabel == BoxTimeLabel)
			{
				var leftColumn = window.document.getElementById(BoxLeftColumnId);
				var button = window.document.getElementById(BoxButtonSubmitId);
				var content = window.document.getElementById(BoxRightColumnId);
				
				if (button)
					button.innerHTML = chrome.i18n.getMessage('leaveWebsite');
					
				switch(link.status) 
				{
					case 'serverUnavailable':
					case 'error':
						if (button)
							button.removeAttribute('disabled');
						content.innerHTML = chrome.i18n.getMessage('scanTimeout');
						leftColumn.className = 'drwebErrorLink';
						
					break;
					case 'clean':
						if (button) 
						{
							button.removeAttribute('disabled');
							button.focus();
						}
						leftColumn.className = 'drwebOkLink';
						
					break;
					case 'unknown':
						leftColumn.className = 'drwebErrorLink';
						
					break;
					case 'error':
						content.innerHTML = chrome.i18n.getMessage('scanError');
						leftColumn.className = 'drwebErrorLink';
						
					break;
					case 'infected':
					    button.style.display = "none";
						var infectionName = link.dwreport;
						var infectionText = chrome.i18n.getMessage('infectionText');
						infectionText = infectionText.replace('drwebLinkName', link.url);
						infectionText = infectionText.replace('drwebLinkDesc', infectionName);
						content.innerHTML = infectionText;
						leftColumn.className = 'drwebThreatLink';
						
					break;
					case 'suspicious':
						leftColumn.className = 'drwebErrorLink';
					break;
					case 'unreliability':
						content.innerHTML = chrome.i18n.getMessage('siteUnreliabilityMessage').replace('drwebLinkName', link.url);
						leftColumn.className = 'drwebThreatLink';
						
					break;
					case 'progress':
					break;
				}
			}
		}

        // click link handle
		HandleClick = function(eventObj){
		    //check if event is clicking by left or middle mouse button
			if(eventObj.which != 1 && eventObj.which != 2)
				return false;
		    //getting clicked element
			var el = eventObj.target;
			//get link if this exist
			if(result = Sites[Hostname].findElement(el, eventObj)){
				var url = result;
				BoxTimeLabel = new Date().getTime();
				//create dialog box
				Dialog(url);

				//checking if this first time to check external link
				if(typeof LinksStatus[url] == "undefined")
				{
					el.removeAttribute('onmousedown');
					CheckLink(url);
				}
				else
				{
					SetStatusForDialog({ 'status'  : LinksStatus[url].status, 'dwreport' : LinksStatus[url].dwreport, 'url' : url, 'timelabel' : BoxTimeLabel });
				}
				eventObj.preventDefault();
				eventObj.stopPropagation();
			}
			return false;
		}
		var _idNodeHash = {
			"saveBlocksButton": 1,
			"cancelAddBlocksButton": 1,
			"fitToBottom": 1,
			"restoreBlockBtn": 1,
			"removeRulesBtn": 1
		};

		HandleLinkClick = function(eventObj){
             if(manualHidingMode){
				if(_idNodeHash[eventObj.target.id]){
					// console.log('FROM HandleLinkClick `%s`', eventObj.type);
					return;
				}
			 
				// console.log('Want click?');
                     //check if event is clicking by left or middle mouse button
				if(eventObj.which != 1 && eventObj.which != 2){
					return false;
				}
					// Cause trouble at a > img
                     // if (eventObj.target.tagName == "A" || eventObj.target.parentNode.tagName == "A"){
                         // eventObj.preventDefault();
                         // eventObj.stopPropagation();
                     // }
             }
        }

		// click link handle
        HandleAdsClick = function(eventObj){
			// TODO refactor this:
			if(_idNodeHash[eventObj.target.id]){
				return;
			}
			
			//check if event is clicking by left or middle mouse button
			if(eventObj.which != 1 && eventObj.which != 2){
				return false;
			}
			
			if(manualHidingMode){
				eventObj.preventDefault();
				eventObj.stopPropagation();
			}
        };

		//send request for checking link to DrWebCheckUrl [background.js]
		CheckLink = function(url){
		    try{
			    chrome.extension.sendMessage({ 
					'action' : 'DrWebCheckUrl', 
					'url' : url, 
					'sitename' : Sites[Hostname].name, 
					'timelabel' : BoxTimeLabel 
				}, HandleDrWebCheckUrl);
			}catch(err){}
		}
		
		RemoveDialog = function(){
			document.body.style.position = '';
			document.body.style.width = '';
			
			if(Box){
				Box.parentNode.removeChild(Box);
				Box = null;
			}
		};

		//creating dialog for external links
		Dialog = function(url) 
		{
		    //getting dialog box and trying to remove it if exist
			Box = window.document.getElementById(BoxId);
			try{
				Box.parentNode.removeChild(Box);
				Box = null;
			} catch(e) {}

            //creating dialog box
			Box = window.document.createElement('div');
			Box.setAttribute('id', BoxId);
			Box.className = "";
			window.document.body.appendChild(Box);
			document.body.style.position = 'fixed';
			document.body.style.width = '100%';

			//adding eventlistener for escape key to remove dialog box
			window.document.addEventListener('keydown', function(e) {
				if(e.keyCode == '27'){
					RemoveDialog();
				}
			}, false);

			var localisedSiteName = chrome.i18n.getMessage(Sites[Hostname].name + 'Site');
			var header = chrome.i18n.getMessage('header');
			header = header.replace('drwebLinkName', localisedSiteName);
			header = header.replace('drwebLinkDesc', url);
			var mainText = chrome.i18n.getMessage('mainText');
			mainText = mainText.replace('drwebLinkName', localisedSiteName);
			var additionalText = chrome.i18n.getMessage('additionalText');
			additionalText = additionalText.replace(/drwebLinkName/g, localisedSiteName);

			Box.innerHTML = 
			'<div id="drwebConfirmationWrap">' +
			'<div id="drwebConfirmationBox"><div id="drwebConfirmationHeader"><img src="' + chrome.extension.getURL('content/css/images/logo.png') +'" alt="' + chrome.i18n.getMessage('antivirusTitle')+ '" /></div><div id="drwebConfirmationContent"><div id="'+BoxLeftColumnId+'" class="drwebWarning"></div><div id="'+BoxRightColumnId+'">' + header + mainText + '<p class="last"><a id="'+BoxDrWebDescriptionLink+'" href="#drweb_description" onclick="return false;">' + chrome.i18n.getMessage('whyWarning') + '</a></p><div id="drweb_description" style="display: none;"><a name="drweb_description"></a><div class="last">' + additionalText + '</div></div></div></div><div id="drwebConfirmationFooter"><form id="'+BoxFormId+'" action="" method="get" accept-charset="utf-8" onsubmit="return false;"><button type="submit" id="'+BoxButtonSubmitId+'" disabled="disabled">' + chrome.i18n.getMessage('scanning') + ' <img src="' + chrome.extension.getURL('content/css/images/loadingImage.gif') + '" /></button><input id="'+BoxButtonCloseId+'" type="button" value="' + chrome.i18n.getMessage('close') + '" onclick=";" /></form></div></div>' +
			'</div>';

			// adding event listeners for description link, close button and submit
			window.document.getElementById(BoxDrWebDescriptionLink).addEventListener('click', function(eventObj) { Toggle(BoxDrWebDescription);}, true);
			window.document.getElementById(BoxButtonCloseId).addEventListener('click', HandleBoxClose, false);
			window.document.getElementById(BoxId).addEventListener('submit', function(eventObj) {
				HandleBoxFormSubmit(url, eventObj);
			}, false);
		}

		//open link from dialog handler
		HandleBoxFormSubmit = function(url, eventObj)
		{
			window.open(url);
			RemoveDialog();
			eventObj.preventDefault();
			eventObj.stopPropagation();
			return false;
		}

	    //close dialog handler
		HandleBoxClose = function(e){
			e.preventDefault();
			e.stopPropagation();
			RemoveDialog();
		}

		//show or hide dialog description
		Toggle = function(id)
		{
			var el = window.document.getElementById(id);
			el.style.display = (el.style.display == 'block' ? 'none' : 'block');
			return false;
		}
		
		HandleMessages = function(request, sender, sendResponse) 
		{
			try
			{
				var func = eval(request.action); // refactor it!!!!
			} 
			catch(e) 
			{
				return false;
			}
			if(typeof func == 'function') {
				func(request, sender, sendResponse);
			}
		}
		
		HandleContextMenu = function(request, sender, sendResponse)
		{
			var selectedText = request.selectionText;
			var url;
			var result;
			
			if(!selectedText)
				return false;

			result = request.isLink? LinkHrefRegexp.exec(selectedText) : LinkInTextRegexp.exec(selectedText);

			if(result)
			{
				var url = (result[1]? result[1] : 'http://') + result[2];
				if(typeof Sites[Hostname] != "undefined")
				{
					var url = Sites[Hostname].linkFunction(url);
				}
				if(url)
				{
					var width = 640;
					var height = 400;
					var lng = chrome.i18n.getMessage("lng");
					var win = window.open('http://online.drweb.com/result/?lng='+lng+'&chromeplugin=1&url=' + encodeURIComponent(url), 'drweb_online_check', 'type=popup,width=' + width + ', height=' + height + ',top=' + Math.ceil(window.screen.height-height)/2 + ',left=' + Math.ceil(window.screen.width-width)/2);
					return true;
				}
				else
				{
					alert(chrome.i18n.getMessage("noExtLinksInSelection"));
					return false;
				}
			}
			alert(chrome.i18n.getMessage("noLinksInSelection"));
			return false;
		}

        //decoding url
		DecodeURIComponentFix = function(str)
		{
			var str;
			try
			{
			    //standart JS function
				str = decodeURIComponent(str);
			} 
			catch(e)
			{
			    //on exception to utf
				str = Cp2Utf(unescape(str));
			}
			return str;
		}

		//to utf converting by char
		Cp2Utf = function(txt)  
		{
			var out = '';
			for(var i = 0; i < txt.length; i++)
			{
				var ch = txt.charCodeAt(i);
				if(ch >= 192 && ch <= 255)
					out += String.fromCharCode(ch+848);
				else if(ch == 168)
					out += String.fromCharCode(ch+937);
				else if(ch == 184)
					out += String.fromCharCode(ch+841);
				else 
					out += txt[i];
			}
			return out;
		}

        //initialize content
        contentsInit = function(){
			if (social_enabled){
                hideElement(socialPatterns, "a", "href");
                hideElement(socialPatterns, "iframe", "src");
            }
            if (track_enabled){
                hideCounters(countersPatts, "a", "href");
                hideCounters(countersPatts, "img", "src");
            }
			
            if((adsException && !adsException.allow) || ads_enabled){
            	if (!isItSocialNetwork()){
                    hideElement(adsPatterns, "a", "href");
                    hideElement(adsPatterns, "iframe", "src");
                    hideSpecTags("yatag");
                }else{
					for(var i = 0; i< specSocialBlocks.length; i++){
                        hideSpecialBlocks(specSocialBlocks[i]);
                    }
                }	
            }

            if(manualHidingMode == false){
                var infoBox = $4.id('infoBox');
                
                if(infoBox){
                    $4.removeNode(infoBox);    
                }
            }
        }

        //social
        isItSocialNetwork = function(){
            var socialURLs = ["vkontakte.ru", "vk.com", "facebook.com", "fb.com", "plus.google.com"];
            for(var i = 0; i < socialURLs.length; i++){
                if (actualURL.indexOf(socialURLs[i]) != -1){
                    return true;
                }
            }

            return false;
        }

        //social
        getSocialNetworkPref = function()
        {
            var socialURLs = new Array("vkontakte.ru", "vk.com", "facebook.com", "fb.com", "plus.google.com");
            for (var i = 0; i< socialURLs.length; i++)
            {
                if (document.URL.indexOf(socialURLs[i]) != -1)
                {
                    if (i < 2)
                        return "vk";
                    else if (i < 4)
                        return "fb";
                    else
                        return "gl";
                }
            }

            return "";
        }

        //hide special blocks like Ads in VK, Facebook
        hideSpecialBlocks = function(specSocialBlock){
			var     ids = specSocialBlock.id.split("%"),
                    buf;
            
            for (var j = 0; j< ids.length; j++){
                if(buf = $4.id(ids[j])){
                    $4.removeNode(buf);
                }
            }
            ids = null;

            var classes = specSocialBlock.className.split("%");
            for (var j = 0; j< classes.length; j++){
                if(buf = document.getElementsByClassName(classes[j])){
                    $4.removeNodes(buf);
                }
            }
            classes = null;
        }

		
		var _TAG_LIST = ["DIV", "SPAN", "IMG", "TABLE", "OBJECT", "EMBED", "IFRAME"];
		// Сравнение элемента с образцом
		function NodeValidate(config, node){
			switch(config.tagName){
				case 'DIV':
				case 'SPAN':
				case 'IMG':
					if(
						(node.className == config.className || (config.id && node.id == config.id)) && 
						config.DOMstring == _global.getDOMstring(node)
					){
						return true;
					}else{
						return false;
					}
					break;
				case 'TABLE':
					if(node.className == config.className && config.DOMstring == _global.getDOMstring(node)){
						return true;
					}else{
						return false;
					}
					break;
				case 'OBJECT':
				case 'EMBED':
				case 'IFRAME':
                    if(config.DOMstring == _global.getDOMstring(node)){
						return true;
					}else{
						return false;
					}
					break;
			}
		};
		
		// Имеется явная проблема, что на момент загрузки не все элементы имеются.
		// Поэтому, по хорошему стоило бы слушать mutation observer!
		function hideBlockedItems3(){
			var 	tagHash = {},
					blockedParts,
					blockedCount = 0;
				
			if(blockedItems && blockedItems != "null"){
				blockedParts = JSON.parse(blockedItems);
			}else{
				blockedParts = [];
			}
			
			_TAG_LIST.forEach(function(tagName){
				tagHash[tagName] = document.getElementsByTagName(tagName);
			});
            
			for(var i = 0, len = blockedParts.length, item; item = blockedParts[i], i < len; i++){
				if(item.baseURL != baseURL || !item.block || !tagHash[item.tagName]){
					continue;
				}
				var nodes = tagHash[item.tagName];
				for(var j = 0, nodeLen = nodes.length; j < nodeLen; j++){
					if(NodeValidate(item, nodes[j])){
						nodes[j].setAttribute("hidden", "true");
						nodes[j].style.display = 'none';
						nodes[j].setAttribute('userblocknode', 'true');
						blockedCount++;
					}
				}
			}
			//tagHash = null;
			return blockedCount;
		};
       
		function showHiddenBlocks(){
			var hiddenNodes = document.querySelectorAll('[userblocknode]');
			
			for(var i = 0, len = hiddenNodes.length; i < len; i++){
				hiddenNodes[i].removeAttribute('hidden');
				hiddenNodes[i].style.display = '';
				
			}
		}
		/*function disableHiddenBlocks(){
			var hiddenNodes = document.querySelectorAll('[userblocknode]');
			
			for(var i = 0, len = hiddenNodes.length; i < len; i++){
				hiddenNodes[i].setAttribute('hidden', 'true');
				hiddenNodes[i].style.display = 'none';
			}
		}*/

var RestoreApp = (function(){
	var 	_CLASS = 'slct-mchn',
			_SVG_NS = 'http://www.w3.org/2000/svg';
			
	return {
		handlers: [],
		count: 0,
		init: function(){
			this.destroy();
			
			this.pickerRoot = $4.cr('div', 'className', _CLASS);
			this.svgRoot = document.createElementNS(_SVG_NS, 'svg');
			this.pickerRoot.appendChild(this.svgRoot);
			document.body.appendChild(this.pickerRoot);
			this.svgRoot.onclick = function(e){
				var index = e.target.dataset.id;
				
				if(index && this.handlers[index]){
					this.handlers[index]();
					this.count--;
				
					if(!this.count){ // If it last
						SelectApp._controls.restoreBtn.onclick();
					}
				}
			}.bind(this);
		},
		open: function(){
			var 	svgWidth = document.documentElement.scrollWidth,
					svgHeight = document.documentElement.scrollHeight,
					disabledNodes = $4.select('[userblocknode]', true);
			
			this.svgRoot.setAttribute('x', 0);
			this.svgRoot.setAttribute('y', 0);
			this.svgRoot.setAttribute('width', svgWidth);
			this.svgRoot.setAttribute('height', svgHeight);
			this.svgRoot.setAttribute("viewBox", '0 0 ' + svgWidth + ' ' + svgHeight);
			
			//disabledNodes
			var svgIsland;
			for(var i = 0, len = disabledNodes.length; i < len; i++){
				svgIsland = this.createIland(disabledNodes[i], function(node, island){
					return function(){
						node.removeAttribute('userblocknode');
						$4.removeNode(island);
						// TODO send request on backend!
                        chrome.extension.sendMessage({
                            action: 'clearBlockRule', 
                            host: _HOST,
                            domString: _global.getDOMstring(node)
                        }, function(){});
                        
					};
				});
				this.svgRoot.appendChild(svgIsland);
			}
			
			// TODO for not 100% blocked items
			SelectApp.cache.forEach(function(item){
				svgIsland = this.createIland(item, function(node, island){
					return function(){
						node.removeAttribute('drweb-disabled');
						$4.removeNode(island);
						var pos = SelectApp.cache.indexOf(item);
						
						if(pos != -1){
							 SelectApp.cache.splice(pos, 1);
						}
					};
				});
				this.svgRoot.appendChild(svgIsland);
			}.bind(this));
			
		},
		createIland: function(node, createHandler){
			var 	island = document.createElementNS(_SVG_NS, 'path'),
					offx = window.pageXOffset,
					offy = window.pageYOffset,
					islandPath,
					ow = this.svgRoot.getAttribute('width'),
					islands = [],
					r = node.getBoundingClientRect();
			
			island.classList.add('slct-machn_islands');
			island.dataset.id = this.handlers.length;
			islands.push(
				'M', r.left + offx, ' ', r.top + offy,
				'h', r.width,
				'v', r.height,
				'h-', r.width,
				'z'
			);
			
			if(islandPath = islands.join('')){
				island.setAttribute('d', islandPath);
			}
			
			this.handlers.push(createHandler(node, island));
			this.count++;
			return island;
		},
		destroy: function(){
			if(this.pickerRoot && this.pickerRoot.parentNode){
				$4.removeNode(this.pickerRoot);
			}
			this.handlers.length = 0;
			this.count = 0;
		},
	};
}());

var 	_FIT_CLASS = '__drweb_fitToBottom',
		_DIS_ICON_CLASS = 'drweb_disabled',
		_DIS_ATTR = 'drweb-disabled';
		_OBJECT_TAG = {
			"IFRAME": 1,
			"EMBED": 1,
			"OBJECT": 1
		},
		_BACK_SRC = chrome.extension.getURL('content/icons/back1.gif'),
		_HOST = window.location.host, // aka baseURL
		_HREF = window.location.href; // aka actualURL
		
var SelectApp = (function(){

    var _SelectModel = new BaseModel({
        disablePanel: false,
        topAlign: true,
        saveEnabled: false,
        blockEnabled: false,
        restoreEnabled: false,
        opened: false,
        //cache: [],
    });
    _SelectModel.toggle = function(propertyName){
        this.change(propertyName, !this.get(propertyName));
    }
    
    var _Template = '<div class="drweb_tool-panel">' +
            '<div class="drweb_tool-icon drweb_tool-icon_show" data-co="restore-btn" title="restore"></div>' +
            '<div class="drweb_tool-icon drweb_tool-icon_remove" data-co="remove-btn" title="remove"></div>' +
            '<div class="drweb_fit-btn" data-co="fit-btn" title=""></div>' +
        '</div>' +
		'<span data-co="label">' + chrome.i18n.getMessage('manualBlockingText') + '</span>' +
        '<div class="drweb_btn" data-co="save">' + chrome.i18n.getMessage('manualBlockingSave') + '</div>' +
        '<div class="drweb_btn" data-co="cancel">' + chrome.i18n.getMessage('manualBlockingCancel') + '</div>' +
        '<div class="drweb_panel-plug" data-co="plug" style="display: none"></div>';
    
    return {
		_inited: false,
        _controls: {},
        _bindByData: function(root){
            var		pos,
                    $nodes = (root || document).querySelectorAll('[data-co]');

            for(var i = $nodes.length - 1, field, $node; $node = $nodes[i], i >= 0; i--){
                field = ($node.dataset.co || 'root').replace(this.CATCH_DEFIS, this._replaceDefis);
                this._controls[field] = $node;
            }
        },
        CATCH_DEFIS: /-(\w)/g,
        _replaceDefis: function(str, p1, offset, s) {
             return p1.toUpperCase();
        },
        createPanel: function(){
        	// create panel tag for VK bug - #91060
            this.$panel = $4.cr('panel', 'className', 'drweb_select-panel');
            this.$panel.style.display = 'none';
            // this.$panel.style.top = '0'; // fix for bug #91060 (VK)
            this.$panel.insertAdjacentHTML('afterbegin', _Template);
            this._bindByData(this.$panel);
        },
		cache: [],
        // SelectApp.init()
		init: function(){
			this._inited =  true;
			$4.prepend(document.body, this.$panel);
			
            // Panel visibility
            _SelectModel.on('opened', function(val, property, model){
                if(val){ // show
                	document.body.style.position = 'static';
                    this.$panel.style.display = '';
                    this.$panel.style.top = '';
			        model.change('topAlign', true);
			        model.change('restoreEnabled', false);
					this._controls.restoreBtn.classList.remove(_DIS_ICON_CLASS); // init state (for animation!)
					
					model.change('blockEnabled', true);
                }else{ // hide
                	document.body.style.position = '';
					model.change('blockEnabled', false);
                    this.$panel.style.display = 'none';
                    // this.$panel.style.top = '0';
                    document.body.style.marginTop = '';
					// Clear cache before we leave the mode
					this.cache.forEach(function(node){
						node.style.display = '';
						node.removeAttribute('userblocknode');
						node.removeAttribute(_DIS_ATTR);
						node.style.background = node.getAttribute('drweb-back') || '';
						node.style.opacity = '';
						node.onclick = null;
						node.onmouseover = null;
						node.onmouseout = null;

                        if(_OBJECT_TAG[node.tagName]){
                            var flashNode = node.parentNode.querySelector('[flashnode]');
                            
                            if(flashNode){
				                $4.removeNode(flashNode);
                                node.parentNode.removeAttribute('flashLock');
                            }
						}
					});
					this.cache.length = 0;
					model.change('restoreEnabled', false);
                }
            }.bind(this));
            
            // Panel align
            _SelectModel.on('topAlign', function(val, property, model){
				if(val){
					this.$panel.classList.remove(_FIT_CLASS);
                    document.body.style.marginTop = '37px';
				}else{
					this.$panel.classList.add(_FIT_CLASS);
                    document.body.style.marginTop = '';
				}
				
				if(model.get('restoreEnabled')){
					RestoreApp.init();
					RestoreApp.open();
				}
            }.bind(this));
            
			// Select mode change
            _SelectModel.on('blockEnabled', function(val, property, model){
                if(val){
					document.addEventListener('mouseover', this._onMouseoverHandler);
                }else{
					document.removeEventListener('mouseover', this._onMouseoverHandler);
                }
            }.bind(this));
			
			// Restore mode change
            _SelectModel.on('restoreEnabled', function(val, property, model){
				var 	disabledNodes = $4.select('[userblocknode]', true);
				
				if(val){
					this._controls.save.style.display = 'none';
					this._controls.label.textContent = chrome.i18n.getMessage('manualUnBlockingText');
					this._controls.cancel.textContent = chrome.i18n.getMessage('close');
					
					
					for(var i = 0, len = disabledNodes.length; i < len; i++){
						disabledNodes[i].style.display = '';
						disabledNodes[i].removeAttribute('hidden');
					}
					
					this.cache.forEach(function(node){
						node.style.opacity = '';
						node.style.backgroundImage = '';
						
						if(node.tagName == "IFRAME" || node.tagName == "EMBED" || node.tagName == "OBJECT"){
							var flash = node.parentNode.querySelector('[flashnode]');
							flash.style.display = 'none';
							node.style.display = '';
						}
					});
					
					RestoreApp.init();
					RestoreApp.open();
				}else{
					this._controls.save.style.display = '';
					this._controls.label.textContent = chrome.i18n.getMessage('manualBlockingText');
					this._controls.cancel.textContent = chrome.i18n.getMessage('manualBlockingCancel');
					
					
					for(var i = 0, len = disabledNodes.length; i < len; i++){
						disabledNodes[i].style.display = 'none';
						disabledNodes[i].setAttribute('hidden', true);
					}
					
					this.cache.forEach(function(node){
						node.style.opacity = '0.1';
						
						if(node.tagName == "IFRAME" || node.tagName == "EMBED" || node.tagName == "OBJECT"){
							var flash = node.parentNode.querySelector('[flashnode]');
							flash.style.display = '';
							node.style.display = 'none';
						}
					});
					
					RestoreApp.destroy();
				}
				//model.change('blockEnabled', !val);
			}.bind(this));
			
			
			// [SAVE]
            this._controls.save.onclick = function(){
				var blocks = this.blocksFromCache();
				this.cache.forEach(function(node){
					node.style.display = 'none';
					node.setAttribute('userblocknode', 'true');
					node.style.background = node.getAttribute('drweb-back') || '';
					node.style.opacity = '';
					
					if(node.tagName == "IFRAME" || node.tagName == "EMBED" || node.tagName == "OBJECT"){
						var flashNode = node.parentNode.querySelector('[flashnode]');
						
						if(flashNode){
							$4.removeNode(flashNode);
                            node.parentNode.removeAttribute('flashLock');
						}
					}
					
					node.removeAttribute(_DIS_ATTR);
				});
				this.cache.length = 0;
                _SelectModel.change('opened', false);
                
				
				chrome.extension.sendMessage({
					action: 'saveBlocks', 
					blocks: blocks
				}, function() {});
            }.bind(this);
			
			// Blocked - [userblocknode=true]
			// Selected, but not blocked [drweb-disabled=true]
			
			// [CANCEL]
            this._controls.cancel.onclick = function(){
				//this.restorePause();
				// this._clearDOM();
                _SelectModel.change('opened', false);
				
            }.bind(this);
            this._controls.fitBtn.onclick = function(e){
                e.stopPropagation();
                _SelectModel.toggle('topAlign');
            };
            
            // REMOVE BTN:
            this._controls.plug.onclick = function(e){
                _global.prevent(e);
            };
            this._controls.removeBtn.onclick = function(e){
                e.stopPropagation();
				e.target.classList.add('drweb_trash_animation');
//				this.showHiddenBlocks();
//				this.hide(true); // remove events but don`t hide the panel

				this._clearAll();
				// this._clearDOM();
				
				this._controls.plug.style.display = '';
				chrome.extension.sendMessage({
					action: 'clearBlocks', 
					//path: _HREF,
					path: _HOST
				}, function(){});
            }.bind(this);
			var onAnimationHandler = function(e){
				e.target.classList.remove('drweb_trash_animation');
				setTimeout(function(){
					this._controls.plug.style.display = 'none';
					_SelectModel.change('opened', false);
				}.bind(this), 500);
			}.bind(this);
			this._controls.removeBtn.addEventListener('webkitAnimationEnd', onAnimationHandler);
			this._controls.removeBtn.addEventListener('animationEnd', onAnimationHandler);
            
            // RESTORE BTN:
            this._controls.restoreBtn.onclick = function(e){
                e && e.stopPropagation();
				var target = this._controls.restoreBtn;
				
				if(target.classList.contains(_DIS_ICON_CLASS)){
					target.classList.remove(_DIS_ICON_CLASS);
					target.classList.add('drweb_lamp_animation');
					
                    
					_SelectModel.change('restoreEnabled', false);
					_SelectModel.change('blockEnabled', true);
				}else{
                    target.classList.add(_DIS_ICON_CLASS);
					target.classList.remove('drweb_lamp_animation');
					
                    
                    _SelectModel.change('restoreEnabled', true);
					_SelectModel.change('blockEnabled', false);
				}
            }.bind(this);
			this._onMouseoverHandler = function(e){
				if(!_SelectModel.get('blockEnabled')){
					return;
				}
				var 	target = e.target,
						tagName = target.tagName;
						
				if(
					this.$panel && (
						this.$panel == target || 
						this.$panel.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_CONTAINED_BY //// 16
				)){
					return;
				}
					
				if(
					tagName == "DIV" || tagName == "SPAN" || tagName == "TD" || tagName == "IFRAME" || tagName == "EMBED" || tagName == "OBJECT" || tagName == "IMG"
				){
					if(tagName == "IMG" && !target.getAttribute(_DIS_ATTR)){
						var originalSrc = target.getAttribute("src");
						target.setAttribute("src", _BACK_SRC);
						target.setAttribute("oldSrc", originalSrc);
							
						target.onclick = function(e){
							//if(!SelectApp.enabled){ 
							if(!_SelectModel.get('blockEnabled')){
								target.onclick = null;
								return;
							}
							_global.prevent(e);
							
							if(!target.hasAttribute(_DIS_ATTR)){
								target.setAttribute(_DIS_ATTR, true);
								this.cache.push(target);
								target.style.opacity = '0.1'; 
							}else{
								target.removeAttribute(_DIS_ATTR);
								this.removeFromCache(target);
								target.style.opacity = '';
								target.setAttribute("src", originalSrc);
							}
						}.bind(this);
							
						target.onmouseout = function(e){
							e.stopPropagation();
							target.setAttribute("src", originalSrc);
							target.removeAttribute("oldSrc")
						}.bind(this);
					}else if(
						(tagName == "IFRAME" || tagName == "EMBED" || tagName == "OBJECT") &&
						!target.getAttribute(_DIS_ATTR)
					){
						var parent = target.parentNode;	
						var flashBlock; // Заглушка, помечается атрибутом `flashLock`
							
						if(!parent.getAttribute('flashLock')){
							flashBlock = document.createElement("div");
							
							flashBlock.style.width = target.offsetWidth + "px";
							flashBlock.style.height = target.offsetHeight + "px";
							
							flashBlock.setAttribute('flashnode', true);

							parent.setAttribute("flashLock", true);
							parent.appendChild(flashBlock);
						}else{
							flashBlock = parent.querySelector('[flashnode]');
						}
							
						target.style.display = "none";
						flashBlock.style.backgroundImage = 'url(' + _BACK_SRC + ')';
						flashBlock.style.display = '';
						
						flashBlock.onmouseout = function(e){
							_global.prevent(e);
							
							if(!target.getAttribute(_DIS_ATTR)){
								flashBlock.style.display = 'none';
								target.style.display = '';
							}
						}.bind(this);
							
						flashBlock.onclick = function(e){
							//if(!SelectApp.enabled){ 
							if(!_SelectModel.get('blockEnabled')){
								target.onclick = null;
								return;
							}
							_global.prevent(e);
							
							if(!target.hasAttribute(_DIS_ATTR)){
								target.setAttribute(_DIS_ATTR, true);
								this.cache.push(target);
								flashBlock.style.backgroundColor = 'rgba(255, 255,255, 0.5)';
							}else{
								target.removeAttribute(_DIS_ATTR);
								this.removeFromCache(target);
								flashBlock.style.backgroundColor = '';
							}
						}.bind(this);
						
					}else if(
						(tagName == "DIV" || tagName == "SPAN" || tagName == "TD") &&
						!target.getAttribute('flashnode')
					){
						if(target.tagName == "TD"){
							var tableNode = $4.parentByTag(target, 'TABLE');
							if(tableNode != document.body){
								target = tableNode;
							}
						}
							
						if(!target.getAttribute(_DIS_ATTR)){
							var originalBackground = target.style.background;
							target.style.background = 'url(' + _BACK_SRC + ')';
							target.setAttribute('drweb-back', originalBackground);
								
							target.onclick = function(e){
								//if(!SelectApp.enabled){ 
								if(!_SelectModel.get('blockEnabled')){
									target.onclick = null;
									return;
								}
								_global.prevent(e);
								
								if(!target.hasAttribute(_DIS_ATTR)){
									target.setAttribute(_DIS_ATTR, true);
									this.cache.push(target);
									target.style.opacity = '0.1'; 
								}else{
									target.removeAttribute(_DIS_ATTR);
									this.removeFromCache(target);
									target.style.opacity = '';
								}
							}.bind(this);
							
							target.onmouseout = function(e){
								_global.prevent(e);
								
								if(!target.getAttribute(_DIS_ATTR)){
									target.style.background = target.getAttribute('drweb-back') || '';
									target.style.opacity = ''; 
								}
							}.bind(this);
						}
					}
					//this.$current = target;
				}
			}.bind(this);
		},

        toggle: function(){
            _SelectModel.toggle('opened');
		},

		// @memberOf SelectApp
		removeFromCache: function(target){
			var pos = this.cache.indexOf(target);
								
			if(pos > -1){
				this.cache.splice(pos, 1);
			}
		},
		disableHiddenBlocks: function(){
			var hiddenNodes = document.querySelectorAll('[userblocknode]');
			
			for(var i = 0, len = hiddenNodes.length; i < len; i++){
				hiddenNodes[i].setAttribute('hidden', 'true');
				hiddenNodes[i].style.display = 'none';
			}
		},
		// @TODO define baseURL, actualURL
		// @memberOf SelectApp
		blocksFromCache: function(){
			var blockList = [];
			this.cache.forEach(function(node){
				blockList.push({
					id: node.id,
					baseURL: _HOST, 
					actualURL: _HREF,
					tagName: node.tagName,
					className: node.className,
					prtNodeClass: node.parentNode && node.parentNode.className,
					prtGrandNodeClass: node.parentNode && node.parentNode.parentNode && node.parentNode.parentNode.className,
					DOMstring: _global.getDOMstring(node)
				});
			});
			return blockList;
		},
        // @memberOf SelectApp - private method for cleaning DOM after manual block mode
		_clearDOM: function(){
			this.cache.forEach(function(node){
				node.style.display = '';
				node.removeAttribute('userblocknode');
				node.removeAttribute(_DIS_ATTR);
				node.style.background = node.getAttribute('drweb-back') || '';
				node.style.opacity = '';
				node.onclick = null;
				node.onmouseover = null;
				node.onmouseout = null;
			});
			this.cache.length = 0;
		},
		_clearAll: function(){
			var 	hiddenNodes = document.querySelectorAll('[userblocknode]'),
					len = hiddenNodes.length,
					node;
			
			while(len--){
				node = hiddenNodes[len];
				node.removeAttribute('hidden');
				node.style.display = '';
				node.removeAttribute('userblocknode');
				node.removeAttribute(_DIS_ATTR);
				node.style.background = node.getAttribute('drweb-back') || '';
				node.style.opacity = '';
				node.onclick = null;
				node.onmouseover = null;
				node.onmouseout = null;
			}
		},
    };
}());
SelectApp.createPanel();
// SelectApp.initEvents();	

// Informer for update page
var InformApp = (function(){
	return {
		show: function(){
			if(document.querySelector('.drweb_inform-panel')){
				return;
			}
			
			var $panel = $4.cr('div', 'className', 'drweb_inform-panel', 'id', 'refreshBox');
			$panel.style.display = 'none';
			
			$panel.appendChild($4.t(chrome.i18n.getMessage('refreshBox')));
			$panel.appendChild($4.cr('div', 'className', 'drweb-linkchecker_btn', 'textContent', chrome.i18n.getMessage('refreshButton'), 'onclick', function(){
				window.location.reload();
			}));
			$panel.appendChild($4.cr('div', 'className', 'drweb-linkchecker_btn', 'textContent', chrome.i18n.getMessage('refreshCancelButton'), 'onclick', function(){
				$4.removeNode($panel);
			}));
			$panel.onmouseover = function(e){
				e.stopPropagation();
				e.preventDefault();
			}
			
			$4.prepend(document.body, $panel);
			$panel.style.display = 'block';
		}
	};
}());	



// Was ist das?
checkForBlocking = function(target){
	return true;
}

//blocked item - structure of database item
blockedItem = function(id, baseURL, actualURL, tagName, className, prtNodeClass, prtGrandNodeClass, DOMstring){
	this.id = id;
	this.baseURL = baseURL;
	this.actualURL = actualURL;
	this.tagName= tagName;
	this.className= className;
	this.prtNodeClass = prtNodeClass;
	this.prtGrandNodeClass = prtGrandNodeClass;
	this.DOMstring = DOMstring;
}


//flag to show that flash is already hidden
var flashHidden = false;

//hide flash
hideFlash = function()
{
		var elementsObjects = document.getElementsByTagName("object");
		for (var j=0; j < elementsObjects.length; j++){
			elementsObjects[j].style.display = "none";
		}
		var elementsEmbed = document.getElementsByTagName("embed");
		for (var j=0; j < elementsEmbed.length; j++){
			elementsEmbed[j].style.display = "none";
		}
}

//hiding element by pattern
hideElement = function(patterns, tag, attribute)
{
	  if (patterns)
	  {
		  var elements = document.getElementsByTagName(tag);
		  for (var j=0; j < elements.length; j++){
			   if (elements[j].getAttribute(attribute))
			   {
				   for (var i=0; i < patterns.length; i++){
					  var patt = RegExp(patterns[i].patt);
					  if (patt.test(elements[j].getAttribute(attribute))){
						  elements[j].style.display = "none";
					  }
				   }
			   }
		  }
	  }
}

hideSpecTags = function(tag){
	  var elements = document.getElementsByTagName(tag);
	  for (var j=0; j < elements.length; j++){
		  $4.removeNode(elements[j]);
	  }
}

hideElement2 = function(pattern, tag, attribute){
	  if (pattern){
		  var elements = document.getElementsByTagName(tag);
		  for (var j=0; j < elements.length; j++){
			   if (elements[j].getAttribute(attribute))
			   {
				  var src = elements[j].getAttribute(attribute);
				  var patt = RegExp(pattern);
				  if (patt.test(src)){
					  elements[j].style.display = "none";
				  }
			   }
		  }
	  }
}

hideCounters = function(patterns, tag, attribute)
{
	  if (patterns.length > 0)
	  {
		  var elements = document.getElementsByTagName(tag);
		  for (var j=0; j < elements.length; j++){
			   if (elements[j].getAttribute(attribute))
			   {
				  var src = elements[j].getAttribute(attribute);
				  if (src)
				  {
					  for (var i=0; i < patterns.length; i++){
						 var patt = RegExp(patterns[i]);
						 if (patt.test(src)){
							 elements[j].style.display = "none";
						 }
					  }
				  }
			   }
		  }
	  }
}

		// TODO refactor it May cause Block panel showing!
		chrome.extension.onMessage.addListener(HandleMessages);
		
		/*var MutationService = {
			_observer: undefined,
			init: function(){
				this._observer = new MutationObserver(function(mutations) {
					// console.log('mutations');
					// console.log(mutations);
					var nodeCollection,
						j, 
						colLen;

					for(var i = 0, len = mutations.length; i < len; i++){
						nodeCollection = mutations[i].addedNodes;
						if(nodeCollection.length > 0){
							// console.log('Added');
							// console.dir(nodeCollection);
							for(j = 0, colLen = nodeCollection.length; j < colLen; j++){
								console.dir(nodeCollection[j]);
								console.log('Added type: %s', nodeCollection[j].tagName);
							}
							
						}
					}
				});
			},
			start: function(){
				this._observer.observe(document.body, { 
					// attributes: true, 
					childList: true, 
					subtree: true 
				});
			},	
			destroy: function(){
				this._observer.disconnect();
			}
		};
		MutationService.init();*/
		
function callbackFunction(response) {
	socialPatterns = [];
	adsPatterns = [];
	specSocialBlocks = [];
	adsException = [];
	// flashException = [];

	adsPatterns = response.adsPatterns;
	socialPatterns = response.socialPatterns;
	
	ads_enabled = response.options.ads_enabled;
	social_enabled = response.options.social_enabled;
	analytics_enabled = response.analytics;
	track_enabled = response.track;
	flash_enabled = response.flash;
	
	adsException = response.adsException;
	//flashException = response.flashException;
	//block_mode = response.blockMode;
	
	baseURL = response.tabURL.split( '/' )[2];
	actualURL = response.tabURL;
	blockedItems = response.blockedItems;
	specSocialBlocks = response.specSocialBlocks;
	countersPatts = response.countersPatts;
	
	document.addEventListener('readystatechange', function(e){
		// at interact step: MutationService.start();
		if(document.readyState == 'complete'){
			//console.log('LOAD COMPLETE');
			// clean dom here:
			hideBlockedItems3();
			// Create and init select panel
			SelectApp.init();
			
			// TODO: в contentsInit остался старый код, который скрывал заблокированные запросы
			contentsInit();
			
			setTimeout(function(){
				// Приоритетный метод для скрытия то что было прервано в процессе загрузки!
				chrome.extension.sendMessage({
					action: 'getBlocked', 
				}, function(blocks){
					if(!blocks){
						return;
					}
					
					var 	nodesHash = {
								'image': document.getElementsByTagName('img'),
								'sub_frame': document.getElementsByTagName('iframe')
							}, 
							j, nodeLen, nodes;
					
					for(var i = 0, len = blocks.length; i < len; i++){
						nodes = nodesHash[blocks[i].resType];
						
						if(!nodes){
							continue;
						}
						for(j = 0, nodeLen = nodes.length; j < nodeLen; j++){
							
							if(nodes[j].getAttribute('src') == blocks[i].resUrl){
								nodes[j].style.display = 'none';
							}
						}
					}
					nodesHash = null;
				});
			}, 1000);
		}
	});
			
	var hidden, visibilityChange; 
	
	if(typeof document.hidden !== "undefined"){ 
		hidden = "hidden";
		visibilityChange = "visibilitychange";
	}else if (typeof document.webkitHidden !== "undefined"){
		hidden = "webkitHidden";
		visibilityChange = "webkitvisibilitychange";
	}
	
	if(hidden){
		var visibilityChangeHandler = function(e){
			if(document[hidden] === false){
				
				chrome.extension.sendMessage({
					action: 'updateBadge'
				}, function(){});
			}
		};
		
		visibilityChangeHandler();
		document.addEventListener(visibilityChange, visibilityChangeHandler);
	}
}
//getting settings for extension and adding handlers for clicking
try{
	//console.log('STEP 1');
	chrome.extension.sendMessage({'action' : 'GetOptions'}, HandleGetOptions);
}catch(err){}

var firstTime = true;

var HandleCheckSocialSettings = function(message){
	if(Options[Sites[Hostname].name+'-check'].toString() != message.options[Sites[Hostname].name+'-check'].toString()){
		InformApp.show();
	}
}

var getElementsByTagList = function(tagList){
	var res = [];
	tagList.forEach(function(tagName){
		var nodes = document.getElementsByTagName(tagName);
		for(var i = 0, len = nodes.length; i < len; i++ ){
			res.push(nodes[i]);
		}
	});
	return res;
};

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if(!request){
		return;
	}
	
	switch(request.mode){
		case 'showRefreshInformer':
			InformApp.show();
			break;
		case 'refresh':
			var type = request.type;
			var curSocNetwork = getSocialNetworkPref();
			
			if(type == 'tracking' && request.pattern){
				var 	reg = new RegExp(request.pattern),
						nodeList = getElementsByTagList(['img', 'iframe', 'script']);
				
				// we clean items
				nodeList.forEach(function(node){
					if(node.src && reg.test(node.src)){
						node.src = '';
					}
				});
				// but reload page not neccessery, testers want's 
				InformApp.show();
			}else if(
				type == 'social-vk' ||
				type == 'social-fb' ||
				type == 'social-gl' 
			){
				if(curSocNetwork && (type != 'social-' + curSocNetwork)){
					break;
				}
				try{
					chrome.extension.sendMessage({action: 'GetOptions'}, HandleGetOptions);
				}catch(err){}
			}
		break;
		case "updateTabData":
			if(!_clickHandlerAdded){
				try{
					chrome.extension.sendMessage({'action' : 'GetOptions'}, HandleGetOptions);
				}
				catch(err){}
			}else{
				
			}
		break;
		case "refresh-special":
			if (request.urls){
				var urls1 = JSON.parse(request.urls);
				for(var i = 0; i < urls1.length; i++)
				{
					if(urls1[i].replace("www.", "") == document.location.host.replace("www.", "")){
						InformApp.show();
					}
				}
			}
			break;	
		case 'checkLink':
			// show window with url check
			HandleContextMenu(request, sender, sendResponse);
			break;
		case 'blockMode':
			//switchMode(request.enabled);
			SelectApp.toggle();
			break;
		default:
			if(request.mode != ""){
				// TODO refactor this method
				//switchMode(request.mode);
				SelectApp.toggle();
			}else{
						
				if(request.patt){ // This statement never done!
					if(document.readyState == "interactive"){
						hideElement2(request.patt, "a", "href");
						hideElement2(request.patt, "iframe", "src");
						hideElement2(request.patt, "img", "src");
						hideElement(request.adsPatterns, "a", "href");
						hideElement(request.adsPatterns, "iframe", "src");
					}else{
						setTimeout(function(){
							hideElement2(request.patt, "a", "href");
							hideElement2(request.patt, "iframe", "src");
							hideElement2(request.patt, "img", "src");
							hideElement(request.adsPatterns, "a", "href");
							hideElement(request.adsPatterns, "iframe", "src");
						}, 1000);
					}
				}
				if (request.specSocialBlocks){
					for (var i = 0; i< request.specSocialBlocks.length; i++){
					   if (adsException){
						   if (!adsException.allow){
							   hideSpecialBlocks(request.specSocialBlocks[i]);
						   }
					   }else if (ads_enabled){
						   hideSpecialBlocks(request.specSocialBlocks[i]);
					   }
					}
				}	
			}
		break;
	}
	
});
		
// @TODO: add handler on creation of block (don't delegate to document!)
document.addEventListener('click', function(e){
	 var event = e || window.event;
	 var target = event.target || event.srcElement;

	 if (target.id == "drwebConfirmation"){
		var box = document.getElementById("drwebConfirmation");
		if(box){
			box.parentNode.removeChild(box);
			box.style.display = "none";
			box = null;
			document.body.style.position = '';
			document.body.style.width = '';
		}
	 }
});

port = chrome.extension.connect();
port.onDisconnect.addListener(function (event) {

});
