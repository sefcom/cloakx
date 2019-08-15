var storage =
{
    tabs: new Array(),

    //initialize objects
    initialize: function()
    {
        this.tabs = new Array();
    },

    //clean objects
    dispose: function()
    {
        this.tabs = null;
    },

    //track object
    track: function(requestURL, url, isBlocked, type, name)
    {
        this.requestURL = requestURL;
        this.url = url;
        this.isBlocked = isBlocked;
        this.type = type;
        this.name = name;
    },

    //tab object
    tab: function(context, tabId, requestURL, url, isBlocked, type, name)
    {
        this.tabId = tabId;
        this.baseURL = context.getBaseURL(url);
        this.tracks = new Array();
        this.tracks.push(new context.track(requestURL, url, isBlocked, type, name));
    },

    //add track to tracklist
    addTrack: function(tabId, track)
    {
        var tabIndex = this.tabExist(tabId);
        if (tabIndex == -1){
            this.tabs.push(new this.tab(this, tabId, track.requestURL, track.url, track.isBlocked, track.type, track.name));
        }
        else if (!this.trackExist(tabIndex, track)){
            this.tabs[tabIndex].tracks.push(track);
        }
    },

    //check if this is a new tab
    tabExist: function(tabId)
    {
         for (var i=0; i < this.tabs.length; i++){
             if (this.tabs[i].tabId == tabId)
                return i;
         }
         return -1;
    },

    //check if this is a new tab
    trackExist: function(tabIndex, track)
    {
         for (var i=0; i < this.tabs[tabIndex].tracks.length; i++){
             if (this.tabs[tabIndex].tracks[i].requestURL == track.requestURL)
             {
                //update track url
                this.tabs[tabIndex].tracks[i].url = track.url;
                return true;
             }
         }
         return false;
    },

    //remove tab
    removeTab: function(tabId)
    {
         var tabIndex = this.tabExist(tabId);
         if (tabIndex != -1){
             this.tabs.splice(tabIndex,1);
         }
    },

    //update tab
    updateTab: function(tabId, tabURL)
    {
         var tabIndex = this.tabExist(tabId);
         if (tabIndex != -1){
             if (this.tabs[tabIndex].baseURL != this.getBaseURL(tabURL))
             {
                this.tabs[tabIndex].baseURL = this.getBaseURL(tabURL);
                this.tabs[tabIndex].tracks.splice(0,this.tabs[tabIndex].tracks.length);
             }
         }
    },

    //update track in tracklist
    updateTrack: function(tabId, track)
    {
        var tabIndex = this.tabExist(tabId);
        if (tabIndex != -1){
            for (var i=0; i < this.tabs[tabIndex].tracks.length; i++){
                if (this.tabs[tabIndex].tracks[i].requestURL == track.requestURL)
                {
                    this.tabs[tabIndex].tracks[i].isBlocked = track.isBlocked;
                }
            }
        }
    },

    //get tracks in tab
    getTracks: function(tabId, tabURL)
    {
        var tabIndex = this.tabExist(tabId);
        var tabTracks = new Array();
        if (tabIndex != -1){
            for (var i=0; i < this.tabs[tabIndex].tracks.length; i++){
                if (this.tabs[tabIndex].tracks[i].url == tabURL){
                    tabTracks.push(this.tabs[tabIndex].tracks[i]);
                }
            }
            return tabTracks;
        }
        return false;
    },

    //get base url
    getBaseURL: function(url)
    {
        return url.split( '/' )[2];
    },
}