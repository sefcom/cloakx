(function () {

    'use strict';

    var widget = {

        name: 'Heartbeat moments',

        sort: 'views',
        sort_dir: 'desc',

        initialize: function () {
            if (this.widget_dom) {
                return;
            }

            this.widget_dom = jsonToDOM(['div', {
                    id: 'freedom_saved_moments_list',
                    class: 'yt-card yt-card-has-paddingyt-uix-expander yt-uix-expander-collapsed'
                },
                ['div', {class: 'section_header'},
                    ['h3', util.locale('Heartbeat_moments')],
                    ['span', {id: 'total_saved_moments'}],
                    ['div', {id: 'saved_moments_filter'},
                        ['button', {
                                id: 'saved_moments_filter_button',
                                popup_id: 'saved_moments_filter_options',
                                class: 'yt-uix-button yt-uix-button-size-default yt-uix-button-has-icon'
                                    + ' no-icon-markup yt-uix-videoactionmenu-button yt-uix-button-toggled',
                                onclick: this.show_popup
                            },
                            ['i', {class: 'fa fa-filter'}],
                            ['span', util.locale('all_moments')]
                        ],
                        ['div', {
                                id: 'saved_moments_filter_options',
                                class: 'yt-uix-button-menu yt-uix-button-menu-default freedom_popup freedom_hid',
                            },
                            ['ul', {
                                    class: 'yt-uix-kbd-nav yt-uix-kbd-nav-list'
                                },
                                ['li', {
                                        'data-value': 'my_moments',
                                        'data-text': util.locale('my_moments'),
                                        onclick: this.on_filter_by_email
                                    },
                                    ['span', {class: 'yt-uix-button-menu-item'}, util.locale('my_moments')]
                                ],
                                ['li', {
                                        'data-value': 'all_moments',
                                        'data-text': util.locale('all_moments'),
                                        onclick: this.on_reset_filter
                                    },
                                    ['span', {class: 'yt-uix-button-menu-item'}, util.locale('all_moments')]
                                ]
                            ]
                        ]
                    ],
                    ['div', {id: 'saved_moments_sorting'},
                        ['button', {
                                id: 'saved_moments_sort_button',
                                popup_id: 'saved_moments_sort_options',
                                class: 'yt-uix-button yt-uix-button-size-default yt-uix-button-has-icon'
                                    + ' no-icon-markup yt-uix-videoactionmenu-button yt-uix-button-toggled',
                                onclick: this.show_popup
                            },
                            ['i', {
                                class: 'fa fa-sort-alpha-desc',
                                onclick: this.on_sort_dir_saved_moment
                            }],
                            ['span', util.locale('sort_by_views')]
                        ],
                        ['div', {
                                id: 'saved_moments_sort_options',
                                class: 'yt-uix-button-menu yt-uix-button-menu-default freedom_popup freedom_hid',
                            },
                            ['ul', {
                                    class: 'yt-uix-kbd-nav yt-uix-kbd-nav-list'
                                },
                                ['li', {
                                        'data-value': 'views',
                                        'data-text': util.locale('sort_by_views'),
                                        onclick: this.on_sort_saved_moment
                                    },
                                    ['span', {class: 'yt-uix-button-menu-item'}, util.locale('sort_by_views')]
                                ],
                                ['li', {
                                        'data-value': 'inserted_date',
                                        'data-text': util.locale('sort_by_time'),
                                        onclick: this.on_sort_saved_moment
                                    },
                                    ['span', {class: 'yt-uix-button-menu-item'}, util.locale('sort_by_time')]
                                ]
                            ]
                        ]
                    ]
                ],
                ['ul', {id: 'freedom_saved_moments_ul'}]
            ]);
        },

        start: function () {
            var qs = util.parse_qs();

            if (!settings.save_moment || location.pathname !== '/watch') {
                this.remove();
                return;
            }

            if (this.video_id !== qs.v) {
                this.reset_data();
            }

            this.video_id = qs.v;

            this.render();
            this.load_saved_moments();
        },

        render: function () {
            var temp = util.$('#watch7-content');

            if (temp && !util.$('#freedom_saved_moments_list')) {
                temp.insertBefore(this.widget_dom, util.$('#watch-action-panels'));
            }
        },

        remove: function () {
            this.widget_dom.remove();
        },

        integrity: function() {
            return util.$('#freedom_saved_moments_list')
                && location.pathname === '/watch'
                && this.video_id === util.parse_qs().v;
        },

        settings_changed: function (change) {
            if (change.save_moment && !settings.save_moment) {
                this.remove();
            }
        },

        show_popup: function (evt) {
            var btn = util.bind_elem_functions(evt.currentTarget),
                popup_id = '#' + evt.currentTarget.getAttribute('popup_id');

            evt.stopPropagation();

            this.hide_popup(btn, popup_id);

            util.$(popup_id, this.widget_dom).remove_class('freedom_hid');
            btn.add_class('active');
            document.addEventListener('click', this.hide_popup);
        },

        hide_popup: function (except_button, except_popup_id) {
            _(util.$('.yt-uix-button', this.widget_dom))
                .forEach(function (button) {
                    if (button === except_button) {
                        return;
                    }

                    button.remove_class('active');
                })
                .commit();

            _(util.$('.freedom_popup'))
                .forEach(function (popup) {
                    if (popup.getAttribute('id') === except_popup_id) {
                        return;
                    }

                    popup.add_class('freedom_hid');
                })
                .commit();

            document.removeEventListener('click', this.hide_popup);
        },

        on_filter_by_email: function (evt) {
            var btn = util.$('#saved_moments_filter_button span', this.widget_dom)[0];

            this.filter =  data.email;
            btn.innerText = evt.currentTarget.getAttribute('data-text');

            this.reload_saved_moments();
        },

        on_reset_filter: function (evt) {
            var btn = util.$('#saved_moments_filter_button span', this.widget_dom)[0];

            this.filter =  '';
            btn.innerText = evt.currentTarget.getAttribute('data-text');

            this.reload_saved_moments();
        },

        on_sort_saved_moment: function (evt) {
            var btn = util.$('#saved_moments_sort_button span', this.widget_dom)[0];

            this.sort = evt.currentTarget.getAttribute('data-value');
            btn.innerText = evt.currentTarget.getAttribute('data-text');

            this.reload_saved_moments();
        },

        on_sort_dir_saved_moment: function (evt) {
            var icon = util.bind_elem_functions(evt.currentTarget);

            evt.stopPropagation();

            icon.toggle_class('fa-sort-alpha-asc');
            icon.toggle_class('fa-sort-alpha-desc');

            this.sort_dir = icon.has_class('fa-sort-alpha-asc') ? 'asc' : 'desc';
            this.reload_saved_moments();
        },

        wait_for_video_load: function () {
            var that = this,
                player = that.get_video_player();

            if (player && isFinite(player.duration)) {
                return that.refresh_thumbnail();
            }

            this.video_load_interval = setInterval(function () {
                var new_player = that.get_video_player();

                if (new_player && isFinite(new_player.duration)) {
                    clearInterval(that.video_load_interval);
                    that.refresh_thumbnail();
                }
            }, 500);
        },

        refresh_thumbnail: function () {
            var that = this;

            _(this.saved_moments)
                .forEach(function (item) {
                    var li = util.$('#li_' + item.id, that.widget_dom),
                        start_at = moment.duration(item.start_at).asSeconds();

                    if (!li) {
                        return;
                    }

                    util.$('.preview_image', li)[0].style.background = that.get_storyboard_preview(start_at);
                })
                .commit();
        },

        load_saved_moments: function (refresh) {
            var that = this,
                limit = 10,
                first_load = !this.saved_moments,
                option;

            if (this.all_saved_moments_loaded) {
                return;
            }

            option = {
                video_id: util.parse_qs().v,
                total: first_load ? 'total' : '',
                skip: this.saved_moments ? this.saved_moments.length : 0,
                limit: limit,
                email: this.filter || '',
                sort: this.sort || '',
                sort_dir: this.sort_dir || 'DESC'
            };

            if (refresh) {
                option.t = (new Date()).getTime();
            }

            util.api('hb_moments')(option)
                .get({'ACCESS-TOKEN': session.access_token}, null, function (err, result) {
                    if (err || !result) {
                        return;
                    }

                    if (first_load) {
                        that.saved_moments = result.items;
                    }
                    else {
                        that.saved_moments = that.saved_moments.concat(result.items);
                    }

                    if (!result.items.length || result.items.length < limit) {
                        that.all_saved_moments_loaded = true;
                    }

                    that.render_saved_moments(result);
                });
        },

        render_saved_moments: function (result) {
            var that = this,
                storyboard = this.get_storyboard() || 80,
                widget_dom = util.bind_elem_functions(this.widget_dom),
                total_label = util.$('#total_saved_moments', widget_dom),
                load_more_btn = util.$('#load_more_saved_moments', widget_dom),
                video_title = util.$('#eow-title').innerText,
                ul = util.$('#freedom_saved_moments_ul', widget_dom);

            this.wait_for_video_load();

            if (load_more_btn) {
                load_more_btn.remove();
            }

            if (result.total) {
                total_label.innerText = result.total;
                widget_dom.add_class('has_data');
                total_label.setAttribute('title', util.locale('saved_moment_tooltip')
                    .replace('?', result.total)
                    .replace('?', video_title));
            }

            _(result.items)
                .forEach(function (item) {
                    ul.appendChild(that.create_saved_moment_item(item));
                })
                .commit();

            if (!this.all_saved_moments_loaded && this.saved_moments.length) {
                ul.appendChild(jsonToDOM(['li', {
                        id: 'load_more_saved_moments',
                        onclick: this.load_saved_moments
                    },
                    ['a', {
                            style: 'width: ' + storyboard.thumb_width + 'px;'
                                + 'height: ' + storyboard.thumb_height + 'px;'
                                + 'line-height: ' + storyboard.thumb_height + 'px;'
                        },
                        util.locale('more_results')
                    ]
                ]));
            }

            if (this.saved_moments.length) {
                widget_dom.add_class('has_data');
            }
        },

        duation_to_hms: function (s) {
            return util.seconds_to_hms(moment.duration(s).asSeconds());
        },

        create_saved_moment_item: function (item) {
            var link = 'https://www.youtube.com/watch?v=' + item.video_id
                    + '&hb=Heartbeat_moment'
                    + '&hb_moment=' + item.id
                    + '&t=' + moment.duration(item.start_at).asSeconds() + 's'
                    + '&t2=' + moment.duration(item.end_at).asSeconds() + 's'
                    + (item.playlist_id ? '&list=' + item.playlist_id : ''),

                start_at = this.duation_to_hms(item.start_at),
                end_at = this.duation_to_hms(item.end_at),
                moment_duration = start_at + ' - ' + end_at,

                storyboard = this.get_storyboard() || {},

                li = jsonToDOM(['li', {
                        id: 'li_' + item.id,
                        class: item.email === data.email ? 'own_moment' : '',
                        onclick: _.partial(util.log_count_per_day, 'play_moment', null),
                        onmouseleave: this.on_item_mouse_leave
                    },
                    ['a', {
                            class: 'preview_image',
                            href: link
                        },
                        ['span', {class: 'moment_duration'}, moment_duration],
                            ['span', {
                                class: 'freedom_video_item_stat',
                                style: item.views ? 'display: block' : 'display:none'
                            },
                            item.views ? item.views + ' ' + util.locale('views') : ''
                        ]
                    ],
                    ['div', {class: 'saved_moment_item_toolbar'},
                        ['div', {class: 'saved_moments_share'},
                            ['a', {
                                    popup_id: 'saved_moments_share_popup_' + item.id,
                                    onclick: this.show_popup
                                },
                                ['i', {class: 'fa fa-share-alt'}]
                            ],
                            ['div', {
                                    id: 'saved_moments_share_popup_' + item.id,
                                    link: link,
                                    class: 'yt-uix-button-menu yt-uix-button-menu-default saved_moments_share_popup'
                                        + ' freedom_popup freedom_hid'
                                },
                                ['a', {onclick: this.share_facebook},
                                    ['span', {class: 'share-service-icon share-service-icon-facebook yt-sprite'}]
                                ],
                                ['a', {onclick: this.share_google},
                                    ['span', {class: 'share-service-icon share-service-icon-googleplus yt-sprite'}]
                                ],
                                ['a', {onclick: this.share_twitter},
                                    ['span', {class: 'share-service-icon share-service-icon-twitter yt-sprite'}]
                                ],
                                ['a', {onclick: this.share_tumblr},
                                    ['span', {class: 'share-service-icon share-service-icon-tumblr yt-sprite'}]
                                ],
                                ['a', {onclick: this.share_pinterest},
                                    ['span', {class: 'share-service-icon share-service-icon-pinterest yt-sprite'}]
                                ],
                                ['a', {onclick: this.share_reddit},
                                    ['span', {class: 'share-service-icon share-service-icon-reddit yt-sprite'}]
                                ],
                                ['a', {onclick: this.share_vk},
                                    ['span', {class: 'share-service-icon share-service-icon-vkontakte yt-sprite'}]
                                ]
                            ]
                        ],
                        ['a', {
                                class: 'remove_moment',
                                moment_id: item.id,
                                onclick: this.remove_moment
                            },
                            ['i', {class: 'fa fa-times'}]
                        ]
                    ],
                    ['div', {
                            class: 'moment_comment yt-uix-tooltip',
                            'data-tooltip-text': item.comment || ''
                        },
                        item.comment || ''
                    ]
                ]),

                preview = util.$('.preview_image', li)[0];

            li.style.width = preview.style.width = (storyboard.thumb_width || 120) + 'px';
            preview.style.height = (storyboard.thumb_height || 80)+ 'px';
            preview.style.background = this.get_storyboard_preview(moment.duration(item.start_at).asSeconds());

            return li;
        },

        remove_moment: function (evt) {
            var that = this;

            util.api('hb_moments')({id: evt.currentTarget.getAttribute('moment_id')})
                .delete({'ACCESS-TOKEN': session.access_token}, null, function (err) {
                    if (err) {
                        return;
                    }

                    that.reload_saved_moments();
                });
        },

        get_video_player: function () {
            return util.$('#player video')[0];
        },

        get_storyboard: function () {
            var data = util.retrieve_window_variables({data: 'ytplayer.config.args.storyboard_spec'}).data,
                img, thumb, scale = 0.8;

            if (!data) return null;

            data = data.split('|');
            img = data[2].split('#');
            thumb = data[3].split('#');

            return {
                img_width: parseInt(img[0]) * 10 * scale,
                img_height: parseInt(img[1]) * 10 * scale,
                thumb_width: parseInt(thumb[0]) * scale,
                thumb_height: parseInt(thumb[1]) * scale,
                thumb_total: parseInt(thumb[2]),
                thumb_x: parseInt(thumb[3]),
                thumb_y: parseInt(thumb[4]),
                sign: _(thumb).last()
            };
        },

        get_storyboard_preview: function (seconds) {
            var data = this.get_storyboard(),
                video_player = this.get_video_player(),
                url = 'https://i.ytimg.com/sb/{video_id}/storyboard3_L2/M{m}.jpg?sigh={sign}',
                actual_height = data && data.img_height,
                thumbs = data && (data.thumb_x * data.thumb_y),
                thumb_index, image_index, x, y, tmp;

            if (!data) return '';

            thumb_index = Math.floor(seconds / (video_player.duration - 1) * (data.thumb_total - 1));
            image_index = Math.floor(thumb_index / thumbs);
            thumb_index = thumb_index % thumbs;
            x = - thumb_index % data.thumb_x * data.thumb_width;
            y = - Math.floor(thumb_index / data.thumb_x) * data.thumb_height;

            if (thumbs * (image_index + 1) > data.thumb_total) {
                tmp = data.thumb_total - thumbs * image_index;
                actual_height = Math.floor(tmp / data.thumb_x) * data.thumb_height;
                if (tmp % data.thumb_x) {
                    actual_height += data.thumb_height;
                }
            }

            url = url
                .replace('{m}', image_index)
                .replace('{video_id}', util.parse_qs().v)
                .replace('{sign}', data.sign);

            return 'url({url}) {x}px {y}px / {w}px {h}px'
                .replace('{url}', url)
                .replace('{x}', x)
                .replace('{y}', y)
                .replace('{w}', data.img_width)
                .replace('{h}', actual_height);
        },

        reload_saved_moments: function () {
            this.reset_data();
            this.load_saved_moments('refresh');
        },

        reset_data: function () {
            var widget_dom = util.bind_elem_functions(this.widget_dom),
                ul = util.$('#freedom_saved_moments_ul', widget_dom),
                total_label = util.$('#total_saved_moments', widget_dom);

            this.storyboard = null;
            this.saved_moments = null;
            this.commented_moments = null;
            this.all_saved_moments_loaded = false;

            ul.replace(document.createTextNode(''));
            total_label.innerText = '';
            widget_dom.remove_class('has_data');
        },

        plug_save_moment: function (dom) {
            var header = util.$('.section_header', this.widget_dom)[0];

            header.appendChild(dom);
        },

        on_item_mouse_leave: function (evt) {
            util.$('.saved_moments_share_popup', evt.currentTarget)[0].add_class('freedom_hid');
        },

        open_window: function (url) {
            window.open(url, '_blank', 'height:560, width:530, scrollbars:true');
        },

        share_facebook: function (evt) {
            var url = 'https://www.facebook.com/dialog/share?app_id=87741124305&href='
                    + encodeURIComponent(evt.currentTarget.parentElement.getAttribute('link'))
                    + '&display=popup&redirect_uri=https://www.youtube.com/facebook_redirect';

            this.open_window(url);
        },

        share_twitter: function (evt) {
            var url = 'https://twitter.com/intent/tweet?url='
                    + encodeURIComponent(evt.currentTarget.parentElement.getAttribute('link'))
                    + '&text=' + encodeURIComponent(util.$('#watch-headline-title').innerText)
                    + '&via=Heartbeat&related=YouTube,YouTubeTrends,YTCreators,Heartbeat';

            this.open_window(url);
        },

        share_google: function (evt) {
            var url = 'https://plus.google.com/u/0/share?url='
                    + encodeURIComponent(evt.currentTarget.parentElement.getAttribute('link'))
                    + '&source=yt&hl=en&soc-platform=1&soc-app=130';

            this.open_window(url);
        },

        share_tumblr: function (evt) {
            var url = 'http://www.tumblr.com/share/video?embed='
                    + encodeURIComponent(evt.currentTarget.parentElement.getAttribute('link'))
                    + '&caption=' + encodeURIComponent(util.$('#watch-headline-title').innerText);

            this.open_window(url);
        },

        share_pinterest: function (evt) {
            var url = 'http://pinterest.com/pin/create/button/?url='
                    + encodeURIComponent(evt.currentTarget.parentElement.getAttribute('link'))
                    + '&description=' + encodeURIComponent(util.$('#watch-headline-title').innerText)
                    + '&is_video=true&media='
                    + encodeURIComponent('https://i.ytimg.com/vi/' + this.video_id + '/default.jpg');

            this.open_window(url);
        },

        share_reddit: function (evt) {
            var url = 'http://reddit.com/submit?url='
                    + encodeURIComponent(evt.currentTarget.parentElement.getAttribute('link'))
                    + '&title=' + encodeURIComponent(util.$('#watch-headline-title').innerText);

            this.open_window(url);
        },

        share_vk: function (evt) {
            var url = 'http://vkontakte.ru/share.php?url='
                    + encodeURIComponent(evt.currentTarget.parentElement.getAttribute('link'));

            this.open_window(url);
        }
    };

    widgets.push(widget);

})();
