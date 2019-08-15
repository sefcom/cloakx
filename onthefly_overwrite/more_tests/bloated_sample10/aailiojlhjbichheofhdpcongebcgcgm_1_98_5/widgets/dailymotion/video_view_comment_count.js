(function () {
    'use strict';

    var widget = {

        name: 'Video View Comment Count',

        initialize: function () {
            widget.show = location.pathname === '/us';

            if (!widget.show) return;

            widget.mask_class = 'hb_video_count';
        },

        start: function () {
            if (!widget.show || !settings.dailymotion_view_comment_count) return;

            util.$wait('.pl_wtw_video[data-video-id]:not(.' + widget.mask_class + ')', function (err, els) {
                if (err) return;

                els.forEach(widget.get_video_count);
            });
        },

        get_video_count: function (video_ele) {
            var video_id = video_ele.getAttribute('data-video-id');

            // mask as processed
            video_ele.add_class(widget.mask_class);

            // get view count from api
            fermata
                .json('https://api.dailymotion.com/video/' + video_id)({ fields: 'views_total,comments_total' })
                .get(function (err, result) {
                    if (err) return;

                    var views_total = ' ' + result.views_total.toLocaleString(),
                        comments_total = ' ' + result.comments_total.toLocaleString();

                    // render to element
                    video_ele.$('.info')[0].append_child(
                        ['span', { class: widget.mask_class },
                            ['i', { class: 'fa fa-eye'}, views_total],
                            ['i', { class: 'fa fa-comment-o'}, comments_total]
                        ]
                    );
                });
        },

        stop: function () {
            _(util.$('.pl_wtw_video.' + widget.mask_class + '[data-video-id]'))
                .forEach(function (el) {
                    el.remove_class(widget.mask_class);
                })
                .commit();

            util.$remove('.' + widget.mask_class);
        },

        settings_changed: function (change) {
            if (change.dailymotion_view_comment_count && widget.show) {
                settings.dailymotion_view_comment_count ? widget.start() : widget.stop();
            }
        },

        integrity: function () {
            if (!widget.show || !settings.dailymotion_view_comment_count) return true;

            return !util.$('.pl_wtw_video[data-video-id]:not(.' + widget.mask_class + ')').length;
        }
    };

    widgets.push(widget);
})();
