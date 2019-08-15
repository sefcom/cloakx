(function () {
    'use strict';

    var ready_check_interval,
        heartbeat_login_url = 'http://api.accounts.freedom.tm/auth?service=heartbeat&' +
        'redirect_uri=https%3A%2F%2Fwww.you1tube.com%2Fcallback&' +
        'response_type=code&roles=profile,email,partner&' +
        'state=' + encodeURIComponent(location.href),

        heartbeat_tm_login_url = 'https://www.heartbeat.tm/auth/',

        setting_page = {
            start: function () {

                this.setting_page_dom = jsonToDOM(
                    ['div', {id: 'settings_container'},
                        ['div', {id: 'settings_header'},
                            ['div', {id: 'heartbeat_option_header'},
                                ['img', {src: '../images/icon-small.png'}],
                                ['p', util.locale('heartbeat_settings')]
                            ]
                        ],
                        ['div', {
                                id: 'settings_menu',
                            },
                            ['ul',
                                ['li',
                                    ['a', {section_id: 'youtube_section', class: 'selected'}, 'youtube']
                                ],
                                ['li',
                                    ['a', {section_id: 'twitch_section'}, 'twitch']
                                ],
                                ['li',
                                    ['a', {section_id: 'dailymotion_section'}, 'dailymotion']
                                ],
                                ['li',
                                    ['a', {section_id: 'hitbox_section'}, 'hitbox']
                                ],
                                ['li',
                                    ['a', {section_id: 'facebook_section'}, util.locale('facebook')]
                                ],
                                ['button', {
                                    type: 'button',
                                    id: 'hb_reset_option_btn',
                                    onclick: this.reset_setting
                                }, util.locale('reset_default')]
                            ]
                        ],
                        ['div', {id: 'settings_body'},
                            ['div', {
                                    id: 'youtube_section',
                                    class: 'settings_section selected menu'
                                },
                                ['h4', {class: 'setting_section_header'}, 'YouTube'],
                                ['div', {class: 'setting_section_body'},
                                    ['table', {id: 'youtube_table'},
                                        ['tr',
                                            ['th', {class: 'hbeat_header'}, util.locale('watch_page')],
                                            ['th', {class: 'hbeat_header'}, util.locale('youtube_player')],
                                            ['th', {class: 'hbeat_header'}, util.locale('playlist')]
                                        ],
                                        ['tr',
                                            ['td', this.load_setting(settings_config.youtube_music[1].videos[1])],
                                            ['td',
                                                this.load_setting(settings_config.youtube_music[1].player[1]),
                                                ['br'],
                                                ['span', {class: 'hbeat_header'}, util.locale('uploads_page')],
                                                ['br'],
                                                this.load_setting(settings_config.youtube_music[1].uploads[1]),
                                                ['br'],
                                                ['span', {class: 'hbeat_header'}, util.locale('channels')],
                                                ['br'],
                                                this.load_setting(settings_config.youtube_music[1].channels[1]),
                                                ['br'],
                                                this.load_setting(settings_config.youtube_music[1].external_apps[1]),
                                                ['br'],
                                                this.load_setting(settings_config.youtube_music[1].external_apps[2]),
                                            ],
                                            ['td',
                                                this.load_setting(settings_config.youtube_music[1].playlist[1]),
                                                ['br'],
                                                ['span', {class: 'hbeat_header'}, util.locale('creator_studio')],
                                                ['br'],
                                                this.load_setting(settings_config.youtube_music[1].creator_studio[1]),
                                                ['br'],
                                                ['span', {class: 'hbeat_header'}, util.locale('feed')],
                                                ['br'],
                                                this.load_setting(settings_config.youtube_music[1].feed[1]),
                                                ['br'],
                                                ['span', {class: 'hbeat_header'}, util.locale('youtube_icons')],
                                                ['br'],
                                                this.load_setting(settings_config.youtube_music[1].video_icon[1]),
                                            ],
                                        ]
                                    ]
                                ]
                            ],
                            ['div', {
                                    id: 'shorcut_section',
                                    class: 'settings_section'
                                },
                                ['h4', {class: 'setting_section_header'}, util.locale('social_media')],
                                ['div', {class: 'setting_section_body'},
                                    ['a', {href: heartbeat_login_url},
                                        ['img', {src: 'images/google-connect.png'}], util.locale('heartbeat_google')
                                    ]
                                ],
                                ['div', {class: 'setting_section_body'},
                                    ['a', {href: heartbeat_login_url},
                                        ['img', {src: 'images/youtube-connect.png'}], util.locale('youtube_social')
                                    ]
                                ],
                                ['div', {class: 'setting_section_body'},
                                    ['a', {href: heartbeat_tm_login_url},
                                        ['img', {src: 'images/social_login.png'}], util.locale('social_login')
                                    ]
                                ]
                            ],
                            ['div', {class: 'clr'}],
                            ['div', {
                                    id: 'twitch_section',
                                    class: 'settings_section menu'
                                },
                                ['h4', {class: 'setting_section_header'}, 'Twitch'],
                                ['div', {class: 'setting_section_body'},
                                    this.load_setting(settings_config.twitch[1]),
                                ]
                            ],
                            ['div', {
                                    id: 'hitbox_section',
                                    class: 'settings_section menu'
                                },
                                ['h4', {class: 'setting_section_header'}, 'Hitbox'],
                                ['div', {class: 'setting_section_body'},
                                    this.load_setting(settings_config.hitbox[1]),
                                ]
                            ],
                            ['div', {

                                    id: 'dailymotion_section',
                                    class: 'settings_section menu'
                                },
                                ['h4', {class: 'setting_section_header'}, 'Dailymotion'],
                                ['div', {class: 'setting_section_body'},
                                    this.load_setting(settings_config.dailymotion[1]),
                                ]
                            ],
                            ['div', {
                                    id: 'facebook_section',
                                    class: 'settings_section menu'
                                },
                                ['h4', {class: 'setting_section_header'}, 'Facebook'],
                                ['div', {class: 'setting_section_body'},
                                    ['div', {class: 'setting_column'},
                                        this.build_toggle_option('fb_block_seen_chat', util.locale('fb_block_seen_chat'))
                                    ]
                                ]
                            ]
                        ]
                    ]
                );

                util.$('#page_body').replace(this.setting_page_dom);
                this.add_event_handlers();
                this.check_for_reward();
            },

            check_for_reward: function () {
                if(!settings.public_token_id || localStorage.getItem('freedom_use_option_page')){
                    return;
                }

                util.api('reward')('reward_points')
                    .post({
                        action_name: 'discover_new_feature',
                        token_id: settings.public_token_id,
                        action_data: {
                            feature_name: 'Chrome option page'
                        }
                    }, function () {
                        localStorage.setItem('freedom_use_option_page', 1);
                    });
            },

            add_event_handlers: function () {
                var that = this;

                // right now all inputs are checkbox
                _(util.$('.setting_option_item input[type=checkbox]', this.setting_page_dom))
                    .forEach(function (input) {
                        input.addEventListener('change', that.on_setting_change);
                    })
                    .commit();

                // auto select tab when scrolling
                util.$('#settings_body', this.setting_page_dom)
                    .addEventListener('scroll', function () {
                        var links = util.$('#settings_menu a', that.setting_page_dom),
                            closest = links[0],
                            distance = Number.MAX_VALUE,
                            container = this;

                        _(links)
                            .forEach(function (link) {
                                var tab_pane = util.$('#' + link.getAttribute('section_id'), that.setting_page_dom),
                                    dist = container.scrollTop + container.clientHeight - tab_pane.offsetTop;

                                if (dist > 0 && dist < distance) {
                                    distance = dist;
                                    closest = link;
                                }
                            })
                            .commit();

                        that.select_tab(closest);
                    });

                _(util.$('#settings_menu a', this.setting_page_dom))
                    .forEach(function (link) {
                        link.addEventListener('click', function () {
                            var blink,
                                e = document.getElementById(link.getAttribute('section_id'));

                            blink = setInterval(function () {
                                e.style.opacity = '0.5';
                                e.style.color = '#f00';

                                setTimeout(function () {
                                    e.style.opacity = '1';
                                    e.style.color = '#000';
                                }, 250);
                            }, 500);

                            setTimeout(function () {
                                clearInterval(blink);
                            }, 2000);

                            e.classList.add('highlighted');
                            e.scrollIntoView();
                        });
                    })
                    .commit();
            },

            select_tab: function (elem) {
                var tab = util.bind_elem_functions(elem),
                    tab_pane = util.$('#' + tab.getAttribute('section_id'), this.setting_page_dom),
                    selected_tab_pane = util.$('.settings_section.selected', this.setting_page_dom),
                    selected_tab = util.$('#settings_menu a.selected', this.setting_page_dom);

                if (selected_tab_pane.length) {
                    selected_tab_pane[0].remove_class('selected');
                }

                if (selected_tab) {
                    selected_tab[0].remove_class('selected');
                }

                tab.add_class('selected');
                if (tab_pane) {
                    tab_pane.add_class('selected');
                }
            },

            build_toggle_option: function (id, text, opt) {
                var option = opt || {},
                    checked = this.get_toggle_setting_value(id),
                    div_option = {
                        class: 'setting_option_item' + (option.parent_id ? ' sub_item' : '')
                    },
                    input_option = {
                        type: 'checkbox',
                        id: id
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
                        ['span', text]
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

                chrome.runtime.sendMessage({message: 'heartbeat_setting_changed'});
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

                function add_it (value, key) {
                    if (!parent_id) {
                        dom.push(that.build_toggle_option(key, util.locale(value[0])));
                    }
                    else {
                        dom.push(that.build_toggle_option(key, util.locale(value[0]), {parent_id: parent_id}));
                    }

                    if (value[1]) {
                        dom.push(that.load_setting(value[1], key));
                    }
                }

                _.forEach(object, function(value, key) {
                    if (settings_config.beta_keys[key]) {
                        session.on_ready(function () {
                            if (session.has_role('lab')) {
                                add_it(value, key);
                            }
                        });
                        return;
                    }

                    add_it(value, key);
                });

                return dom;
            }
        };

    document.title = 'More settings';

    ready_check_interval = setInterval(function () {
        if (settings) {
            setting_page.start();
            clearInterval(ready_check_interval);
        }
    }, 50);

})();
