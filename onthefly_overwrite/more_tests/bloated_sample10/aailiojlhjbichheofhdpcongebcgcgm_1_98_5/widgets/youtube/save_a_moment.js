/*globals, widgets, settings, util, jsonToDOM*/

(function () {

    'use strict';

    var widget = {

        name: 'Save moment',

        container: '#save_a_moment_container',
        popup_selector: '#save_moment_popup',
        playlists: [],

        range_slider_thumb_width: 22,
        comment_max_len: 100,

        initialize: function () {
            var login_link = util.get_login_link(location.href),
                is_logged_in = session.user;

            if (this.save_a_moment_dom) {
                return;
            }

            this.shortcut_dom = jsonToDOM(['button', {
                    id: 'save_moment_button_shortcut',
                    class: 'yt-uix-tooltip',
                    'data-tooltip-text': util.locale('save_your_favorite_moment'),
                    onclick: this.show_save_popup
                },
                ['span', {class: 'yt-uix-button-content'},
                    ['i', {class: 'fa fa-plus'}]
                ]
            ]);

            this.save_a_moment_dom = jsonToDOM(['div', {
                    id: this.container.slice(1),
                    class: 'yt-uix-menu'
                },
                ['div', {class: 'yt-uix-menu-trigger'},
                    ['button', {
                            class: 'yt-uix-button yt-uix-button-size-default yt-uix-button-opacity ' +
                                'yt-uix-button-has-icon no-icon-markup yt-uix-videoactionmenu-button ' +
                                'yt-uix-tooltip yt-uix-button-toggled',
                            id: 'save_moment_button',
                            'data-tooltip-text': util.locale('save_your_favorite_moment')
                        },
                        ['i', {class: 'fa fa-plus'}],
                        ['span', util.locale('add_moment')]
                    ]
                ],
                ['div', {id: 'save_moment_popup', class: 'freedom_popup freedom_hid'},
                    ['h3', util.locale('pick_a_moment')],
                    ['div', {class: 'save_moment_pick_a_moment_wrapper'},
                        ['section', {class: 'range_slider_value'},
                            ['label', {id: 'save_moment_start_at_value'}, '0'],
                            ['label', {id: 'save_moment_end_at_value'}, '0']
                        ],
                        ['section', {class: 'range_slider'},
                            ['input', {
                                id: 'save_moment_start_at',
                                type: 'range',
                                min: '0'
                            }],
                            ['input', {
                                id: 'save_moment_end_at',
                                type: 'range',
                                min: '0'
                            }],
                            ['div', {
                                    id: 'save_moment_preview',
                                    class: 'ytp-tooltip ytp-bottom ytp-preview'
                                },
                                ['div', {class: 'ytp-tooltip-bg'}],
                                ['div', {class: 'ytp-tooltip-duration'}]
                            ]
                        ],
                        ['section', {class: 'save_moment_comment_wrap'},
                            ['label',
                                util.locale('comment'),
                                ['span', {id: 'comment_char_counter'},
                                    util.locale('num_chars_remaining').replace('?', this.comment_max_len)
                                ]
                            ],
                            ['textarea', {
                                id: 'save_moment_comment',
                                onkeyup: this.on_typing_comment,
                                maxlength: this.comment_max_len
                            }]
                        ],
                        ['section', {class: 'save_moment_player'},
                            ['button', {
                                    id: 'save_moment_btn_play',
                                    class: 'yt-uix-button yt-uix-button-size-default yt-uix-button-default'
                                },
                                ['span', {class: 'play'},
                                    ['i', {class: 'fa fa-play'}],
                                    util.locale('play_moment')
                                ],
                                ['span', {class: 'stop'},
                                    ['i', {class: 'fa fa-stop'}],
                                    util.locale('stop')
                                ]
                            ],
                            ['button', {
                                    id: 'save_new_moment',
                                    class: 'yt-uix-button yt-uix-button-size-default yt-uix-button-default',
                                    onclick: this.add_new_moment
                                },
                                ['i', {class: 'fa fa-floppy-o'}],
                                util.locale('save_moment')
                            ]
                        ]
                    ],
                    ['p', {class: 'add_to_playlist_title'},
                        util.locale('add_moment_to_playlist')
                    ],
                    ['div', {
                            id: 'save_moment_login',
                            style: !is_logged_in ? 'display:block' : 'display:none'
                        },
                        ['a', {href: login_link}, util.locale('save_moment_login_link')]
                    ],
                    ['div', {
                            id: 'save_moment_authorized',
                            style: is_logged_in ? 'display:block' : 'display:none'
                        },
                        ['div', {class: 'addto-search-playlist-section'},
                            ['span', {
                                    class: 'yt-uix-form-input-container ' +
                                        'yt-uix-form-input-text-container ' +
                                        'yt-uix-form-input-fluid-container'
                                },
                                ['span', {class: 'yt-uix-form-input-fluid'},
                                    ['input', {
                                        id: 'save_moment_search_playlist',
                                        title: util.locale('enter_playlist_name_to_search'),
                                        maxlength: '60',
                                        class: 'yt-uix-form-input-text addto-search-box'
                                    }]
                                ]
                            ],
                            ['span', {class: 'search-icon yt-sprite'}]
                        ],
                        ['div', {id: 'save_moment_list_wrapper'},
                            ['ul', {
                                role: 'menu',
                                id: 'play_list_container',
                                class: 'yt-uix-kbd-nav yt-uix-kbd-nav-list'
                            }]
                        ],
                        ['button', {id: 'save_moment_add_new_playlist'},
                            ['span', '+ ' + util.locale('create_new_playlist')]
                        ],
                        ['div', {
                                id: 'save_moment_create_playlist_section',
                                style: 'display: none'
                            },
                            ['div', {class: 'margin_bottom_15'},
                                ['span', {
                                        class: 'title-input-container yt-uix-form-input-container ' +
                                            'yt-uix-form-input-text-container yt-uix-form-input-fluid-container'
                                    },
                                    ['span', {class: ' yt-uix-form-input-fluid'},
                                        ['input', {
                                            id: 'save_moment_new_play_plist_name',
                                            class: 'yt-uix-form-input-text title-input',
                                            maxlength: '150',
                                            title: util.locale('create_new_playlist_tooltip')
                                        }]
                                    ]
                                ]
                            ],
                            ['div', {class: 'clearfix'},
                                ['div', {class: 'create-playlist-buttons'},
                                    ['button', {
                                            id: 'save_moment_add_new_playlist_button',
                                            class: 'yt-uix-button yt-uix-button-size-default yt-uix-button-primary disabled',
                                            type: 'button',
                                            disabled: 'disabled'
                                        },
                                        ['span', {class: 'yt-uix-button-content disabled'}, util.locale('create')]
                                    ]
                                ],
                                ['button', {
                                        id: 'save_moment_privacy_list_button',
                                        'aria-expanded': 'false',
                                        type: 'button',
                                        class: 'yt-uix-button yt-uix-button-default yt-uix-button-size-default ' +
                                            'yt-uix-button-has-icon no-icon-markup',
                                        'aria-haspopup': 'true',
                                        'data-button-menu-indicate-selected': 'true',
                                        'data-button-has-sibling-menu': 'true'
                                    },
                                    ['span', {class: 'yt-uix-button-content'}, util.locale('public')],
                                    ['span', {class: 'yt-uix-button-arrow yt-sprite'}],
                                    ['div', {
                                            id: 'save_moment_privacy_list_menu',
                                            class: 'yt-uix-button-menu yt-uix-button-menu-default',
                                            'style': 'display: none'
                                        },
                                        ['ul', {
                                                class: 'create_playlist_widget_privacy_menu yt-uix-kbd-nav yt-uix-kbd-nav-list',
                                            },
                                            ['li', {
                                                    role: 'menuitem',
                                                    'data-value': 'public',
                                                    'data-text': util.locale('public'),
                                                    class: 'privacy-option selected'
                                                },
                                                ['span', {class: 'yt-uix-button-menu-item'}, util.locale('public')]
                                            ],
                                            ['li', {
                                                    role: 'menuitem',
                                                    'data-value': 'unlisted',
                                                    'data-text':  util.locale('unlisted'),
                                                    class: 'privacy-option'
                                                },
                                                ['span', {class: 'yt-uix-button-menu-item'}, util.locale('unlisted')]
                                            ],
                                            ['li', {
                                                    role: 'menuitem',
                                                    'data-value': 'private',
                                                    'data-text': util.locale('private'),
                                                    class: 'privacy-option'
                                                },
                                                ['span', {class: 'yt-uix-button-menu-item'}, util.locale('private')]
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]);

            this.listen_events();
        },

        start: function () {
            var qs = util.parse_qs();

            if (!settings.save_moment || location.pathname !== '/watch') {
                this.remove();
                return;
            }

            this.video_id = qs.v;
            this.playlist_id = qs.list;

            this.render();

            this.stop_playing_moment();
            this.start_playing_moment();
        },

        render: function () {
            var control_container = util.$('.ytp-chrome-controls')[0],
                saved_moment_widget = _(widgets).find(function (w) {
                    return w.name && w.name === 'Heartbeat moments';
                });

            if (!control_container || !saved_moment_widget || !saved_moment_widget.plug_save_moment) {
                return;
            }

            saved_moment_widget.plug_save_moment(this.save_a_moment_dom);
            control_container.appendChild(this.shortcut_dom);
        },

        on_session_ready: function () {
            util.$('#save_moment_login', this.save_a_moment_dom).style.display = 
                !session.user
                    ? 'block' 
                    : 'none';

            util.$('#save_moment_authorized', this.save_a_moment_dom).style.display = 
                session.user
                    ? 'block'
                    : 'none';
        },

        remove: function () {
            var progress_bar = util.$('#save_moment_progress_bar');

            if (progress_bar) {
                progress_bar.remove();
            }

            this.shortcut_dom.remove();
            this.save_a_moment_dom.remove();
        },

        integrity: function () {
            var widget = util.bind_elem_functions(this.save_a_moment_dom);

            if (this.is_ads_running()) {
                widget.add_class('disabled');
                this.stop_playing_moment();
            }
            else {
                widget.remove_class('disabled');
                this.start_playing_moment();
            }

            return util.$(this.container)
                && location.pathname === '/watch'
                && this.video_id === util.parse_qs().v;
        },

        is_ads_running: function () {
            return !!util.$('.video-ads .videoAdUi').length;
        },

        start_playing_moment: function () {
            var qs = util.parse_qs();

            if (this.is_playing_moment) {
                return;
            }

            this.is_playing_moment = true;

            if (this.playlist_moment_timeout) {
                clearTimeout(this.playlist_moment_timeout);
            }

            if (qs.hb_moment && qs.t && qs.t2 && !this.is_ads_running()) {
                this.listen_for_moment({
                    video_id: qs.v,
                    start_at: parseInt(qs.t.replace('s', '')),
                    end_at: parseInt(qs.t2.replace('s', ''))
                });

                if (!this.logged) {
                    this.log_views(qs.hb_moment);
                    this.logged = true;
                }
            }
        },

        stop_playing_moment: function () {
            if (this.playlist_moment_timeout) {
                clearTimeout(this.playlist_moment_timeout);
            }

            this.is_playing_moment = false;
            this.remove_moment_progress_bar();
        },

        on_document_scroll: function () {
            var offset = util.get_element_offset(this.target_element),
                popup = util.$('#save_moment_popup'),
                top = offset.top + this.target_element.clientHeight;

            if (popup.has_class('freedom_hid')) {
                document.removeEventListener('scroll', this.on_document_scroll);
                return;
            }

            if (this.target_element.id === 'save_moment_button_shortcut') {
                top -= popup.clientHeight + this.target_element.clientHeight;
            }

            popup.style.top = top + 'px';
            popup.style.left = offset.left + 'px';
        },

        on_typing_comment: function (evt) {
            util.$('#comment_char_counter').innerText = util.locale('num_chars_remaining')
                .replace('?', this.comment_max_len - evt.currentTarget.value.length);
        },

        show_save_popup: function (evt) {
            var widget_dom = util.bind_elem_functions(this.save_a_moment_dom),
                elem = evt.currentTarget,
                offset = util.get_element_offset(elem),
                popup = util.$('#save_moment_popup');

            evt.stopPropagation();

            if (widget_dom.has_class('disabled')) {
                return;
            }

            document.addEventListener('click', this.close_save_popup);

            util.bind_elem_functions(this).add_class('active');
            this.reset_ui();
            this.set_moment_start_at(this.get_video_player().currentTime);
            this.load_playlist();

            _(util.$('.freedom_popup'))
                .forEach(function (pop) {
                    pop.add_class('freedom_hid');
                })
                .commit();
            popup.remove_class('freedom_hid');

            this.target_element = elem;
            this.on_document_scroll();
            document.removeEventListener('scroll', this.on_document_scroll);
            document.addEventListener('scroll', this.on_document_scroll);
        },

        listen_events: function () {
            var that = this,
                filter_timeout,
                widget_dom = util.bind_elem_functions(this.save_a_moment_dom);

            function select_privacy_status(evt) {
                evt.stopPropagation();
                that.select_privacy_status(this);
            }

            util.$('#save_moment_button', widget_dom)
                .addEventListener('click', this.show_save_popup);

            util.$('#save_moment_popup', widget_dom)
                .addEventListener('click', function (evt) {
                    evt.stopPropagation();
                    that.close_privacy_menu();
                });

            // user click on add new playlist button -> show inputs for him
            util.$('#save_moment_add_new_playlist', widget_dom).addEventListener('click',
                function () {
                    util.$('#save_moment_create_playlist_section', widget_dom).style.display = 'block';
                    util.$('#save_moment_add_new_playlist', widget_dom).style.display = 'none';
                    util.$('#save_moment_new_play_plist_name', widget_dom).focus();
                    util.$('#save_moment_add_new_playlist_button', widget_dom).setAttribute(
                        'disabled', 'disabled');
                });

            // show select privacy status menu when adding new playlist
            util.$('#save_moment_privacy_list_button', widget_dom)
                .addEventListener('click', function (evt) {
                    evt.stopPropagation();
                    document.addEventListener('click', that.close_privacy_menu);

                    util.$('#save_moment_privacy_list_menu').style.display = 'block';
                });

            // select privacy status menu item will change button value
            _(util.$('#save_moment_privacy_list_menu' + ' > ul > li', widget_dom))
                .forEach(function (li) {
                    li.addEventListener('click', select_privacy_status);
                })
                .commit();

            // user enter the playlist name -> enable add button
            util.$('#save_moment_new_play_plist_name', widget_dom)
                .addEventListener('keyup', function () {
                    var add_btn = util.$('#save_moment_add_new_playlist_button', widget_dom),
                        name = this.value ? this.value.trim() : '';

                    if (name) {
                        add_btn.remove_class('disabled');
                        add_btn.removeAttribute('disabled');

                        return;
                    }

                    add_btn.add_class('disabled');
                    add_btn.setAttribute('disabled', 'disabled');
                });

            // user click add button -> create new playlist also add the video to it
            util.$('#save_moment_add_new_playlist_button', widget_dom)
                .addEventListener('click', function () {
                    that.add_new_playlist();
                });

            // range slider change event handler
            util.$('#save_moment_start_at', widget_dom)
                .addEventListener('change', function () {
                    that.on_moment_start_change();
                });

            util.$('#save_moment_end_at', widget_dom)
                .addEventListener('change', function () {
                    that.on_moment_end_change();
                });

            util.$('#save_moment_btn_play', widget_dom)
                .addEventListener('click', function () {
                    that.start_playing();
                });

            util.$('#save_moment_search_playlist', widget_dom)
                .addEventListener('keyup', function () {
                    if (this.value === this.old_text) {
                        return;
                    }

                    this.old_text = this.value;

                    clearTimeout(filter_timeout);
                    filter_timeout = setTimeout(function () {
                        that.render_playlist(that.playlists);
                    }, 300);
                });

            _(util.$('.range_slider > input', widget_dom))
                .forEach(function (input) {
                    input.addEventListener('input', function () {
                        that.show_preview(this.value);
                    });
                })
                .commit();

            _(util.$('.range_slider > input', widget_dom))
                .forEach(function (input) {
                    input.addEventListener('change', function () {
                        util.$('#save_moment_preview', widget_dom).remove_class('show');
                    });
                })
                .commit();

            session.on_ready(function () {
                that.on_session_ready();
            });
        },

        log_views: function (id) {
            util.api('hb_moments')
                .put({id: id}, _.noop);
        },

        select_playlist: function (li) {
            var that = this,
                input = this.get_moment_for_save();

            input.playlist_id = li.getAttribute('playlist-id');
            input.title = li.getAttribute('playlist-title');
            input.privacy_status = li.getAttribute('privacy-status');

            this.enable_ui(false);
            util.api('playlist_items')
                .post({'ACCESS-TOKEN': session.access_token}, input, function (err) {
                    var message = util.locale('added_to_playlist_title')
                            .replace('?', li.getAttribute('playlist-title'));

                    that.trigger_on_moment_saved(err, message);
                });
        },

        add_new_moment: function () {
            var that = this,
                input = this.get_moment_for_save();

            this.enable_ui(false);
            util.api('hb_moments')
                .post({'ACCESS-TOKEN': session.access_token}, input, function (err) {
                    that.trigger_on_moment_saved(err, util.locale('save_success'));
                });
        },

        add_new_playlist: function () {
            var that = this,

                btn_privacy = util.$('#save_moment_privacy_list_button', this.save_a_moment_dom),
                txt_name = util.$('#save_moment_new_play_plist_name', this.save_a_moment_dom),

                input = this.get_moment_for_save();

            input.title = txt_name.value;
            input.privacy_status = btn_privacy.value;

            this.enable_ui(false);
            util.api('playlists')
                .post({'ACCESS-TOKEN': session.access_token}, input, function (err) {
                    that.trigger_on_moment_saved(err, util.locale('added_to_playlist_title').replace('?', input.title));
                });
        },

        get_moment_for_save: function () {
            var moment_start_at = new moment.duration(
                    parseInt(util.$('#save_moment_start_at', this.save_a_moment_dom).value), 'seconds').toISOString(),
                moment_end_at = new moment.duration(
                    parseInt(util.$('#save_moment_end_at', this.save_a_moment_dom).value), 'seconds').toISOString(),

                input = {
                    token_id: settings.public_token_id,
                    email: data.email,
                    video_id: util.parse_qs().v,
                    start_at: moment_start_at,
                    end_at: moment_end_at,
                    comment: util.$('#save_moment_comment', this.save_a_moment_dom).value
                };

            return input;
        },

        listen_for_moment: function (info) {
            var that = this,
                video_player = this.get_video_player();

            if (this.playlist_moment_timeout) {
                clearInterval(this.playlist_moment_timeout);
            }

            this.play_moment(info);

            this.playlist_moment_timeout = setInterval(function () {
                if (util.parse_qs().v !== info.video_id) {
                    return;
                }

                if (video_player.currentTime >= info.end_at) {
                    clearTimeout(that.playlist_moment_timeout);

                    that.goto_next_moment(info.video_id);
                }
            }, 500);
        },

        goto_next_moment: function (video_id) {
            var lnk = this.get_playlist_link(video_id),
                video_player = this.get_video_player();

            video_player.pause();

            if (!lnk || !lnk.parentElement || !lnk.parentElement.nextElementSibling) {
                return;
            }

            location.href = util.$('a.playlist-video',
                lnk.parentElement.nextElementSibling)[0].getAttribute('href');
        },

        add_moment_progress_bar: function (info) {
            var progress_bar = util.$('#save_moment_progress_bar'),
                bar_container = util.$('#player-api .ytp-progress-list')[0],
                video_player = this.get_video_player();

            if (!bar_container || !video_player || !video_player.duration) {
                return;
            }

            if (!progress_bar) {
                progress_bar = jsonToDOM(['div', {id: 'save_moment_progress_bar'}]);
                bar_container.appendChild(progress_bar);
            }

            progress_bar.style.left = (info.start_at / video_player.duration * 100) + '%';
            progress_bar.style.transform = 'scaleX(' +
                (info.end_at - info.start_at) / video_player.duration + ')';
        },

        remove_moment_progress_bar: function (info) {
            var progress_bar = util.$('#save_moment_progress_bar');

            if (!progress_bar) {
                return;
            }

            progress_bar.remove();
        },

        get_playlist_link: function (video_id) {
            var link = util.$('#playlist-autoscroll-list li[data-video-id="' +
                video_id + '"] a.playlist-video');

            if (!link.length) {
                return null;
            }

            return link[0];
        },

        load_playlist: function (is_append) {
            var that = this,
                wrapper = util.$('#save_moment_list_wrapper', this.save_a_moment_dom);

            if (!wrapper || !session.user || this.is_loading_playlist) {
                return;
            }

            this.is_loading_playlist = true;

            if (!is_append) {
                wrapper.replace(jsonToDOM(['span', {
                        class: 'loading'
                    },
                    util.locale('loading')
                ]));
            }

            util.api('my_playlists')({
                    channel_id: session.get_channel_id(),
                    page_token: this.pl_page_token ? this.pl_page_token : ''
                })
                .get({'ACCESS-TOKEN': session.access_token}, null, function (err, result) {
                    that.is_loading_playlist = false;

                    if (err || !result) {
                        return;
                    }

                    if (!is_append) {
                        that.playlists = result.items;
                    }
                    else {
                        that.playlists = that.playlists.concat(result.items);
                    }

                    that.pl_page_token = result.nextPageToken;
                    that.render_playlist(result.items, is_append);

                    if (that.pl_page_token) {
                        that.load_playlist(true);
                    }
                });
        },

        render_playlist: function (data, is_append) {
            var that = this,
                wrapper = util.$('#save_moment_list_wrapper', this.save_a_moment_dom),
                playlist_container = util.$('#save_moment_playlist_ul', this.save_a_moment_dom),
                filter = util.$('#save_moment_search_playlist', this.save_a_moment_dom).value.toLowerCase();

            function select_playlist(evt) {
                evt.stopPropagation();
                that.select_playlist(this);
            }

            if (!is_append) {
                if (!data.length) {
                    wrapper.replace(jsonToDOM(['span', {class: 'loading'},
                        util.locale('no_playlist_found')
                    ]));

                    return;
                }

                playlist_container = jsonToDOM([
                    'ul', {
                        id: 'save_moment_playlist_ul',
                        role: 'menu',
                        tabindex: '0',
                        class: 'yt-uix-kbd-nav yt-uix-kbd-nav-list'
                    }
                ]);
                wrapper.replace(playlist_container);
            }

            if (!playlist_container) {
                return;
            }

            _(data)
                .forEach(function (pl) {
                    var title = pl.snippet.title;

                    if (filter && !~title.toLowerCase().indexOf(filter)) {
                        return;
                    }

                    playlist_container.appendChild(jsonToDOM(['li', {
                            class: 'yt-uix-button-menu-item',
                            title: 'Click to add the moment to ?'.replace('?', title),
                            onclick: select_playlist,
                            'playlist-id': pl.id,
                            'playlist-title': title,
                            'privacy-status': pl.status.privacyStatus
                        },
                        ['span', {class: 'playlist-name'}, title],
                        ['span', {
                            class: pl.status.privacyStatus + '-icon yt-sprite',
                            title: pl.status.privacyStatus + ' playlist'
                        }]
                    ]));
                })
                .commit();

            this.on_document_scroll();
        },

        trigger_on_moment_saved: function (err, message) {
            var saved_moment_widget = _(widgets).find(function (w) {
                    return w.name && w.name === 'Heartbeat moments';
                });

            this.enable_ui(true);

            if (err || !saved_moment_widget || !saved_moment_widget.reload_saved_moments) {
                return;
            }

            this.close_save_popup();
            this.show_notification(message);
            util.log_count_per_day('moment_creation');

            saved_moment_widget.reload_saved_moments();
        },

        close_privacy_menu: function () {
            util.$('#save_moment_privacy_list_menu', this.save_a_moment_dom)
                .style.display = 'none';
            document.removeEventListener('click', this.close_privacy_menu);
        },

        get_video_player: function () {
            return util.$('#player video')[0];
        },

        reset_ui: function () {
            var video_player = this.get_video_player(),
                moment_start_at = util.$('#save_moment_start_at', this.save_a_moment_dom),
                moment_end_at = util.$('#save_moment_end_at', this.save_a_moment_dom);

            this.playlists = [];

            util.$('#save_moment_popup', this.save_a_moment_dom).remove_class('freedom_hid');

            // hide add new section by default
            util.$('#save_moment_create_playlist_section', this.save_a_moment_dom)
                .style.display = 'none';
            util.$('#save_moment_add_new_playlist', this.save_a_moment_dom)
                .style.display = 'inline-block';

            // empty playlist name text box
            util.$('#save_moment_new_play_plist_name', this.save_a_moment_dom).value = '';
            util.$('#save_moment_comment', this.save_a_moment_dom).value = '';

            // set default privacy  to public
            util.$('#save_moment_privacy_list_button', this.save_a_moment_dom).value = 'public';
            util.$('#save_moment_privacy_list_menu > ul > li.selected', this.save_a_moment_dom)[0]
                .remove_class('selected');
            util.$('#save_moment_privacy_list_menu > ul > li', this.save_a_moment_dom)[0]
                .add_class('selected');

            // reset range slider
            moment_start_at.setAttribute('max', video_player.duration);
            moment_end_at.setAttribute('max', video_player.duration);
            this.set_moment_start_at(0);
            this.set_moment_end_at(video_player.duration);

            this.stop_playing();
            this.enable_ui(true);
        },

        enable_ui: function (enabled) {
            var block_ui = util.$('#save_moment_block_ui', this.save_a_moment_dom);

            if (enabled) {
                if (block_ui) {
                    block_ui.remove();
                }

                return;
            }

            if (block_ui) {
                return;
            }

            util.$('#save_moment_popup', this.save_a_moment_dom).appendChild(
                jsonToDOM(['div', {id: 'save_moment_block_ui'}]));
        },

        select_privacy_status: function (li) {
            var btn = util.$('#save_moment_privacy_list_button', this.save_a_moment_dom),
                btn_text = util.$('#save_moment_privacy_list_button > span.yt-uix-button-content',
                    this.save_a_moment_dom)[0],
                selected_item = util.$('#save_moment_privacy_list_menu > ul > li.selected',
                    this.save_a_moment_dom)[0],
                item = util.bind_elem_functions(li);

            if (selected_item) {
                selected_item.remove_class('selected');
            }

            if (btn_text) {
                btn_text.innerText = item.getAttribute('data-text');
            }

            item.add_class('selected');
            btn.value = item.getAttribute('data-value');

            this.close_privacy_menu();
        },

        show_notification: function (text, timeout) {
            var wrapper = util.$('#appbar-main-guide-notification-container'),
                body = util.$('body')[0],
                dom = ['div', {
                            id: 'heartbeat_save_a_moment_popup',
                            class: 'appbar-guide-notification',
                            role: 'alert'
                        },
                        ['span', {class: 'appbar-guide-notification-content-wrapper yt-valign'},
                            ['span', {class: 'appbar-guide-notification-icon yt-sprite'}],
                            ['span', {class: 'appbar-guide-notification-text-content'}, text]
                        ]
                    ];

            body.add_class('show-guide-button-notification');

            if (wrapper) {
                wrapper.replace(jsonToDOM(dom));
            }

            if (this.notification_timeout) {
                clearTimeout(this.notification_timeout);
            }

            this.notification_timeout = setTimeout(function () {
                    body.remove_class('show-guide-button-notification');
                }, timeout || 3000);
        },

        stop_playing: function (pause) {
            var btn_play = util.$('#save_moment_btn_play', this.save_a_moment_dom),
                video_player = this.get_video_player();

            if (this.play_timeout) {
                clearTimeout(this.play_timeout);
            }

            this.is_playing = false;

            if (pause) {
                video_player.pause();
            }

            btn_play.remove_class('playing');
        },

        start_playing: function () {
            var that = this,

                btn_play = util.$('#save_moment_btn_play', this.save_a_moment_dom),
                video_player = this.get_video_player(),

                moment_start_at = util.$('#save_moment_start_at', this.save_a_moment_dom),
                moment_end_at = util.$('#save_moment_end_at', this.save_a_moment_dom),

                start_at = parseInt(moment_start_at.value),
                end_at = parseInt(moment_end_at.value);

            if (!this.is_playing) {
                this.is_playing = true;
                btn_play.add_class('playing');

                if (this.play_timeout) {
                    clearTimeout(this.play_timeout);
                }

                // seek to new position
                video_player.currentTime = start_at;
                if (video_player.paused) {
                    video_player.play();
                }

                this.play_timeout = setInterval(function () {
                    if (video_player.currentTime >= end_at) {
                        that.stop_playing(true);
                        video_player.currentTime = end_at;

                        clearTimeout(that.play_timeout);
                    }
                }, 500);
            }
            else {
                this.stop_playing(true);
            }
        },

        play_moment: function (info) {
            var that = this,
                interval_play,
                video_player = this.get_video_player();

            // wait for the video load and seek to new position
            interval_play = setInterval(function () {
                if (!video_player.duration) {
                    return;
                }

                video_player.currentTime = info.start_at;
                that.add_moment_progress_bar(info);
                if (video_player.paused) {
                    video_player.play();
                }

                clearInterval(interval_play);
            }, 100);
        },

        on_moment_start_change: function () {
            var video_player = this.get_video_player(),
                lbl_start = util.$('#save_moment_start_at_value', this.save_a_moment_dom),
                moment_start_at = util.$('#save_moment_start_at', this.save_a_moment_dom),
                moment_end_at = util.$('#save_moment_end_at', this.save_a_moment_dom),

                start_at = parseInt(moment_start_at.value),
                end_at = parseInt(moment_end_at.value),
                delta = Math.ceil(video_player.duration * this.range_slider_thumb_width /
                    moment_start_at.clientWidth);

            lbl_start.innerText = util.seconds_to_hms(start_at);

            if (end_at <= start_at + delta) {
                end_at = start_at + delta > video_player.duration ?
                    video_player.duration : start_at + delta;
                this.set_moment_end_at(end_at);
            }

            // seek to new position
            video_player.currentTime = start_at;
            if (this.is_playing) {
                this.stop_playing(true);
            }
        },

        on_moment_end_change: function () {
            var video_player = this.get_video_player(),
                moment_start_at = util.$('#save_moment_start_at', this.save_a_moment_dom),
                lbl_end = util.$('#save_moment_end_at_value', this.save_a_moment_dom),
                moment_end_at = util.$('#save_moment_end_at', this.save_a_moment_dom),

                start_at = parseInt(moment_start_at.value),
                end_at = parseInt(moment_end_at.value),
                delta = Math.ceil(video_player.duration * this.range_slider_thumb_width /
                    moment_end_at.clientWidth);

            lbl_end.innerText = util.seconds_to_hms(end_at);

            if (end_at <= start_at + delta) {
                start_at = end_at - delta < 0 ? 0 : end_at - delta;
                this.set_moment_start_at(start_at);
            }

            // seek to new position
            video_player.currentTime = end_at;
            if (this.is_playing) {
                this.stop_playing(true);
            }
        },

        set_moment_start_at: function (value) {
            var lbl_start = util.$('#save_moment_start_at_value', this.save_a_moment_dom),
                moment_start_at = util.$('#save_moment_start_at', this.save_a_moment_dom);

            lbl_start.innerText = util.seconds_to_hms(value);
            moment_start_at.value = value;
        },

        set_moment_end_at: function (value) {
            var lbl_end = util.$('#save_moment_end_at_value', this.save_a_moment_dom),
                moment_end_at = util.$('#save_moment_end_at', this.save_a_moment_dom);

            lbl_end.innerText = util.seconds_to_hms(value);
            moment_end_at.value = value;
        },

        close_save_popup: function () {
            util.$('#save_moment_popup').add_class('freedom_hid');
            util.$('#save_moment_button').remove_class('active');
            document.removeEventListener('click', this.close_save_popup);
        },

        duation_to_hms: function (s) {
            return util.seconds_to_hms(moment.duration(s).asSeconds());
        },

        show_preview: function (seconds) {
            var data = this.get_storyboard(),
                widget_dom = this.save_a_moment_dom,
                video_player = this.get_video_player(),
                slider = util.$('.range_slider', widget_dom)[0],
                save_moment_preview = util.$('#save_moment_preview', widget_dom),
                tooltip_bg = util.$('.ytp-tooltip-bg', save_moment_preview)[0],
                tooltip_duration = util.$('.ytp-tooltip-duration', save_moment_preview)[0];

            if (!data) return;

            tooltip_bg.style.width = data.thumb_width + 'px';
            tooltip_bg.style.height = data.thumb_height + 'px';
            tooltip_bg.style.background = this.get_storyboard_preview(seconds);

            tooltip_duration.replace(jsonToDOM(['span', util.seconds_to_hms(seconds)]));

            save_moment_preview.style.left = seconds / video_player.duration * slider.clientWidth
                - data.thumb_width / 2 + 'px';
            save_moment_preview.add_class('show');
        },

        get_storyboard: function () {
            var  data = util.retrieve_window_variables({data: 'ytplayer.config.args.storyboard_spec'}).data,
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

        settings_changed : function (change) {
            if (change.save_moment && !settings.save_moment) {
                this.remove();
            }
        }
    };

    widgets.push(widget);
})();

