var stats_sidebar = (function () {
    'use strict';

    var widget = {

        name: 'All stats collection',

        all_stats: {},

        initialize: function () {
            var that = this,
                ready_check_interval;

            this.stats_sidebar = jsonToDOM(['div', {
                    id : 'heartbeat_stats_sidebar',
                },
                ['div', {id: 'heartbeat_stats_sidebar_head'},
                    ['h3', util.locale('heartbeat_stats_collection')],
                    ['i', {
                        class: 'fa ' + (settings.stats_sidebar ? 'fa-angle-up' : 'fa-angle-down'),
                        onclick: this.toggle_stats
                    }]
                ],
                ['div', {
                    id: 'heartbeat_channel_info_stats',
                    style: (settings.stats_sidebar) ? 'display: block' : 'display: none'
                },
                    ['div', {
                        id: 'heartbeat_channel_name_info',
                        class: 'content-wrapper'
                    },
                        ['a', {target: '_blank'},
                            ['img', {src:'#'}]
                        ],
                        ['div',
                            ['h4',
                                ['a', {target: '_blank'}]
                            ],
                            ['span'],
                        ],
                        ['div', {class: 'clr'}]
                    ],
                    ['div', {
                        id: 'heartbeat_channel_basic_stats',
                        style: (settings.stats_basic) ? 'display:block' : 'display:none'
                    },
                        ['div', {class : 'heartbeat_loading_stats'},
                            ['img', {src: config.assets_url + 'loading.gif', style: 'display:none'}]
                        ]
                    ],
                    ['div', {class: 'clr'}],
                    ['div' , {id: 'heartbeat_channel_all_stats'},
                        ['div', {
                            id: 'wrap_stats_content',
                            style: (settings.stats_wrap) ? 'display:block' : 'display:none'
                        },
                            ['ul', {id : 'menu_stats_table'},
                                ['div', {class: 'clr'}]
                            ],
                            ['div', {class: 'heartbeat_loading_stats'},
                                ['img', {src: config.assets_url + 'loading.gif', style: 'display:none'}]
                            ]
                        ]
                    ]
                ],
                ['div', {class: 'clr'}]
            ]);

            ready_check_interval = setInterval(function () {
                if (settings && util.$('#watch7-sidebar-modules') && data.channel_id) {
                    clearInterval(ready_check_interval);
                    that.start();
                }
            }, 50);

        },

        add_sidebar: function () {
            var sidebar = util.$('#watch7-sidebar');

            if (!sidebar && data.page !== 'watch') {
                return;
            }

            if (util.$('#watch-appbar-playlist') && sidebar.childNodes[2]) {
                sidebar.insertBefore(this.stats_sidebar, sidebar.childNodes[2]);
            }
            else {
                sidebar.insertBefore(this.stats_sidebar, sidebar.firstElementChild);
            }
        },

        start: function () {
            if (!util.$('#heartbeat_stats_sidebar') && settings.stats_collection) {
                this.add_sidebar();
                this.insert_info();
                this.load_child_widgets();
            }
        },

        toggle_stats: function () {
            var i = util.$('#heartbeat_stats_sidebar_head i')[0];

            if (settings.stats_sidebar) {
                i.add_class('fa-angle-down').remove_class('fa-angle-up');
            }
            else {
                i.add_class('fa-angle-up').remove_class('fa-angle-down');
            }

            settings.set('stats_sidebar', !settings.stats_sidebar);
            util.$('#heartbeat_channel_info_stats').style.display = settings.stats_sidebar ? 'block' : 'none';
            this.reload();
        },

        insert_info: function () {
            var author_elem = util.$('#heartbeat_channel_name_info h4 a')[0],
                username_elem = util.$('#heartbeat_channel_name_info span')[0],
                channel_img = util.$('#watch7-user-header .yt-thumb-clip img')[0];

            if (author_elem && data.author) {
                author_elem.innerHTML = data.author;
                author_elem.setAttribute('href', 'http://www.stats.tm/stats.html?id=' + (data.username || data.channel_id));
                author_elem.setAttribute('title', data.author);
            }

            if (username_elem && data.username) {
                username_elem.innerHTML = data.username;
            }

            if (channel_img) {
                util.$('#heartbeat_channel_name_info img')[0].setAttribute('src', channel_img.getAttribute('data-thumb'));
                util.$('#heartbeat_channel_name_info > a')[0].setAttribute('href', 'https://www.youtube.com/' + (data.username || ('channel/' + data.channel_id)));
            }
        },

        add_event_handlers: function (evt) {
            var list_menu = util.$('.menu_stats_item'),
                elem = util.bind_elem_functions(evt.srcElement),
                list_frame = util.$('.stats_frame'),
                current_frame = document.getElementById(elem.getAttribute('frame-name'));

            _(list_menu)
                .forEach(function (menu) {
                    menu.setAttribute('class', 'menu_stats_item');
                })
                .commit();

            elem.setAttribute('class', 'menu_stats_item active');
            localStorage.setItem('current_menu', elem.getAttribute('frame-name'));
            this.load_current_active();

            _(list_frame)
                .forEach(function (frame) {
                    frame.style.display = 'none';
                })
                .commit();

            current_frame.style.display = 'block';
        },

        /*toggle_basic_stats: function (evt) {
            var elem = util.bind_elem_functions(evt.srcElement),
                basic_stats = util.$('#heartbeat_channel_basic_stats');

            if (settings.stats_basic) {
                basic_stats.style.display = 'none';
                elem.setAttribute('value', util.locale('show'));
            }
            else {
                basic_stats.style.display = 'block';
                elem.setAttribute('value', util.locale('hide'));
                this.all_stats.basic_stats.get_basic_info();
            }

            settings.set('stats_basic', !settings.stats_basic);
        },

        toggle_wrap_stats: function (evt) {
            var elem = util.bind_elem_functions(evt.srcElement),
                stats_content = util.$('#wrap_stats_content');

            if (settings.stats_wrap) {
                stats_content.style.display = 'none';
                elem.setAttribute('value', util.locale('show'));
            }
            else {
                stats_content.style.display = 'block';
                elem.setAttribute('value', util.locale('hide'));
                this.load_current_active();
            }

            settings.set('stats_wrap', !settings.stats_wrap);
            evt.stopPropagation();
        },*/

        add_child_widgets: function (key, widget) {
            this.all_stats[key] = widget;
        },

        load_child_widgets: function () {
            _(this.all_stats)
                .forEach(function (stats) {
                    stats.start();
                })
                .commit();
        },

        load_current_active: function () {
            var current_active =  util.$('#menu_stats_table .active')[0],
                current_object_key = current_active.getAttribute('frame-name');

            if (!this.all_stats[current_object_key].is_show) {
                this.all_stats[current_object_key].get_basic_info();
                this.all_stats[current_object_key].is_show = true;
            }
        },

        remove_loading: function () {
            util.$('#wrap_stats_content .heartbeat_loading_stats')[0].style.display = 'none';
            util.$('#heartbeat_channel_basic_stats .heartbeat_loading_stats')[0].style.display = 'none';
        },

        show_loading: function () {
            util.$('#wrap_stats_content .heartbeat_loading_stats')[0].style.display = 'block';
            util.$('#heartbeat_channel_basic_stats .heartbeat_loading_stats')[0].style.display = 'block';
        },

        settings_changed: function (change) {
            if (change.stats_collection) {
                if (settings.stats_collection) {
                    this.start();
                }
                else {
                    this.remove();
                }
            }
        },

        remove: function () {
            this.stats_sidebar.remove();
        },

        reload: function () {
            _(this.all_stats)
                .forEach(function (stats) {
                    if (stats.is_show) {
                        stats.get_basic_info();
                    }
                })
                .commit();
        }
    };

    return widget;
})();

widgets.push(stats_sidebar);
