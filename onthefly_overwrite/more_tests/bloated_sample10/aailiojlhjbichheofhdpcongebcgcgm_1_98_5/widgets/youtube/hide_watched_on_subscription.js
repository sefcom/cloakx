(function() {
    'use strict';

    var widget = {

        name: 'Hide watched on subscription with same channel',

        start: function() {
            widget.show = location.pathname === '/feed/subscriptions';

            if (!widget.show || !settings.hide_watched_video) return;

            util.$wait('.yt-shelf-grid-item', function (err, elements) {
                if (err) return;

                _(elements)
                    .forEach(function (element) {
                        //all videos
                        if(!util.$('.watched-badge', element).length) return;

                        //watched videos elements need to hide
                        util.bind_elem_functions(element).add_class('freedom_hidden');
                    })
                    .commit();
            });
        },

        stop: function () {
            _(util.$('.yt-shelf-grid-item.freedom_hidden'))
                .forEach(function (el) {
                    util.bind_elem_functions(el).remove_class('freedom_hidden');
                })
                .commit();
        },

        integrity: function () {
            var restart = true;

            _(util.$('.yt-shelf-grid-item'))
                .forEach(function (el) {
                    if (!util.$('.watched-badge', el).length) return;

                    if (!util.bind_elem_functions(el).has_class('freedom_hidden')) {
                        restart = !restart;
                        return false;
                    }
                })
                .commit();

            return restart;
        },

        settings_changed: function (change) {
            if (change.hide_watched_video) {
                if (settings.hide_watched_video) {
                    widget.start();
                    util.log_count_per_day('hide_watched_video');
                }
                else {
                    widget.stop();
                }
            }
        }
    };

    widgets.push(widget);
})();
