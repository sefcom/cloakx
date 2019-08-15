(function () {
    'use strict';

    var widget = {

        name : 'Heartbeat Discovery',

        event_name: 'heartbeat_discovery',

        show: false,

        initialize: function () {
            if (location.pathname === '/' || ~location.pathname.indexOf('/feed')) {
                widget.show = true;

                widget.menu = util.bind_elem_functions(jsonToDOM(
                    ['li', {
                            id: 'heartbeat_discovery_link',
                            class: 'freedom_trending_link'
                        },
                        ['a', {
                                href: '#heartbeat_discovery',
                                class: 'yt-uix-button yt-uix-button-epic-nav-item',
                                click: widget.get_discovery_tags
                            },
                            ['span', {class: 'yt-uix-button-content'}, util.locale('heartbeat_discovery')]
                        ],
                        ['h2', {class: 'epic-nav-item-heading'}, util.locale('heartbeat_discovery')]
                    ]
                ));

                widget.discovery_container = util.bind_elem_functions(jsonToDOM(
                    ['div', {id: 'heartbeat_discovery_container'},
                        ['div', {id: 'hb_discovery_tags', class: 'yt-card'}],
                        ['div', {id: 'hb_discovery_videos', class: 'yt-card clearfix'}],
                        ['div', {id: 'hb_discovery_loading'},
                            ['i', {class: 'fa fa-spinner fa-spin'}]
                        ]
                    ]
                ));

                widget.load_more_btn = jsonToDOM(
                    ['button', {
                            id: 'hb_discovery_load_more',
                            class: 'yt-uix-button yt-uix-button-size-default yt-uix-button-default load-more-button yt-uix-load-more browse-items-load-more-button',
                            type: 'button',
                            onclick: widget.load_more
                        },
                        ['span', {class: 'yt-uix-button-content'},
                            ['span', {class: 'load-more-loading hid'},
                                ['span', {class: 'yt-spinner'},
                                    ['span', {
                                            class: 'yt-spinner-img  yt-sprite',
                                            title: 'Loading icon'
                                        }, 'Loading...'
                                    ]
                                ]
                            ],
                            ['span', {class: 'load-more-text'}, util.locale('yta_load_more')]
                        ]
                    ]
                );
            }
        },

        start : function () {
            if (!widget.show || !settings.heartbeat_discovery) return;

            widget.render_menu();

            if (window.location.hash && ~window.location.hash.indexOf('#heartbeat_discovery')) {
                widget.get_discovery_tags();
            }
        },

        render_menu: function () {
            if (util.$('#heartbeat_discovery_link')) return;

            util.$wait('#appbar-nav .appbar-nav-menu', function (err, eles) {
                if (err || !eles.length) return;

                eles[0].appendChild(widget.menu);
            });
        },

        active_menu: function () {
            // wait for menu injected to dom
            util.$wait('#heartbeat_discovery_link', function () {

                var h2 = util.$('#appbar-nav .appbar-nav-menu li h2')[0],
                    selected_li = util.$('#appbar-nav .appbar-nav-menu li.active')[0] || (h2 ? h2.parentElement : null);

                if (selected_li && selected_li !== widget.menu) {
                    widget.deselect_menu(selected_li);
                }

                widget.menu.add_class('active');
            });
        },

        deselect_menu: function (li) {
            var url = window.location.href.replace(window.location.hash, '');

            li = util.bind_elem_functions(li);

            if (li.has_class('active')) {
                return li.remove_class('active');
            }

            li.replace(
                ['a', {
                        href: url,
                        class: 'yt-uix-button yt-uix-button-epic-nav-item'
                    },
                    ['span', {class: 'yt-uix-button-content'}, li.innerText]
                ]
            );
        },

        show_loading: function (class_name) {
            widget.discovery_container.add_class(class_name);
        },

        hide_loading: function (class_name) {
            widget.discovery_container.remove_class(class_name);
        },

        get_discovery_tags: function () {

            widget.analytics_logging('tab_count');

            widget.active_menu();

            util.$wait('#content', function (err, ele) {
                if (err) return;

                ele.replace(widget.discovery_container);

                widget.show_loading('loading_tags');

                util.api('discovery')('tags')
                    .get(widget.render_discovery_tags);
            });
        },

        render_discovery_tags: function (err, tags) {
            if (err || !tags || !tags.length) return;

            var container = util.$('#hb_discovery_tags', widget.discovery_container).empty();

            tags.forEach(function (tag) {
                container.append_child(
                    ['div', {class: 'hb_discovery_tag'},
                        ['a', {
                                title: tag.name + ' (' + tag.count + ')',
                                href: '#heartbeat_discovery?tag=' + encodeURIComponent(tag.name),
                                onclick: widget.get_discovery_videos,
                            }, tag.name
                        ],
                        ['span', ' (' + tag.count + ')']
                    ]
                );
            });

            widget.hide_loading('loading_tags');

            widget.get_discovery_videos();
        },

        get_discovery_videos: function (e, page) {
            setTimeout(function () {
                var tag = util.parse_qs(location.hash).tag;

                widget.analytics_logging('category_count');

                if (!tag) return;

                if (!page) {
                    widget.page = page = 0;
                    widget.show_loading('loading_videos');
                }

                widget.active_menu();

                util.api('discovery')('videos')({tag: tag, page: page})
                    .get(widget.render_discovery_videos);
            });
        },

        render_discovery_videos: function (err, videos) {
            if (err) return;

            // render more videos
            if (widget.page) return widget.render_discovery_videos_more(videos);

            var tag = util.parse_qs(location.hash).tag,
                video_container = ['ul', {
                    class: 'channels-browse-content-grid branded-page-gutter-padding grid-lockups-container',
                    style: 'padding-top: 15px;'
                }];

            videos.forEach(function (video) {
                video_container.push(widget.parse_video(video));
            });

            util.$('#hb_discovery_videos', widget.discovery_container).replace(
                ['ul',
                    ['li', {class: 'branded-page-v2-subnav-container branded-page-gutter-padding'},
                        util.locale('videos_with_tag') + ' "' + tag + '"'
                    ],
                    ['li', {id: 'hb_discovery_videos_li'}, video_container]
                ]
            );

            if (videos.length) {
                util.$('#hb_discovery_videos_li').appendChild(widget.load_more_btn);
            }

            widget.hide_loading('loading_videos');
        },

        render_discovery_videos_more: function (videos) {
            if (!videos.length) {
                return widget.load_more_btn.remove();
            }

            var video_container = util.$('#hb_discovery_videos_li ul')[0];

            videos.forEach(function (video) {
                video_container.append_child(widget.parse_video(video));
            });
        },

        load_more: function () {
            widget.get_discovery_videos(null, ++widget.page);
        },

        parse_video: function (video) {
            var duration = video.contentDetails.duration.replace(/PT|S/g, '').split('M'),
                m = _.padLeft(duration.length === 2 ? duration[0] : '00', 2, '0'),
                s = _.padLeft(duration.length === 2 ? duration[1] : duration[0], 2, '0'),
                duration_time = [m, s].join(':');

            return  ['li', {
                                class: 'channels-content-item yt-shelf-grid-item hb_discovery_video',
                                onclick: _.partial(widget.analytics_logging, 'video_count')
                            },
                        ['div', {class: 'yt-lockup yt-lockup-video yt-lockup-grid'},
                            ['div', {class: 'yt-lockup-dismissable'},
                                ['div', {class: 'yt-lockup-thumbnail'},
                                    ['span', {class: 'spf-link  ux-thumb-wrap contains-addto'},
                                        ['a', {
                                                class: 'yt-uix-sessionlink',
                                                href: '//www.youtube.com/watch?v=' + video.id
                                            },
                                            ['span', {class: 'video-thumb  yt-thumb yt-thumb-196'},
                                                ['span', {class: 'yt-thumb-default'},
                                                    ['span', {class: 'yt-thumb-clip'},
                                                        ['img', {
                                                            src: video.snippet.thumbnails.medium.url,
                                                            width: '196'
                                                        }],
                                                        ['span', {class: 'vertical-align'}]
                                                    ]
                                                ]
                                            ]
                                        ],
                                        ['span', {class: 'video-time'},
                                            ['span', duration_time]
                                        ]
                                    ]
                                ],
                                ['div', {class: 'yt-lockup-content'},
                                    ['h3', {class: 'yt-lockup-title'},
                                        ['a', {
                                                class: 'yt-uix-sessionlink yt-uix-tile-link  spf-link  yt-ui-ellipsis yt-ui-ellipsis-2',
                                                href: '//www.youtube.com/watch?v=' + video.id
                                            }, video.snippet.title
                                        ]
                                    ],
                                    ['div', {class: 'yt-lockup-byline'},
                                        ['span', 'by '],
                                        ['a', {
                                                class: 'yt-uix-sessionlink g-hovercard spf-link',
                                                href: '//www.youtube.com/channel/' + video.snippet.channelId
                                            }, video.snippet.channelTitle],
                                        ['span', ' - '],
                                        ['span', moment(video.snippet.publishedAt).fromNow()]
                                    ],
                                    ['div', {class: 'yt-lockup-meta'},
                                        ['ul', {class: 'yt-lockup-meta-info'},
                                            ['li', (video.statistics.viewCount ? video.statistics.viewCount.toLocaleString() : 0) + ' '
                                                + util.locale('video_views_count')],
                                            ['li', (video.statistics.commentCount ? video.statistics.commentCount.toLocaleString() : 0) + ' '
                                                + util.locale('video_comments_count')]
                                        ]
                                    ]
                                ]
                            ]
                        ],
                    ];
        },

        analytics_logging: function (event_changed) {
            var local_data = util.json_parse(localStorage.getItem('track_' + widget.event_name)) || {};

            local_data[event_changed] = local_data[event_changed] ? local_data[event_changed]++ : 1;

            //log analytics
            util.log_count_per_day(widget.event_name, local_data);
        }
    };

    widgets.push(widget);

})();
