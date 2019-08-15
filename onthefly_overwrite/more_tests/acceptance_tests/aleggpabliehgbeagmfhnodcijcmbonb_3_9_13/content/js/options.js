(function(){
	// Take settings from _back.model
	var _back = chrome.extension.getBackgroundPage();
	
	var _global = { // Some helpers
		_DOMAIN_REG: /^(?:https?:\/\/)?([^\/?:#]*)/i,
		// get Domain 
		getDomain: function(urlStr){
			var parseDomain = this._DOMAIN_REG.exec(urlStr);
			return Array.isArray(parseDomain) && parseDomain[1];
		},
		containsNonLatinSymbols: function(str){
			return /[^.\-_a-z\w]/.test(str);
		}
	};
	
    settingsItem = function(id, name, type, pattern, block)
    {
        this.id = id;
        this.name = name;
        this.type= type;
        this.block= block;
        this.pattern = pattern;
    }
    //exception item - structure of database item
    exceptionItem = function(id, baseURL, allow, content)
    {
        this.id = id;
        this.baseURL = baseURL;
        this.allow= allow;
        this.content = content;
    }

    //exception item - structure of database item
    urlsItems = function(baseURL, block){
        this.baseURL = baseURL;
        this.block = block;
    }

    var analytics_enabled = "analytics-enabled";
    var social_enabled = "social-enabled";
    var track_enabled = "track-enabled";
    var flash_enabled = "flash-enabled";
    var ads_enabled = "ads-enabled";
    var blockParts = new Array();
    var urls = new Array();
    var adsExceptions = new Array();
    var flashExceptions = new Array();
    var urlsToRefresh = new Array();
	
	var PopupService = {
		outer: undefined,
		inner: undefined,
		// @param {HTMLElement} outerNode
		init: function(outerNode, innerNode){
			this.outer = outerNode;
			this.inner = innerNode;
		},
		open: function(){
			this.outer.style.display = '';
			document.body.style.height = '100%';
			document.body.style.width = '100%';
			document.body.style.position = 'fixed';
		},
		hide: function(){
			this.outer.style.display = 'none';
			document.body.style.height = '';
			document.body.style.width = '';
			document.body.style.position = '';
		}
	};

    //initialize
	optionsInit = function(){

		Options = 
		{
			'vkontakte-check': 	true,
			'facebook-check': 	true,
			'google-check': 	true
		};
		
		var 	$popupBack = el('popupback'),
				$popupCloseBtn = el('popupback_close'),
				$popupContent = el('popupback_column'),
				$adsExceptionsBtn = el('adsexception'),
				$flashExceptionsBtn = el('flashexception');
				
		PopupService.init($popupBack);
		
		$popupBack.addEventListener('click', function(){
			el("adsExceptionTable").innerHTML = ""; 
			el('siteURL2').value = ''; 
			el("adsPopup").style.display="none";
			el("flashExceptionTable").innerHTML = ""; 
			el('siteURL').value = ''; 
			el("flashPopup").style.display="none";
			//blockBackgroundScroll(false);
			PopupService.hide();

			flashExceptions.length = 0;
			adsExceptions.length = 0;
		});
		
		$popupContent.addEventListener('click', function(e){
			e.stopPropagation();
		});
		
		$popupCloseBtn.onclick = function(e){
			el("adsExceptionTable").innerHTML = ""; 
			el('siteURL2').value = ''; 
			el("adsPopup").style.display="none";
			el("flashExceptionTable").innerHTML = ""; 
			el('siteURL').value = ''; 
			el("flashPopup").style.display="none";
			//blockBackgroundScroll(false);
			PopupService.hide();

			flashExceptions.length = 0;
			adsExceptions.length = 0;

		};
		
		// Открывает попап с flash блокировками 
		$flashExceptionsBtn.addEventListener('click', function(){
            if(localStorage.flashExceptions){
				flashExceptions = JSON.parse(localStorage.flashExceptions);
            }
           // var flashExceptions = localStorage.flashExceptions ? JSON.parse(localStorage.flashExceptions) : []

            uploadException(flashExceptions, "flashExceptionTable", "flash");
			PopupService.open();
            el("flashPopup").style.display ="block";
            el('siteURL').focus();
        });
		// Открывает попап с Ads блокировками 
		$adsExceptionsBtn.addEventListener('click', function(){
			if(localStorage.adsExceptions){
				adsExceptions = JSON.parse(localStorage.adsExceptions);
			}

			for (var i = 0; i < urls.length; i++){
				var exist = false;
				var index = 0;
				for (var j=0; j <adsExceptions.length; j++){
					if (adsExceptions[j].baseURL == urls[i].baseURL){
                       index = j;
                       exist = true;
                       break;
					}
				}
				if(!exist){
                   var id = Math.random();
                   id = id.toString();
                   id = id.replace(".","");
                   id = "uni" + id;
                   adsExceptions.push(new exceptionItem(id, urls[i].baseURL, !urls[i].block, true));
				}
				else adsExceptions[index].allow = !urls[i].block;
			}
			uploadException(adsExceptions, "adsExceptionTable", "ads");
			PopupService.open();
           
			el("adsPopup").style.display="block";
			el('siteURL2').focus();
        });
		
        uploadBlockedPartsItems();
		el('social-check').addEventListener('click', function(e) {
			e.stopPropagation();
			var changeSettings = setSocial(); 
			showStatus(); 
			setRefreshPageState(changeSettings);
		}, false);
		el('analytics-check').addEventListener('click', function(e){
			e.stopPropagation();
			var changeSettings = setAnalytics(); 
			showStatus(); 
			setRefreshPageState(changeSettings);
		}, false);
		//@TODO <) el('track-section') one handler!
		el('track-check').addEventListener('click', function(e){
			e.stopPropagation();
			var changeSettings = setTrack(); 
			showStatus(); 
			setRefreshPageState(changeSettings);
			}, false);
        el('social-section').addEventListener('click', function(e) {
			e.stopPropagation();
			var changeSettings = setSocial(); 
			showStatus(); 
			setRefreshPageState(changeSettings);
		}, false);
        el('analytics-section').addEventListener('click', function(e) {
			e.stopPropagation();
			var changeSettings = setAnalytics(); 
			showStatus(); 
			setRefreshPageState(changeSettings);
		}, false);
		el('track-section').addEventListener('click', function(e){
			e.stopPropagation();
			var changeSettings = setTrack(); 
			showStatus(); 
			setRefreshPageState(changeSettings);
		}, false);
        el('noprotection-check').addEventListener('click', function(e) {
			e.stopPropagation();
			setNoProtection(); 
			showStatus(); 
			setRefreshPageState();
		}, false);
        el('noprotection-section').addEventListener('click', function(e) {
			e.stopPropagation();
			setNoProtection(); 
			showStatus(); 
			setRefreshPageState();
		}, false);

        el('vkicon').addEventListener('click', function() {
			setSocialItem("vkontakte-check", "vkicon");}, false);
        el('facebookicon').addEventListener('click', function() {
			setSocialItem("facebook-check", "facebookicon");
			}, false);
        el('googleicon').addEventListener('click', function() {setSocialItem("google-check", "googleicon");}, false);

        el('updateDataBase').addEventListener('click', function() {updateDatabase();}, false);
		
        $('select[name="defaultFlashValue"]').change(function(){
			var val = this.value == "deny";
			_back.model.set('flash_enabled', val);
            setRefreshPageState();
        });

        $('select[name="defaultAdsValue"]').change( function() {
			var val = this.value == "deny";
			_back.model.set('ads_enabled', val);
            setRefreshPageState();
        });

        uploadLinkCheckerSettings();
        uploadTrackerSettings();
        uploadContentSettings();
        if (localStorage.updateDate != undefined)
            el("lastUpdateTime").innerHTML = localStorage.updateDate;
        else el("lastUpdateTime").innerHTML = "-";
        if (localStorage.version != undefined)
            el("currentVersionNumber").innerHTML = localStorage.version;
        else el("currentVersionNumber").innerHTML = "1.0";

       localize();
	}

    //update database
    updateDatabase = function(){
        el('updateDataBase').style.display = "none";
        el('updating').style.display = "block";
        el('updatingImage').style.display = "block";

		_back.App.updateDB(function(){
			el('updateDataBase').style.display = "block";
			el('updating').style.display = "none";
			el('updatingImage').style.display = "none";
			el("lastUpdateTime").innerHTML = localStorage.updateDate;
			el("currentVersionNumber").innerHTML = localStorage.version;
		});
    }

	//blocking background scroll
	// DEPICATED
	var BackService = {
		updateSettings: function(name, value){
			chrome.runtime.sendMessage({
				action: 'updateSettings',
				data: {
					property: name,
					value: value
				}
			}, function(response){});
		}
	};
	
    setRefreshPageState = function(types){
		// BackService.updateSettings('refresh', true);
		_back.App.recheckContent('tracking', types);
    };
    setRefreshVkState = function(){
		// BackService.updateSettings('refreshsocial-vk', true);
		_back.App.recheckContent('social-vk');
	};
    setRefreshFbState = function(){
		// BackService.updateSettings('refreshsocial-fb', true);
		_back.App.recheckContent('social-fb');
	};
    setRefreshGlState = function(){
		// BackService.updateSettings('refreshsocial-gl', true);
		_back.App.recheckContent('social-gl');
	};
    setRefreshSpecialPageState = function(urls){
		BackService.updateSettings('refresh-special', true);
        localStorage["refresh-special-urls"] = JSON.stringify(urls);
    };

    //upload settings for link checker
	// Options contains: [facebook/vk/g+]-check
	uploadLinkCheckerSettings = function(){
	     var inputs = window.document.getElementById('options-form').getElementsByTagName('input');
	     for (var i = 0, l = inputs.length; i < l; i++)
         {
         	key = inputs[i].name;
         	if (typeof localStorage[key] != "undefined" && typeof Options[key] != "undefined")
         	{
         		Options[key] = localStorage[key] == 'true';
         	}
         	else if(typeof localStorage[key] == "undefined" && typeof Options[key] != "undefined")
         	{
         		localStorage[key] = Options[key];
         	}
         	inputs[i].checked = Options[key];
         	if (inputs[i].checked)
         	   inputs[i].parentNode.parentNode.children[0].setAttribute("selected", "true");
         	else inputs[i].parentNode.parentNode.children[0].setAttribute("selected", "false");
         	inputs[i].addEventListener('change', optionsSave, false);
         }
	}

    //getting urls with blocked content
    uploadBlockedPartsItems = function(){
        urls = new Array();
        if (localStorage.blockParts != null &&
            localStorage.blockParts != "null" &&
            localStorage.blockParts != undefined)
        {
            blockParts = JSON.parse(localStorage.blockParts);
            for (var i =0; i<blockParts.length; i++)
            {
                var exist = false;
                for (var j=0; j <urls.length; j++)
                {

                    if (urls[j].baseURL == blockParts[i].baseURL)
                    {
                        exist = true;
                        break;
                    }
                }
                if (!exist)
                    urls.push(new urlsItems(blockParts[i].baseURL, blockParts[i].block));
            }
        }

    }

	//upload settings for tracker
	uploadTrackerSettings = function(){
//        if (getLocalObj(social_enabled, false) == "true"){
		if(_back.model.get('social_enabled')){
            setSocial();
            return;
        }
//        if(getLocalObj(analytics_enabled, true) == "true"){
		if(_back.model.get('analytics_enabled')){
            setAnalytics();
            return;
        }
//        if (getLocalObj(track_enabled, true) == "true"){
		if(_back.model.get('track_enabled')){
            setTrack();
            return;
        }
        setNoProtection();
    };

    setCounter = function(type){
        if (type == "flash")
        {
            if (localStorage.flashExceptions != null && localStorage.flashExceptions != undefined)
            {
                var flashExceptions = JSON.parse(localStorage.flashExceptions);
                el('flashExcCount').innerHTML = "(" + flashExceptions.length + ")";
            }
            else  el('flashExcCount').innerHTML = "(0)";
        }
        else
        {
             if (localStorage.adsExceptions != null &&
                 localStorage.adsExceptions != undefined)
             {
                 var adsExceptions = JSON.parse(localStorage.adsExceptions);
                 for (var i =0; i<urls.length; i++)
                 {
                    var exist = false;
                    var index = 0;
                    for (var j=0; j <adsExceptions.length; j++)
                    {
                       if (adsExceptions[j].baseURL == urls[i].baseURL)
                       {
                            index = j;
                            exist = true;
                            break;
                       }
                    }
                    if (!exist)
                    {
                         var id = Math.random();
                         id = id.toString();
                         id = id.replace(".","");
                         id = "uni" + id;
                         adsExceptions.push(new exceptionItem(id, urls[i].baseURL, false, false));
                    }
                    else adsExceptions[index].allow = urls[i].block;
                 }

                 el('adsExcCount').innerHTML = "(" + adsExceptions.length + ")";
             }
             else  el('adsExcCount').innerHTML = "(0)";
        }
    }

    uploadContentSettings = function(){
		if(!_back.model.get('flash_enabled')){
            el("defaultFlashValue").options[0].selected = "selected";
        }else{
            el("defaultFlashValue").options[1].selected = "selected";
		}

		if(!_back.model.get('ads_enabled')){
            el("defaultAdsValue").options[0].selected = "selected";
        }else{
            el("defaultAdsValue").options[1].selected = "selected";
		}

        setCounter("flash");
        setCounter("ads");
    };

    uploadException = function(exceptions, tableId, type){
        urlsToRefresh = new Array();
        if(exceptions){
			var 	nationalURL,
					baseURL;
            for (var i=0; i<exceptions.length; i++){
				baseURL = exceptions[i].baseURL;
				nationalURL = baseURL;
				
				if(_global.containsNonLatinSymbols(baseURL)){ // maybe national domain
					baseURL = punycode.toASCII(baseURL);
				}else if(baseURL.indexOf('xn--') > -1){
					nationalURL = punycode.toUnicode(baseURL);
				}
				
                appendExceptionItem(tableId, exceptions[i].allow, exceptions[i].id, baseURL, nationalURL);
            }
            $('select[name="settings"]').change( function() {
                if ($(this).val() == "deny") updateException($(this).attr("siteid"), type, false);
                else if ($(this).val() == "allow") updateException($(this).attr("siteid"), type, true);
            });

            $('.removesite').bind("click", function() {
                removeException($(this).attr("siteid"), type);
                var elId = $(this).attr("siteid");
                $("#" + elId).remove();
                createTableLines(type + "ExceptionTable");
            });
            var lng = chrome.i18n.getMessage("lng");
            if (type == "flash"){
                var objDiv = document.getElementById("scrollContainer1");
                $('#siteURL').bind('keypress', function(e) { if(e.keyCode==13){ addAddressEvent("flash", "siteURL", objDiv);}});
                $('#flashAddButton').bind('click', function(e) { addAddressEvent("flash", "siteURL", objDiv); });
                $('#readyButton').on('click', function(e){ 
                	saveItems("flash"); 
                	hideFlashPopup(); 
                });
            }else{
                var objDiv = document.getElementById("scrollContainer2");
                $('#readyButton2').bind('click', function(e) { saveItems("ads"); hideAdsPopup();});
                $('#siteURL2').bind('keypress', function(e) { if(e.keyCode==13){ addAddressEvent("ads", "siteURL2", objDiv); }});
                $('#adsAddButton').bind('click', function(e){ 
					addAddressEvent("ads", "siteURL2", objDiv);
				});
            }
        }
    }

    function saveItems(type){
         addAddressItem(type);
         if(type == "flash"){
            _back.ExceptionService.setFlashExceptions(flashExceptions);
            el('flashExcCount').innerHTML = "(" + flashExceptions.length + ")";
         }else if (type == "ads"){
            _back.ExceptionService.setAdsExceptions(adsExceptions, blockParts);
            uploadBlockedPartsItems();
         }

         setCounter(type);
         if (urlsToRefresh.length != 0){
            setRefreshSpecialPageState(urlsToRefresh);
         }
    }

    //add address event handler
    function addAddressEvent(type, input, objDiv)
    {
         addAddressItem(type);
         el(input).value = "";
         el(input).focus();
         //objDiv.scrollTop = objDiv.scrollHeight;
    }

    //hide ads popup event handler
    function hideFlashPopup(){
        el("flashExceptionTable").innerHTML = "";
        el("popupback").style.display="none";
        el("flashPopup").style.display="none";
        el('siteURL').value = '';
    }

    //hide flash popup event handler
    function hideAdsPopup(){
        el("adsExceptionTable").innerHTML = "";
        el("popupback").style.display="none";
        el("adsPopup").style.display="none";
        el('siteURL2').value = '';
    }

    //create lines in a table
    function createTableLines(tableId)
    {
        var rows = document.getElementById(tableId).rows;
        for(var i = 0; i < rows.length; i++)
        {
           if(i%2==0){
              rows.item(i).style.backgroundColor = "#FFFFFF"
           }else{
              rows.item(i).style.backgroundColor = "#F2f2f2"
           }

        }
    }

    //add address by type
    addAddressItem = function(type){
		var 	node = el(type == "flash" ? 'siteURL' : 'siteURL2'),
				selectNode = document.querySelector(type == "flash" ? '[name=addingFlashSiteUrlSelector]' : '[name=addingAdsSiteUrlSelector]');
		
		if(!node || !node.value){
			return;
		}
		var url = node.value.replace(/"|'|\s/g, '');
		
        if(url){
			var		allow = selectNode.value == 'allow';
			addException(url, type, allow);
			node.value = '';
			node.focus();
        }
    };

    //append item to table
	// @param {String} nationalURL - url in national representation
	appendExceptionItem = function(tableId, allow, id, baseURL, nationalURL){
		// TODO неплохо было бы почистить baseURL от html entities (encryptedString не подходит)
		var html = '<tr class="addressItem" id="' + id + '">' +
			'<td><div class="optpage_ribtable_max-column" title="' + baseURL + '">' + (nationalURL || baseURL) + '</div></td>' +
			'<td>' +
				'<div class="styled-select">' +
					'<select siteId="' + id + '" name="settings">' +
					'<option value="allow" ' + (allow ? "selected" : "") + '>' +
						chrome.i18n.getMessage("allowOption") +
					'</option>' +
					'<option value="deny" ' + (allow ? "" : "selected") + '>' + 
						chrome.i18n.getMessage("denyOption") +
					'&nbsp;</option>' + 
					'</select>' +
				'</div>'+
			'</td>' +
			'<td>' +
				'<div siteId="' + id + '" class="removesite"></div>' +
			'</td>' +
		'</tr>';
		$("#" + tableId).prepend(html);
        createTableLines(tableId);
	};

	// TODO добавить экранирование кавычек
    encryptedString = function(string)
    {
         string = string.replace(/[<]/g, "&lt;");
         string = string.replace(/[>]/g, "&gt;");
         string = string.replace(/[&]/g, "&amp;");
         return string;
    }

    //adding site exception
    addException = function(url, type, allow){
        var		id = ("uni" + Math.random()).replace(".","");
		var 	baseURL = (_global.getDomain(url) || '').replace(/^www\./, ''),
				nationalURL;
		
		if(!baseURL){
			return;
		}
		
		// if(!~baseURL.indexOf("www.")){
			// baseURL = "www." +  baseURL;
		// }
		nationalURL = baseURL;
		
		if(_global.containsNonLatinSymbols(baseURL)){ // maybe national domain
			baseURL = punycode.toASCII(baseURL);
			
		}else if(baseURL.indexOf('xn--') > -1){
			nationalURL = punycode.toUnicode(baseURL);
		}
		
        urlsToRefresh.push(baseURL);
        if(type == "flash"){
            var index = geExceptionByURL(flashExceptions, baseURL);
            if (index == null){
                flashExceptions.push(new this.exceptionItem(this.id = id, this.baseURL = baseURL, this.allow = allow, false));
                appendExceptionItem("flashExceptionTable", allow, id, baseURL, nationalURL);
            }
            $('.removesite').bind("click", function() {
                removeException($(this).attr("siteid"), "flash");
                var elId = $(this).attr("siteid");
                $("#" + elId).remove();
                createTableLines("flashExceptionTable");
            });
        }else if(type == "ads"){
            var index = geExceptionByURL(adsExceptions, baseURL);
            if (index == null){
                adsExceptions.push(new this.exceptionItem(this.id = id, this.baseURL = baseURL, this.allow= allow, false));
                appendExceptionItem("adsExceptionTable", allow, id, baseURL, nationalURL);
            }
            $('.removesite').bind("click", function() {
                removeException($(this).attr("siteid"), "ads");
                var elId = $(this).attr("siteid");
                $("#" + elId).remove();
                createTableLines("adsExceptionTable");
            });
        }

        $('select[name="settings"]').change( function() {
            if ($(this).val() == "deny")
                updateException($(this).attr("siteid"), type, false);
            else if ($(this).val() == "allow")
                updateException($(this).attr("siteid"), type, true);
        });
    }

    //removeException
    removeException = function(id, type)
    {
          if (type == "flash")
          {
               var index = geExceptionById(flashExceptions, id);
               if (index != null)
               {
                  urlsToRefresh.push(flashExceptions[index].baseURL);
                  flashExceptions.splice(index, 1);
               }
          }
          else if (type == "ads")
          {
               var index = geExceptionById(adsExceptions, id);
               if (index != null)
               {
                  urlsToRefresh.push(adsExceptions[index].baseURL);
                  adsExceptions.splice(index, 1);
               }
			   // TODO check if elementExist!
               var sireURL = document.getElementById(id).children[0].innerText;
               aLength = blockParts.length;
               for (var i =0; i<aLength; i++)
               {
                   if (sireURL.indexOf(blockParts[i].baseURL) != -1)
                   {
                       urlsToRefresh.push(blockParts[i].baseURL);
                       blockParts.splice(i,1);
                       i--;
                       aLength--;
                   }
               }
          }
    }

    //update exception settings
    updateException = function(id, type, allow)
    {
         if (type == "flash")
         {
            var index = geExceptionById(flashExceptions, id);
            if (index != null)
            {
               flashExceptions[index].allow = allow;
               urlsToRefresh.push(flashExceptions[index].baseURL);
            }
         }
         else if (type == "ads")
         {
            var index = geExceptionById(adsExceptions, id);
            if (index != null)
            {
               adsExceptions[index].allow = allow;
               urlsToRefresh.push(adsExceptions[index].baseURL);
            }
            var sireURL = document.getElementById(id).children[0].innerText;
            aLength = blockParts.length;
            for (var i =0; i<aLength; i++)
            {
                if (blockParts[i].baseURL == sireURL)
                {
                    urlsToRefresh.push(blockParts[i].baseURL);
                    blockParts[i].block = !allow;
                }
            }
         }
    }

    //getting exception by id
    geExceptionById = function(storage, id)
    {
         for (var i=0; i < storage.length; i++)
         {
            if (storage[i].id == id)
                return i;
         }
         return null;
    }

    //getting exception by id
    geUrlByExceptionId = function(storage, id)
    {
         for (var i=0; i < storage.length; i++)
         {
            if (storage[i].id == id)
                return storage.baseURL;
         }
         return null;
    }

     //getting exception by id
    geExceptionByURL = function(storage, url)
    {
         for (var i=0; i < storage.length; i++)
         {
            if (storage[i].baseURL == url)
                return i;
         }
         return null;
    }

    //set state for social checking
    setSocial = function(){
		var recheckSettings = [];
		['social_enabled', 'analytics_enabled', 'track_enabled'].forEach(function(propertName){
			if(!_back.model.get(propertName)){
				recheckSettings.push(propertName);
			}
		});
		
		_back.model.set('social_enabled', true); 
		_back.model.set('analytics_enabled', true); 
		_back.model.set('track_enabled', true); 

		el('social-check').checked = true;
		el('social-section').setAttribute("selected", "true");
		el('analytics-section').setAttribute("selected", "false");
		el('track-section').setAttribute("selected", "false");
		el('noprotection-section').setAttribute("selected", "false");
		
		return recheckSettings;
    }

    //set state for web analytics checking
    setAnalytics = function(){
		var recheckSettings = [];
		['analytics_enabled', 'track_enabled'].forEach(function(propertName){
			if(!_back.model.get(propertName)){
				recheckSettings.push(propertName);
			}
		});		  
		_back.model.set('social_enabled', false); 
		_back.model.set('analytics_enabled', true); 
		_back.model.set('track_enabled', true); 

		el('analytics-check').checked = true;
		el('analytics-section').setAttribute("selected", "true");
		el('social-section').setAttribute("selected", "false");
		el('track-section').setAttribute("selected", "false");
		el('noprotection-section').setAttribute("selected", "false");
		  
		return recheckSettings;
    }

    //set state for ads checking
    setTrack = function(){
		var recheckSettings = [];
		if(!_back.model.get('track_enabled')){
			recheckSettings.push('track_enabled');
		}
		
		_back.model.set('social_enabled', false); 
		_back.model.set('analytics_enabled', false); 
		_back.model.set('track_enabled', true);  

		el('track-check').checked = true;
		el('track-section').setAttribute("selected", "true");
		el('social-section').setAttribute("selected", "false");
		el('analytics-section').setAttribute("selected", "false");
		el('noprotection-section').setAttribute("selected", "false");
		return recheckSettings;
    }

    setNoProtection = function(){
		// setLocalObj(track_enabled, false);
		_back.model.set('social_enabled', false); 
		_back.model.set('analytics_enabled', false); 
		_back.model.set('track_enabled', false); 

         el('noprotection-check').checked = true;
         el('track-section').setAttribute("selected", "false");
         el('social-section').setAttribute("selected", "false");
         el('analytics-section').setAttribute("selected", "false");
         el('noprotection-section').setAttribute("selected", "true");
    }

    setAds = function(){
//        if (el('enable-ads').checked)
//            setLocalObj(ads_enabled, true);
//        else setLocalObj(ads_enabled, false);
		_back.model.set('ads_enabled', el('enable-ads').checked);
    };

    setFlash = function(){
//        if (el('enable-flash').checked)
//            setLocalObj(flash_enabled, true);
//        else setLocalObj(flash_enabled, false);
		_back.model.set('flash_enabled', el('enable-flash').checked);
    };

    //save link checker options
	optionsSave = function(eventObj){
		localStorage[eventObj.target.name] = event.target.checked.toString();
//		_back.model.set(eventObj.target.name, event.target.checked);

//		if (eventObj.target.checked)
//            eventObj.target.parentNode.parentNode.children[0].setAttribute("selected", "true")
//        else eventObj.target.parentNode.parentNode.children[0].setAttribute("selected", "false")
		
		eventObj.target.parentNode.parentNode.children[0].setAttribute("selected", eventObj.target.checked ? "true" : "false");
        showStatus();

		switch(eventObj.target.name){
			case "vkontakte-check": setRefreshVkState(); break;
			case "google-check": setRefreshGlState(); break;
			case "facebook-check": setRefreshFbState(); break;
		}
		return false;
	}

    //save vk check
	setSocialItem = function(checkbox, icon){

	    if (el(checkbox).checked){
            el(checkbox).checked = false;
            el(icon).setAttribute("selected", "false");
        }else{
            el(checkbox).checked = true;
            el(icon).setAttribute("selected", "true");
        }
		
        switch(checkbox){
			case "vkontakte-check": setRefreshVkState(); break;
			case "google-check": setRefreshGlState(); break;
			case "facebook-check": setRefreshFbState(); break;
		}
		localStorage[checkbox] = el(checkbox).checked;
	    showStatus();
	}

    //save facebook check
    setFb = function(){
        if (el('facebook-check').checked)
            el('facebook-check').checked = false;
        else  el('facebook-check').checked = true;
        localStorage["facebook-check"] = el('facebook-check').checked.toString();
        showStatus();
    }

    //save facebook check
    setGl = function(){
        if (el('google-check').checked)
            el('google-check').checked = false;
        else  el('google-check').checked = true;
        localStorage["google-check"] = el('google-check').checked.toString();
        showStatus();
    }

    //show status block
    showStatus = function()
    {
        var status = el("status");
        status.style.display = 'none';
        status.style.opacity = 1;
        status.innerHTML = chrome.i18n.getMessage("optionsSaved");
        hideStatus(status);
    }

	//hide status block
	hideStatus = function(element)
	{
		var step = .1;
		var time = 5000;
		var timedSteps = time * step;
		var opacityInterval = setInterval(
		function() 
		{
			var opacity = element.style.opacity;
			if (opacity < 0.5) 
			{
				clearInterval(opacityInterval);
				element.innerHTML = "";
				element.style.display = 'none';
				return;
			}
			element.style.opacity -= step;
		}, timedSteps);
	}

    //localize document
    localize = function()
    {
         window.document.title = chrome.i18n.getMessage("optionsPageTitle");
         localizeObj("vkontakte-check-label", "vkontakteLabel");
         localizeObj("facebook-check-label", "facebookLabel");
         localizeObj("google-check-label", "googleLabel");
         localizeObj("description", "description");
         localizeObj("privacyPolicy", "privacyPolicy");
         localizeObj("otherSoftware", "otherSoftware");
         localizeObj("copyright", "copyright");

         localizeObj("autoCheckWebsites", "autoCheckWebsites");
         localizeObj("autoCheckWebsitesDesc", "autoCheckWebsitesDesc");
         localizeObj("internetTracker", "internetTracker");
         localizeObj("internetTrackerDesc", "internetTrackerDesc");
         localizeObj("allowAll", "allowAll");
         localizeObj("allowAllDesc", "allowAllDesc");
         localizeObj("minimal", "minimal");
         localizeObj("minimalDesc", "minimalDesc");
         localizeObj("medium", "medium");
         localizeObj("mediumDesc", "mediumDesc");
         localizeObj("maximum", "maximum");
         localizeObj("maximumDesc", "maximumDesc");
         localizeObj("pageContent", "pageContent");
         localizeObj("pageContentDesc", "pageContentDesc");
         localizeObj("flashPlugins", "flashPlugins");
         localizeObj("defaultAllow", "defaultAllow");
         localizeObj("defaultDeny", "defaultDeny");
         localizeObj("ads", "ads");
         localizeObj("defaultAllow2", "defaultAllow2");
         localizeObj("defaultDeny2", "defaultDeny2");

         localizeObj("flashExceptionHeader", "flashExceptionHeader");
         localizeObj("flashExceptionDesc", "flashExceptionDesc");
         localizeObj("flashAllow", "allowOption");
         localizeObj("flashDeny", "denyOption");

         localizeObj("adsExceptionHeader", "adsExceptionHeader");
         localizeObj("adsExceptionDesc", "adsExceptionDesc");
         localizeObj("adsAllow", "allowOption");
         localizeObj("adsDeny", "denyOption");

         localizeObj("flashExceptionString", "exception");
         localizeObj("adsExceptionString", "exception");

         localizeObj("readyButton", "readyButton");
         localizeObj("readyButton2", "readyButton");

         localizeObj("updateDataBase", "updateDataBase");
         localizeObj("lastUpdate", "lastUpdate");
         localizeObj("updating", "updating");
         localizeObj("currentVersion", "currentVersion");
         localizeObj("updateHeader", "updateHeader");
         localizeObj("updateDesc", "updateDesc");


    }

    //get local storage object
    getLocalObj = function(key, defaultValue)
    {
         if (localStorage[key] == null || localStorage[key] == 'undefined')
            localStorage[key] = defaultValue;
         return localStorage[key];
    }

     //get local storage object
    setLocalObj = function(key, value)
    {
          localStorage[key] = value;
    }

    //localize object
    localizeObj = function(objId, locId){
        el(objId).innerHTML =  chrome.i18n.getMessage(locId);
    }

    //get element by ID
	el = function(id)
    {
        return window.document.getElementById(id);
    }
	
	window.addEventListener('DOMContentLoaded', optionsInit, false);

})();