(function(){
	var back = chrome.extension.getBackgroundPage();
	var LSModel = back.model;
    var block_mode = "block-mode-enabled";
	
	
	function reloadOptionPage(){
		chrome.tabs.query({
			url: chrome.extension.getURL('/content/options.html')
		}, function(tabs){
			var tabIndex = tabs.length;
			
			while(tabIndex--){
				tabs[tabIndex].id && chrome.tabs.reload(tabs[tabIndex].id);
			}
		});
	};
	
	optionsInit = function(){
	    localize();
		

		window.document.title = chrome.i18n.getMessage("optionsPageTitle");
		window.bg=chrome.extension.getBackgroundPage();

        var analytics_enabled = "analytics-enabled";
        var social_enabled = "social-enabled";
        var track_enabled = "track-enabled";

        var ads_enabled = "ads-enabled";
        var flash_enabled = "flash-enabled";

		var tracks = back.getTracksInfo();
		
		var analyticsblock = el('analyticsblock');
		var analyticsnameblock = el('analyticsname');
		var analyticscountblock = el('analyticscount');
		var analyticslistblock = el('analyticslist');
		var analyticscount = 0;

		var socialblock = el('socialblock');
		var socialcountblock = el('socialcount');
        var socialnameblock = el('socialname');
        var sociallistblock = el('sociallist');
        var socialcount = 0;

		var trackblock = el('trackblock');
		var trackcountblock = el('trackcount');
		var tracknameblock = el('trackname');
        var tracklistblock = el('tracklist');
        var trackcount = 0;

        var adsTypes = new Array();

        el('analyticsheader').addEventListener('click', function() {
			toggleList(analyticsblock)
		}, true);
        el('socialheader').addEventListener('click', function() {
			toggleList(socialblock)
		}, true);
        el('trackheader').addEventListener('click', function() {
			toggleList(trackblock)
		}, true);
        el('settingsButton').addEventListener('click', function() {
			browseUrl("content/options.html");
		}, true);
        el('switchMode').addEventListener('click', function(e) {
			// setSwitcherState(el('switchMode')); 
			back.switchMode(); 
			window.close(); 
		}, true);

        if (tracks){
            for (var i=0; i < tracks.length; i++){
                if (tracks[i].type == "Web Analytics"){
                   analyticscount++;
                   createItem(analyticscount, analyticsblock, analyticscountblock, analyticslistblock, tracks[i].name);
                }
                else if (tracks[i].type == "Social Buttons"){
                   socialcount++;
                   createItem(socialcount, socialblock, socialcountblock, sociallistblock, tracks[i].name);
                }
                else if (tracks[i].type == "Tracking"){
                   trackcount++;
                   createItem(trackcount, trackblock, trackcountblock, tracklistblock, tracks[i].name);
                }
            }
        }
        if (analyticscount == 0){
            analyticsblock.style.opacity = "0.7";
            analyticsblock.setAttribute("notexist", "true")
        }
        if (socialcount == 0){
            socialblock.style.opacity = "0.7";
            socialblock.setAttribute("notexist", "true")
        }

		// TODO change option list by enabled property!
		if(!LSModel.get('flash_enabled')){
           //$("#flashsettings option[value=defaultAllow]").attr("selected","selected");
		   el('flashsettings').value = 'defaultAllow';
		   $("#flashsettings option[value=defaultDeny]").remove();
        }else{
           //$("#flashsettings option[value=defaultDeny]").attr("selected","selected");
		   el('flashsettings').value = 'defaultDeny';
		   $("#flashsettings option[value=defaultAllow]").remove();
        }

        var flashException = back.getException("flash");
        if (flashException != null){
            if (flashException.allow){
               // $("#flashsettings option[value=allowHere]").attr("selected","selected");
				el('flashsettings').value = 'allowHere';
            }else{
				el('flashsettings').value = 'denyHere';
                //$("#flashsettings option[value=denyHere]").attr("selected","selected");
			}
        }

        //if (back.getLocalStorageValue(ads_enabled) == "false"){
		if(!LSModel.get('ads_enabled')){
            //$("#adssettings option[value=defaultAllow]").attr("selected","selected");
			el('adssettings').value = 'defaultAllow';
			$("#adssettings option[value=defaultDeny]").remove();
        }else{
            //$("#adssettings option[value=defaultDeny]").attr("selected","selected");
			el('adssettings').value = 'defaultDeny';
			$("#adssettings option[value=defaultAllow]").remove();
        }

        var adsException = back.getException("ads");
        if (adsException != null){
            if (adsException.allow){
				el('adssettings').value = 'allowHere';
                //$("#adssettings option[value=allowHere]").attr("selected","selected");
            }else{
				el('adssettings').value = 'denyHere';
                //$("#adssettings option[value=denyHere]").attr("selected","selected");
			}
        }

        $('select[name="flashsettings"]').change(function(){
			if ($(this).val() == "defaultAllow")
            {
                back.setLocalStorageValue(flash_enabled, false);
                back.removeException("flash");
            }
            else if ($(this).val() == "defaultDeny")
            {
                back.setLocalStorageValue(flash_enabled, true);
                back.removeException("flash");
            }
            else if ($(this).val() == "allowHere")
                back.addException("flash", true);
            else if ($(this).val() == "denyHere")
                back.addException("flash", false);
            //back.refreshMode();
            back.refreshSpecial();
			reloadOptionPage();
        });

        $('select[name="adssettings"]').change(function(){
            if ($(this).val() == "defaultAllow")
            {
                back.setLocalStorageValue(ads_enabled, false);
                back.removeException("ads");
            }
            else if ($(this).val() == "defaultDeny")
            {
                back.setLocalStorageValue(ads_enabled, true);
                back.removeException("ads");
            }
            else if ($(this).val() == "allowHere")
                back.addException("ads", true);
            else if ($(this).val() == "denyHere")
                back.addException("ads", false);
            //back.refreshMode();
            back.refreshSpecial();
			reloadOptionPage();
        });

        var sw = el('switchMode');

		sw.parentNode.className = "switchitem";
		sw.innerHTML = chrome.i18n.getMessage("switchOn");
        
        var     menu = document.querySelector('.lc_menu_wrap');
        
        menu.onclick = function(e){
            var target = e.target;
            
            if(!target.dataset.id){
                target = target.parentNode;   
            }
            
            switch(target.dataset.id){
                case 'ads': 
                    var clist = target.classList;
                   
                    if(!clist.contains('lc_menu_process') && !clist.contains('lc_menu_completed')){
                        clist.add('lc_menu_process');
                        back.report(true);
                        setTimeout(function(){
                            clist.add('lc_menu_completed');
                            clist.remove('lc_menu_process');
                            // Thank you! Your message has been sent
                            target.textContent = chrome.i18n.getMessage('messageSend');
                        }, 1000);
                    }
                    break;       
                case 'settings': 
                    browseUrl("content/options.html"); 
                    break;       
                //case 'manual': alert(2); break; 
                case 'site':
                    chrome.tabs.create({
                        url: "http://drweb.com"
                    })
                    break;
            }
        };
	}

    localize = function(){
           localizeObj("trackerheader", "internetTracker");
           localizeObj("trackname", "trackname");
           localizeObj("trackblockstring", "blocked");
           localizeObj("analyticsname", "analyticsname");
           localizeObj("analyticsblockstring", "blocked");
           localizeObj("socialname", "socialname");
           localizeObj("socialblockstring", "blocked");
           localizeObj("contentheader", "contentheader");

           localizeObj("flashname", "flashPlugins");
           localizeObj("adsname", "ads");

           localizeObj("flashDefaultAllow", "defaultAllow");
           localizeObj("flashDefaultDeny", "defaultDeny");
           localizeObj("flashAllowHere", "allowHere");
           localizeObj("flashDenyHere", "denyHere");

           localizeObj("adsDefaultAllow", "defaultAllow2");
           localizeObj("adsDefaultDeny", "defaultDeny2");
           localizeObj("adsAllowHere", "allowHere");
           localizeObj("adsDenyHere", "denyHere");

           localizeObj("switchMode", "switchOn");
        
        var     nodesForTranslate = document.querySelectorAll("[data-lang]"),
                buf;
        
        for(var i = 0, len = nodesForTranslate.length; i < len ; i++){
            buf = chrome.i18n.getMessage(nodesForTranslate[i].dataset.lang);
            if(buf){
                nodesForTranslate[i].textContent = buf;
            }
        }
    }

    // setSwitcherState = function(obj){
        // if(!LSModel.get('block_enabled')){
            // LSModel.set('block_enabled', true);
            // obj.parentNode.className = "switchitemactive";
            // obj.innerHTML = chrome.i18n.getMessage("switchOff");
        // }else{
            // LSModel.set('block_enabled', false);
            // obj.parentNode.className = "switchitem";
            // obj.innerHTML = chrome.i18n.getMessage("switchOn");
        // }
    // }

    createItem = function(count, block, countblock, listblock, itemname)
    {
          countblock.innerText = count;
          listblock.appendChild(createItemBlock(itemname));
    }

    createItemBlock = function(name)
    {
        var item=document.createElement("DIV")
        item.innerText = name;
        item.setAttribute("class","item");
        return item;
    }

    toggleList = function(list)
    {
        if (list.getAttribute("expanded") == "false")
             list.setAttribute("expanded", "true");
        else list.setAttribute("expanded", "false");
    }

    el = function(id)
    {
         return window.document.getElementById(id);
    }

    //localize object
    localizeObj = function(objId, locId){
        el(objId).innerHTML =  chrome.i18n.getMessage(locId);
    }


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

	window.addEventListener('DOMContentLoaded', optionsInit, false);

})();