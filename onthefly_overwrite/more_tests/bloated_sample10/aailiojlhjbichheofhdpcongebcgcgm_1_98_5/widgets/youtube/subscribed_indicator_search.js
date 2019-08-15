(function () {
    'use strict';

    var widget = {

        name: 'Subcribed Indicator Search',

        show: false,

        initialize: function () {
            widget.show = location.pathname === '/results' && settings.subscribed_to_me;

            if (!widget.show) return;

            this.load_cache();

            widget.indicator_for_ytsearch = jsonToDOM(
                ['a', {
                        class: 'ytsearch-indicator fa fa-youtube-play',
                        title: util.locale('subscribed')
                    }
                ]
            );
        },

        start: function () {
            if (!widget.show) return;
            widget.render();
        },

        get_user_cache: function (key) {
            var cache_item = this.cached_items[key];

            if (!cache_item) return null;

            var seconds = cache_item.expired_in || (72 * 3600);
            if (moment().diff(cache_item.date, 'seconds') > seconds) {
                delete this.cached_items[key];
                return null;
            }

            return cache_item;
        },

        set_user_cache: function (key, data, secs) {
            this.cached_items[key] = {
                date: new Date(),
                expired_in: secs || (72 * 3600),
                data: data
            };
        },

        load_cache: function () {
            var cached_items = util.json_parse(localStorage.getItem('comment_subscribed_to_me')) || {};

            _.forOwn(cached_items, function (val, key) {
                if (!val) return;

                var seconds = val.expired_in || (72 * 3600);

                if (moment().diff(val.date, 'seconds') > seconds) {
                    delete cached_items[key];
                }
            });

            this.cached_items = cached_items;
        },

        save_cache: function () {
            localStorage.setItem('comment_subscribed_to_me', JSON.stringify(this.cached_items));
        },

        render: function () {
            var that = this,

                handle_channel_subscribed = function (channel_id, callback) {
                    var cache_key = data.own_channel_id + '_' + channel_id,
                        cache_item = that.get_user_cache(cache_key);

                    if (cache_item) {
                        if (cache_item.data) callback();
                        return;
                    }

                    fermata
                        .json('https://www.googleapis.com/youtube/v3/subscriptions')
                        ({
                            part: 'id',
                            channelId: data.own_channel_id,
                            forChannelId: channel_id,
                            key: config.youtube_browser_key
                        })
                        .get(function (err, result) {
                            var ok = !err && result && result.items && result.items.length;

                            that.set_user_cache(cache_key, ok);
                            that.save_cache();
                            if (ok) callback();
                        });
                };

            //Render for tagging result
            util.$wait('.freedom_video_item', function (err, elems) {

                if (err || !elems.length) {
                    return;
                }

                _(elems).forEach(function (element) {
                    var video_id = util.$('a', element)[0].getAttribute('video_id');

                    util.api('video_channel')({ id: video_id })
                        .get(function (err, result) {

                            if (err) return;

                            var channel_id = result[0].snippet.channelId;

                            handle_channel_subscribed(channel_id, function () {
                                var cloneIndicator = widget.indicator_for_ytsearch.cloneNode(true);

                                util.bind_elem_functions(cloneIndicator).add_class('fa-2x');
                                element.appendChild(cloneIndicator);
                            });
                        });
                }).commit();
            });

            //Render for youtube result
            _(util.$('.yt-lockup-byline')).forEach(function (element) {
                var channel_id = util.$('.yt-uix-sessionlink', element)[0].getAttribute('data-ytid');

                handle_channel_subscribed(channel_id, function () {
                    var cloneIndicator = widget.indicator_for_ytsearch.cloneNode(true);

                    element.appendChild(cloneIndicator);
                });
            }).commit();
        }
    };

    widgets.push(widget);
})();
