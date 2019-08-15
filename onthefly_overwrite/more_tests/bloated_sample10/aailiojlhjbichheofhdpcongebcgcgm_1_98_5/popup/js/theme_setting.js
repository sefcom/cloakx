(function () {
    'use strict';

    var setting_page = {
        
        start: function () {

            /*
             * obj = ['youtube_theme_global', {
             *     youtube_theme_background_color: ['background_color'],
             *     ...
             * ];
             */
            function build_array_color_settings (obj) {
                var options = obj[1],
                    arr =   ['div', {class: 'setting_option_item show'},
                                ['label', ['span', util.locale(obj[0])]]
                            ];

                _(options)
                    .forEach(function (value, key) {
                        var label = value[0],
                            key_enable = key + '_enable';

                        arr.push(
                            ['div', {class: 'setting_option_item sub_item show'},
                                ['label',
                                    ['input', {
                                            id: key_enable,
                                            type: 'checkbox',
                                            checked: settings[key_enable] || undefined,
                                            onchange: setting_page.on_setting_change
                                        }
                                    ],
                                    ['span', util.locale(label)],
                                    ['input', {
                                            id: key,
                                            type: 'color',
                                            onchange: setting_page.on_setting_change
                                        }
                                    ]
                                ]
                            ]
                        );
                    })
                    .commit();

                return arr;
            }

            this.menu_item = jsonToDOM(['li', {
                    content_id: 'custom_theme'
                },
                'Custom Theme'
            ]);

            this.content_page = jsonToDOM(['div', {
                    id: 'custom_theme',
                    class: 'setting_page_content'
                },
                ['div', {
                        id: 'youtube_section',
                        class: 'settings_section selected'
                    },
                    ['div', {class: 'setting_section_body'},
                        ['div', {class: 'box_setting'},
                            ['h4', {class: 'setting_subsection_header'},
                                ['span', {class: 'active'}, 'Youtube']
                            ]
                        ],
                        ['div', {class: 'setting_content active'},
                            ['div', {class: 'setting_option_col'},
                                ['div', {class: 'setting_option_item show'},
                                    ['label',
                                        ['span', 'Youtube Theme']
                                    ],
                                    ['div', {class: 'setting_option_item sub_item show'},
                                        ['label',
                                            ['input', {
                                                    id: 'youtube_theme',
                                                    type: 'checkbox',
                                                    checked: settings.youtube_theme || undefined,
                                                    onchange: this.on_setting_change
                                                }
                                            ],
                                            ['span', 'Enable']
                                        ]
                                    ]
                                ],
                                build_array_color_settings(settings_config.heartbeat_theme[1].youtube_theme[1].youtube_theme_global),
                                build_array_color_settings(settings_config.heartbeat_theme[1].youtube_theme[1].youtube_theme_button)
                            ],
                            ['div', {class: 'setting_option_col'},
                                build_array_color_settings(settings_config.heartbeat_theme[1].youtube_theme[1].youtube_theme_body),
                                build_array_color_settings(settings_config.heartbeat_theme[1].youtube_theme[1].youtube_theme_input),
                                build_array_color_settings(settings_config.heartbeat_theme[1].youtube_theme[1].youtube_theme_video_link),
                                ['div', {id: 'theme_rendering'},
                                    ['i', {class: 'fa fa-spinner fa-pulse'}],
                                    ['span', 'Saving...']
                                ]
                            ],
                            ['div', {class: 'setting_option_col'},
                                ['div', {class: 'setting_option_item show'},
                                    ['label', ['span', 'Heartbeat Themes']],
                                    ['div',
                                        ['div', {class: 'setting_option_item sub_item show'},
                                            ['label',
                                                ['input', {
                                                        type: 'radio',
                                                        name: 'youtube_theme_heartbeat_themes',
                                                        checked: (!settings.youtube_theme_mode || settings.youtube_theme_mode === 'dark') || undefined,
                                                        onchange: _.partial(this.on_mode_change, 'dark')
                                                    }
                                                ],
                                                ['span', 'Dark']
                                            ],
                                            ['span', {
                                                class: 'fa fa-save',
                                                title: 'save the settings to custom mode',
                                                onclick: _.partial(this.save_mode_settings, 'dark')
                                            }]
                                        ],
                                        ['div', {class: 'setting_option_item sub_item show'},
                                            ['label',
                                                ['input', {
                                                        type: 'radio',
                                                        name: 'youtube_theme_heartbeat_themes',
                                                        checked: settings.youtube_theme_mode === 'red' || undefined,
                                                        onchange: _.partial(this.on_mode_change, 'red')
                                                    }
                                                ],
                                                ['span', 'Red']
                                            ],
                                            ['span', {
                                                class: 'fa fa-save',
                                                title: 'save the settings to custom mode',
                                                onclick: _.partial(this.save_mode_settings, 'red')
                                            }]
                                        ],
                                        ['div', {class: 'setting_option_item sub_item show'},
                                            ['label',
                                                ['input', {
                                                        type: 'radio',
                                                        name: 'youtube_theme_heartbeat_themes',
                                                        checked: settings.youtube_theme_mode === 'blue' || undefined,
                                                        onchange: _.partial(this.on_mode_change, 'blue')
                                                    }
                                                ],
                                                ['span', 'Blue']
                                            ],
                                            ['span', {
                                                class: 'fa fa-save',
                                                title: 'save the settings to custom mode',
                                                onclick: _.partial(this.save_mode_settings, 'blue')
                                            }]
                                        ],
                                        ['div', {class: 'setting_option_item sub_item show'},
                                            ['label',
                                                ['input', {
                                                        type: 'radio',
                                                        name: 'youtube_theme_heartbeat_themes',
                                                        checked: settings.youtube_theme_mode === 'green' || undefined,
                                                        onchange: _.partial(this.on_mode_change, 'green')
                                                    }
                                                ],
                                                ['span', 'Green']
                                            ],
                                            ['span', {
                                                class: 'fa fa-save',
                                                title: 'save the settings to custom mode',
                                                onclick: _.partial(this.save_mode_settings, 'green')
                                            }]
                                        ],
                                        ['div', {class: 'setting_option_item sub_item show'},
                                            ['label',
                                                ['input', {
                                                        type: 'radio',
                                                        name: 'youtube_theme_heartbeat_themes',
                                                        checked: settings.youtube_theme_mode === 'cyan' || undefined,
                                                        onchange: _.partial(this.on_mode_change, 'cyan')
                                                    }
                                                ],
                                                ['span', 'Cyan']
                                            ],
                                            ['span', {
                                                class: 'fa fa-save',
                                                title: 'save the settings to custom mode',
                                                onclick: _.partial(this.save_mode_settings, 'cyan')
                                            }]
                                        ],
                                        ['div', {class: 'setting_option_item sub_item show'},
                                            ['label',
                                                ['input', {
                                                        type: 'radio',
                                                        name: 'youtube_theme_heartbeat_themes',
                                                        checked: settings.youtube_theme_mode === 'custom' || undefined,
                                                        onchange: _.partial(this.on_mode_change, 'custom')
                                                    }
                                                ],
                                                ['span', 'Custom']
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]);

            setting_page.show_default_color();

            util.$('#heartbeat_sidebar_items').appendChild(setting_page.menu_item);
            util.$('#heartbeat_content').appendChild(setting_page.content_page);
        },

        show_default_color: function () {
            var list_color_input = util.$('.setting_option_item input[type=color]', setting_page.content_page),
                colors = theme_helper.get_settings('youtube');

            _(list_color_input)
                .forEach(function (input) {
                    var key = input.id.replace('youtube_theme_', '');

                    input.value = '#FFFFFF';

                    if (colors[key]) {
                        input.value = colors[key];
                    }
                })
                .commit();
        },

        on_mode_change: function (mode) {
            util.$('#theme_rendering').show();

            theme_helper.set_mode('youtube', mode, function () {
                theme_helper.recompile('youtube', function () {
                    setting_page.show_default_color();
                    settings.set('youtube_theme_last_update', Date.now());
                    util.$('#theme_rendering').hide();
                });
            });
        },

        on_setting_change: function (evt) {
            var elem = evt.srcElement,
                key = elem.id,
                value = (elem.type === 'color') ? elem.value : elem.checked;

            settings.set(key, value);

            if (key === 'youtube_theme') return;

            util.$('#theme_rendering').show();

            theme_helper.recompile('youtube', function () {
                settings.set('youtube_theme_last_update', Date.now());
                util.$('#theme_rendering').hide();
            });
        },

        save_mode_settings: function (mode) {
            var variables = theme_helper.get_settings('youtube', mode);

            util.$('#theme_rendering').show();

            theme_helper.set_settings('youtube', variables, function () {
                theme_helper.recompile('youtube', function () {
                    setting_page.show_default_color();
                    settings.set('youtube_theme_last_update', Date.now());
                    util.$('#theme_rendering').hide();
                });
            });
        }
    };

    heartbeat_menu_popup.add_page(setting_page);
})();
