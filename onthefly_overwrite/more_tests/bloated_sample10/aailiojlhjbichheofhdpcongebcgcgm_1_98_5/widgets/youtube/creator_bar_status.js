(function () {
    'use strict';

    var widget = {

        name: 'Creator Bar Status',

        initialize: function () {
            widget.show = location.pathname === '/watch';
        },

        start: function () {
            if (!widget.show || !settings.show_creator_bar_status) return;

            util.$wait('#watch7-creator-bar', function (err, ele) {
                if (err || !ele) return;

                // check annotation;
                chrome.runtime.sendMessage({
                    message: 'get_video_annotation',
                    video_id: util.parse_qs().v
                }, function (response) {
                    response &&  ele.$('.yt-uix-button-icon-annotations')[0].add_class('hb_enabled');
                });

                // check cards
                util.$wait('.iv-card-video', function (err) {
                    !err && ele.$('.yt-uix-button-icon-cards')[0].add_class('hb_enabled');
                });

                // check subtitles
                util.$wait('button.ytp-subtitles-button', function (err) {
                    !err && ele.$('.yt-uix-button-icon-captions')[0].add_class('hb_enabled');
                });
            });
        },

        stop: function () {
            util.$('.hb_enabled').forEach(function (ele) {
                ele.remove_class('hb_enabled');
            });
        },

        settings_changed: function (change) {
            if (change.show_creator_bar_status && widget.show) {
                settings.show_creator_bar_status ? widget.start() : widget.stop();
            }
        }
    };

    widgets.push(widget);

})();
