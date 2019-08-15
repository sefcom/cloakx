(function () {
    'use strict';

    var widget = {

        name: 'Heartbeat settings',
        container: '#heartbeat_settings_span',

        initialize: function () {
            var version_name = config.version_name
                    ? ' - ' + config.version_name.toUpperCase()
                    : '',
                is_checked = function (attribs, checked) {
                    if (checked) {
                        attribs.checked = true;
                    }
                    return attribs;
                };

            if (util.$('#heartbeat_settings_span')) {
                return;
            }

            this.heartbeat_settings = jsonToDOM(
                ['span', {id: this.container.slice(1)},
                    ['input', {
                        type: 'image',
                        src: config.assets_url + 'logo.png?2',
                        id: 'freedom_heartbeat_button',
                        class: 'hbeat_dropdown'
                    }],

                    ['div', {
                            id: 'freedom_settings_div',
                            class: 'hbeat_dropdown',
                            style: 'display:none'
                        },
                        ['div', {
                                id: 'freedom_settings_header',
                                class: 'hbeat_dropdown'
                            },
                            util.locale('settings') + ' ' + config.version + version_name

                            // ['div', {id: 'freedom_settings_navigator'},
                            //     ['input', {
                            //         type: 'image',
                            //         id: 'heartbeat_move_left',
                            //         onclick: this.move_to_left,
                            //         class: 'hbeat_dropdown',
                            //         src: config.assets_url + 'left-white.png'
                            //     }],
                            //     ['input', {
                            //         type: 'image',
                            //         id: 'heartbeat_move_right',
                            //         onclick: this.move_to_right,
                            //         class: 'hbeat_dropdown',
                            //         src: config.assets_url + 'right-white.png'
                            //     }]
                            // ]

                        ],
                        ['table', {
                                id: 'freedom_settings_body',
                                class: 'hbeat_dropdown'
                            },

                            ['thead', {class: 'hbeat_dropdown'},
                                ['tr', {class: 'hbeat_dropdown'},
                                    ['th', {class: 'hbeat_dropdown'}, util.locale('watch_page')],
                                    ['th', {class: 'hbeat_dropdown'}, util.locale('shortcuts')],
                                ]
                            ],

                            ['tbody', {class: 'hbeat_dropdown'},
                                ['tr', {class: 'hbeat_dropdown'},

                                    ['td', {class: 'hbeat_dropdown'},
                                        this.load_setting(settings_config.youtube[1].videos[1])
                                    ],

                                    ['td', {class: 'hbeat_dropdown'},
                                        ['span', {class: 'hbeat_dropdown header'}, util.locale('youtube_icons')],
                                        ['br'],['br'],
                                        this.load_setting(settings_config.youtube_music[1].video_icon[1]),
                                        ['br'],
                                        ['span', {class: 'hbeat_dropdown header'}, util.locale('youtube_others')],
                                        ['br'],['br'],
                                        this.load_setting(settings_config.youtube_music[1].others[1]),
                                    ],

                                    ['td', {
                                            id: 'freedom_shortcuts_td',
                                            class: 'hbeat_dropdown'
                                        },
                                        ['div', {
                                                id: 'freedom_toggle_dark_mode',
                                                class: 'hbeat_dropdown',
                                                style: settings.light_switch ? 'display:none' : ''
                                            },
                                            ['a', {
                                                    href: '#',
                                                    id: 'freedom_dark_mode_a',
                                                },
                                                util.light_switch_text()
                                            ],
                                            ['br']
                                        ],
                                        ['div', {
                                                id: 'freedom_video_manager',
                                                class: 'hbeat_dropdown',
                                                style: !settings.show_video_manager ? '' : 'display:none'
                                            },
                                            ['a', {href: 'https://www.youtube.com/my_videos'},
                                                util.locale('video_manager')
                                            ],
                                            ['br']
                                        ],
                                        ['div', {
                                                id: 'freedom_watch_later',
                                                class: 'hbeat_dropdown',
                                                style: !settings.show_watch_later ? '' : 'display:none'
                                            },
                                            ['a', {href: 'https://www.youtube.com/playlist?list=WL'},
                                                util.locale('watch_later')
                                            ],
                                            ['br']
                                        ],
                                        ['div', {
                                                id: 'freedom_analytics',
                                                class: 'hbeat_dropdown',
                                                style: !settings.show_analytics ? '' : 'display:none'
                                            },
                                            ['a', {
                                                    href: 'https://www.youtube.com/analytics' + (
                                                        settings.realtime_analytics ? '#r=realtime' :
                                                        ''),
                                                    id: 'freedom_analytics_a'
                                                },
                                                util.analytics_text()
                                            ],
                                            ['br']
                                        ],
                                        ['div', {
                                                id: 'freedom_all_comments',
                                                class: 'hbeat_dropdown',
                                                style: !settings.show_comments ? '' : 'display:none'
                                            },
                                            ['a', {
                                                    href: 'https://www.youtube.com/comments',
                                                    id: 'freedom_all_comments_a'
                                                },
                                                util.comments_text()
                                            ]
                                        ],
                                        ['div', {
                                                id: 'freedom_crm_link',
                                                class: 'hbeat_dropdown',
                                                style: settings.crm ? '' : 'display:none'
                                            },
                                            ['a', {
                                                    target: '_blank',
                                                    href: 'https://www.heartbeat.tm/crm',
                                                    id: 'freedom_crm_link_a'
                                                },
                                                util.locale('crm_toggle')
                                            ]
                                        ],
                                        ['div', {class: 'hbeat_dropdown'},
                                            ['hr', {class: 'freedom_hr'}],
                                            ['a', {href: 'https://www.youtube.com/playlist?list=PLxLYo5_7D3SdNDe8YF0lsiXoyUkvA5Z5K'},
                                                util.locale('get_more_views')
                                            ],
                                            ['br'],
                                            ['a', {href: 'https://www.youtube.com/editor'},
                                                util.locale('free_video_editor')
                                            ],
                                            ['br'],
                                            ['a', {
                                                    href: 'https://creatoracademy.withgoogle.com/page/education',
                                                    target: '_blank'
                                                },
                                                util.locale('youtube_academy')
                                            ],
                                            ['br'],
                                            ['hr', {class: 'freedom_hr'}],
                                            ['a', {
                                                    href: 'https://twitter.com/heartbeattm',
                                                    target: '_blank'
                                                },
                                                util.locale('heartbeat_twitter')
                                            ],
                                            ['br'],
                                            ['a', {
                                                    href: 'https://www.heartbeat.tm/achievements',
                                                    target: '_blank'
                                                },
                                                util.locale('heartbeat_achievements')
                                            ],
                                            ['br'],
                                            ['a', {href: 'https://www.youtube.com/playlist?list=PLxLYo5_7D3Sfsq4i0BdQnvt0VRCD5PS1c'},
                                                util.locale('about_heartbeat')
                                            ],
                                            ['br'],
                                            ['a', {
                                                    href: 'https://www.heartbeat.tm/feedback.html',
                                                    target: '_blank'
                                                },
                                                util.locale('feedback')
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ],

                        ['div', {id: 'hb_more_settings'},
                            ['a', {
                                    target: '_blank',
                                    href: heartbeat_chrome ? chrome.extension.getURL('/options/index.html') : ''
                                },
                                'More settings'
                            ]
                        ]
                    ]
                ]
            );

            this.add_event_handlers();
        },

        start: function () {
            var that = this;

            if (!settings.yt_legacy_menu) return;

            util.$wait('#heartbeat_settings_place_holder', function (err, ele) {
                if (!err && ele && !util.$('#heartbeat_settings_span')) {
                    ele.replace(that.heartbeat_settings);
                    that.refresh_shortcut();
                }
            });

            document.body.addEventListener('click', function (e) {
                var _temp = util.$('#freedom_settings_div');
                if (!~e.target.className.indexOf('hbeat_dropdown')) {
                    if (_temp) {
                        _temp.style.display = 'none';
                    }
                }
            });
        },

        refresh_shortcut: function () {
            this.toggle_one_click(
                'freedom_video_manager',
                'video_manager',
                'https://www.youtube.com/my_videos',
                util.locale('video_manager'),
                !settings.show_video_manager
            );

            this.toggle_one_click(
                'freedom_watch_later',
                'watch_later',
                'https://www.youtube.com/playlist?list=WL',
                util.locale('watch_later'),
                !settings.show_watch_later
            );

            this.toggle_one_click(
                'freedom_analytics',
                'analytics',
                settings.realtime_analytics ? 'https://www.youtube.com/analytics#r=realtime' :
                'https://www.youtube.com/analytics',
                util.analytics_text(),
                !settings.show_analytics
            );

            this.toggle_one_click(
                'freedom_all_comments',
                'community',
                'https://www.youtube.com/comments' +
                (settings.spam_comments ? '?filter=all&highlights=False&tab=spam' : ''),
                util.comments_text(),
                !settings.show_comments
            );
        },

        add_event_handlers: function () {
            var that = this,

                stats_box_count = +settings.monetization +
                (+settings.social_stats) +
                (+settings.estimated_earnings) +
                (+settings.branded_video) +
                (+settings.video_age),

                hide_stats_box = function () {
                    var panel = util.$('#freedom_stats_panel');
                    if (panel) {
                        panel.style.display = stats_box_count > 0 ? 'block' : 'none';
                    }
                },

                temp = function () {
                    util.toggle('freedom_settings_div');
                };

            util.$('#freedom_heartbeat_button', this.heartbeat_settings)
                .addEventListener('click', temp, true);

            _(util.$('.setting_option_item input[type=checkbox]', this.heartbeat_settings))
                .forEach(function (input) {
                    input.addEventListener('change', that.on_setting_change);
                })
                .commit();
        },


        build_toggle_option: function (id, text, opt) {
            var option = opt || {},
                checked = this.get_toggle_setting_value(id),
                div_option = {
                    class: 'setting_option_item' + (option.parent_id ? ' sub_item' : '')
                },
                input_option = {
                    type: 'checkbox',
                    id: id,
                    class: 'hbeat_dropdown'
                };

            if (checked) {
                input_option.checked = true;
            }

            if (option.parent_id) {
                div_option.parent_id = option.parent_id;
                div_option.style = this.get_toggle_setting_value(option.parent_id) ? 'display:block' :
                    'display:none';
            }

            return ['div', div_option,
                ['label',
                    ['input', input_option],
                    ['span', {
                        class: 'hbeat_dropdown'
                    }, text]
                ]
            ];
        },

        on_setting_change: function (evt) {
            var elem = evt.srcElement,
                checked = !!elem.checked;

            if (elem.id && elem.id.length && elem.id[0] === '!') {
                checked = !checked;
            }

            // update setting
            settings.set(elem.id.replace('!', ''), checked);

            // show/hide child settings if any
            _(util.$('.setting_option_item.sub_item[parent_id="' + elem.id + '"]'))
                .forEach(function (sub_item) {
                    var input = util.$('input', sub_item);

                    if (input.length) {
                        input = input[0];
                    }

                    sub_item.style.display = !!elem.checked ? 'block' : 'none';
                    if (input && !elem.checked) {
                        input.checked = false;
                        settings.set(input.id, false);
                    }
                })
                .commit();

            this.refresh_shortcut();
        },

        get_toggle_setting_value: function (id) {
            var key = id.replace('!', ''),
                checked = settings[key];

            if (id && id.length && id[0] === '!') {
                checked = !checked;
            }

            return checked;
        },

        reset_setting: function () {
            if (confirm(util.locale('reset_confirm'))) {
                settings = util.reset_settings();

                _(util.$('input'))
                    .forEach(function (i){
                        i.checked = !!settings[i.getAttribute('id')];
                    })
                    .commit();
            }
        },

        load_setting: function (object, parent_id) {
            var that = this,
                dom = [];

                _.forEach(object, function(value, key) {
                    if (!parent_id) {
                        dom.push(that.build_toggle_option(key, util.locale(value[0])));
                    }
                    else {
                        dom.push(that.build_toggle_option(key, util.locale(value[0]), {parent_id: parent_id}));
                    }

                    if (value[1]) {
                        dom.push(that.load_setting(value[1], key));
                    }
                });

            return dom;
        },

        toggle_one_click: function (id, img, link, tooltip, visible) {
            var e = util.$('#upload-btn'),
                icon;

            if (settings.heartbeat_position === 'appbar-onebar-upload-group' || settings.heartbeat_position ===
                'upload-btn') {
                e = this.heartbeat_settings;
            }

            util.$('#' + id, this.heartbeat_settings).style.display = visible ? 'block' : 'none';
        },

        move_to_left: function () {
        },

        move_to_right: function () {
        },

        stop: function () {
            widget.heartbeat_settings.remove();
        },

        settings_changed: function (change) {
            if (change.yt_legacy_menu) {
                settings.yt_legacy_menu
                    ? widget.start()
                    : widget.stop();
            }
        }
    };

    widgets.push(widget);

})();
