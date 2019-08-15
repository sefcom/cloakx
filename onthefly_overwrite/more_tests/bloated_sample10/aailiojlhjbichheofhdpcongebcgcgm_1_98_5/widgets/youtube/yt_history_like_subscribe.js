(function() {
    'use strict';

    var widget = {

        name: 'Adding like and subscribe option for watch history',

        initialize: function() {
            widget.show = location.pathname === '/feed/history';

            if (!widget.show || !session.user) return;

            var like_btn_classes        = 'yt-uix-button yt-uix-button-opacity yt-uix-button-has-icon no-icon-markup like-button-renderer-like-button like-button-renderer-like-button-unclicked yt-uix-post-anchor yt-uix-tooltip',
                subscribe_btn_classes   = 'yt-uix-button yt-uix-button-has-icon no-icon-markup yt-uix-subscription-button yt-can-buffer yt-uix-button-subscribe-branded';


           widget.action_header = jsonToDOM(
                ['div', {
                        class: 'primary-header-actions freedom-history-actions'
                    },
                    ['span', {
                            class: 'yt-uix-button-subscription-container'
                        },
                        ['button', {
                                class: subscribe_btn_classes + ' fd-subscribe-btn'
                            },
                            ['span', {
                                    class: 'yt-uix-button-content'
                                },['span', {
                                        class: 'fd-label subscribe-label'
                                    },
                                    util.locale('subscribe')
                                ],['span', {
                                        class: 'fd-label subscribed-label'
                                    },
                                    util.locale('subscribed')
                                ],['span', {
                                        class: 'fd-label unsubscribe-label'
                                    },
                                    util.locale('unsubscribe')
                                ]
                            ]
                        ]
                    ],
                    ['button', {
                            class: like_btn_classes + ' fd-like-btn'
                        },
                        ['span', {
                                class: 'yt-uix-button-content'
                            },
                            ''
                        ]
                    ]
                ]
            );

            widget.subscribeOpt = jsonToDOM([])
        },

        start: function() {
            widget.show = location.pathname === '/feed/history';

            if (!widget.show || !session.user) return;

            widget.render();
        },

        render: function() {
            var video_ids = _(util.$('.yt-lockup'))
                                .map(function (element) {
                                    return util.$('.addto-watch-later-button', element)[0].getAttribute('data-video-ids');
                                })
                                .value();

            function check_channel_subscribed (channel_id, callback) {
                if (channel_id === data.own_channel_id) callback(null, true);

                fermata
                    .json('https://www.googleapis.com/youtube/v3/subscriptions')
                    ({
                        part: 'id',
                        channelId: data.own_channel_id,
                        forChannelId: channel_id,
                        key: config.youtube_browser_key
                    })
                    .get(function (err, result) {

                        if (err) return;

                        callback(result.items.length);
                    });
            }

            util.api('video_rating')({
                    channel_id: session.get_channel_id(),
                    video_id: video_ids.join(',')
                })
                .get({'ACCESS-TOKEN': session.access_token}, null, function (err, result) {
                    if (err) return;

                    var result = _(result.items)
                                    .map(function (item) {
                                        return item.rating
                                    })
                                    .value();

                    _(result)
                        .forEach(function (item, idx) {
                            var yt_video_el = util.$('.yt-lockup')[idx],
                                lockup_content_el = util.$('.yt-lockup-content', yt_video_el),
                                channel_id = util.$('.g-hovercard', yt_video_el)[0].getAttribute('data-ytid'),
                                clone_action_el = widget.action_header.cloneNode(true);


                            check_channel_subscribed(channel_id, function (is_subscribed, is_my_channel) {
                                if (util.$('.freedom-history-actions', lockup_content_el[0]).length) return;

                                var is_liked = item === 'like',
                                    like_btn = util.$('.fd-like-btn', clone_action_el)[0],
                                    subscribe_btn = util.$('.fd-subscribe-btn', clone_action_el)[0];

                                if (is_my_channel) {
                                    subscribe_btn.add_class('hid');
                                }

                                if (is_subscribed) {
                                    subscribe_btn.add_class('fd-subscribed');
                                }

                                if (is_liked) {
                                    like_btn.add_class('fd-liked');
                                }

                                lockup_content_el[0].appendChild(clone_action_el);
                                like_btn.onclick = widget.handle_like_click;
                                subscribe_btn.onclick = widget.handle_subscribe_click;
                            });
                        }).commit();
                });
        },

        handle_like_click: function () {
            var like_btn = util.bind_elem_functions(event.target),
                video_item = like_btn.parents('.yt-lockup')[0],
                input = {
                    action: 'like',
                    channel_id: data.own_channel_id,
                    video_id: util.$('.addto-watch-later-button', video_item)[0].getAttribute('data-video-ids'),
                };

            if (like_btn.has_class('fd-liked')) return;

            util.api('video_rating')
                .post({'ACCESS-TOKEN': session.access_token}, input, function (err, result) {
                    if (err) return;
                    like_btn.add_class('fd-liked');
                });
        },

        handle_subscribe_click: function () {
            var target_el = util.bind_elem_functions(event.target),
                subscribe_btn = target_el.has_class('fd-subscribe-btn')
                    ? target_el
                    : target_el.parents('.fd-subscribe-btn')[0],
                video_item = subscribe_btn.parents('.yt-lockup')[0],
                input = {
                    channel_id: data.own_channel_id,
                    subs_channel_id: util.$('.g-hovercard', video_item)[0].getAttribute('data-ytid')
                };

            if (subscribe_btn.has_class('fd-subscribed')) {
                util.api('unsubscribe_channel')
                    .delete({'ACCESS-TOKEN': session.access_token}, input, function (err, result) {
                        if (err) return;

                        subscribe_btn.remove_class('fd-subscribed');
                    });
            }
            else {
                util.api('subscribe_channel')
                    .post({'ACCESS-TOKEN': session.access_token}, input, function (err, result) {
                        if (err) return;

                        subscribe_btn.add_class('fd-subscribed');
                    });
            }
        },

        integrity: function () {
            var isChecking = true;

            _(util.$('.yt-lockup'))
                .forEach(function (element) {
                    if (!util.$('.freedom-history-actions', element).length) {
                        isChecking = false;
                    }
                })
                .commit();
            return isChecking;
        }

    };

    widgets.push(widget);
})();
