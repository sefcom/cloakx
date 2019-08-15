(function () {
    'use strict';

    var widget = {

        name: 'Comment Count',

        videos_data: {},

        initialize: function () {
            var lastIndex   = location.pathname.lastIndexOf('/'),
                end         = (lastIndex !== 0 && lastIndex !== 1) ? lastIndex : location.pathname.length;

            widget.pathname = location.pathname.substring(0, end);

            if (~['/', '/user', '/feed', '/channel', '/watch'].indexOf(widget.pathname)) {
                widget.show = true;
                widget.videos_data = util.json_parse(localStorage.getItem('vid_stats')) || {};
            }
        },

        start: function () {
            if (!widget.show) return;

            switch (widget.pathname) {
                case '/':
                case '/user':
                case '/feed':
                case '/channel':
                    return widget.start_monitor_other();
                case '/watch':
                    return widget.start_monitor_watch();
            }
        },

        start_monitor_watch: function () {
            util.$wait('.video-list-item .thumb-wrapper a.thumb-link:not(.hb_comment_count_mask)', function (err, els) {
                if (err || !settings.comment_count) return;

                var video_ids = _(els)
                                    .map(function (el) {
                                        el.add_class('hb_comment_count_mask');
                                        return el.getAttribute('href').replace('/watch?v=', '');
                                    })
                                    .value();

                video_ids = widget.get_un_cached_video_ids(video_ids);

                widget.get_video_stats(video_ids, render);

                function render () {
                    _(els)
                        .forEach(function (el) {
                            var video_id      = el.getAttribute('href').replace('/watch?v=', ''),
                                statistics    = widget.videos_data[video_id],
                                comment_count = !statistics || _.isNaN(parseInt(statistics.commentCount)) ? 0 : parseInt(statistics.commentCount);

                            el.append_child(['span', {class: 'hb_comment_count'}, comment_count.toLocaleString()]);
                        })
                        .commit();
                }
            });
        },

        start_monitor_other: function () {
            util.$wait('.yt-lockup-video[data-context-item-id]:not(.hb_comment_count_mask)', function (err, els) {
                if (err || !settings.comment_count) return;

                var video_ids = _(els)
                                    .map(function (el) {
                                        el.add_class('hb_comment_count_mask');
                                        return el.getAttribute('data-context-item-id');
                                    })
                                    .value();

                video_ids = widget.get_un_cached_video_ids(video_ids);

                widget.get_video_stats(video_ids, render);

                function render () {
                    _(els)
                        .forEach(function (el, idx) {
                            var thumb_cont = el.$('.yt-lockup-thumbnail a')[0],
                                video_id        = el.getAttribute('data-context-item-id'),
                                statistics      = widget.videos_data[video_id],
                                comment_count   = !statistics || _.isNaN(parseInt(statistics.commentCount)) ? 0 : parseInt(statistics.commentCount);

                            thumb_cont.append_child(['span', {class: 'hb_comment_count'}, comment_count.toLocaleString()]);
                        })
                        .commit();
                }
            });
        },

        get_un_cached_video_ids: function (video_ids) {
            var now = Date.now();

            return _(video_ids)
                .filter(function (video_id) {
                    return !widget.videos_data[video_id]
                        || !widget.videos_data[video_id].expired
                        || (widget.videos_data[video_id].expired < now)
                })
                .value();
        },

        get_video_stats: function (video_ids, final_callback) {
            async.until(
                function () {
                    return !video_ids.length;
                },
                function (callback) {
                    var video_ids_to_call = video_ids.splice(0, 50).join();

                    fermata
                        .json('https://www.googleapis.com/youtube/v3/videos')({
                            part: 'statistics',
                            id: video_ids_to_call,
                            key: config.youtube_browser_key
                        })
                        .get(function (err, result) {
                            if (err) return callback(err);

                            var expired = Date.now() + 3*24*60*60*1000; // cache in 3 days

                            _(result.items)
                                .forEach(function (item) {
                                    item.statistics.expired = expired;
                                    widget.videos_data[item.id] = item.statistics;
                                })
                                .commit();

                            callback();
                        });
                },
                function (err) {
                    if (err) return;

                    localStorage.setItem('vid_stats', JSON.stringify(widget.videos_data));
                    final_callback();
                }
            );
        },

        stop: function () {
            switch (widget.pathname) {
                case '/':
                case '/user':
                case '/feed':
                case '/channel':
                    return widget.stop_monitor_other();
                case '/watch':
                    return widget.stop_monitor_watch();
            }
        },

        stop_monitor_watch: function () {
            _(util.$('.video-list-item .thumb-wrapper a.thumb-link.hb_comment_count_mask'))
                .forEach(function (ele) {
                    ele.remove_class('hb_comment_count_mask');
                })
                .commit();

            util.$remove('.hb_comment_count');
        },

        stop_monitor_other: function () {
            _(util.$('.yt-lockup-video.hb_comment_count_mask[data-context-item-id]'))
                .forEach(function (ele) {
                    ele.remove_class('hb_comment_count_mask');
                })
                .commit();

            util.$remove('.hb_comment_count');
        },

        settings_changed: function (change) {
            if (widget.show && change.comment_count) {
                if (settings.comment_count) {
                    widget.start();
                    util.log_count_per_day('comment_count');
                }
                else {
                    widget.stop();
                }
            }
        },

        integrity: function () {
            if (!widget.show || !settings.comment_count) return true;

            if (widget.pathname === '/watch') {
                return !util.$('.video-list-item .thumb-wrapper a.thumb-link:not(.hb_comment_count_mask)').length;
            }

            return !util.$('.yt-lockup-video[data-context-item-id]:not(.hb_comment_count_mask)').length;
        }
    };

    widgets.push(widget);

})();
