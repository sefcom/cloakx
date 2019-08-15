function generateList() {
	var ul = document.getElementById("sites");

	ul.innerHTML = "";

	chrome.storage.sync.get(["fretboardsites"], function(result) {
        var allSites = result["fretboardsites"] ? result["fretboardsites"] : [];

        if (allSites.length > 0) {
	        for (var i = 0; i < allSites.length; i++) {
	        	var li = document.createElement("li");

	        	var siteAnchor = document.createElement("a");
	        	siteAnchor.setAttribute("class", "site-anchor");
	        	siteAnchor.setAttribute("href", allSites[i]);
	        	var siteTxt = document.createTextNode(allSites[i]);
	        	siteAnchor.appendChild(siteTxt);

	        	var removeBtn = document.createElement("a");
	        	removeBtn.setAttribute("class", "remove");
	        	removeBtn.setAttribute("href", "#");
	        	removeBtn.setAttribute("data", allSites[i]);
	        	removeBtn.onclick = clearOne;
	        	var removeIco = document.createTextNode(String.fromCharCode(10006));
	        	removeBtn.appendChild(removeIco);

	        	li.appendChild(siteAnchor);
	        	li.appendChild(removeBtn);

	        	ul.appendChild(li);
	        }
	    } else {
	    	var li = document.createElement("li");
	    	li.setAttribute("class", "empty-list")
	    	var alert = document.createTextNode("Nothing to show here");
	    	li.appendChild(alert);
	    	ul.appendChild(li);
	    }
    });
}

function clearAll() {
	var jsonObj = {};
	jsonObj["fretboardsites"] = new Array();
	
	chrome.storage.sync.set(jsonObj, function() {
        generateList();
    });

	notifyPages();

    return false;
}

function clearOne(e) {
	var elem = e.target;
	var removingUrl = elem.getAttribute("data");

	chrome.storage.sync.get(["fretboardsites"], function(result) {
        var allSites = result["fretboardsites"] ? result["fretboardsites"] : [];

        var index = allSites.indexOf(removingUrl);
        if (index >= 0) {
        	allSites.splice(index, 1);

        	var jsonObj = {};
	        jsonObj["fretboardsites"] = allSites;

        	chrome.storage.sync.set(jsonObj, function() {
		        generateList();
		    });
        }
    });
    
    notifyPages();

    return false;
}

function notifyPages() {
	chrome.tabs.query({}, function(tabs) {
	    for (var i=0; i<tabs.length; ++i) {
	        chrome.tabs.sendMessage(tabs[i].id, {
				from: 'FRETBOARD_OPTIONS', 
				subject: 'FRETBOARD_UPDATE_URLS'
			});
	    }
	});
}

window.onload = function() {
	generateList();

	document.getElementById("clear").onclick = clearAll;
};