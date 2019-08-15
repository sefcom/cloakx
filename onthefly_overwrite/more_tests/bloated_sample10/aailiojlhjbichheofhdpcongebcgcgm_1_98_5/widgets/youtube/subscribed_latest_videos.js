(function () {
    'use strict';

    var widget = {

        name: 'Heartbeat YouTube Subscription Latest Videos',
        container: '#hb_yt_playlist_subscription_latest_videos',
        headers: [],
        body: [],

        initialize: function () {
            if (~window.location.href.indexOf('channel') && settings.subscription_recent_uploads) {
                util.$wait('#browse-items-primary', function (err, result_1) {
                    if (err) {
                        return;
                    }

                    _(result_1.children)
                        .forEach(function (a, key) {
                            if (!key || key === 1) {
                                widget.headers.push(a);
                            }
                            else {
                                widget.body.push(a);
                            }
                        })
                        .commit();

                    
                    util.$wait('.branded-page-v2-subnav-container', function (err, result_2) {
                        if (err) {
                            return;
                        }

                        if (result_2[0].children[0].innerText === 'List') {
                            widget.insert_videos();
                        }
                    });
                });
            }
        },

        settings_changed: function (changes) {
            if (changes.subscription_recent_uploads) {
                settings.subscription_recent_uploads ? widget.initialize() : widget.remove_videos();
            }
        },

        shorten_width: function (children) {
            _(children)
                .forEach(function (a) {
                    a.className += ' shorten';
                })
                .commit();
        },

        remove_videos: function () {
            _(widget.body)
                .forEach(function (a) {
                    var container = a.children[0].children[0].children[0].children[0].children[1].children[0];

                    if (container.classList.contains('subscription_videos')) {
                        container.remove();
                    }
                })
                .commit();
        },

        insert_videos: function () {
            _(widget.body)
                .forEach(function (a, key) {
                    var container = a.children[0].children[0].children[0].children[0].children[1],
                        id = a.children[0].children[0].children[0].children[0].children[0].children[0].href.split('/')[4];

                    util.api('get_channel_videos')({channel_id: id})
                        .get(function (err, result) {
                            if (err) {
                                return;
                            }

                            widget.shorten_width(container.children);

                            if (result.items.length) {
                                widget['videos_' + key] = jsonToDOM(
                                    ['div', {class: 'subscription_videos'},
                                        ['b', util.locale('slv_recent_uploads')],
                                        ['ul', {class: 'subscription_video_list'},
                                            ['li', {
                                                    id: 'video_' + result.items[0].snippet.resourceId.videoId,
                                                    class: 'subscription_uploads'
                                                },
                                                ['a', {href: 'https://www.youtube.com/watch?v=' + result.items[0].snippet.resourceId.videoId + '&hb=subscribed_latest_video'},
                                                    ['img', {
                                                        class: 'upload_thumbs',
                                                        src: result.items[0].snippet.thumbnails.default.url
                                                    }],
                                                    result.items[0].snippet.title
                                                ]
                                            ],
                                            ['li', {
                                                    id: 'video_' + result.items[1].snippet.resourceId.videoId,
                                                    class: 'subscription_uploads'
                                                },
                                                ['a', {href: 'https://www.youtube.com/watch?v=' + result.items[1].snippet.resourceId.videoId + '&hb=subscribed_latest_video'},
                                                    ['img', {
                                                        class: 'upload_thumbs',
                                                        src: result.items[1].snippet.thumbnails.default.url
                                                    }],
                                                    result.items[1].snippet.title
                                                ]
                                            ],
                                            ['li', {
                                                    id: 'video_' + result.items[2].snippet.resourceId.videoId,
                                                    class: 'subscription_uploads'
                                                },
                                                ['a', {href: 'https://www.youtube.com/watch?v=' + result.items[2].snippet.resourceId.videoId + '&hb=subscribed_latest_video'},
                                                    ['img', {
                                                        class: 'upload_thumbs',
                                                        src: result.items[2].snippet.thumbnails.default.url
                                                    }],
                                                    result.items[2].snippet.title
                                                ]
                                            ],
                                        ]
                                    ]
                                );

                                container.insertBefore(widget['videos_' + key], container.childNodes[1]);
                            }
                        });
                })
                .commit();
        }
    };

    widgets.push(widget);
})();

