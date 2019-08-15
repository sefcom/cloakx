/*globals util, data, jsonToDOM, widgets, location*/

(function () {
    'use strict';

    var widget = {

        name: 'Annotation Tool',
        videos: [],

        initialize: function () {
            var home_body,
                videobar_body;

            if (this.widget_dom) return;

            home_body = ['div', {id: 'annotation_tool_home_body'},
                ['div', {id: 'annotation_tool_toolbar'},
                    ['div', {class: 'annotation_tool_buttons'},
                        ['div', {id: 'annotation_tool_annotations_status'}],
                        ['button', {
                                id: 'annotation_tool_copy_annotation',
                                'data-tooltip-text': util.locale('clone_annotations_tooltip'),
                                class: 'yt-uix-button yt-uix-button-default yt-uix-tooltip'
                            },
                            ['i', {class: 'fa fa-copy'}],
                            ['span', util.locale('clone_annotations')]
                        ],
                        ['div', {
                                id: 'annotation_tool_delete_popup_wrap'
                            },
                            ['button', {
                                    id: 'annotation_tool_delete_trigger',
                                    class: 'yt-uix-button yt-uix-button-default'
                                },
                                ['i', {class: 'fa fa-remove'}],
                                ['span', util.locale('remove_annotations')],
                                ['i', {class: 'fa fa-caret-down'}]
                            ],
                            ['ul', {id: 'annotation_tool_delete_popup'},
                                ['li', {
                                        id: 'annotation_tool_delete_annotation',
                                        'data-tooltip-text': util.locale('remove_annotations_tooltip'),
                                        class: 'yt-uix-tooltip'
                                    },
                                    util.locale('remove_copied_annotations')
                                ],
                                ['li', {
                                        id: 'annotation_tool_delete_all_annotation',
                                        'data-tooltip-text': util.locale('remove_all_annotations_tooltip'),
                                        class: 'yt-uix-tooltip'
                                    },
                                    util.locale('remove_all_annotations')
                                ]
                            ]
                        ],
                        ['button', {
                                id: 'annotation_tool_edit_videobar',
                                'data-tooltip-text': util.locale('program_videobar_tooltip'),
                                class: 'yt-uix-button yt-uix-button-default yt-uix-tooltip'
                            },
                            ['i', {class: 'fa fa-play-circle'}],
                            ['span', util.locale('program_videobar')]
                        ]
                    ]
                ],
                ['div', {id: 'annotation_tool_sub_toolbar'},
                    ['div', {
                            class: 'freedom_tag_input_wrapper'
                        },
                        ['input', {
                            id: 'txt_annotation_tool_search',
                            placeholder: util.locale('search_my_videos')
                        }],
                        ['i', {class: 'fa fa-search'}]
                    ],
                    ['div', {class: 'freedom_annotation_select_option'},
                        ['a', {id: 'freedom_annotation_select_all'}, util.locale('select_all')],
                        ['span', ' / '],
                        ['a', {id: 'freedom_annotation_deselect_all'}, util.locale('deselect_all')]
                    ]
                ],
                ['div', {class: 'annotation_tool_video_list_wrap'},
                    ['ul', {id: 'annotation_tool_video_list'}],
                    ['div', {class: 'loading'}, util.locale('loading')],
                    ['a', {
                            id: 'annotation_tool_show_more',
                            style: 'display: none'
                        },
                        util.locale('see_more_results')
                    ]
                ]
            ];

            videobar_body = ['div', {id: 'annotation_tool_videobar_body'},
                ['div', {id: 'videobar_toolbar'},
                    ['div', {class: 'annotation_tool_buttons'},
                        ['button', {
                                id: 'edit_videobar_back',
                                'data-tooltip-text': util.locale('videobar_return_description'),
                                class: 'yt-uix-button yt-uix-button-default yt-uix-tooltip'
                            },
                            ['i', {class: 'fa fa-angle-double-left'}],
                            ['span', util.locale('return')]
                        ],
                        ['button', {
                                id: 'edit_videobar_save',
                                'data-tooltip-text': util.locale('videobar_save_description'),
                                class: 'yt-uix-button yt-uix-button-default yt-uix-tooltip'
                            },
                            ['i', {class: 'fa fa-floppy-o'}],
                            ['span', util.locale('save')]
                        ]
                    ]
                ],
                ['div', {
                        id: 'annotation_tool_videobar_container'
                    },
                    this.create_videobar_button('videobar_skip_ahead', util.locale('skip_ahead'), {
                        videobar_button_body: ['div', {class: 'videobar_button_body'},
                            ['div', {id: 'videobar_skip_ahead_buttons'}],
                            ['div', ['button', {
                                    id: 'videobar_skip_ahead_add',
                                    class: 'yt-uix-button yt-uix-button-default'
                                },
                                ['i', {class: 'fa fa-plus'}],
                                ['span', util.locale('add')]
                            ]]
                        ],
                        is_link: false,
                        description: util.locale('skip_ahead_description')
                    }),
                    this.create_videobar_button('videobar_skip1', util.locale('skip_1'), {
                        is_link: false,
                        description: util.locale('skip_1_description')
                    }),
                    this.create_videobar_button('videobar_skip2', util.locale('skip_2'), {
                        is_link: false
                    }),
                    this.create_videobar_button('videobar_skip3', util.locale('skip_3'), {
                        is_link: false
                    }),
                    this.create_videobar_button('videobar_star', util.locale('star'), {
                        is_link: true,
                        description: util.locale('videobar_star_description')
                    }),
                    this.create_videobar_button('videobar_next', util.locale('next_video'), {
                        is_link: true,
                        description: util.locale('videobar_next_description')
                    }),
                    this.create_videobar_button('videobar_hide', util.locale('hide_videobar'), {
                        is_link: true,
                        description: util.locale('videobar_hide_videobar_description')
                    })
                ]
            ];

            this.widget_dom = jsonToDOM(['div', {
                    id: 'annotation_tool_container'
                },
                ['span', {id: 'annotation_tool_icon'}],
                ['div', {id: 'annotation_tool_popup'},
                    ['div', {id: 'annotation_tool_header'},
                        util.locale('annotation_tool_header')
                    ],
                    ['div', {id: 'annotation_tool_body'},
                        home_body,
                        videobar_body,
                        ['div', {id: 'annotation_tool_status_bar'},
                            ['span', {id: 'annotation_tool_selecteds_status'},
                                util.locale('numbers_videos_selected').replace('?', 0)
                            ],
                            ['span', {id: 'annotation_tool_copy_status'}]
                        ]
                    ]
                ]
            ]);

            this.add_event_handlers();
        },

        start: function () {
            if (!settings.annotation_tool || !this.get_own_channel_id()) {
                return;
            }

            this.render();
        },

        remove: function () {
            if (util.$('#annotation_tool_container')) {
                util.$('#annotation_tool_container').remove();
            }
        },

        render: function () {
            if (!this.get_own_channel_id()) return;

            util.$wait('#annotation_tool_container_place_holder', function (err, ele) {
                if (err || !ele || util.$('#annotation_tool_container')) {
                    return;
                }

                ele.replace(widget.widget_dom);
            });
        },

        add_event_handlers: function () {
            var that = this,
                change_timeout,

                on_close_popup = function () {
                    util.$('#annotation_tool_container').remove_class('show');
                    document.removeEventListener('click', on_close_popup);
                },

                on_show_popup = function () {
                    that.refresh_data();

                    util.$('#annotation_tool_container').add_class('show');
                    document.addEventListener('click', on_close_popup);
                },

                on_hide_delete_menu = function () {
                    util.$('#annotation_tool_delete_popup_wrap').remove_class('show');
                    that.widget_dom.removeEventListener('click', on_close_popup);
                },

                on_show_delete_menu = function (evt) {
                    util.$('#annotation_tool_delete_popup_wrap').add_class('show');
                    that.widget_dom.addEventListener('click', on_hide_delete_menu);

                    evt.stopPropagation();
                };

            this.widget_dom.addEventListener('click', function (evt) {
                evt.stopPropagation();
            });

            util.$('#annotation_tool_show_more', this.widget_dom)
                .addEventListener('click', function () {
                    clearTimeout(change_timeout);
                    this.style.display = 'none';
                    that.load_videos(true);
                });

            util.$('#txt_annotation_tool_search', this.widget_dom)
                .addEventListener('keyup', function () {
                    if (this.value === this.old_text) {
                        return;
                    }

                    this.old_text = this.value;

                    clearTimeout(change_timeout);
                    change_timeout = setTimeout(function () {
                        that.render_videos();
                        that.update_selection_status();
                    }, 300);
                });

            util.$('#annotation_tool_copy_annotation', this.widget_dom)
                .addEventListener('click', function () {
                    that.copy_annotations();
                });

            util.$('#annotation_tool_delete_annotation', this.widget_dom)
                .addEventListener('click', function () {
                    that.delete_annotations();
                });

            util.$('#annotation_tool_delete_all_annotation', this.widget_dom)
                .addEventListener('click', function () {
                    that.delete_annotations(true);
                });

            util.$('#edit_videobar_save', this.widget_dom)
                .addEventListener('click', function () {
                    that.save_videobar_annotations();
                });

            util.$('#edit_videobar_back', this.widget_dom)
                .addEventListener('click', function () {
                    util.$('#annotation_tool_body', this.widget_dom)
                        .remove_class('edit_videobar');
                });

            util.$('#annotation_tool_edit_videobar', this.widget_dom)
                .addEventListener('click', function () {
                    that.create_videobar_template();
                    util.$('#annotation_tool_body', this.widget_dom)
                        .add_class('edit_videobar');
                });

            util.$('#annotation_tool_icon', this.widget_dom)
                .addEventListener('click', on_show_popup);

            util.$('#annotation_tool_delete_trigger', this.widget_dom)
                .addEventListener('click', on_show_delete_menu);

            util.$('#videobar_skip_ahead_add', this.widget_dom)
                .addEventListener('click', function () {
                    that.add_skip_ahead();
                });

            util.$('#freedom_annotation_select_all', this.widget_dom)
                .addEventListener('click', function () {
                    that.select_all_video(true);
                });

            util.$('#freedom_annotation_deselect_all', this.widget_dom)
                .addEventListener('click', function () {
                    that.select_all_video(false);
                });
        },

        select_all_video: function (selected) {
            _(util.$('#annotation_tool_video_list > li'))
                .forEach(function (li) {
                    li.remove_class('deleted');
                    li.remove_class('copied');

                    if (selected) {
                        li.add_class('selected');
                    }
                    else {
                        li.remove_class('selected');
                    }
                })
                .commit();

            this.update_selection_status();
        },

        load_videos: function (is_append) {
            var that = this,
                wrap = util.$('.annotation_tool_video_list_wrap', this.widget_dom)[0],
                option = {
                    channel_id: this.get_own_channel_id(),
                    limit: 20
                };

            if (this.no_more_result || wrap.has_class('loading')) {
                return;
            }

            if (this.playlist_id) {
                option.page_token = this.page_token;
                option.playlist_id = this.playlist_id;
            }

            if (!option.channel_id && !option.playlist_id) {
                return;
            }

            wrap.add_class('loading');

            util.api('uploaded_videos')(option)
                .get(function (err, result) {
                    wrap.remove_class('loading');

                    if (err) {
                        that.no_more_result = true;
                        return;
                    }

                    that.page_token = result.nextPageToken;
                    that.playlist_id = result.playlistId;
                    if (!result.nextPageToken) {
                        that.no_more_result = true;
                    }

                    that.videos = that.videos.concat(result.items);
                    that.render_videos(is_append ? result.items : null);
                });
        },

        render_videos: function (videos) {
            var that = this,
                filter = util.$('#txt_annotation_tool_search', this.widget_dom).value,
                video_list = util.$('#annotation_tool_video_list', this.widget_dom),
                show_more = util.$('#annotation_tool_show_more', this.widget_dom),
                all_stats = ['selected', 'annotation_copied', 'videobar_saved', 'deleted'],

                on_select_video = function () {
                    var li = util.bind_elem_functions(this);

                    if (li.has_class('selected')) {
                        _(all_stats)
                            .forEach(function (stat) {
                                li.remove_class(stat);
                            })
                            .commit();

                        that.update_processing_status_text('');
                    }
                    else {
                        li.add_class('selected');
                    }

                    that.update_selection_status();
                };

            // reset mode
            if (!videos) {
                videos = this.videos;

                _(util.$('li', video_list))
                    .forEach(function (li) {
                        li.remove();
                    })
                    .commit();
            }

            if (filter) {
                filter = filter.toLowerCase();

                videos = _(videos)
                    .filter(function (video) {
                        return ~video.snippet.title.toLowerCase().indexOf(filter);
                    })
                    .value();
            }

            _(videos)
                .forEach(function (item) {
                    video_list.appendChild(jsonToDOM(['li', {
                            onclick: on_select_video,
                            video_id: item.id
                        },
                        ['div', {
                                class: 'annotation_tool_item_wrap'
                            },
                            ['div', {
                                    class: 'annotation_tool_item_img_wrap'
                                },
                                ['img', {src: item.snippet.thumbnails.default.url}],
                                ['span', {class: 'video_time'},
                                    that.get_duration_display(item.contentDetails.duration)
                                ]
                            ],
                            ['div', {
                                    class: 'annotation_tool_item_title_wrap'
                                },
                                ['a', {
                                        class: 'yt-uix-tooltip',
                                        'data-tooltip-text': item.snippet.title,
                                        href: 'https://www.youtube.com/watch?v=' + item.id + '&hb=annotation_tool'
                                    },
                                    item.snippet.title
                                ]
                            ],
                            ['i', {class: 'fa fa-check'}]
                        ]
                    ]));
                })
                .commit();

            show_more.style.display = this.no_more_result ? 'none' : 'block';
        },

        get_auth_token: function (video_id, callback) {
            var that = this;

            that.update_processing_status_text(util.locale('retrieving_access_token'));

            chrome.runtime.sendMessage({
                message: 'get_auth_token',
                video_id: video_id
            }, function (response) {
                that.auth_token = response;

                that.set_button_status();
                that.update_processing_status_text(!response ? util.locale(
                    'please_login_to_youtube_to_continue') : '');

                callback(response);
            });
        },

        load_annotations: function () {
            var that = this;

            that.update_annotation_status(util.locale('detecting_source_video_annotation'));

            chrome.runtime.sendMessage({
                message: 'get_video_annotation',
                video_id: util.parse_qs().v
            }, function (response) {
                that.src_video.annotations = response;

                if (response) {
                    that.update_annotation_status(util.locale('annotation_found'), 'success');
                }
                else {
                    that.update_annotation_status(util.locale('annotation_not_found'), 'warn');
                }

                that.set_button_status();
            });
        },

        setup_for_processing: function (callback) {
            var remove_class = function (li) {
                _(['videobar_saved', 'annotation_copied', 'deleted'])
                    .forEach(function (stat) {
                        li.remove_class(stat);
                    })
                    .commit();
            };

            this.reset_progress();
            this.processing_videos = this.get_videos_for_processing();

            if (!this.processing_videos.length) {
                return;
            }

            _(util.$('li', util.$('#annotation_tool_video_list', this.widget_dom)))
                .forEach(remove_class)
                .commit();

            this.get_auth_token(this.processing_videos[0].id, callback);
        },

        process_video_annotations: function (request, option, reward_action) {
            var that = this,
                cont = true;

            this.show_loading_panel();

            this.setup_for_processing(function (token) {
                request.token = token;

                _(that.processing_videos)
                    .forEach(function (video) {
                        if (!cont) {
                            that.hide_loading_panel();
                            return;
                        }

                        request.video = video;
                        that.update_processing_status_text(option.loading_message);

                        chrome.runtime.sendMessage(request, function (response) {
                            if (!response) {
                                cont = false;
                                that.hide_loading_panel();
                                return;
                            }

                            that.update_progress(video, option.status, reward_action);
                        });
                    })
                    .commit();
            });
        },

        copy_annotations: function () {
            this.process_video_annotations(
                {
                    message: 'copy_annotation',
                    src_video: this.src_video,
                    metadata: {
                        channel_id: this.get_own_channel_id(),
                        google_plus_user_id: this.get_google_plus_id()
                    }
                },
                {
                    loading_message: util.locale('annotation_copying'),
                    status: 'annotation_copied'
                },
                _.noop
            );
        },

        delete_annotations: function (delete_all) {
            this.process_video_annotations(
                {
                    message: 'delete_annotation',
                    delete_all: delete_all
                },
                {
                    loading_message: util.locale('annotation_deleting'),
                    status: 'deleted'
                }
            );
        },

        save_videobar_annotations: function () {
            this.process_video_annotations(
                {
                    message: 'make_videobar',
                    template: this.videobar_template
                },
                {
                    loading_message: util.locale('saving_videobar_annotations'),
                    status: 'videobar_saved'
                },
                _.noop
            );
        },

        update_annotation_status: function (message, status) {
            var wrap = util.$('#annotation_tool_annotations_status', this.widget_dom);

            if (!status) {
                wrap.setAttribute('class', '');
            }
            else {
                wrap.add_class(status);
            }

            wrap.replace(jsonToDOM(['i', {
                class: 'fa fa-comment-o ' + status
            }]));

            wrap.appendChild(document.createTextNode(message));
        },

        get_google_plus_id: function () {
            var link = util.$('.yt-masthead-picker-photo-wrapper');

            if (!link.length) {
                return '';
            }

            return link[0].getAttribute('href').replace('https://plus.google.com/u/0/', '');
        },

        get_own_channel_id: function () {
            var link = util.$('#watch-discussion .user-avatar .video-thumb');

            if (data.own_channel_id) {
                return data.own_channel_id;
            }

            if (!link.length) {
                return '';
            }

            return link[0].getAttribute('data-ytid');
        },

        update_progress: function (video, status, reward_action) {
            var li = util.$('#annotation_tool_video_list li.selected[video_id="' +
                    video.id + '"]', this.widget_dom)[0],
                processed,
                total = this.processing_videos.length;

            if (li) {
                li.add_class(status);
            }

            processed = util.$('#annotation_tool_video_list li.selected.' + status,
                this.widget_dom).length;

            if (total === processed) {
                this.update_processing_status_text(processed + ' ' + util.locale(status),
                    jsonToDOM(['i', {class: 'fa fa-check ' + status}]));


                this.hide_loading_panel();

                if (status === 'videobar_saved') {
                    util.$('#annotation_tool_body', this.widget_dom)
                        .remove_class('edit_videobar');
                }

                reward_action && reward_action();
            }
        },

        update_processing_status_text: function (message, icon) {
            var label = util.$('#annotation_tool_copy_status', this.widget_dom);

            label.replace(document.createTextNode(''));

            if (icon) {
                label.appendChild(icon);
            }

            if (message) {
                label.appendChild(document.createTextNode(message));
            }
        },

        get_videos_for_processing: function () {
            var that = this,
                videos = _(this.videos)
                .filter(function (v) {
                    return util.$('#annotation_tool_video_list li.selected[video_id="' +
                        v.id + '"]', that.widget_dom)[0];
                })
                .value();

            return videos;
        },

        load_src_video: function () {
            var that = this;

            if (!this.is_watching()) {
                this.update_annotation_status(util.locale('annotation_not_found'), 'warn');
                return;
            }

            this.update_annotation_status(util.locale('retrieving_source_video_information'));

            util.api('video_details')({
                    video_id: util.parse_qs().v
                })
                .get(function (err, result) {
                    if (err || !result.length) {
                        return;
                    }

                    that.src_video = result[0];
                    that.load_annotations();
                });
        },

        update_selection_status: function () {
            var lis = util.$('#annotation_tool_video_list li.selected', this.widget_dom),
                label = util.$('#annotation_tool_selecteds_status', this.widget_dom);

            label.replace(jsonToDOM(['i', {class: 'fa fa-check'}]));
            label.appendChild(document.createTextNode(
                util.locale('numbers_videos_selected').replace('?', lis.length)));

            this.set_button_status();
        },

        reset_progress: function () {
            this.update_processing_status_text('');
            this.progress = 0;
        },

        set_button_status: function () {
            var has_annotation = this.src_video && this.src_video.annotations,
                has_selected = util.$('#annotation_tool_video_list li.selected', this.widget_dom).length;

            _(util.$('.annotation_tool_buttons button', this.widget_dom))
                .forEach(function (button) {
                    var status = has_selected;

                    if (button.id === 'annotation_tool_copy_annotation') {
                        status = has_selected && has_annotation;
                    }

                    if (!status) {
                        button.setAttribute('disabled', 'disabled');
                        return;
                    }

                    button.removeAttribute('disabled');
                })
                .commit();

            if (util.$('#annotation_tool_delete_trigger', this.widget_dom)
                .getAttribute('disabled')) {
                util.$('#annotation_tool_delete_popup_wrap', this.widget_dom)
                    .remove_class('show');
            }
        },

        is_watching: function () {
            return location.pathname === '/watch';
        },

        refresh_data: function () {
            var video_list = util.$('#annotation_tool_video_list', this.widget_dom),
                show_more = util.$('#annotation_tool_show_more', this.widget_dom);

            _(util.$('li', video_list))
                .forEach(function (li) {
                    li.remove();
                })
                .commit();

            show_more.style.display = 'none';
            this.reset_progress();
            this.update_selection_status();
            this.hide_loading_panel();

            this.playlist_id = null;
            this.page_token = null;
            this.videos = [];
            this.src_video = null;
            this.no_more_result = false;

            this.set_button_status();
            this.load_videos();
            this.load_src_video();

            util.$('#annotation_tool_body', this.widget_dom)
                .remove_class('edit_videobar');
        },

        get_duration_display: function (duration) {
            var d = moment.duration(duration),
                h = d.hours(),
                m = d.minutes(),
                s = d.seconds();

            return (h > 0 ? h + ':' : '') + m + ':' + s;
        },

        show_loading_panel: function () {
            var is_loading = util.$('.saving_panel', this.widget_dom)[0];

            if (is_loading) {
                return;
            }

            util.$('#annotation_tool_popup', this.widget_dom).appendChild(jsonToDOM(['div', {
                class: 'saving_panel'
            }]));
        },

        hide_loading_panel: function () {
            var panel = util.$('.saving_panel', this.widget_dom)[0];

            if (panel) {
                panel.remove();
            }
        },

        create_videobar_template: function () {
            this.videobar_template = {
                videobar_skip_ahead: {
                    buttons: []
                },
                videobar_skip1: {
                    text: '',
                    skip_to: ''
                },
                videobar_skip2: {
                    text: '',
                    skip_to: ''
                },
                videobar_skip3: {
                    text: '',
                    skip_to: ''
                },
                videobar_star: {
                    text: '',
                    url: ''
                },
                videobar_next: {
                    text: '',
                    url: ''
                },
                videobar_hide: {
                    text: '',
                    url: ''
                }
            };

            this.update_processing_status_text('');

            util.$('#videobar_skip_ahead_buttons', this.widget_dom).replace(
                document.createTextNode(''));

            _(util.$('#annotation_tool_videobar_container input', this.widget_dom))
                .forEach(function (txt) {
                    txt.value = '';
                })
                .commit();

            _(util.$('.videobar_button.collapsed', this.widget_dom))
                .forEach(function (button) {
                    button.remove_class('collapsed');
                })
                .commit();

            this.add_skip_ahead();
        },

        add_skip_ahead: function () {
            var that = this,
                videobar_skip_ahead = this.videobar_template.videobar_skip_ahead,
                new_id = 'videobar_skip_ahead_' +
                videobar_skip_ahead.buttons.length + 1,
                suggest_time = '0:30',
                last_button,
                txt,

                on_title_change = function () {
                    var button_id = this.getAttribute('button_id'),
                        button;

                    button = _(that.videobar_template.videobar_skip_ahead.buttons)
                        .find({id: button_id});

                    if (button) {
                        button.text = this.value;
                    }
                },

                on_time_change = function () {
                    var button_id = this.getAttribute('button_id'),
                        button;

                    button = _(that.videobar_template.videobar_skip_ahead.buttons)
                        .find({id: button_id});

                    if (button) {
                        button.skip_to = this.value;
                    }
                },

                on_remove = function () {
                    var button_id = this.getAttribute('button_id');

                    _(that.videobar_template.videobar_skip_ahead.buttons)
                        .remove(function (btn) {
                            return btn.id === button_id;
                        })
                        .commit();

                    this.parentElement.remove();
                };

            if (videobar_skip_ahead.buttons.length) {
                last_button = videobar_skip_ahead.buttons[videobar_skip_ahead.buttons.length - 1];
            }

            if (last_button) {
                suggest_time = util.seconds_to_hms(
                    util.hms_to_seconds(last_button.skip_to) + 30);
            }

            videobar_skip_ahead.buttons.push({
                id: new_id,
                skip_to: suggest_time,
                text: util.locale('skip_ahead_default_text')
            });

            util.$('#videobar_skip_ahead_buttons', this.widget_dom)
                .appendChild(jsonToDOM(
                    ['div', {
                            class: 'videobar_skip_ahead_button'
                        },
                        ['div', {
                                class: 'freedom_tag_input_wrapper text'
                            },
                            ['input', {
                                class: 'txt_videobar_button_title',
                                button_id: new_id,
                                placeholder: util.locale('enter_button_title'),
                                onchange: on_title_change,
                                value: util.locale('skip_ahead_default_text')
                            }]
                        ],
                        ['div', {class: 'freedom_tag_input_wrapper text'},
                            ['input', {
                                class: 'txt_videobar_button_time',
                                placeholder: '00:00:00',
                                button_id: new_id,
                                onchange: on_time_change,
                                value: suggest_time
                            }]
                        ],
                        ['a', {
                                button_id: new_id,
                                onclick: on_remove,
                                style: 'display:' + (videobar_skip_ahead.buttons.length === 1 ?
                                    'none' : 'inline-block')
                            },
                            ['i', {class: 'fa fa-times'}]
                        ]
                    ]
                ));

            txt = util.$('.txt_videobar_button_title[button_id="' + new_id + '"]',
                this.widget_dom)[0];
            txt.focus();
            txt.select();
        },

        create_videobar_button: function (id, title, option) {
            var that = this,

                on_videobar_button_title_change = function () {
                    var button_id = this.getAttribute('button_id');

                    that.videobar_template[button_id].text = this.value;
                },

                on_videobar_button_time_change = function () {
                    var button_id = this.getAttribute('button_id');

                    that.videobar_template[button_id].skip_to = this.value;
                },

                on_videobar_button_url_change = function () {
                    var button_id = this.getAttribute('button_id');

                    that.videobar_template[button_id].url = this.value;
                },

                toggle_expand_collapse = function () {
                    var div = util.bind_elem_functions(this.parentElement);

                    if (div.has_class('collapsed')) {
                        div.remove_class('collapsed');
                        return;
                    }

                    div.add_class('collapsed');
                },

                link_input = ['input', {
                    class: 'txt_videobar_button_url',
                    button_id: id,
                    placeholder: option.url_text ? option.url_text : util.locale('enter_button_url'),
                    onchange: on_videobar_button_url_change
                }],

                time_input = ['input', {
                    class: 'txt_videobar_button_time',
                    button_id: id,
                    placeholder: '00:00:00',
                    onchange: on_videobar_button_time_change
                }],

                videobar_button_body = ['div', {
                        class: 'videobar_button_body'
                    },
                    ['div', {
                            class: 'freedom_tag_input_wrapper text'
                        },
                        ['input', {
                            class: 'txt_videobar_button_title',
                            button_id: id,
                            placeholder: util.locale('enter_button_title'),
                            onchange: on_videobar_button_title_change
                        }]
                    ],
                    ['div', {
                            class: 'freedom_tag_input_wrapper text'
                        },
                        option.is_link ? link_input : time_input
                    ]
                ],

                result = ['div', {
                        id: id,
                        class: 'videobar_button'
                    },
                    ['div', {
                            class: 'videobar_button_title',
                            onclick: toggle_expand_collapse
                        },
                        ['span', title],
                        ['i', {class: 'fa fa-caret-square-o-up'}],
                        ['i', {class: 'fa fa-caret-square-o-down'}]
                    ]
                ];

            if (option.description) {
                result.push(['div', {
                        class: 'videobar_button_desc'
                    },
                    option.description
                ]);
            }

            result.push(option.videobar_button_body ?
                option.videobar_button_body :
                videobar_button_body);

            return result;
        },

        settings_changed : function (change) {
            if (change.annotation_tool && !settings.annotation_tool) {
                this.remove();
            }
        },

        integrity: function () {
            return util.$('#annotation_tool_container');
        }
    };

    widgets.push(widget);

})();

