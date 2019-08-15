(function(){

// var _GA = {
// 	tid: 'UA-54304288-1', 
// 	cid: '832388617.1413808586', // get from cookie
// 	// category, action, label, value
//     // @param {Function} Cb - onsuccess
//     // @param {Function} Fb - onsuccess
// 	sendEvent: function(cat, act, lab, val, Cb, Fb){
// 		$xhr.get('http://www.google-analytics.com/collect', {
// 			v: 1,
// 			tid: this.tid,
// 			cid: this.cid,
// 			t: 'event',
// 			ec: cat,
// 			ea: act,
// 			el: lab,
// 			ev: (val|| 1),
// 			dp: '/chromium-background',
// 			z: (1000000000 + Math.floor(Math.random() * (2147483647 - 1000000000))),
// 		}, (Cb || function(){}), (Fb ||function(){}));
//         //console.log('[GA ] ' + cat +  ' act: ' + act + ' lab:' + lab);
// 	}
// };    


var httpRequestTimeout = 11000;
var tracks = new Array();
var tabId;
var tabURL;
var ads_enabled = "ads-enabled";
var analytics_enabled = "analytics-enabled";
var social_enabled = "social-enabled";
var flash_enabled = "flash-enabled";
var track_enabled = "track-enabled";
var block_mode = "block-mode-enabled";
var settings;
var debug;
var adsTypes = new Array();
var patterns = new Array();
var names = new Array();
var types = new Array();
var flashExceptions = new Array();
var adsExceptions = new Array();
var blockParts = new Array();
var specSocialBlocks = new Array();




    //var notBlockThisTabs = 0;
    var allowUpload = true;

    //getting localStorage object value
    getLocalStorageValue = function(name){
        return localStorage[name];
    }
    //getting localStorage object value
    setLocalStorageValue = function(name, value){
       localStorage[name] = value;
    }

    //settings item - structure of database item
    settingsItem = function(id, name, type, pattern, block){
        this.id = id;
        this.name = name;
        this.type= type;
        this.block= block;
        this.pattern = pattern;
    }

    //exception item - structure of database item
    exceptionItem = function(id, baseURL, allow){
        this.id = id;
        this.baseURL = baseURL;
        this.allow = allow;
    }

    //ads block - structure of database item
    adsBlock = function(baseURL, id, className){
        this.id = id;
        this.baseURL = baseURL;
        this.className= className;
    }

    //blocked item - structure of database item
    blockedItem = function(id, baseURL, actualURL, tagName, className, prtNodeClass, prtGrandNodeClass, DOMstring, block){
        this.id = id;
        this.baseURL = baseURL;
        this.actualURL = actualURL;
        this.tagName= tagName;
        this.className= className;
        this.prtNodeClass = prtNodeClass;
        this.prtGrandNodeClass = prtGrandNodeClass;
        this.DOMstring = DOMstring;
        this.block = block;
    }

    //initialize single item of localStorage
    initializeLocalStorageObj = function(name, defaultValue){
        if (localStorage[name] == null || localStorage[name] == 'undefined' || localStorage[name] == '')
            localStorage[name] = defaultValue;
    }

    function openWizardPage(){
        if (localStorage.firstRun == undefined || localStorage.firstRun.toString() == "true")
        {
            localStorage.firstRun = false;
            url=chrome.extension.getURL("content/wizard.html");
            chrome.tabs.query({}, function(tabs) {
                var found = false;
                for (var i = 0; i < tabs.length; i++) {
                    if (tabs[i].url == url)
                    {
                        chrome.tabs.update(tabs[i].id, {selected: true});
                        found = true;
                    }
                }
                if (found == false)
                    chrome.tabs.query( {url:url}, function(){chrome.tabs.create({url:url})});
            });
        }
    }

    function getDateTimeString(date){
		var 	curDate = date.getDate(),
				curMonth = date.getMonth() + 1,
				curHour = date.getHours(),
				curMinute = date.getMinutes(),
				curSeconds = date.getSeconds();

       return _global.withZero(curDate) + "." + _global.withZero(curMonth) + "." +  date.getFullYear() + " <font style='color: graytext'>" +  _global.withZero(curHour) + ":" + _global.withZero(curMinute) + ":" + _global.withZero(curSeconds) + "</font>";
    };

	// @TODO refactor it! all code is not async!
    function getJSON(url){
        if (!url) { return null; }

        method = 'GET';
        async = false;
        data = null;

        var req = new XMLHttpRequest();
        req.open(method, url, async);
        if (req.overrideMimeType) {
            req.overrideMimeType("text/plain; charset=utf-8");
        }
        if (async) {
            req.onreadystatechange = function() {
                if ((req.readyState === 4) && (req.status === 200)) {
                    var response = req.responseText;
                    var headers = req.getAllResponseHeaders();
                    if (typeof callback === 'function') {
                        callback(response, headers);
                    } else {
                        return response;
                    }
                }
                return null;
            };

            req.send(data);
        } else {
            req.send(data);
            return req.responseText;
        }

        return null;
    }

    function getString(string){
        if(!string || !string.length){
			return null;
		}
		var 	value = "",
				abs = string.split("-");
				
        for (i = 0, len = abs.length; i < len; i++) {
            if(abs[i]){
                value += String.fromCharCode(parseInt(abs[i]));
            }
        }
        return value;
    }
 	
	// Maybe unused
    //update tab data
    updateTabData = function(){
        try{
            chrome.tabs.sendMessage(tabId, {'mode' : 'updateTabData'}, function(responseMessage) {});
        }
        catch(err){}
    }

	//adding site exception
    addException = function(type, allow){
		var id = ('uni' + Math.random()).replace(".","");
        var baseURL = _global.getBaseURL(SettingsService.tabURL).replace('www.', '');

        adsExceptions = _global.parseFromStorage('adsExceptions');
        flashExceptions = _global.parseFromStorage('flashExceptions');

        if (type == "flash"){
            var index = exceptionExist(flashExceptions, baseURL);
            if(index == null){
                flashExceptions.push(new this.exceptionItem(this.id = id, this.baseURL = baseURL, this.allow = allow));
            }else{
                flashExceptions[index].allow = allow;
			}
			
            localStorage.flashExceptions = JSON.stringify(flashExceptions);
        }else if (type == "ads"){
            var index = exceptionExist(adsExceptions, baseURL);
            if (index == null){
                adsExceptions.push(new this.exceptionItem(this.id = id, this.baseURL = baseURL, this.allow= allow));
            }else{
                adsExceptions[index].allow = allow;
			}

            localStorage.adsExceptions = JSON.stringify(adsExceptions);
            //if allow - remove all blocked parts
            if(allow == true){
				var i = blockParts.length;
				while(i--){
					blockParts[i].baseURL == baseURL && blockParts.splice(i, 1);
				}
                localStorage.blockParts = JSON.stringify(blockParts);
            }
        }
    }

    //update Exception
    updateException = function(id, type, allow){
        if (type == "flash"){
            var index = geExceptionById(flashExceptions, id);
            if (index != null){
				 flashExceptions[index].allow = allow;
				 localStorage.flashExceptions = JSON.stringify(flashExceptions);
            }
        }
    }

    //getting exception for current tab
    getException = function(type){
        var baseURL = _global.getBaseURL(SettingsService.tabURL).replace('www.', '');
        if (type == "flash"){
             if(localStorage.flashExceptions != null &&
                 localStorage.flashExceptions != undefined &&
                 localStorage.flashExceptions != "[]"
			){
                 flashExceptions = JSON.parse(localStorage.flashExceptions);
                 var index = exceptionExist(flashExceptions, baseURL);
                 if (index != null)
                    return flashExceptions[index];
            }
        }else if (type == "ads"){
			if (localStorage.adsExceptions != null &&
                 localStorage.adsExceptions != undefined &&
                 localStorage.adsExceptions != "[]"){
                 adsExceptions = JSON.parse(localStorage.adsExceptions);
                 var index = exceptionExist(adsExceptions, baseURL);
                 if (index != null)
                    return adsExceptions[index];
                }
        }
        return null;
    }

    //get exceptions by tab Id
    var tempAdsException;
    getExceptionByTabId = function(type, tabId){
        chrome.tabs.get(tabId, function (parentTab) {
            var baseURL = _global.getBaseURL(parentTab.url);
            if (type == "ads")
            {
               if (localStorage.adsExceptions != null &&
                    localStorage.adsExceptions != undefined &&
                    localStorage.adsExceptions != "[]")
                    {
                    adsExceptions = JSON.parse(localStorage.adsExceptions);
                    var index = exceptionExist(adsExceptions, baseURL);
                    if (index != null)
                       tempAdsException = adsExceptions[index];
                   }
            }
            return null;
        });
    }

    //check if exception exist
    geExceptionById = function(storage, id){
         for (var i=0; i < storage.length; i++)
         {
            if (storage[i].id == id)
                return i;
         }
         return null;
    }

	// @TODO похоже здесь пытаются определить домен верхнего уровня
    //check if exception exist
    exceptionExist = function(storage, baseURL)
    {
         for (var i=0; i < storage.length; i++)
         {
			var actualURL = '',
				storageURL = '';
				
            if (storage[i].baseURL)
                var storageURL = storage[i].baseURL.replace("www.", "");
            if (baseURL)
                var actualURL = baseURL.replace("www.", "");
            var urlArray = storageURL.split(".");
            var urlLevel = urlArray.length;
            if (urlLevel <= 2)
            {
                var urlActualArray = actualURL.split(".");
                var urlActualLevel = urlActualArray.length;
                if (urlActualLevel > 2){
                    actualURL = urlActualArray[urlActualLevel-2] + "." + urlActualArray[urlActualLevel-1];
                }
                if (storageURL == actualURL && actualURL != "")
                    return i;
            }
            else
            {
                if (storageURL == actualURL && actualURL != "")
                    return i;
            }
         }
         return null;
    }

    //adding site exception
    removeException = function(type){
        var baseURL = _global.getBaseURL(SettingsService.tabURL).replace('www.', '');
        adsExceptions = _global.parseFromStorage('adsExceptions');
        flashExceptions = _global.parseFromStorage('flashExceptions');
        
        if (type == "flash"){
             var index = exceptionExist(flashExceptions, baseURL);
             if (index != null)
             {
                 flashExceptions.splice(index, 1);
                 localStorage.flashExceptions = JSON.stringify(flashExceptions);
             }
        }
        if (type == "ads"){
              var index = exceptionExist(adsExceptions, baseURL);
              if (index != null)
              {
                  adsExceptions.splice(index, 1);
                  localStorage.adsExceptions = JSON.stringify(adsExceptions);
              }
          }
    }

    //getting tracks info
    getTracksInfo = function(){
		//var tabDomain = _global.getDomain(SettingsService.tabURL);
		var tabDomain = _global.getBaseURL(SettingsService.tabURL || '');
		
		var tracks = TrackList.getTracks(SettingsService.tabId, tabDomain);
		
		return tracks;
    }

    //getting tracks info
    getTracksInfo2 = function(){
		//console.log('[CALL: getAdsAndSocialTracks]');
        var tracks = TrackList.getAdsAndSocialTracks(SettingsService.tabId, SettingsService.tabURL);
        return tracks;
    }

    //get patterns by type
    getPatterns = function(type){
         return getTracksInfo2();
    }

    getCounters = function(){
		var counters = [];
		for(var i=0; i < settings.length; i++){
			if(settings[i].type == "Tracking"){
			   counters.push(settings[i].pattern);
			}
		}
        return counters;
    }
	// Maybe unused
	SettingsChange = function(eventObj){
		Settings[eventObj.key] = eventObj.newValue;
	}
	
	// Maybe unused
    /*var tabIdPorts = [];
    var tabIdPort = SettingsService.tabId;*/
	
	// epic fail... предполагается что только в одной вкладке режим блокировки
	switchMode = function(){
		chrome.tabs.sendMessage(SettingsService.tabId,{
			mode: 'blockMode',
			enabled: LSModel.get('block_enabled')
		}, function(){});
    }.bind(this);
	
	turnOffBlockMode = function(tabId){
		LSModel.set('block_enabled', false);
		chrome.tabs.sendMessage(tabId, {
			mode: 'blockMode',
			enabled: false
		}, function(){});
	};
	
	
	// Maybe unused
    refreshMode = function(){
         chrome.tabs.sendMessage(SettingsService.tabId, {
			'mode' : "refresh"
		}, function(responseMessage) {});
    }
	// used add popup (when change at drop down)
    refreshSpecial = function(){
		var urls = [_global.getBaseURL(SettingsService.tabURL)]; 

        chrome.tabs.query({}, function(tabs) {
            for (var i = 0; i < tabs.length; i++) {
                try{
                    chrome.tabs.sendMessage(tabs[i].id, {
						'mode' : "refresh-special", 
						'urls': JSON.stringify(urls)
					}, function() {});
                }
                catch(err){}
            }
        });
    }
	// Maybe unused
	getBlockMode = function(request, sender, sendResponse){
        sendResponse({
			'state' :  LSModel.get('block_enabled')
		});
    }

	ContextMenuid = chrome.contextMenus.create({
        "title": chrome.i18n.getMessage("contextMenuSelectionSearch"),
        "contexts":	["all", "selection", "link"],
        "onclick": function(link, tab){
			var textLink;
			var isLink = false;
			
			if(link.linkUrl){
				textLink = link.linkUrl;
				isLink = true;
			}else{
				textLink = link.selectionText;
			}
			chrome.tabs.sendMessage(tab.id, { 
				//'action': 'HandleContextMenu', 
				mode: 'checkLink',
				'selectionText' : textLink, 
				'isLink' : isLink 
			}, function(){});
		}
	});


    browseUrl = function(url){
        url=chrome.extension.getURL(url);
        chrome.tabs.query({}, function(tabs) {
            var found = false;
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].url == url)
                {
                    chrome.tabs.update(tabs[i].id, {selected: true});
                    found = true;
                }
            }
            if (found == false)
                chrome.tabs.query( {url:url}, function(){chrome.tabs.create({url:url})});
        });

    }
    
