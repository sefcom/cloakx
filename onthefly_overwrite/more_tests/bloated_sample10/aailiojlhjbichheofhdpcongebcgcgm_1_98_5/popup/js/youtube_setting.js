(function () {
    'use strict';

    var setting_page = {

        start: function () {
            var that = this;

            this.menu_item = jsonToDOM(['li', {
                    content_id: 'youtube_content'
                },
                'Youtube'
            ]);

            this.content_page = jsonToDOM(['div', {
                    id: 'youtube_content',
                    class: 'setting_page_content'
                },
                ['div', {
                        id: 'youtube_section',
                        class: 'settings_section selected'
                    },
                    ['div', {class: 'setting_section_body'},
                        ['div', {class: 'box_setting'},
                            ['h4', {class: 'setting_subsection_header'},
                                ['span', {hbFor: 'general', class: 'active'}, util.locale('general')],
                                ['span', {hbFor: 'watch_page'}, util.locale('watch_page')],
                                ['span', {hbFor: 'channels'}, util.locale('channels')],
                                ['span', {hbFor: 'youtube_player'}, util.locale('youtube_player')],
                                ['span', {hbFor: 'playlist'}, util.locale('playlist')],
                                ['span', {hbFor: 'feed'}, util.locale('feed')],
                                ['span', {hbFor: 'youtube_icons'}, util.locale('youtube_icons')]
                            ]
                        ],
                        ['div', {id: 'general', class: 'setting_content active'},
                            heartbeat_menu_popup.load_setting(settings_config.youtube_music[1].general[1]),
                            ['div', {class: 'clr'}]
                        ],
                        ['div', {id: 'watch_page', class: 'setting_content'},
                            heartbeat_menu_popup.wrap_settings([
                                heartbeat_menu_popup.load_setting(settings_config.youtube_music[1].videos[1]),
                                heartbeat_menu_popup.load_setting(settings_config.youtube_music[1].external_apps[1])
                            ], 3),
                            ['div', {class: 'clr'}]
                        ],
                        ['div', {id: 'channels', class: 'setting_content'},
                            heartbeat_menu_popup.load_setting(settings_config.youtube_music[1].channels[1]),
                            ['div', {class: 'clr'}]
                        ],
                        ['div', {id: 'youtube_player', class: 'setting_content'},
                            heartbeat_menu_popup.load_setting(settings_config.youtube_music[1].player[1]),
                            ['div', {class: 'clr'}]
                        ],
                        ['div', {id: 'playlist', class: 'setting_content'},
                            heartbeat_menu_popup.load_setting(settings_config.youtube_music[1].playlist[1]),
                            ['div', {class: 'clr'}]
                        ],
                        ['div', {id: 'feed', class: 'setting_content'},
                            heartbeat_menu_popup.load_setting(settings_config.youtube_music[1].feed[1]),
                            ['div', {class: 'clr'}]
                        ],
                        ['div', {id: 'youtube_icons', class: 'setting_content'},
                            heartbeat_menu_popup.load_setting(settings_config.youtube_music[1].video_icon[1]),
                            ['div', {class: 'clr'}]
                        ],
                        ['div', { id: 'more_settings' },
                            ['a', {
                                    onclick: function (evt) {
                                        window.open(
                                            chrome.extension.getURL('../../../options/index.html')
                                        );
                                    }
                                },
                                util.locale('looking_for_more_settings_click_here')
                            ]
                        ]
                    ]
                ]
            ]);

            this.add_event_handlers();

            util.$('#heartbeat_sidebar_items').appendChild(this.menu_item);
            util.$('#heartbeat_content').appendChild(this.content_page);
        },

        add_event_handlers: function () {
            var list_menu = util.$('.setting_subsection_header span', this.content_page),
                list_input = util.$('.setting_option_item input[type=checkbox]', this.content_page);

            _(list_input)
                .forEach(function (input) {
                    input.addEventListener('change',
                        heartbeat_menu_popup.on_setting_change);
                })
                .commit();

            _(list_menu)
                .forEach(function (menu) {
                    menu.addEventListener('click', function (evt) {
                        var id = menu.getAttribute('hbFor');

                        util.$('.setting_content.active', setting_page.content_page)[0].remove_class('active');
                        util.$('.setting_subsection_header span.active', setting_page.content_page)[0].remove_class('active');

                        menu.add_class('active');
                        util.$('#' + id).add_class('active');
                    });
                })
                .commit();
        },

        on_analytic_change: function () {
            util.$('#freedom_analytics').style.display = !settings.hide_analytics
                ? 'block'
                : 'none';

            heartbeat_menu_popup.on_platform_shortcut_change();
        },

        on_darkmode_change: function () {
            util.$('#freedom_dark_mode').style.display = settings.light_switch
                ? 'block'
                : 'none';

            heartbeat_menu_popup.on_platform_shortcut_change();
        },

        on_video_manager_change: function () {
            util.$('#freedom_video_manager').style.display = !settings.hide_video_manager
                ? 'block'
                : 'none';

            heartbeat_menu_popup.on_platform_shortcut_change();
        },

        on_comment_change: function () {
            util.$('#freedom_all_comments').style.display = !settings.hide_comments
                ? 'block'
                : 'none';

            heartbeat_menu_popup.on_platform_shortcut_change();
        }
    };

    heartbeat_menu_popup.add_page(setting_page);
})();
