/*
    @@name  New YT player
*/

(function () {
    'use strict';

    var widget = {

        settings_changed: function (change) {
            if (change.new_player) {
                this.set_player();
            }
        },

        set_player: function () {
            if (!heartbeat_chrome) {
                return;
            }

            chrome.runtime
                .sendMessage({
                        message: 'toggle_yt_player',
                        new_player: settings.new_player
                    },
                    function () {}
                );
        }
    };

    widgets.push(widget);

})();

