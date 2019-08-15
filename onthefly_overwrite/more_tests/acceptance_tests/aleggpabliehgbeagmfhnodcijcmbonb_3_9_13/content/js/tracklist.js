var _global = {
	debug: true,
	_DOMAIN_REG: /^(https?:\/\/[^\/]+)/i,
	// 'www.sub.domain.com' -> 'domain.com'
	getParentDomain: function(str){
		return str.split(/\/|\./g).slice(-2).join('.')
	},
	// get Domain
	getDomain: function(urlStr){
		var parseDomain = this._DOMAIN_REG.exec(urlStr);
		return Array.isArray(parseDomain) && parseDomain[1];
	},
	withZero: function(n){
		return (n < 10 ? '0' : '') + n;
	},
	getBaseURL: function(url){
		return url ? url.split( '/' )[2] : '';
	},
	htmlEscape: function(str){
		return str;
	},
	escapeMap: {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#x27;'
	},
	unescapeMap: {
		'&amp;': '&',
		'&lt;': '<',
		'&gt;': '>',
		'&quot;': '"',
		'&#x27;': "'"
	},
	escape: function(str){
		return str.replace(/[<>&"']/g, function(m){
			return this.escapeMap[m];
		}.bind(this));
	},
	unescape:function(str){
		return str.replace(/(&amp;|&lt;|&gt;|&quot;|&#x27;)/g, function(m){
			return this.unescapeMap[m];
		});
	},
	parseFromStorage: function(name){
		var value = localStorage[name];
		return value && value != 'undefined' ? JSON.parse(value) : []; 
	},
};

// @param {Int} tabId
// @param {String} refUrl - url of main_frame request (also contains in `referer` header)
var Tab = function(tabId, refUrl){
	// TODO: check this field
	// this.tabId = tabId;
	this.baseURL = this._getBaseURL(refUrl);
	this.tracks = [];
	this.blocked = []; // добавил, потому что tracks невозможно использовть 
	
	// new properties
	this.baseHost = this._getBaseHost(this.baseURL);
	this.domainList = {};
	this.isSaveBrowsing = false;
	this.state = undefined; // process state; 
};
Tab.prototype = {
	_getBaseHost: function(str){
		return str.split(/\/|\./g).slice(-2).join('.');
	},
	_getBaseURL: function(url){
		return url.split( '/' )[2] || '';
	},
	addTrack: function(trackData){
		if(!this.isTrackExist(trackData)){
			this.tracks.push(trackData);
		}
	},
	// @return {Bool}
	isTrackExist: function(trackData){
		for(var i = 0, len = this.tracks.length, curTrack; curTrack = this.tracks[i], i < len; i++){
			if(
				curTrack.requestURL == trackData.requestURL ||
				(curTrack.name == trackData.name && curTrack.type != 'Ads')
			){
				curTrack.url = trackData.url; //update track url
				return true;
			}
		}
		return false;
	},
	// @param {String} domain - domain of resource
	addResDomain: function(domain){
		if(this.domainList[domain]){
			this.domainList[domain]++;
		}else{
			this.domainList[domain] = 1;
		}
	}
};

function BlockedData(type, resUrl, resType){
	this.type = type;
	this.resUrl = resUrl;
	this.resType = resType;
}

// Create abstract Hash Collection. base of:
// * TrackList (without LocalStorage Support)
// * ExceptionList (with LocalStorage support)
var TrackList = {
	tabs: {},
	dispose: function(){
		for(var id in this.tabs){
			this.tabs.hasOwnProperty(id) && (this.tabs[id] = null);
		}
	},
	// @param {Int} tabId
	// @param {Object} trackData
	appendTrack: function(tabId, trackData, resType){
		if(!this.tabs[tabId]){
			this.tabs[tabId] = new Tab(tabId, trackData.url);
		}
		this.tabs[tabId].addTrack(trackData);
	},
	appendBlock: function(tabId, tabUrl, type, requestType, requestURL){
		if(!this.tabs[tabId]){
			this.tabs[tabId] = new Tab(tabId, tabUrl);
		}
		this.tabs[tabId].blocked.push(new BlockedData(
			type, 
			requestURL, 
			requestType
		));
	},
	// @return {Bool} tabLoading completed (For save browsing)
	registerRequest: function(tabId, url){
		if(this.tabs[tabId]){
			var resHost = _global.getParentDomain(_global.getBaseURL(url));
			
			if(this.tabs[tabId].state < 2){
				this.tabs[tabId].addResDomain(resHost);
				
				return false;
			}else{ // Loaded completed and host from another domain 
				return !this.tabs[tabId].domainList[resHost];
			}
		}
	},
	
	// @memberOf TrackList 
	removeTab: function(tabId){
		if(this.tabs[tabId]){
			this.tabs[tabId].tracks.length = 0;
			this.tabs[tabId].blocked.length = 0;
			this.tabs[tabId].domainList = {};
		}
		// don't use `delete`
		this.tabs[tabId] = null;
	},
	
	// @memberOf TrackList - when request begin loading
	stateLoading: function(tabId, tabURL){
		var 	tab = this.tabs[tabId];
				
		this.tabs[tabId] = new Tab(/*tabId*/undefined, tabURL);
		this.tabs[tabId].state = 1; // Loading 
		return this.baseURL;
	},
	// @memberOf TrackList - when main_frame complete loading
	stateComplete: function(tabId){
		if(this.tabs[tabId]){
			this.tabs[tabId].state = 2; // Completed
		}
	},
	// @memberOf TRackList getTabDomain
	getTabDomain: function(tabId){
		return this.tabs[tabId] && this.tabs[tabId].baseURL;
	},
	
	
	
	
	updateTrack: function(tabId, trackData){
		var 	tab = this.tabs[tabId];
				
		if(!tab){
			return;
		}
		
		for(var i = 0, len = tab.tracks.length; i < len; i++){
			if(tab.tracks[i].requestURL == trackData.requestURL){
				tab.tracks[i].isBlocked = trackData.isBlocked;
			}
		}
	},
	// @memberOf {TrackList}
	getTracks: function(tabId, tabURL){
		var 	tab = this.tabs[tabId];
				
		if(!tab){
			return;
		}
		var tabTracks = [];
		for(var i = 0, len = tab.tracks.length, track; track = tab.tracks[i], i < len; i++){
		
			if(
				track.url == tabURL.split("#")[0] && 
				track.type != "Ads" && 
				track.type != "Tracking"
			){
				tabTracks.push(track);
			}
		}
		
		return tabTracks;
	},
	getAdsAndSocialTracks: function(tabId, tabURL){
		var 	tab = this.tabs[tabId];
				
		if(!tab){
			return;
		}
		var tabTracks = [];
		for(var i = 0, len = tab.tracks.length, track; track = tab.tracks[i], i < len; i++){
			if(
				track.url == tabURL &&
				(
					track.type == "Ads" || 
					track.type == "Social Buttons" || 
					track.type == "Tracking"
				)
			){
				tabTracks.push(track);
			}
		}
		
		return tabTracks;
	},
	getBlocks: function(tabId){
		return this.tabs[tabId] ? this.tabs[tabId].blocked : undefined;
	}
};


window.devTabs = TrackList;

