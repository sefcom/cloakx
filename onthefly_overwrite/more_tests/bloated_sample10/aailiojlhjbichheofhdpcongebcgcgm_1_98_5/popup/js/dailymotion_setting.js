(function () {
    'use strict';

    var setting_page = {

        start: function () {
            this.menu_item = jsonToDOM(['li', {
                    content_id: 'dailymotion_content'
                },
                'Dailymotion'
            ]);

            this.content_page = jsonToDOM(['div', {
                    id: 'dailymotion_content',
                    class: 'setting_page_content'
                },
                ['div', {
                        class: 'box_setting'
                    },
                    ['div', {
                            id: 'dailymotion_section',
                            class: 'settings_section',
                        },
                        ['h4', {
                                class: 'setting_section_header'
                            },
                            ['span', 'Dailymotion']
                        ],
                        ['div', {
                                class: 'setting_section_body'
                            },
                            
                            ['div', {
                                    class: 'box_setting'
                                },
                                heartbeat_menu_popup.load_setting(settings_config.dailymotion[1]),
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
            _(util.$('.setting_option_item input[type=checkbox]', this.content_page))
                .forEach(function (li) {
                    li.addEventListener('change', heartbeat_menu_popup.on_setting_change);
                })
                .commit();
        }
    };

    heartbeat_menu_popup.add_page(setting_page);
})();
