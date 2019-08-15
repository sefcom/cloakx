(function() {

    'use strict';

    var widget = {

        name: 'Heartbeat Activity Logger',

        start: function () {
            if (this.event_registered) {
                return;
            }

            this.register_for_watch_video();
            // we going to have more...

            this.event_registered = true;
        },

        register_for_watch_video: function () {
            var that = this,
                qs = util.parse_qs();

            if (!~location.pathname.indexOf('/watch') || !qs.hb) {
                return;
            }

            chrome.runtime.sendMessage({
                message: 'log_analytics',
                data: {
                    hitType: 'event',
                    eventCategory: 'youtube-play',
                    eventAction: 'playback',
                    dimension0: qs.v,
                    dimension1: data.email
                }
            });
        }
    };

    widgets.push(widget);

})();
