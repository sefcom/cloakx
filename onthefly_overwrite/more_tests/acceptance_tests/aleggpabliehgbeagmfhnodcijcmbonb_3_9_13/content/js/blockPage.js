var 	_back = chrome.extension.getBackgroundPage(),
		urlHash = window.location.hash,
		splitPos = urlHash.indexOf(';'),
		_tId = urlHash.substring(1, splitPos),
		_url = urlHash.substring(1 + splitPos),
		$incognitoBtn = document.getElementById('open-btn'),
		$linkLabel = document.getElementById('link');

chrome.tabs.getCurrent(function(tab){
	if(tab && tab.id != _tId){
		$backBtn.style.display = '';
	}
});

$linkLabel.textContent = _url;

$incognitoBtn.onclick = function(e){
	chrome.windows.create({
		url: _url,
		incognito: true,
	}, function(){});
};

var 	nodesForTranslate = document.querySelectorAll("[data-lang]"),
		translateKey,
		onLocal;

for(var i=0, len = nodesForTranslate.length; i < len; i++){
	translateKey = nodesForTranslate[i].dataset.lang;

	if(onLocal = chrome.i18n.getMessage(translateKey)){
		nodesForTranslate[i].textContent = chrome.i18n.getMessage(translateKey);
	}
}