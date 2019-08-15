(function () {

    'use strict';

    var widget = {
        initialize: function () {
            chrome.runtime.sendMessage({message: 'heartbeattm_visitor_log'});
        }
    };

    widgets.push(widget);
})();
