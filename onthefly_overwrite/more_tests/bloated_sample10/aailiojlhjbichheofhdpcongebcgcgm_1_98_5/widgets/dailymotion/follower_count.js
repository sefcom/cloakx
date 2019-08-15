(function () {
    'use strict';

    var widget = {

        name: 'Follower Count',

        initialize: function () {
            widget.show = location.pathname === '/us';

            if (!widget.show) return;

            widget.mask_class = 'hb_follower_count';
        },

        start: function () {
            if (!widget.show || !settings.dailymotion_follower_count) return;

            util.$wait('.pl_wtw_video[data-video-id]:not(.' + widget.mask_class + ')', function (err, els) {
                if (err) return;

                els.forEach(widget.get_follower_count);
            });
        },

        get_follower_count: function (video_ele) {
            // mask as processed
            video_ele.add_class(widget.mask_class);

            var author_ele = video_ele.$('a[data-user-uri]')[0];

            if (!author_ele) return;

            var author = author_ele.getAttribute('data-user-uri');

            // get follower count from tooltip link
            fermata
                .json('//www.dailymotion.com/controller/Shared_User_Tip')({
                    request: author,
                    type: 'channel'
                })
                .get(function (err, result) {
                    var div, follower_count_ele, follower_count, info_ele;

                    if (!result) return;

                    div = util.bind_elem_functions(jsonToDOM(['div']));
                    div.innerHTML = result;

                    follower_count_ele = div.$('[data-follower-count]')[0];
                    follower_count = parseInt(follower_count_ele.getAttribute('data-count')).toLocaleString();

                    info_ele = video_ele.$('span.ellipsis')[0];
                    info_ele && info_ele.append_child(
                        ['span', {class: widget.mask_class}, follower_count + ' ' + util.locale('followers')]
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
            if (change.dailymotion_follower_count && widget.show) {
                settings.dailymotion_follower_count ? widget.start() : widget.stop();
            }
        },

        integrity: function () {
            if (!widget.show || !settings.dailymotion_follower_count) return true;

            return !util.$('.pl_wtw_video[data-video-id]:not(.' + widget.mask_class + ')').length;
        }
    };

    widgets.push(widget);
})();
