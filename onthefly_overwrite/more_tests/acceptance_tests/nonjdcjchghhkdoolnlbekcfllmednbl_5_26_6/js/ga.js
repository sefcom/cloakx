// Returns last two digits of number string
function toTwoDigitString(n) {
    return ("0" + n.toString()).slice(-2);
}

// Return client date in UTC, because that's how we keep track
function getUTCToday() {
    d = new Date();
    return toTwoDigitString(d.getUTCFullYear()) + toTwoDigitString(d.getUTCMonth()) + toTwoDigitString(d.getUTCDate());
}

// Executes executeMethod if the curValue differs from value set for localStorageKey
function runIfChanged(executeMethod, curValue, localStorageKey) {
    // console.log("runIfChanged")

    // if the value hasn't changed, return and continue waiting.
    if (localStorage.getItem(localStorageKey) == curValue) return;

    // if the value has changed, save it and execute the method.
    localStorage.setItem(localStorageKey, curValue);
    executeMethod();
}

// Records pageviews for the provided trackers
function recordPageView(trackers) {
    for (var i = 0; i < trackers.length; i++) {
        ga(trackers[i].name + '.send', 'pageview', '/background.html');
        // console.log(trackers[i].name + " " + trackers[i].gaId);
    }
}

// -------- Execution:

// Inject Google Analytics
(function(i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

// Define, then create the different trackers
var trackers = [{
        'name': 'hz_original',
        'gaId': 'UA-54273221-2'
    }, // original provided
    {
        'name': 'hz_audit',
        'gaId': 'UA-54273221-3'
    }
];

//
for (var i = 0; i < trackers.length; i++) {
    ga('create', trackers[i].gaId, 'auto', trackers[i].name);
    ga(trackers[i].name + '.set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
    
}

var ga_pv = setInterval(function() {
    runIfChanged(function() {
        recordPageView(trackers)
    }, getUTCToday(), "lastGAPageView")
}, 30000);

// window.clearInterva(ga_pv)