window.report = function(addTab){
    var     nav = window.navigator;
    var     agent = nav.userAgent + '|' + nav.language + '|' + nav.vendor + '|' + nav.platform,
            cat = 'wizardReport';
    
    if(addTab){
        agent += '|' + SettingsService.tabURL;
        cat = 'adsReport';
    }
    
    // _GA.sendEvent(cat, 'chromium', agent, 1);  
};
    

	var LSModel = new LocalStorageModel('appConfig');
	var TabModel = new BaseModel();
	window.model = LSModel;
	
	if(!window.localStorage['appConfig'] && localStorage[analytics_enabled] != undefined){ // transform legacy settings
        LSModel.set('ads_enabled', localStorage[ads_enabled] == "true", true);
		LSModel.set('analytics_enabled', localStorage[analytics_enabled] == "true", true);
		LSModel.set('social_enabled', localStorage[social_enabled] == "true", true);
		LSModel.set('flash_enabled', localStorage[flash_enabled] == "true", true);
		LSModel.set('track_enabled', localStorage[track_enabled] == "true", true);
		LSModel.set('block_enabled', localStorage[block_mode] == "true", true);
	}else if(
        !LSModel.defined('ads_enabled') ||
        !LSModel.defined('analytics_enabled') ||
        !LSModel.defined('social_enabled') ||
        !LSModel.defined('flash_enabled') ||
        !LSModel.defined('track_enabled')
    ){ // initilaize new default settings
        LSModel.set('ads_enabled', true, true);
		LSModel.set('analytics_enabled', true, true);
		LSModel.set('social_enabled', false, true);
		LSModel.set('flash_enabled', false, true);
		LSModel.set('track_enabled', true, true);
		LSModel.set('block_enabled', false, true);	
	} // else use saved settings
	LSModel.saveData();
	
	// public interface
	window.App = {
		// refresh DB
		// @param {Function} cb - success callback
		updateDB: function(cb){
			SettingsService.updateDB(cb);
		},
		// recheck after settings were changed
		recheckContent: function(type, enabledList){
			SettingsService.recheckContent(type, enabledList);
		},
		devSettings: function(){
			return SettingsService;
		}
	};

    // TODO core of exception API
    var ExceptionService = {
        // Attention use global variable `flashExceptions`
        getFlashException: function(tabHost){
            for(var i = 0, len = flashExceptions.length, exception; exception = flashExceptions[i], i < len; i++){
                if(tabHost.indexOf(exception.baseURL) != -1){
                    return exception;
                }
            }
        },
        setFlashExceptions: function(flaExcList){
            flashExceptions = flaExcList;
            localStorage.flashExceptions = JSON.stringify(flaExcList);
        },
        setAdsExceptions: function(adsExcList, blocksList){
            adsExceptions = adsExcList;
            localStorage.adsExceptions = JSON.stringify(adsExcList);
            blockParts = blocksList;
            localStorage.blockParts = JSON.stringify(blocksList);
        }
    };

    window.ExceptionService = ExceptionService;


	
	function createBlockItem(id, name, type, block, pattern){
		this.id = id;
		this.name = name;
		this.type = type;
		this.block = block,
		this.pattern = pattern;
		this.reg = new RegExp(pattern);
	}
	
	// @TODO: all variables from method append in that namespace
	// adsBlock
	// settingsItem
	var SettingsService = {
		checkSocialSettings: function(request, sender, sendResponse){
			sendResponse({
				options: {
					'vkontakte-check': LSModel.get('vkontakte-check'),
					'facebook-check': LSModel.get('facebook-check'),
					'google-check': LSModel.get('google-check')
				}
			});
		},
		//redirect tab
		redirectedTab: function(){
			return this.notBlockThisTabs == this.tabId;
		},
		sendParams: function(request, sender, callbackFunction){
			try{
				chrome.tabs.sendMessage(this.tabId, { 
					adsPatterns: getPatterns("Ads"),
					socialPatterns: getPatterns("Social Buttons"),
					ads: LSModel.get('ads_enabled'), //localStorage[ads_enabled], 
					social: LSModel.get('social_enamled'), //localStorage[social_enabled],
					analytics: LSModel.get('analytics_enabled'), //localStorage[analytics_enabled],
					flash: LSModel.get('flash_enabled'), //localStorage[flash_enabled], 
					track: LSModel.get('track_enabled'), //localStorage[track_enabled],
					adsException: getException("ads"),
					flashException: getException("flash"), 
					blockMode: LSModel.get('block_enabled'),
					tabURL: this.tabURL, 
					switchMode: localStorage.blockParts, 
					specSocialBlocks: specSocialBlocks, 
					countersPatts: getCounters()
				}, function(){});
			}catch(err){}
		},
		// @TODO: refact this methods, there are very similar
		disableBlockMode: function(request, sender, sendResponse){
			// LSModel.set('block_enabled', request.action == "enableBlockMode");
		},
		enableBlockMode: function(request, sender, sendResponse){
			// LSModel.set('block_enabled', request.action == "enableBlockMode");
		},
		GetOptions: function(request, sender, sendResponse){
			var options = {
				// 'vkontakte-check': true,
				// 'facebook-check': true,
				// 'google-check': true
			};
			$m.extend(options, LSModel.attr);
			['vkontakte-check', 'facebook-check', 'google-check'].forEach(function(key){
				options[key] = localStorage[key] == 'true';
			});

			var update = false;
			if(typeof request.update != "undefined" && request.update){
				update = true;
			}
			
			try{
				this._getActiveTab(function(tab){
					this.tabId = tab.id;
					this.tabURL = tab.url;
				}.bind(this));
				
				sendResponse({ 
					'options': options, 
					'update': false, 
					'adsPatterns': getPatterns("Ads"), 
					'socialPatterns': getPatterns("Social Buttons"),
					
					ads: LSModel.get('ads_enabled'),
					social: LSModel.get('social_enamled'),
					analytics: LSModel.get('analytics_enabled'),
					flash: LSModel.get('flash_enabled'),
					track: LSModel.get('track_enabled'),
					// "blockMode" : LSModel.get('block_enabled'),
					
					"adsException" : getException("ads"), 
					//"flashException" : getException("flash"), 
					"tabURL" : this.tabURL, 
					"blockedItems" : localStorage.blockParts, 
					"specSocialBlocks" : specSocialBlocks, 
					"countersPatts" : getCounters()
				});
			}catch(err){}
		},
		//check url safety
		DrWebCheckUrl: function(request, sender, sendResponse){
			if(request.url){
				var abortTimeout;
				
				var xhr = $xhr.get('http://online.drweb.com/result/', {
					snp: request.sitename,
					r: 'xml',
					url: request.url
				}, function(r, xhr){
					clearTimeout(abortTimeout);
					try{
						sendResponse({
							response: xhr.responseText,
							url: request.url, 
							timelabel: request.timelabel
						});
					}catch(e){};
				}, function(){
					clearTimeout(abortTimeout);
					try{
						sendResponse({
							response: '<?xml version="1.0" encoding="UTF-8"?><dwonline><status>serverUnavailable</status><dwreport></dwreport></dwonline>', 
							url: request.checkURL, 
							timelabel: request.timelabel
						});
					}catch(e){};
				});
				
				abortTimeout = setTimeout(function(){
					xhr.abort();
				}, httpRequestTimeout);
			}else{
				try{
					sendResponse({response: ''});
				}catch(e){};
			}
		},
		//saveBlocks
		saveBlocks: function(request, sender, sendResponse){
			var blockedParts = [];
			if(
				localStorage.blockParts &&
				localStorage.blockParts != "null"
			){
				blockedParts = JSON.parse(localStorage.blockParts);
			}

			if(request.blocks){
				for(var i=0; i < request.blocks.length; i++){
					var item = request.blocks[i];
					blockedParts.push(new blockedItem(
						item.id,
						item.baseURL,
						item.actualURL,
						item.tagName,
						item.className,
						item.prtNodeClass,
						item.prtGrandNodeClass,
						item.DOMstring,
						true
					 ));
				}
			}
			var urls = [];
			for(var i = 0; i < blockedParts.length; i++){
				var exist = false;
				for(var j = 0; j < urls.length; j++){
					if(urls[j] == blockedParts[i].baseURL){
						exist = true;
						break;
					}
				}
				if(!exist){
					urls.push(blockedParts[i].baseURL);
				}
			}

			for(var i = 0; i < urls.length; i++){
				var exist = false;
				var index = 0;
				if(
					localStorage.adsExceptions != null && 
					localStorage.adsExceptions != "undefined" && 
					localStorage.adsExceptions != ""
				){
				   adsExceptions = JSON.parse(localStorage.adsExceptions);
				}else{
					adsExceptions = [];
				}
				for(var j=0; j <adsExceptions.length; j++){
					if(adsExceptions[j].baseURL == urls[i]){
					   index = j;
					   exist = true;
					   break;
					}
				}
				if(!exist){
				   addException("ads", false);
				}else{
				   adsExceptions[index].allow = false;
				   localStorage.adsExceptions = JSON.stringify(adsExceptions);
			   }
			}

			localStorage.blockParts = JSON.stringify(blockedParts);
		},
		clearBlocks: function(request, sender, sendResponse){
			var 	blockedParts,
					//removedDomain = _global.getBaseURL(request.path || ''),
					removedDomain = (request.path || ''),
					list;
			
			if(localStorage.blockParts && localStorage.blockParts != "null"){
				blockedParts = JSON.parse(localStorage.blockParts);
			}else{
                blockedParts = [];
            }
			
			if(Array.isArray(blockedParts) && removedDomain){
				list =  blockedParts.filter(function(obj){
					return obj.baseURL != removedDomain;
				});
				
				localStorage.blockParts = JSON.stringify(list);
			}
		},
        // clear single rule
        clearBlockRule: function(request, sender, sendResponse){
            var 	blockedParts,
                    list;

            if(localStorage.blockParts && localStorage.blockParts != "null"){
				blockedParts = JSON.parse(localStorage.blockParts);
			}else{
                blockedParts = [];
            }
			
			if(Array.isArray(blockedParts) && request.host){
				list =  blockedParts.filter(function(obj){
					return obj.baseURL != request.host || obj.DOMstring != request.domString;
				});
				
				localStorage.blockParts = JSON.stringify(list);
			}
        },
		// @param {String} 
		//	'tracking' - enable tracking
		//	'social-gl'
		//	'social-vk'
		//	'social-fb'
		recheckContent: function(type, enabledList){
			var data = {};
			var patternList = [];
			var bufList;
			
//			console.log('[CALL recheckContent] type `%s`', type);
//			console.dir(enabledList);
			
			if(Array.isArray(enabledList)){
				enabledList.forEach(function(enabledItem){
					switch(enabledItem){
						case 'social_enabled':
							bufList = SettingsService.blockHash['Social Buttons'] || [];
						break;
						case 'analytics_enabled':
							bufList = SettingsService.blockHash['Web Analytics'] || [];
						break;
						case 'track_enabled':
							bufList = SettingsService.blockHash['Tracking'] || [];
						break;
						default:
							bufList.length = [];
						break;
					}
					bufList.forEach(function(item){
						patternList.push(item.pattern);
					});
				});
			}
			
			chrome.tabs.query({}, function(tabs) {
				for (var i = 0; i < tabs.length; i++) {
					try{
						chrome.tabs.sendMessage(tabs[i].id, { 
							mode: "refresh",
							type: type,
							tabId: tabs[i].id,
							pattern: patternList.join('|')
						},  function() {});
					}catch(err){}
				}
			});
		},
		init: function(){
			// TODO: все эти свойства не следует держать в localstorage. Необходимо заменить их отдельными методами
			// Add handlers on settings change
			var SocialRefreshHandler = function(value, model, propertyName){
				if(value){
					model.set(propertyName, false, true);
					chrome.tabs.query({}, function(tabs) {
						for (var i = 0; i < tabs.length; i++) {
							try{
								chrome.tabs.sendMessage(tabs[i].id, {
									mode: propertyName
								}, function() {});
							}
							catch(err){}
						}
					});
				}
			};
			// @DEPRICATED use SettingsService.recheckContent()
			LSModel.on('refresh', function(value, model, propertyName){
				if(!value){
					return;
				}
				model.set(propertyName, false, true); // without triggering
				chrome.tabs.query({}, function(tabs) {
					for (var i = 0; i < tabs.length; i++) {
						try{
							chrome.tabs.sendMessage(tabs[i].id, { 
								mode: "refresh"
							},  function() {});
						}catch(err){}
					}
				});
			});
			
			LSModel.on('refreshsocial-vk', SocialRefreshHandler);
			LSModel.on('refreshsocial-fb', SocialRefreshHandler);
			LSModel.on('refreshsocial-gl', SocialRefreshHandler);
			LSModel.on('refresh-special', function(value, model, propertyName){
				if(value){
					model.set(propertyName, false, true); // without triggering
					chrome.tabs.query({}, function(tabs) {
						for (var i = 0; i < tabs.length; i++) {
							try{
								chrome.tabs.sendMessage(tabs[i].id, { 
									mode: propertyName,
									urls: localStorage["refresh-special-urls"]
								},  function(){});
							}catch(err){}
						}
					});
				}
			});
			
			LSModel.on('ads_enabled', function(value, model, propertyName){
				chrome.tabs.query({}, function(tabs) {
					for (var i = 0; i < tabs.length; i++) {
						try{
							chrome.tabs.sendMessage(tabs[i].id, { 
								mode: 'showRefreshInformer',
							}, function(){});
						}catch(err){}
					}
				});
			});
			LSModel.on('flash_enabled', function(value, model, propertyName){
				chrome.tabs.query({}, function(tabs) {
					for (var i = 0; i < tabs.length; i++) {
						try{
							chrome.tabs.sendMessage(tabs[i].id, { 
								mode: 'showRefreshInformer',
							}, function(){});
						}catch(err){}
					}
				});
			});
			
			chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
                switch(request.action){
					case 'updateBadge':
						this._getActiveTab(function(tab){
							this.tabURL = tab.url;
							this.tabId = tab.id;
							
							// Schit code, need to normalize domain name!
							var normalizeURL = _global.getDomain(this.tabURL); // http://www.site.com/ => http://www.site.com
							
							this.setBadgeState(this.tabId, normalizeURL);
						}.bind(this));
						
						break;
					case 'updateSettings': // Change properties
						if(request.data){
							if(Array.isArray(request.data)){
								request.data.forEach(function(setItem){
									LSModel.set(setItem.property, setItem.value);
								});
							}else{
								LSModel.set(request.data.property, request.data.value);
							}
						}
						break;
					case "GetOptions":
						this.GetOptions(request, sender, sendResponse);
						break;
					case "CheckSocialSettings":
						this.checkSocialSettings(request, sender, sendResponse);
						break;
					case "sendParams":
						this.sendParams(request, sender, sendResponse);
						break;
					case "enableBlockMode":
						this.enableBlockMode(request, sender, sendResponse);
						break;
					case "disableBlockMode":
						this.disableBlockMode(request, sender, sendResponse);
						break;
					case "DrWebCheckUrl":
						this.DrWebCheckUrl(request, sender, sendResponse); break;
					case "saveBlocks":
						this.saveBlocks(request, sender, sendResponse); break;
					case 'clearBlocks':
						this.clearBlocks(request, sender, sendResponse); break;
                    case 'clearBlockRule':
						this.clearBlockRule(request, sender, sendResponse); break;
					case 'getBlocked': // передача элементов, которые были заблокированы в текущем табе
						var blocks = TrackList.getBlocks(this.tabId);
						sendResponse(blocks);
						
						// TODO set tab load completed:
						TrackList.stateComplete(this.tabId);
					break;
                    case 'closeTab':
                        if(sender.tab && sender.tab.id){
                            chrome.tabs.remove(sender.tab.id, function(){});
                        }
                        break;
				}
				return true;
			}.bind(this));
			
			this._getActiveTab(function(tab){
				this.tabId = tab.id;
				this.tabURL = tab.url;
				// Alternate:
				// TabModel.set('tabId', tab.id);
				// TabModel.set('tabURL', tab.url);
			}.bind(this));
			
			// window.model = TabModel;
			// @TODO: change Bundge on change event off activeTab.id
			
			
			chrome.tabs.onSelectionChanged.addListener(function(tab){
				this.setTabsParameters(); 
				this.setBadgeState(this.tabId, this.tabURL);
			}.bind(this));
			chrome.tabs.onUpdated.addListener(function(tid){ 
				this.setTabsParameters();  
			}.bind(this));
			chrome.tabs.onRemoved.addListener(function(tid){ 
				this.setTabsParameters();  
				// TrackList.removeTab(this.tabId, this.tabURL);
			}.bind(this));
			chrome.windows.onFocusChanged.addListener(function(tid){
				
				this.setTabsParameters(); 
				this.checkForUpdateDB();
			}.bind(this));
			chrome.webNavigation.onCreatedNavigationTarget.addListener(function(details) {
				this.checkNavigate(details);
			}.bind(this));
		},
		// @param {Function} cb
		_getActiveTab: function(cb){
			chrome.tabs.query({
				'active': true,
				windowType: "normal",
				'currentWindow': true // ??? at dev window
			}, function (tabs) {
				tabs.length && cb(tabs[0]);
			});
		},
		setTabsParameters: function(){
			this._getActiveTab(function(tab){
				this.tabId = tab.id;
				this.tabURL = tab.url;
				
				// TabModel.set('tabId', tab.id);
				// TabModel.set('tabURL', tab.url);
				// this.setBadgeState(this.tabId, this.tabURL);
			}.bind(this));
		},
		//checking navigation
		checkNavigate: function(details){
			getExceptionByTabId("ads", details.sourceTabId);
			var siteExc = tempAdsException;
			
			for(var i = 0; i < settings.length; i++){
				if(settings[i].type == "Ads"){
					if (RegExp(settings[i].pattern).test(details.url)){
						if (siteExc != null){
							if (!siteExc.allow){
								chrome.tabs.remove(details.tabId, function () {});
							}else{
								this.notBlockThisTabs = details.tabId;
							}
						}else{
							if(/*localStorage[ads_enabled] == "true"*/ LSModel.get('ads_enabled')){
								chrome.tabs.remove(details.tabId, function () {});
							}else{
								this.notBlockThisTabs = details.tabId;
							}
						}
						break;
					}
				}
			}
		},
		setBadgeState: function(tabId, tabURL){
			if(tabId < 0 || !TrackList.tabs[tabId]){ // inconsistent tab
				return;
			}
			var tabDomain = _global.getBaseURL(SettingsService.tabURL || '');
			
			var tracks = TrackList.getTracks(tabId, /*tabURL*/tabDomain) || [];
			var text = tracks.length > 0 ? tracks.length + '' : '';
			
			
			try{
				text && chrome.browserAction.setBadgeBackgroundColor({
					color: [0,0,0,220],
					tabId: tabId
				});
				chrome.browserAction.setBadgeText({
					text: text, 
					tabId: tabId
				});
			}catch(e){}
		},
		// @memeberOf SettingsService - Check if it is a time for update
		checkForUpdateDB: function(){
			var prevUpdateTime = (LSModel.get('updateTimeStamp') || 0) - 0; // {Int}
			
			if(prevUpdateTime){
				var delta = +new Date() - prevUpdateTime;
				
				if(delta > 14400000){ // 4 hours
					this.updateDB();
				}
			}else{ // never be updated
				this.updateDB();
			}
		},
		// @memeberOf SettingsService - start update process
		// @param {Function} cb
		updateDB: function(cb){
			this.initSettings();
			var now = new Date();
			localStorage.updateDate = getDateTimeString(now);
			LSModel.set('updateTimeStamp', +now);
			cb && cb();
		},
		
		// TODO change on it 
		initSettings: function(){
			// detect DB version:
			$chain(function($next){
                $xhr.get("http://ftp.drweb.com/pub/drweb/linkchecker/Bases/.version.json?" + Math.random(), {}, function(data, xhr){
                	if(!localStorage.version || localStorage.version != data.version.message){
                        $xhr.get('http://ftp.drweb.com/pub/drweb/linkchecker/Bases/.db.json?' + Math.random(), {}, function(dbj, xhr){
                        	if(dbj){
								localStorage.patterns = dbj.patterns.message;
								localStorage.names = dbj.names.message;
								localStorage.types = dbj.types.message;
								localStorage.socialURLs = dbj.socialURLs.message;
								localStorage.socialBlocksIds = dbj.socialBlocksIds.message;
								localStorage.socialBlocksClasses = dbj.socialBlocksClasses.message;
							}
							$next('get new DB version');
						}, function(r, xhr){
							$next('get new DB version failed');
						}, 'json');
						
						localStorage.version = data.version.message;
						var now = new Date();
						LSModel.set('updateTimeStamp', +now);
						// TODO: don't save this value. Calculate on option page!
						localStorage.updateDate = getDateTimeString(now);
					}else{
						$next('use current db version');
					}
				}, function(r, xhr){
					$next('update verifacation failed');
				}, 'json');
			}).then(function(cb, status){
				// Attention" if request broken take DB from db variable (from internal js file)
				if(
					localStorage.patterns == undefined ||
					localStorage.names == undefined ||
					localStorage.types == undefined ||
					localStorage.socialURLs == undefined ||
					localStorage.socialBlocksIds == undefined ||
					localStorage.socialBlocksClasses == undefined
				){
					patterns = db.data.patterns;
					names = db.data.names;
					types = db.data.types;

					//special blocks in social networks
					socialURLs = db.data.socialURLs;
					socialBlocksIds = db.data.socialBlocksIds;
					socialBlocksClasses = db.data.socialBlocksClasses;
				}else{
					patterns = localStorage.patterns.split('@');
					names = localStorage.names.split('@');
					types = localStorage.types.split('@');

					//special blocks in social networks
					socialURLs = localStorage.socialURLs.split('@');
					socialBlocksIds = localStorage.socialBlocksIds.split('@');
					socialBlocksClasses = localStorage.socialBlocksClasses.split('@');
				}
				
				// TODO refactor code:
				var options = [];
				for(var i = 0, len = patterns.length; i < len; i++){
					options.push(new settingsItem(
						i+1,
						getString(names[i]),
						getString(types[i]),
						getString(patterns[i]),
						"true"
					));
				}
				this.blockHash = this.getBlockBase(names, types, patterns);
				this.blockList = options;
				
				if( LSModel.get('ads_enabled') == undefined ){
					setTimeout(function(){
						openWizardPage();
					}, 1000);
				}
				
				for(var i = 0, len = socialURLs.length; i < len; i++){
					specSocialBlocks.push(new adsBlock(
						socialURLs[i],
						socialBlocksIds[i],
						socialBlocksClasses[i]
					));
				}
				
				//??? Very strange code:
				localStorage.settings = JSON.stringify(options);
	//			settings = JSON.parse(localStorage.settings);
				settings = options;
				
				window.devOptions = options;

				if(localStorage.flashExceptions != undefined){
					flashExceptions = JSON.parse(localStorage.flashExceptions);
				}

				if(localStorage.adsExceptions != undefined){
					adsExceptions = JSON.parse(localStorage.adsExceptions);
				}
			}.bind(this));
		
		},

		// @memberOf SettingsService - SettingsService.getBlockBase
		// @param {Array} nameList
		// @param {Array} typeList
		// @param {Array} patternList
		// @return {Object} hash
		getBlockBase: function(nameList, typeList, patternList){
			var 	hash = {},
					type,
					pattern;
			
			for(var i = 0, len = patterns.length; i < len; i++){
				type = getString(typeList[i]);
				
				if(!Array.isArray(hash[type])){
					hash[type] = [];
				}
				pattern = getString(patternList[i]);
				// hash[type].push({
					// id: i + 1,
					// name: getString(nameList[i]),
					// type: type,
					// block: 'true',
					// pattern: pattern,
					// reg: new RegExp(pattern)
				// });
				
				hash[type].push(new createBlockItem(i + 1, getString(nameList[i]), type, 'true', pattern));
				
			};
			return hash;
		}
	};
	
	SettingsService.initSettings();
	SettingsService.init();
	
