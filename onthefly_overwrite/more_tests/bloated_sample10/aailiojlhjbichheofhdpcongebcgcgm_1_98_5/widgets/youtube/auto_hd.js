(function () {
    'use strict';

    var start_page_script = function () {
        var player = yt.player.getPlayerByElement(document.querySelector('#player-api'));

        player.setPlaybackQuality && player.setPlaybackQuality('hd1080');
    };

    var stop_page_script = function () {
        var player = yt.player.getPlayerByElement(document.querySelector('#player-api'));

        player.setPlaybackQuality && player.setPlaybackQuality('default');
    };

    var widget = {

        name: 'Auto HD',

        start: function () {
            widget.show = location.pathname === '/watch';

            if (!widget.show || !settings.auto_hd) return;

            util.$wait('#movie_player', function (err, ele) {
                if (err) return;

                util.load_script(start_page_script);
            });
        },

        settings_changed: function (change) {
            if (change.auto_hd && widget.show) {
                if (settings.auto_hd) {
                    util.load_script(start_page_script);
                }
                else {
                    util.load_script(stop_page_script);
                }
            }
        }

    };

    widgets.push(widget);

})();
