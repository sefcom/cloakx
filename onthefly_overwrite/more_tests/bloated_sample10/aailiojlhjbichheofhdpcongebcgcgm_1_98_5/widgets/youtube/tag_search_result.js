(function () {
    'use strict';

    var widget = {
        name: 'Heartbeat tag result',

        container_selector: '#freedom_tag_result',
        search_page_size: 10,
        display_limit: 5,
        is_watching: false,

        initialize: function () {
            var login_url = util.get_login_link(location.href),
                title = this.get_search_title();

            this.widget_dom = jsonToDOM(
                ['div', {
                        id: 'freedom_tag_result',
                        class: 'freedom_video_container' +
                            (this.is_watching ? ' is_watching' : ''),
                        style: 'display:none'
                    },
                    ['div', {
                            class: 'freedom_video_header',
                            title: title
                        },
                        title
                    ],
                    ['div', {id: 'freedom_video_container'}],
                    ['div', {
                            class: 'freedom_video_show_more',
                            style: 'display:' + (!this.is_watching ? 'block' : 'none')
                        },
                        ['a', {onclick: this.open_search_popup},
                            util.locale('see_more_results')
                        ]
                    ]
                ]);


            // search popup
            this.search_popup = jsonToDOM(['div', {
                    id: 'freedom_search_popup',
                    class: 'freedom_hid freedom_popup'
                },
                ['div', {class: 'freedom_popup_header'},
                    ['span', {class: 'freedom_popup_header_title'},
                        util.locale('heartbeat_search')
                    ],
                    ['span', {class: 'freedom_popup_header_close fa fa-times'}]
                ],
                ['div', {class: 'freedom_popup_content'},
                    ['div', {id: 'freedom_tag_search_section'},
                        ['div', {class: 'freedom_tag_input_wrapper show_for_search'},
                            ['input', {id: 'freedom_txt_search',}],
                            ['i', {class: 'fa fa-search'}]
                        ],
                        ['a', {
                                id: 'freedom_login_link',
                                href: login_url,
                                style: 'display: none'
                            },
                            util.locale('heartbeat_search_please_login')
                        ],
                        ['a', {
                                id: 'freedom_create_new_playlist',
                                title: util.$('create_playlist_on_search_results'),
                                class: 'yt-uix-button yt-uix-button-default show_for_search',
                                onclick: this.on_show_create_playlist
                            },
                            util.locale('create_new_playlist')
                        ],
                        ['div', {
                                class: 'freedom_tag_input_wrapper show_for_edit',
                                style: 'display: none'
                            },
                            ['input', {
                                id: 'freedom_txt_playlist_name',
                                placeholder: util.$('enter_playlist_title'),
                                class: 'show_for_edit'
                            }]
                        ],
                        ['a', {
                                id: 'freedom_save_playlist',
                                class: 'yt-uix-button yt-uix-button-default show_for_edit',
                                onclick: this.on_save_new_playlist,
                                style: 'display: none'
                            },
                            util.locale('save')
                        ],
                        ['a', {
                                id: 'freedom_cancel_playlist',
                                class: 'yt-uix-button yt-uix-button-default show_for_edit',
                                onclick: this.on_show_search_video,
                                style: 'display: none'
                            },
                            util.locale('cancel')
                        ]
                    ],
                    ['div', {id: 'freedom_tag_results_section'},
                        ['div', {
                                id: 'freedom_tag_results_items',
                                class: 'item-section'
                            }
                        ],
                        ['div', {
                                id: 'freedom_tag_more_results',
                                style: 'margin-top: 10px; display: none; text-align: center'
                            },
                            ['a', {
                                    class: 'yt-uix-button yt-uix-button-default',
                                    onclick: this.load_more_results
                                },
                                ['span', {class: 'yt-spinner'},
                                    ['span', {class: 'yt-spinner-img  yt-sprite'}]
                                ],
                                util.locale('more_results')
                            ]
                        ]
                    ]
                ]
            ]);

            this.background_popup = jsonToDOM(['div', {class: 'freedom_popup_background'}]);

            this.add_event_handlers();            
        },

        get_search_title: function () {
            var title = util.locale('heartbeat_tag_results')
                    .replace('?', '“' + (util.parse_qs().search_query || '').replace(/\+/gi, ' ') + '”');

            this.is_watching = location.pathname.indexOf('/watch') >= 0;
            if (this.is_watching) {
                title = util.locale('matching_hb_tags');
            }

            return title;
        },

        get_search_keyword: function () {
            var tag_name = (util.parse_qs().search_query || '').replace(/\+/gi, ' ');

            if (!tag_name && data.keywords) {
                tag_name = data.keywords.join(',');
            }

            return tag_name;
        },

        start: function () {
            var tag_name = this.get_search_keyword();

            if (!settings.tag_search_result || (this.is_watching && !tag_name)) {
                this.remove();
                return;
            }

            this.render();
            this.load_videos(tag_name, 0, this.search_page_size, true, this.on_search_result);
        },

        on_search_result: function (result) {
            if (!result || !result.length) {
                this.load_mcn_videos(this.get_search_keyword(), this.display_limit, this.render_videos);
                return;
            }

            this.render_videos(result);
        },

        remove: function () {
            var this_widget = util.$(this.container_selector),
                popup = util.$('#freedom_search_popup');

            if (this_widget) {
                this_widget.remove();
            }

            if (popup) {
                popup.remove();
            }
        },

        render: function () {
            var secondary_col = this.is_watching ? util.$('#watch7-sidebar') :
                util.$('#search-secondary-col-contents'),
                content_box = util.$('body')[0];

            if (!secondary_col || !content_box) {
                return;
            }

            if (!util.$('#freedom_tag_result')) {
                if (secondary_col.firstChild && !this.is_watching) {
                    secondary_col.insertBefore(this.widget_dom, secondary_col.firstChild);
                }
                else {
                    secondary_col.appendChild(this.widget_dom);
                }
            }

            if (!util.$('#freedom_search_popup')) {
                content_box.appendChild(this.search_popup);
            }
        },

        add_event_handlers: function () {
            var that = this,
                text_box = util.$('#freedom_txt_search', this.search_popup),
                playlist_text_box = util.$('#freedom_txt_playlist_name', this.search_popup);

            this.search_popup.addEventListener('click', function (evt) {
                evt.stopPropagation();
            });

            util.$('.freedom_popup_header_close', this.search_popup)[0]
                .addEventListener('click', this.close_search_popup);

            text_box.addEventListener('keydown', function () {
                text_box.old_value = text_box.value;
            });

            text_box.addEventListener('keyup', function () {
                // no change
                if (text_box.old_value === text_box.value) {
                    return;
                }

                // avoid too much db query
                if (that.keypress_timeout) {
                    clearTimeout(that.keypress_timeout);
                }

                that.keypress_timeout = setTimeout(that.search_by_tag, 300);
            });

            playlist_text_box.addEventListener('keyup', function () {
                var btn_save = util.$('#freedom_save_playlist', this.search_popup);

                if (!playlist_text_box.value) {
                    btn_save.setAttribute('disabled', 'disabled');
                    return;
                }

                btn_save.removeAttribute('disabled');
            });
        },

        settings_changed: function (change) {
            if (!change.tag_search_result) {
                return;
            }

            if (!change.tag_search_result.newValue) {
                this.remove();
                return;
            }
            
            this.start();
        },

        load_videos: function (tag_name, skip, limit, approximate, callback) {
            var that = this;

            if (!tag_name || this.loading) {
                return;
            }

            this.loading = true;

            util.api('tag', 'videos')({
                    tag_name: tag_name,
                    approximate: approximate ? 1 : 0,
                    limit: limit,
                    skip: skip
                })
                .get(function (err, result) {
                    that.loading = false;
                    util.$('#freedom_tag_results_section', that.search_popup).remove_class('loading');

                    if (err) {
                        return;
                    }

                    if (callback) {
                        callback(result);
                    }
                });
        },

        load_mcn_videos: function (tag_name, limit, callback) {
            var that = this;

            if (!tag_name || this.loading) {
                return;
            }

            tag_name = tag_name.trim();
            this.loading = true;

            util.api('tag', 'mcn_videos')({
                    tag_name: tag_name,
                    limit: limit
                })
                .get(function (err, result) {
                    that.loading = false;
                    if (err) {
                        return;
                    }

                    if (callback) {
                        callback(result);
                    }
                });
        },

        render_videos: function (videos) {
            var that = this,
                container = util.$('#freedom_video_container', this.widget_dom),
                videos_div = ['div'],
                img_size = this.is_watching ? 'medium' : 'default',
                big_img_size = this.is_watching ? 'high' : 'medium';

            _(videos)
                .forEach(function (video, index) {
                    if (index >= that.display_limit) {
                        return;
                    }

                    var img_url = index === 0 ? video.snippet.thumbnails[big_img_size].url :
                        video.snippet.thumbnails[img_size].url;

                    videos_div.push(['div', {
                            class: 'freedom_video_item',
                            id: 'freedom_video_item_' + video.id
                        },
                        ['a', {
                                video_id: video.id,
                                title: video.snippet.title,
                                onclick: that.log_search_result_click,
                                href: 'https://www.youtube.com/watch?v=' + video.id + '&hb=Heartbeat_tag'
                            },
                            ['img', {src: img_url}]
                        ]
                    ]);
                })
                .commit();

            container.replace(jsonToDOM(videos_div));
            this.widget_dom.style.display = videos && videos.length ? 'block' : 'none';

            this.load_video_stats(videos);
        },

        load_video_stats: function (videos) {
            var that = this,
                video_ids;

            if (!videos || !videos.length) {
                return;
            }

            video_ids = _(videos)
                .map(function (v) {
                    return v.id;
                })
                .join(',');

            util.api('tag_video_stats')
                ({video_id: video_ids})
                .get(function (err, result) {
                    if (err) {
                        return;
                    }

                    that.render_video_stats(result);
                });
        },

        render_video_stats: function (video_stats) {
            var that = this;

            if (!video_stats) {
                return;
            }

            _(video_stats)
                .forEach(function (stats) {
                    var li = util.$('#freedom_video_item_' + stats.video_id, that.widget_dom);

                    if (!li) {
                        return;
                    }

                    li.appendChild(
                        jsonToDOM(['div', {
                            class: 'freedom_video_item_stat yt-uix-tooltip',
                            title: util.locale('heartbeat_views_tooltip')
                        }, stats.clicks.toLocaleString() + ' ' + util.locale('heartbeat_views')])
                    );
                })
                .commit();
        },

        log_search_result_click: function (evt) {
            var btn = evt.currentTarget,
                video_id = btn.getAttribute('video_id');

            util.api('tag_search_result_log')
                .post({
                    video_id: video_id,
                    email: data.email,
                    tag_name: util.parse_qs().search_query
                }, function () {});
        },

        close_search_popup: function () {
            var popup = util.$('#freedom_search_popup');

            if (!popup) {
                return;
            }

            widget.background_popup.remove();

            popup.add_class('freedom_hid');
            this.on_show_search_video();
            document.removeEventListener('click', this.close_search_popup);
        },

        open_search_popup: function (evt) {
            var popup = util.$('#freedom_search_popup'),
                keyword = util.parse_qs().search_query;

            evt.stopPropagation();

            util.$('body')[0].appendChild(widget.background_popup);

            popup.remove_class('freedom_hid');
            popup.style.left = (document.documentElement.clientWidth -
                popup.clientWidth) / 2 + 'px';
            popup.style.top = (document.documentElement.clientHeight -
                popup.clientHeight) / 2 + 'px';

            document.addEventListener('click', this.close_search_popup);
            util.$('#freedom_txt_search', this.search_popup).value = keyword ? keyword : '';
            this.search_by_tag();
        },

        search_by_tag: function () {
            this.load_videos(
                util.$('#freedom_txt_search', this.search_popup).value,
                0, 
                this.search_page_size,
                false,
                this.render_search_results
            );
        },

        load_more_results: function () {
            var items = util.$('#freedom_tag_results_items li', this.search_popup);

            util.$('#freedom_tag_results_section', this.search_popup).add_class('loading');
            this.load_videos(
                util.$('#freedom_txt_search', this.search_popup).value,
                items.length, 
                this.search_page_size,
                false,
                this.append_search_results
            );
        },

        get_duration_display: function (duration) {
            var d = new moment.duration(duration),
                h = d.hours(),
                m = d.minutes(),
                s = d.seconds();

            return (h > 0 ? h + ':' : '') + m + ':' + s;
        },

        get_video_item_dom: function (item) {
            var link = 'https://www.youtube.com/watch?v=' + item.id + '&hb=Heartbeat_tag';

            return ['li',
                ['div', {class: 'yt-lockup yt-lockup-tile yt-lockup-video vve-check clearfix yt-uix-tile'},
                    ['span', {
                            onclick: this.on_check_video,
                            class: 'freedom_checkbox fa fa-check-square-o',
                            video_id: item.id
                        }
                    ],
                    ['div', {class: 'yt-lockup-thumbnail contains-addto'},
                        ['div', {class: 'yt-thumb video-thumb'},
                            ['a', {href: link},
                                ['div', {class: 'yt-thumb video-thumb'},
                                    ['img', {src: item.snippet.thumbnails.default.url}]
                                ],
                                ['div', {class: 'yt-thumb'},
                                    ['span', {class: 'video-time'},
                                        this.get_duration_display(item.contentDetails.duration)
                                    ]
                                ]
                            ]
                        ]
                    ],
                    ['div', {class: 'yt-lockup-content'},
                        ['h3', {class: 'yt-lockup-title'},
                            ['a', {
                                    href: link,
                                    class: 'yt-uix-tile-link yt-ui-ellipsis' +
                                        ' yt-ui-ellipsis-2 yt-uix-sessionlink spf-link'
                                },
                                item.snippet.title
                            ]
                        ],
                        ['div', {class: 'yt-lockup-byline'},
                            ['span', 'by'],
                            ['a', {
                                    href: 'https://www.youtube.com/channel/' + item.snippet.channelId,
                                    style: 'margin-left: 5px'
                                },
                                item.snippet.channelTitle
                            ]
                        ],
                        ['div', {class: 'yt-lockup-meta'},
                            ['ul', {class: 'yt-lockup-meta-info'},
                                ['li', new moment(item.snippet.publishedAt).fromNow()],
                                ['li', parseInt(item.statistics.viewCount).toLocaleString() + ' ' +
                                    util.locale('views')
                                ]
                            ]
                        ],
                        ['div', {class: 'yt-lockup-description yt-ui-ellipsis yt-ui-ellipsis-2'},
                            item.snippet.description
                        ]
                    ]
                ],
                ''
            ];
        },

        render_search_results: function (results) {
            var that = this,
                items_dom = ['ul', {class: 'item-section'}];

            _(results)
                .forEach(function (item) {
                    items_dom.push(that.get_video_item_dom(item));
                })
                .commit();

            util.$('#freedom_tag_results_items', this.search_popup)
                .replace(jsonToDOM(items_dom));

            this.check_for_more_data(results);
        },

        append_search_results: function (results) {
            var that = this,
                ul = util.$('ul', this.search_popup)[0];

            _(results)
                .forEach(function (item) {
                    ul.appendChild(jsonToDOM(that.get_video_item_dom(item)));
                })
                .commit();

            this.check_for_more_data(results);
        },

        check_for_more_data: function (results) {
            var more_button = util.$('#freedom_tag_more_results', this.search_popup);

            if (results.length < this.search_page_size) {
                more_button.style.display = 'none';
                return;
            }

            more_button.style.display = 'block';
        },

        on_check_video: function (evt) {
            var check_box = util.bind_elem_functions(evt.srcElement);

            if (check_box.has_class('fa-check-square-o')) {
                check_box.remove_class('fa-check-square-o');
                check_box.add_class('fa-square-o');
                return;
            }

            check_box.remove_class('fa-square-o');
            check_box.add_class('fa-check-square-o');
        },

        toggle_edit: function (edit) {
            _(util.$('.show_for_search', this.search_popup))
                .forEach(function (elem) {
                    elem.style.display = !edit ? 'inline-block' : 'none';
                })
                .commit();

            _(util.$('.show_for_edit', this.search_popup))
                .forEach(function (elem) {
                    elem.style.display = edit ? 'inline-block' : 'none';
                })
                .commit();
        },

        toggle_enable_edit_control: function (enable) {
            _(util.$('.show_for_edit', this.search_popup))
                .forEach(function (elem) {
                    if (!enable) {
                        elem.setAttribute('disabled', 'disabled');
                        return;
                    }

                    elem.removeAttribute('disabled');
                })
                .commit();
        },

        on_show_create_playlist: function () {
            var text_box = util.$('#freedom_txt_playlist_name', this.search_popup);

            util.$('#freedom_tag_results_items', this.search_popup).add_class('edit_mode');
            util.$('#freedom_save_playlist', this.search_popup).setAttribute('disabled', 'disabled');

            this.toggle_edit(true);
            this.toggle_enable_edit_control(true);

            this.verify_session();

            text_box.focus();
            text_box.value = '';
        },

        verify_session: function () {
            if (!util.$('#freedom_tag_results_items', this.search_popup).has_class('edit_mode')) {
                return;
            }

            util.$('#freedom_login_link', this.search_popup).style.display = !session.user 
                ? 'inline-block' 
                : 'none';

            if (!session.user) {
                _(util.$('.show_for_edit'))
                    .forEach(function (elem) {
                        if (elem.id !== 'freedom_cancel_playlist') {
                            elem.style.display = 'none';
                        }
                    })
                    .commit();
            }
        },

        on_show_search_video: function () {
            this.toggle_edit(false);
            util.$('#freedom_login_link', this.search_popup).style.display = 'none';
            util.$('#freedom_tag_results_items', this.search_popup).remove_class('edit_mode');
        },

        on_save_new_playlist: function () {
            var video_id = [],
                that = this,
                title = util.$('#freedom_txt_playlist_name', this.search_popup).value;

            _(util.$('.freedom_checkbox.fa-check-square-o', this.search_popup))
                .forEach(function (elem) {
                    video_id.push(elem.getAttribute('video_id'));
                })
                .commit();

            this.toggle_enable_edit_control(false);
            util.api('playlists')
                .post(
                {'ACCESS-TOKEN': session.access_token},
                {
                    video_id: video_id.join(),
                    title: title
                }, function (err) {
                    that.toggle_enable_edit_control(true);
                    if (err) {
                        return;
                    }

                    that.on_show_search_video();
                    that.show_notification(util.locale('playlist_has_been_added').replace('?', title));
                });
        },

        show_notification: function (text, timeout) {
            var wrapper = util.$('#appbar-main-guide-notification-container'),
                dom = ['div', {
                        id: 'freedom_notify_popup',
                        class: 'appbar-guide-notification ',
                        role: 'alert'
                    },
                    ['span', {class: 'appbar-guide-notification-content-wrapper yt-valign'},
                        ['span', {class: 'appbar-guide-notification-icon yt-sprite'}],
                        ['span', {class: 'appbar-guide-notification-text-content'},
                            text
                        ]
                    ]
                ],
                body = util.$('body')[0];

            body.add_class('show-guide-button-notification');
            if (wrapper) {
                wrapper.replace(jsonToDOM(dom));
            }

            timeout = timeout ? timeout : 3000;
            if (this.notification_timeout) {
                clearTimeout(this.notification_timeout);
            }

            this.notification_timeout = setTimeout(function () {
                body.remove_class('show-guide-button-notification');
            }, timeout);
        }
    };

    widgets.push(widget);

})();
