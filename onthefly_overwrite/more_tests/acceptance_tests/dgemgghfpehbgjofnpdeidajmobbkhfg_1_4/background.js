var fixfixed_background_class = function( chrome ) {
	var self = this; //alias
	
	self.uuid_class = "chrome-fixfixed";
	self.options = {
		'on_off':		1,
		'show_badge': 	1, 
		'animation': 	0, 
		'transition': 	0, 
		'highlight': 	0, 
		'background':	1,
		'scrollcover': 	1
	}

	self.init = function() {
	
		self.storage = chrome.storage.local; 
		self.tabId = 0; 
		self.lastActivatedTab = 0;
		self.counters = []; 
		
		// init
		self.storage.get( self.options , function(data) {
			self.options = data ; 
			
			self.setIcon();
		});
		
	}
	
	self.setIcon = function() {
		chrome.browserAction.setIcon({
			path: "icon-" + self.options.on_off + ".png"
		});
		
		chrome.browserAction.setBadgeBackgroundColor({
			color: [128, 128, 128, 128]
		});
	}

	self.setBadge = function(  number ) {
		if ( self.options.show_badge == 0 ) {
			number = ''; // hide badge
		}
		
		chrome.browserAction.setBadgeText({
       		text: number.toString()
        });
    
        self.counters[ self.tabId ] = number; 
    
    }
	// restore badge on context switch 
	// does chrome this automatically ? because we give tab.id for badge ?
	self.setBadgeActivate = function() {
	
		return; 
		
		number = self.counters[ self.tabId ] ; 
    	
		if ( typeof number != "undefined" ) {
			self.setBadge( number );
    	}
     
    }

	self.storageChange = function(changes, namespace) {
		for (key in changes) {
			self.options[key] = changes[key].newValue;
			
			if ( key == 'on_off' ) {
				self.setIcon();
			}
		}
	};
	
		self.activateTab = function( tab , callback ) {
		
		chrome.tabs.sendMessage(tab.tabId, {
			type: 'refresh_badge'
		}, function(response) {
			//console.log(response.farewell);
		});
	};
	
	self.updateTab = function( tabId , callback ) {
		chrome.tabs.get(tabId, function(tab) {
			if( tab.status != "loading") {
				self.tabId = tabId; 
				self.lastActivatedTab = 0;
			}
		});
	}


	self.toggleOnOff = function(tab) {
		//console.log( "data", tab);
		// trust that "on_off" is ( 1 or 0 )
 		self.options.on_off = 1 - self.options.on_off; 
		
		self.storage.set( { 'on_off': self.options.on_off } , function(){
			// nop	, lazy send message to content.js
			// this will trigger storage.onChanged in content.js and turn css on/off
		})
		
		chrome.tabs.sendMessage(tab.id, {
			type: 'toggle_on_off'
		}, function(response) {
			//console.log(response.farewell);
		});
		
		self.setIcon();	
	}

	self.onMessage = function(message, sender, sendResponse) {
	    //console.log("message received:" , message );
	    if ( message.type == 'badge' ) {
		        self.setBadge(  message.number  )
	    }
	}

	// constructor auto start
	self.init()

	

}

var ext_fixfixed = new fixfixed_background_class(  chrome ); 

chrome.runtime.onMessage.addListener(ext_fixfixed.onMessage);
chrome.browserAction.onClicked.addListener(ext_fixfixed.toggleOnOff);
chrome.tabs.onUpdated.addListener(ext_fixfixed.updateTab);
chrome.tabs.onActivated.addListener(ext_fixfixed.activateTab);
chrome.storage.onChanged.addListener(ext_fixfixed.storageChange);
