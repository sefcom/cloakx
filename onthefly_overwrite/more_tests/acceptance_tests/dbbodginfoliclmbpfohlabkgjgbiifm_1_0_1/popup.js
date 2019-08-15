var _domain = "";

window.onload = function() {
	document.getElementById("yes").onclick = function(e) {
		chrome.storage.sync.get(["fretboardsites"], function(result) {
	        var allSites = result["fretboardsites"] ? result["fretboardsites"] : [];

	        // add only if the current site is not in the list
	        var index = allSites.indexOf(_domain);
	        if (index == -1) {
		        allSites.push(_domain);

		        var jsonObj = {};
		        jsonObj["fretboardsites"] = allSites;
		        chrome.storage.sync.set(jsonObj);
		    }
	    });

		// Send message to content script to enable popup on this page
		// otherwise user need to refresh the page in order to start seeing
		// popups on this page
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {
				from: 'FRETBOARD_POPUP', 
        		subject: 'FRETBOARD_NEW_URL'
			});
		});

	    window.close();
	};

	document.getElementById("no").onclick = function(e) {
		window.close();
	};
	
	document.getElementById("settings").onclick = function(e) {
		chrome.runtime.openOptionsPage();
		window.close();
	};
	
	chrome.tabs.getSelected(null, function(tab) {
		var fullUrl = tab.url;
		var end = fullUrl.indexOf("/", 8);
		var domain = fullUrl.substring(0, end);
	    
	    _domain = domain;

		var urlElem = document.createTextNode(domain);
	    document.getElementById('url').appendChild(urlElem);

	});
};














/*generateList();

	document.getElementById("clear").onclick = function(e) {
		var jsonObj = {};
		jsonObj["fretboardsites"] = new Array();
		chrome.storage.sync.set(jsonObj, function() {
            // console.log("Saved a new array item");
            generateList();
        });
	};
*/

/*function generateList() {
	var ul = document.getElementById("savedLinks");

	// clear ul
	ul.innerHTML = "";

	chrome.storage.sync.get(["fretboardsites"], function(result) {
        var allSites = result["fretboardsites"] ? result["fretboardsites"] : [];

        // console.log(allSites.length);

        for (var i = 0; i < allSites.length; i++) {
        	var li = document.createElement("li");
        	li.setAttribute("class", "link-row")

        	var siteTxt = document.createTextNode(allSites[i]);
        	var removeBtn = document.createElement("span");
        	removeBtn.setAttribute("class", "remove");

        	li.appendChild(siteTxt);
        	li.appendChild(removeBtn);

        	ul.appendChild(li);
        }
    });
}*/

