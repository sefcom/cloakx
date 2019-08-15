


// start blocking ads
Blocker.start();

// listen for a blocked-ad event
Blocker.listen("block", function(e) {
    // update the block count
    Storage.set("count", Storage.get("count", 0) + 1);
});

Storage.load(function() {
    // set the install time
    if (!Storage.get("installed")) {
        Storage.set("installed", Date.now());
    }
});



/*
// show a notification to rate us
if( !_memory.loved && ( ( Date.now() - installed ) > 3600000 ) )
{
    
    // save it
    chrome.storage.local.set( { 'loved':Date.now() } )
    
    loved = Date.now()
    
    var id = '_keuc38' + Math.random()
    
    // this displays the popup
    chrome.notifications.create( id, {
        "type"          :'basic',
        "priority"      :2,
        "iconUrl"       :'icons/notification.png',
        "title"         :_translateText( 'No More YouTube Ads!' ),
        "message"       :_translateText( 'Our program is blocking all video ads. Will you give us a 5 star rating?' ),
        "isClickable"   :true,
    }, function(){} )
    
    // listen for the click on the body of the notification, not the buttons
    chrome.notifications.onClicked.addListener( function( thisId )
    {
        // stop if not our notification
        if( thisId != id )
        {
            return
        }
        
        // hide it
        chrome.notifications.clear( id, function(){})
    
        // open it
        window.open( 'https://chrome.google.com/webstore/detail/' + chrome.runtime.id + '/reviews' )
    })
    
}
function _translateText( text, useLanguage )
{
    
    var lookup   = window.Translations || {}
    var language = ( useLanguage || ( window.navigator.languages || [] )[ 0 ] || window.navigator.userLanguage || window.navigator.language ).substring( 0, 2 ).toLowerCase() || 'en'
    
    return ( lookup[ text ] || {} )[ language ] || text     

}
*/