/*function generateHTML(){
	var page =
'<html>' +
'<head>' +
	'<meta charset="utf-8"/>' +
	'<title></title>' +
'</head>' +
'<body style="background: green"></body>' +
'</html>';
	return "data:text/html;charset=utf-8;base64," + window.btoa(page);
}*/
//var _FRAME_PLUG = {redirectUrl: generateHTML()};

var _FRAME_PLUG = {redirectUrl: 'data:text/html;charset=utf-8,<html style="background:transparent;"></html>'};
	
	if(_global.debug){
		window.devSettings = SettingsService;
	}
	
	// Прослойка для валидации запроса.
	var ReqValidationModel = {

		// @memberOf ReqValidationModel - get reirect object
		// @param {String} blockURL - url of blocked page
		// @param {String} reason - type of blocked content (not using now)
		// @param {Int} tabId - original tab
		generateBlockPage: function(blockURL, reason, tabId){
			var 	link = _global.escape(blockURL);
			var 	page = chrome.extension.getURL("/content/block.html");
			
			return {redirectUrl: page + '#' + tabId + ';' + link};
		},
        SWF_REG: /\.swf(\?|#|$)/i, 
		// Validate by settings Hash
		// @param {String} $tabURL - tab url
		// @param {Object} e, eventObject
		// @return {Bool} - true if unvalid
		validate2: function($tabURL, e){
			var 	$url = e.url,
					$tabId = e.tabId,
					blockObj = {cancel: true};
					
            if( // Blocking flash
                (e.type == 'other' || e.type== 'object') &&
                this.SWF_REG.test($url)
            ){
                var exception = ExceptionService.getFlashException($tabURL.replace('www.', ''));
                
                if(exception){
                    if(!exception.allow){
                        return blockObj;    
                    }
                }else if(LSModel.get('flash_enabled')){
                    return blockObj;
                }
            }
		
			
			var bufPatt,
				blockList;
				
			if(
				LSModel.get('analytics_enabled') && 
				SettingsService.blockHash &&
				(blockList = SettingsService.blockHash['Web Analytics']) && 
				blockList.length > 0
			){
				if(e.type == 'main_frame'){ // for usual page redirect to Block page
					blockObj = this.generateBlockPage($url, 'Web Analytics', e.tabId);
				}else if(e.type == 'sub_frame'){
					blockObj = _FRAME_PLUG;
				}
				
				for(var i = 0, setItem, len = blockList.length; setItem = blockList[i], i < len; i++){
					if(!setItem.reg.test($url)){
						continue;
					}
					
					TrackList.appendTrack($tabId, {
						requestURL: $url,
						url: $tabURL,
						isBlocked: setItem.block,
						type: setItem.type,
						name: setItem.name,
						patt: setItem.pattern
					});
					
					SettingsService.setBadgeState($tabId, $tabURL);
					TrackList.appendBlock($tabId, $tabURL, setItem.type, e.type, $url);
					return blockObj;
				}
			}
			
			if(
				LSModel.get('social_enabled') &&
				SettingsService.blockHash &&
				$tabURL.indexOf("vk.com") == -1 && 
				$tabURL.indexOf("vkontakte.ru") == -1 &&
				$tabURL.indexOf("facebook.com") == -1 && 
				$tabURL.indexOf("plus.google.com") == -1 &&
				(blockList = SettingsService.blockHash['Social Buttons']) &&
				blockList.length
			){
				for(var i = 0, setItem, len = blockList.length; setItem = blockList[i], i < len; i++){
					if(!setItem.reg.test($url) || setItem.pattern == "http://vk.com/widget_comments.php"){
						continue;
					}
					TrackList.appendTrack($tabId, {
						requestURL: $url,
						url: $tabURL,
						isBlocked: setItem.block,
						type: setItem.type,
						name: setItem.name,
						patt: setItem.pattern
					});
					
					if($tabId > -1){
						try{
							chrome.tabs.sendMessage($tabId, {
								mode: '', 
								patt: setItem.pattern, 
								specSocialBlocks: specSocialBlocks
							}, function(){});
						}catch(err){}
						SettingsService.setBadgeState($tabId, $tabURL);
					}
					TrackList.appendBlock($tabId, $tabURL, setItem.type, e.type, $url);
					return {cancel: true};
				}
			}
				
			if(
				LSModel.get('track_enabled') && 
				SettingsService.blockHash &&
				(blockList = SettingsService.blockHash['Tracking']) &&
				blockList.length
			){
				// var blockList = SettingsService.blockHash['Tracking'];
				for(var i = 0, setItem, len = blockList.length; setItem = blockList[i], i < len; i++){
					if(!setItem.reg.test($url)){
						continue;
					}
					// TODO что то недобавляет в список....
					TrackList.appendTrack($tabId, {
						requestURL: $url,
						url: $tabURL,
						isBlocked: setItem.block,
						type: setItem.type,
						name: setItem.name,
						patt: setItem.pattern
					});
					
					SettingsService.setBadgeState($tabId, $tabURL);
					TrackList.appendBlock($tabId, $tabURL, setItem.type, e.type, $url);
					return {cancel: true};
				}
			}
			
			if(
				SettingsService.blockHash &&
				(blockList = SettingsService.blockHash['Ads']) && 
				blockList.length
			){
				var siteExc = getException("ads"); // Ads that was manualy blocke by user

				if(e.type == 'main_frame'){ // for usual page redirect to Block page
					blockObj = this.generateBlockPage($url, 'Ads', e.tabId);
				}else if(e.type == 'sub_frame'){
					blockObj = _FRAME_PLUG;
				}
				
				if(siteExc != null){
					if(!siteExc.allow && $tabId > -1){
						for(var i = 0, setItem, len = blockList.length; setItem = blockList[i], i < len; i++){
							if(!setItem.reg.test($url) ||  setItem.pattern == "http://vk.com/widget_comments.php"){
								continue;
							}
							
							try{
								chrome.tabs.sendMessage(
									$tabId, {
										mode: '', 
										patt: setItem.pattern,
										adsPatterns: getPatterns("Ads"), 
										specSocialBlocks: specSocialBlocks, 
										srcURL: e.url
								}, function(responseMessage){});
							}catch(err){}

                            console.log('Block! url %s, tabId: %s', $url, $tabId);
                            console.dir(setItem);
							
							TrackList.appendBlock($tabId, $tabURL, setItem.type, e.type, $url);
							return blockObj;
						}
					}
				}else if(LSModel.get('ads_enabled')){
					for(var i = 0, setItem, len = blockList.length; setItem = blockList[i], i < len; i++){
						if(!setItem.reg.test($url) || setItem.pattern == "http://vk.com/widget_comments.php"){
							continue;
						}
						TrackList.appendTrack($tabId, {
							requestURL: $url,
							url: $tabURL,
							isBlocked: setItem.block,
							type: setItem.type,
							name: setItem.name,
							patt: setItem.pattern
						}/*, e.type*/);
						
						if($tabId > -1){
							try{
								chrome.tabs.sendMessage($tabId, {
									mode: '',
									patt: setItem.pattern,
									adsPatterns: getPatterns("Ads"), 
									specSocialBlocks: specSocialBlocks, 
									srcURL : e.url
								}, function() {});
							}catch(err){}
						}

                        
                        console.log('Block! url %s, tabId: %s', $url, $tabId);
                        console.dir(setItem);

						TrackList.appendBlock($tabId, $tabURL, setItem.type, e.type, $url);
						return blockObj;
					}
				}
			}
			
			if($tabId > -1){
				try{
					chrome.tabs.sendMessage($tabId, {
						mode: '', 
						specSocialBlocks: specSocialBlocks
					}, function(){});
				}catch(err){}
			}
			return false;
		},
	};
	
	
	// TODO сделать обработку очереди для метода отправки сообщений 
	// + позволит улучшить производительность
	
	// прослойка для обработки запросов
	var RequestService = {
		_tabCache: {}, // store data about referer
		init: function(){
			// Collect loaded pages
			this.onMainFrameCompleted = function(e){
				//TrackList.stateComplete(e.tabId);
			}.bind(this);
			
			// Collect loaded resources
			this.onResourceBeforeRequest = function(e){
				var 	refDomain = '';
				
				if(e.type == 'main_frame'){ // start load
					refDomain = TrackList.stateLoading(e.tabId, e.url);
				}else if(~e.tabId){ // request from tab
					refDomain = TrackList.getTabDomain(e.tabId);
					
					if(!refDomain){
						// tab can exist before extension was restarted. So we don't have collection of proceeded tabs
						try{ 
							chrome.tabs.get(e.tabId, function(data){
								if(data){
									refDomain = _global.getDomain(data.url);
								}
							});
						}catch(exc){}
					}
				}
				
				var validationRes = ReqValidationModel.validate2(refDomain || '', e);
				if(validationRes){
					return validationRes;
				}
				
			}.bind(this);
			
			this.onTabClose = function(tabId, info){
				TrackList.removeTab(tabId);
			}.bind(this);
		},
		start: function(){
			var urlPatterns = ["http://*/*", "https://*/*"];
				
			chrome.webRequest.onBeforeRequest.addListener(this.onResourceBeforeRequest, {
				urls: urlPatterns
			}, [ // extra arguments
				"blocking",
				"requestBody"
			]);
			
			chrome.webRequest.onCompleted.addListener(this.onMainFrameCompleted, {
				urls: urlPatterns,
				types: [
					'main_frame'
				]
			}, [
				"responseHeaders"
			]);
			
			chrome.tabs.onRemoved.addListener(this.onTabClose);
		}
	};
	
	RequestService.init();
	RequestService.start();
})();
