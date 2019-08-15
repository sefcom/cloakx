(function () {
    'use strict';

    var widget = {

        name: 'Hide deleted and privated videos',

        initialize: function(){
            widget.show = location.pathname === '/playlist';
        },

        start: function () {
            if (!widget.show) return;

            util.$wait('.pl-header-details .g-hovercard', function (err, elements) {

                if (err || !elements.length || elements[0].getAttribute('data-ytid') === data.own_channel_id) return;

                util.$wait('[data-external-id]', function (err, element) {

                    if (err) return;

                    _(util.$('.pl-video'))
                        .forEach(function (element) {

                            if (!util.$('.pl-video-owner', element).length) {

                                settings.hide_deleted_and_privated_videos
                                    ? element.add_class('hb_hidden')
                                    : element.remove_class('hb_hidden');
                            }

                        })
                        .commit();
                });
            })
        },

        settings_changed: function (change) {
            if (change.hide_deleted_and_privated_videos) {
                if (settings.hide_deleted_and_privated_videos) {
                    util.log_count_per_day('hide_private_video', {email: data.email});
                }

                widget.start();
            }
        }
    };

    widgets.push(widget);
})();
