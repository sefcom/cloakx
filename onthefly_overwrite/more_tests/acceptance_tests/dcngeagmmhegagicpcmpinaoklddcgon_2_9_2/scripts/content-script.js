// -------------------- Constants --------------------

var requestEventName = 'com.lacunasoftware.WebPKI.RequestEvent';
var responseEventName = 'com.lacunasoftware.WebPKI.ResponseEvent';
var eventPagePortName = 'com.lacunasoftware.WebPKI.Port';

// -------------------- Globals --------------------

var port = null;
var browserId = null;

// -------------------- Browser compatibility --------------------

browserId = 'chrome';
var browser = chrome;


// -------------------- Functions --------------------

function init() {
    injectDiv();
    if (browserId === 'chrome') {
        document.addEventListener(requestEventName, function (event) {
            onPageMessage(event.detail);
        });
    } else if (browserId === 'firefox') {
        window.addEventListener('message', function (event) {
            if (event && event.data && event.data.port === requestEventName) {
                onPageMessage(event.data.message);
            }
        });
    }
}

function onPageMessage(message) {
    console.log('[ContentScript] request received', message);
    if (port === null) {
        port = browser.runtime.connect({ name: eventPagePortName });
        port.onMessage.addListener(onExtensionMessage);
        console.log('[ContentScript] opened port with extension');
    }
    //message.domain = window.document.domain;
    port.postMessage(message);
}

function onExtensionMessage(message) {
    console.log('[ContentScript] response received', message);
    if (browserId === 'chrome') {
        var event = new CustomEvent('build', { detail: message });
        event.initEvent(responseEventName);
        document.dispatchEvent(event);
    } else if (browserId === 'firefox') {
        window.postMessage({
            port: responseEventName,
            message: message
        }, '*');
    }
}

function injectDiv() {
    var extensionId = browser.runtime.id.replace(/[^A-Za-z0-9_]/g, '_');
    var isInstalledNode = document.createElement('div');
    isInstalledNode.id = extensionId;
    isInstalledNode.className = extensionId;
    isInstalledNode.name = extensionId;
    isInstalledNode.style.display = "none";
    document.body.appendChild(isInstalledNode);
}

// -------------------- Initialization --------------------

init();
