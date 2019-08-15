(function(){
	var _back = chrome.extension.getBackgroundPage();
    var on = "on";
    var off = "off";
    var currentStep = 1;
    var drweb = {
        settings: {
            vk: 'vkontakte-check',
            fb: 'facebook-check',
            gl: 'google-check',
            ads: "ads-enabled",
            flash: "flash-enabled",
            social: "social-enabled",
            analytics: "analytics-enabled",
            track: "track-enabled"
        }
    };
	
	
    //initialize
	optionsInit = function(){

//       el('finish').addEventListener('click', function() {
//           exit();
//       }, false);
       el('openSettings').addEventListener('click', function() {openStep(currentStep, "back");}, false);
       el('back').addEventListener('click', function() {openStep(currentStep, "back");}, false);
       el('next').addEventListener('click', function() {openStep(currentStep, "next");}, false);

       el('setUp').addEventListener('click', function() {openStep(currentStep, "next");}, false);
//       el('leaveDefault').addEventListener('click', function() {
//           exit();
//       }, false);

       el('social-frame-on').addEventListener('click', function() {setSetting('social-frame', "on");}, false);
       el('social-frame-off').addEventListener('click', function() {setSetting('social-frame', "off");}, false);

       el('ads-frame-on').addEventListener('click', function() {setSetting('ads-frame', "on");}, false);
       el('ads-frame-off').addEventListener('click', function() {setSetting('ads-frame', "off");}, false);

       el('tracker-frame-on').addEventListener('click', function() {setSetting('tracker-frame', "on");}, false);
       el('tracker-frame-off').addEventListener('click', function() {setSetting('tracker-frame', "off");}, false);
        
        el('finish').onclick = el('leaveDefault').onclick = function(){
            _back.report();
            chrome.extension.sendMessage({action: 'closeTab'}, function(){});    
        };

       localize();
	}

//    exit = function(){
//        chrome.extension.sendMessage({action: 'closeTab'}, function(){});
//    }

    openSettings = function()
    {

    }

    setSetting = function(item, state)
    {
        el(item + "-" + state).setAttribute("selected", true);
        if (state == "off") el(item + "-on").removeAttribute("selected");
        else el(item + "-off").removeAttribute("selected");

        if (item == "social-frame")
        {
              if (state == on){
                  localStorage[drweb.settings.fb] = true;
                  localStorage[drweb.settings.vk] = true;
                  localStorage[drweb.settings.gl] = true;
              }else{
                  localStorage[drweb.settings.fb] = false;
                  localStorage[drweb.settings.vk] = false;
                  localStorage[drweb.settings.gl] = false;
              }
        }
        else if (item == "ads-frame"){
			_back.model.set('ads_enabled', state == on);	 
        }else if (item == "flash-frame"){
			_back.model.set('flash_enabled', state == on);	 
        }
        else if (item == "tracker-frame"){
			if(state == on){
				_back.model.set('track_enabled', true);
				_back.model.set('analytics_enabled', true);
				_back.model.set('social_enabled', true);
			}else{
				_back.model.set('track_enabled', false);
				_back.model.set('analytics_enabled', false);
				_back.model.set('social_enabled', false);
			}
        }
    }

    openStep = function(step, path)
    {
        var currentFrame = el('step' + step);
        var previousFrame = el('step' + (step - 1));
        var nextFrame = el('step' + (step + 1));
        var movingButtons = el('movingButtons');

        var inc = 1;
        if (path == "back")
            inc = -1;

        currentStep = step + inc;

        if (path == "next")
        {
            $('#movingButtons').fadeOut('fast');
            $('#step' + (step + 1)).css("margin-left", "500px");
            $('#step' + (step + 1)).css("opacity", "0");
            $('#step' + step).animate({
                opacity: 0,
                marginLeft: "-500"
              }, 500, function() {
                $( ".wiz-step" ).each(function( index ) {
                  $(this).removeAttr("active");
                });
                if (currentStep == 5)
                    $("#stepIndicators").fadeOut("fast");
                $(this).css("display", "none");
                $('#step' + (step + 1)).css("display", "block");
                $('#step' + (step + 1)).animate({
                    opacity: 1,
                    marginLeft: "0"
                  }, 500, function() {
                       if (currentStep > 1 && currentStep < 5)
                       {
                           $('#movingButtons').fadeIn('fast');
                           $("#stepIndicators").fadeIn("fast");
                       }
                       if (currentStep != 5)
                        el("indicatorStep" + currentStep).setAttribute("active", true);
                  });
              });

        }
        else if (path == "back")
        {
            $('#movingButtons').fadeOut('fast');
            $('#step' + (step - 1)).css("margin-left", "-500px");
            $('#step' + (step - 1)).css("opacity", "0");
            $('#step' + step).animate({
                opacity: 0,
                marginLeft: "+500"
              }, 500, function() {
                $( ".wiz-step" ).each(function( index ) {
                  $(this).removeAttr("active");
                });
                if (currentStep == 5)
                    $("#stepIndicators").fadeOut("fast");
                $(this).css("display", "none");
                $('#step' + (step - 1)).css("display", "block");
                $('#step' + (step - 1)).animate({
                    opacity: 1,
                    marginLeft: "0"
                  }, 500, function() {
                       if (currentStep > 1 && currentStep < 5){
                          $('#movingButtons').fadeIn('fast');
                          $("#stepIndicators").fadeIn("fast");
                       }
                       if (currentStep != 5)
                        el("indicatorStep" + currentStep).setAttribute("active", true);
                  });
              });

        }
    }

    //localize document
    localize = function()
    {
         window.document.title = chrome.i18n.getMessage("optionsPageTitle");

         localizeObj("privacyPolicy", "privacyPolicy");
         localizeObj("otherSoftware", "otherSoftware");
         localizeObj("copyright", "copyright");

         localizeObj("quickSetup", "quickSetup");
         localizeObj("quickSetupDescription", "quickSetupDescription");
         localizeObj("setUp", "setUp");
         localizeObj("leaveDefault", "leaveDefault");

         localizeObj("back", "back");
         localizeObj("next", "next");

         localizeObj("linksSetup", "linksSetup");
         localizeObj("linksSetupDescription", "linksSetupDescription");
         localizeObj("wiz-social-step-on", "wiz_social_step_on");
         localizeObj("wiz-social-step-off", "wiz_social_step_off");

         localizeObj("adsSetup", "adsSetup");
         localizeObj("adsSetupDescription", "adsSetupDescription");
         localizeObj("wiz-ads-step-on", "wiz_ads_step_on");
         localizeObj("wiz-ads-step-off", "wiz_ads_step_off");

         localizeObj("trackerSetup", "trackerSetup");
         localizeObj("trackerSetupDescription", "trackerSetupDescription");
         localizeObj("wiz-tracker-step-on", "wiz_tracker_step_on");
         localizeObj("wiz-tracker-step-off", "wiz_tracker_step_off");

         localizeObj("finishSetup", "finishSetup");
         localizeObj("finishSetupDescription", "finishSetupDescription");
         localizeObj("openSettings", "openSettings");
         localizeObj("finish", "finish");
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
    localizeObj = function(objId, locId)
    {
         el(objId).innerHTML =  chrome.i18n.getMessage(locId);
    }

    //get element by ID
	el = function(id)
    {
        return window.document.getElementById(id);
    }

    browseUrl = function(url){
        url=chrome.extension.getURL(url);
        document.location.href = url;
    }
	
	window.addEventListener('DOMContentLoaded', optionsInit, false);
})();