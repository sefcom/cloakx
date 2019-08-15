(function () {

    'use strict';

    var widget = {

        name: 'Hide not available videos',

        initialize: function(){
            widget.show = location.pathname === '/watch' && !!util.parse_qs().list;
        },

        start: function () {
            if (!widget.show) return;

            util.$wait('#watch-appbar-playlist', function (err, element) {
                if (err || !element) return;

                _(util.$('[data-video-username=""]'))
                    .forEach(function (ele) {
                        settings.hide_not_available_videos
                            ? ele.add_class('hb_hidden')
                            : ele.remove_class('hb_hidden');
                    })
                    .commit();
            });
        },

        settings_changed: function (change) {
            if (change.hide_not_available_videos) {
                if (settings.hide_not_available_videos) {
                    util.log_count_per_day('hide_not_available_video', {email: data.email});
                }
                widget.start();
            }
        }
    };

    widgets.push(widget);
})();
