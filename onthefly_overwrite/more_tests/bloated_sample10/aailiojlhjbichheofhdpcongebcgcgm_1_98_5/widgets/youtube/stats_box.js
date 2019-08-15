/*
    @@name Stats box widget
    @@contains
        video estimated earnings
        monetization
        video age
        social stats
            tweets
            fb likes
            plus ones
*/

(function () {
    'use strict';

    var widget = {

        name: 'Stats box',

        container: '#freedom_stats_panel',

        initialize: function () {
            var video_id;

            if (location.pathname !== '/watch') {
                return;
            }

            this.check_for_show();

            video_id = util.parse_qs().v;

            this.create_box(video_id);

            fermata.json('//api.facebook.com/method/links.getStats')
                ({
                    urls: location.href,
                    format: 'json'
                })
                .get(this.create_fb_likes);

            // new twitter count api
            fermata.json('//opensharecount.com/count.json')
                ({
                    url: location.href
                })
                .get(this.create_tweets);

            // get branded videos from api
            util.api('branded_video_id')({ video_id: video_id })
                .get(this.create_branded_video);

            util.api('plus_ones')({href: 'https://www.youtube.com/watch?v=' + video_id})
                .get(this.create_plus_ones);

            // feature video
            if (session.has_role('admin')) {
                util.api('trending')('video')({video_id: video_id})
                    .get(this.create_featured_button);
            }
        },

        start: function () {
            if (location.pathname !== '/watch') {
                return;
            }

            this.render();

            this.create_video_earnings();

            if (data.monetizer === 'youtube_multi') {
                return this.create_network(null, {multi: true});
            }

            if (data.monetizer && data.channel_id) {
                util.api('network')
                    ({
                        attribution: data.monetizer,
                        channel_id: data.channel_id
                    })
                    .get(this.create_network);
            }

            this.log_channel_network();
        },

        create_branded_video: function (err, result) {
            if (err || !result || !result.length) return;

            util.$('#freedom_branded_video_container', this.box)
                .replace(jsonToDOM(
                    ['a', {
                            href: result[0].url || '#',
                            target: '_blank'
                        },
                        result[0].text
                    ]
                ));
        },

        create_fb_likes: function (err, result) {
            if (err || !result || !result[0]) return;

            var likes = result[0].like_count;

            util.$('#freedom_fb_likes_container', this.box)
                .replace(jsonToDOM(
                    ['span', {class: 'indent'},
                        ['b', util.number_with_commas(likes)],
                        util.simple_pluralize(' ' + util.locale('facebook_like'), likes)
                    ]
                ));
        },

        create_tweets: function (err, result) {
            if (err || !result) return;

            util.$('#freedom_tweets_container', this.box)
                .replace(jsonToDOM(
                    ['span', {class: 'indent'},
                        ['b', util.number_with_commas(result.count)],
                        util.simple_pluralize(' ' + util.locale('tweet'), result.count)
                    ]
                ));
        },

        create_plus_ones: function (err, result) {
            if (err || !result) return;

            util.$('#freedom_plus_ones_container', this.box)
                .replace(jsonToDOM(
                    ['span', {class: 'indent'},
                        ['b', util.number_with_commas(result.count)],
                        util.simple_pluralize(' ' + util.locale('google_1'), result.count)
                    ]
                ));
        },

        // create_video_age: function (err, result) {
        //     // console.log('received time');
        //     if (err || !result.items || !result.items.length) {
        //         return;
        //     }

        //     this.time = moment(result.items[0].snippet.publishedAt).fromNow();

        //     util.$('#freedom_video_age_container', this.box)
        //         .replace(jsonToDOM(result
        //             ? ['span', {id: 'freedom_time_span'},
        //                 util.locale('this_video_is') + ' ',
        //                 ['b', this.time.replace('ago', '')],
        //                 util.locale('old')
        //             ]
        //             : []
        //         ));

        //     this.insert_video_age_on_uploader_info();
        // },

        // insert_video_age_on_uploader_info: function () {
        //     var e = util.$('#watch-uploader-info');
        //     if (e && this.time && !this.inserted) {
        //         e.appendChild(jsonToDOM(
        //             ['b', ' - ', this.time]
        //         ));
        //         this.inserted = true;
        //     }
        // },

        create_video_earnings: function () {
            var earnings = numeral((+data.views * 7 * 0.55 * 0.25) / 1000).format('$0,0.00'),
                video_id = util.parse_qs().v,
                html = ['span',
                            ['span', {id: 'freedom_estimated_earnings'},
                                ['b', earnings + ' '],
                                util.locale('estimated_earnings')
                            ]
                    ];

            util.$wait('[data-external-id]', function (err, elems){
                if (err || !elems.length) return;

                if (data.channel_id === elems[1].getAttribute('data-external-id')) {
                    html.push(
                        ['a', {
                                class: 'see-actual',
                                href: 'https://www.youtube.com/analytics?o=U#;fi=v-' + video_id,
                                target: '_blank',
                                onclick: _.partial(util.log_count_per_day, 'actual_earning', null)
                            },
                            '[' + util.locale('see_actual') + ']'
                        ]
                    );
                }

                util.$('#freedom_earnings_container', widget.box).replace(html);
            });
        },

        create_network: function (err, result) {
            var network;

            if (err) {
                result = {network_id: data.monetizer};
            }

            if (result.network_id === 'youtube_none') {
                delete result.network_id;
            }

            if (result.network_id && result.network_id.length === 22) {
                result.website = 'https://www.youtube.com/channel/UC' + result.network_id;
            }

            if (result.website) {
                network = ['span',
                    util.locale('this_video_monetized_by') + ' ',
                    ['a', {
                            href: result.website || '#',
                            target: '_self'
                        },
                        result.network_id
                    ]
                ];

                if (result.powered_by) {
                    network.push(', ' + util.locale('powered_by') + ' ');
                    network.push(['a', {href: result.powered_by_website}, result.powered_by]);
                }
            }
            else if (result.multi) {
                network = ['span',
                    util.locale('monetized_directly'), ['b', 'YouTube']
                ];
            }
            else {
                network = result.network_id
                    ? ['span',
                        util.locale('this_video_monetized_by') + ' ', ['b', result.network_id]
                    ]
                    : util.locale('video_not_monetized');
            }

            util.$('#freedom_monetization_container', this.box)
                .replace(jsonToDOM(
                    ['span', {id: 'freedom_monetization'}, network]
                ));
        },

        create_featured_button: function (err, result) {
            var is_featured = !!(result && result.featured && (result.featured > Date.now())),
                video_id = util.parse_qs().v;

            function toggle_featured () {
                is_featured = !is_featured;

                util.api('trending')('feature_video')
                    .post({
                        video_id: video_id,
                        is_featured: is_featured
                    }, update_button);
            }

            function update_button () {
                util.$wait('#freedom_featured_video_container', function (err, ele) {
                    if (err) return;

                    ele.replace(
                        ['span', {
                            id: 'freedom_featured_button_container',
                            class: 'fa ' + (is_featured ? 'fa-star' : 'fa-star-o'),
                            title: util.locale(is_featured ? 'unfeature_this_video' : 'feature_this_video'),
                            onclick: toggle_featured
                        }]
                    );
                });
            }

            update_button();
        },

        create_box: function (video_id) {
            this.box = jsonToDOM(
                ['div', {
                        class: 'action-panel-content yt-card yt-card-has-padding' +
                            'yt-uix-expander yt-uix-expander-collapsed',
                        id: this.container.slice(1),
                        style: this.show_box ? '' : 'display:none',
                        'data-vid-id': video_id
                    },
                    ['span', {
                        id: 'freedom_branded_video_container',
                        style: settings.branded_video ? '' : 'display:none'
                    }],
                    ['span', {
                        id: 'freedom_monetization_container',
                        style: settings.monetization ? '' : 'display:none'
                    }],
                    ['span', {
                        id: 'freedom_earnings_container',
                        style: settings.estimated_earnings ? '' : 'display:none'
                    }],
                    ['span', {
                            id: 'freedom_social_stats_container',
                            style: settings.social_stats ? '' : 'display:none'
                        },
                        ['span', {id: 'freedom_fb_likes_container'}],
                        ['span', {id: 'freedom_tweets_container'}],
                        ['span', {id: 'freedom_plus_ones_container'}]
                    ],
                    ['span', {
                            id: 'freedom_featured_video_container',
                            style: session.has_role('admin') ? '' : 'display:none'
                        }
                    ]
                ]
            );
        },

        remove: function () {
            var elem = util.$(this.container);

            if (elem) {
                elem.parentElement.removeChild(elem);
            }
        },

        exists: function () {
            return !!util.$(this.container);
        },

        render: function () {
            var temp = util.$('#watch7-content');
            this.remove();
            if (temp) {
                temp.insertBefore(this.box, util.$('#watch-header'));
            }

        },

        integrity: function () {
            var elem = util.$(this.container);
            return elem && elem.getAttribute('data-vid-id') === data.video_id;
        },

        check_for_show: function () {
            this.show_box = settings.video_statistics && (
                settings.social_stats ||
                settings.video_earnings ||
                settings.monetization ||
                settings.branded_video);
                //  ||
                // settings.video_age);
        },

        settings_changed: function (change) {
            var box = util.$(this.container);

            // if (change.video_age) {
            //     util.$('#freedom_video_age_container', this.box)
            //         .style.display = settings.video_age ? '' : 'none';
            // }

            if (change.monetization) {
                util.$('#freedom_monetization_container', this.box)
                    .style.display = settings.monetization ? '' : 'none';
            }

            if (change.estimated_earnings) {
                util.$('#freedom_earnings_container', this.box)
                    .style.display = settings.estimated_earnings ? '' : 'none';
            }

            if (change.social_stats) {
                util.$('#freedom_social_stats_container', this.box)
                    .style.display = settings.social_stats ? '' : 'none';
            }

            if (change.branded_video) {
                util.$('#freedom_branded_video_container', this.box)
                    .style.display = settings.branded_video ? '' : 'none';
            }

            if (box) {
                this.check_for_show();
                box.style.display = this.show_box ? 'block' : 'none';
            }
        },

        log_channel_network: function () {
            if (this.channel_network_logged || !data.monetizer || !data.channel_id) {
                return;
            }

            this.channel_network_logged = true;

            util.api('channel_network')
                .post({
                    channel_id: data.channel_id,
                    network: data.monetizer
                }, _.noop);
        }
    };

    widgets.push(widget);

})();
