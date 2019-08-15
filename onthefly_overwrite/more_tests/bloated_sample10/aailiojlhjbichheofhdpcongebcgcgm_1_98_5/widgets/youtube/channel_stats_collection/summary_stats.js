(function () {
    'use strict';

    var setting_page = {

        is_show: false,

        menu_id: '#hb_summary_menu',

        start: function () {
         
            this.menu_item = jsonToDOM(['li', {
                    class: (localStorage.getItem('current_menu') === 'summary_stats') ? 'menu_stats_item active' : 'menu_stats_item', 
                    'frame-name': 'summary_stats',
                    onclick: this.menu_click,
                    id: this.menu_id.slice(1)
                },
                util.locale('daily_stats')
            ]);

            this.content_data = jsonToDOM(['div', {
                    class: 'stats_frame', 
                    id: 'summary_stats',
                    style: (localStorage.getItem('current_menu') === 'summary_stats') ? 'display:block' : 'display:none',
                },
                ['table', {
                    id: 'summary_stats_table', 
                    'cellspacing' : 0,
                    'cellpadding':0
                },
                    ['thead', {class: 'menu_thead_table'},
                        ['tr', {onclick: this.add_event_handlers},
                            ['td', {
                                class: 'menu_tab active',
                                'tbody_id': 'subscribers_tbody'
                            }, util.locale('subscribers')],
                            ['td', {
                                class: 'menu_tab',
                                'tbody_id': 'video_view_tbody'
                            }, util.locale('video_views')],
                            ['td', {
                                class: 'menu_tab',
                                'tbody_id': 'video_count_tbody'
                            }, util.locale('videos')]
                        ]
                    ],                          
                    ['thead', {class: 'info_thead_table'},
                        ['tr',
                            ['td', util.locale('date')],
                            ['td', util.locale('total')],
                            ['td', util.locale('change')]
                        ]
                    ],
                    ['tbody', {id: 'subscribers_tbody'}],
                    ['tbody', {id: 'video_view_tbody'}],
                    ['tbody', {id: 'video_count_tbody'}]
                ]
            ]);

            this.add_content();   
        },

        add_content: function () {
            var menu_stats_table = util.$('#menu_stats_table'),
                wrap_stats_content = util.$('#wrap_stats_content');

            if (!menu_stats_table || !wrap_stats_content) {
                return;
            }

            if (!util.$(this.menu_id)) {
                menu_stats_table.insertBefore(this.menu_item, menu_stats_table.firstElementChild);
                wrap_stats_content.appendChild(this.content_data);
                this.get_basic_info();
            }
        },

        get_basic_info: function () {
            var that = this;

            this.is_show = (localStorage.getItem('current_menu') === 'summary_stats');

            if (settings.stats_sidebar && settings.stats_wrap && this.is_show) {
                that.show_loading();

                util.api('channel_daily_views')({channel_id: data.channel_id})
                .get(function (err, result) {
                    that.remove_loading();
                    
                    if (err || !result.length) {
                        that.stats_not_index_yet();
                        return;
                    }
                    
                    that.add_summary_stats(result);
                });
            }
        },
        
        add_event_handlers: function (evt) {
            var elem = util.bind_elem_functions(evt.srcElement),
                list_tab = document.getElementsByClassName('menu_tab'),
                list_tbody = util.$('#summary_stats_table tbody');

            _(list_tab)
                .forEach(function (tab) {
                    tab.setAttribute('class', 'menu_tab');
                })
                .commit();

            elem.setAttribute('class', 'menu_tab active');
            
            _(list_tbody)
                .forEach(function (tbody) {
                    tbody.style.display = 'none';
                })
                .commit();

            util.$('#' + elem.getAttribute('tbody_id')).setAttribute('style', '');
        },

        add_summary_stats: function (result) {
            var subscribers_change = 0, views_change = 0, videos_change = 0, i = 0;

            for (; i < result.length; i++) {
                if(result[i + 1]){
                   subscribers_change = (result[i].subscribers - result[i + 1].subscribers) > 0 
                                        ? ('+' + (result[i].subscribers - result[i + 1].subscribers)).toLocaleString() 
                                        : (result[i].subscribers - result[i + 1].subscribers).toLocaleString();
                   views_change = (result[i].views - result[i + 1].views) > 0 
                                        ? ('+' + (result[i].views - result[i + 1].views)).toLocaleString()
                                        : (result[i].views - result[i + 1].views).toLocaleString();
                   videos_change = (result[i].videos - result[i + 1].videos) > 0 
                                        ? ('+' + (result[i].videos - result[i + 1].videos)).toLocaleString() 
                                        : (result[i].videos - result[i + 1].videos).toLocaleString();

                   this.add_row_stats(result[i], subscribers_change, views_change, videos_change);
                }   
            }
        },

        add_row_stats: function (data, subscribers_change, views_change, videos_change) {
            var subscribers_row = jsonToDOM(['tr',
                    ['td', {class: 'date_stats_item'}, data.insert_date ],
                    ['td', {class: 'total_stats_item'}, data.subscribers.toLocaleString()],
                    ['td', {class: 'change_stats_item'}, subscribers_change]
                ]),
                video_view_row = jsonToDOM(['tr',
                    ['td', {class: 'date_stats_item'}, data.insert_date ],
                    ['td', {class: 'total_stats_item'}, data.views.toLocaleString()],
                    ['td', {class: 'change_stats_item'}, views_change]
                ]),
                video_count_row = jsonToDOM(['tr',
                    ['td', {class: 'date_stats_item'}, data.insert_date ],
                    ['td', {class: 'total_stats_item'}, data.videos.toLocaleString()],
                    ['td', {class: 'change_stats_item'}, videos_change]
                ]);

            util.$('#subscribers_tbody').appendChild(subscribers_row);
            util.$('#video_view_tbody').appendChild(video_view_row);
            util.$('#video_count_tbody').appendChild(video_count_row);
        },

        stats_not_index_yet: function () {
            var reminder = jsonToDOM(['p', {class: 'hb_stats_not_index_reminder'}, util.locale('less_valuable')]);

            this.content_data.innerHTML = '';
            this.content_data.appendChild(reminder);
        },

        menu_click: function (evt) {
            stats_sidebar.add_event_handlers(evt);
        },

        remove_loading: function () {
            util.$('#wrap_stats_content .heartbeat_loading_stats')[0].style.display = 'none';
        },

        show_loading: function () {
            util.$('#wrap_stats_content .heartbeat_loading_stats')[0].style.display = 'block';
        }
    };
    
    stats_sidebar.add_child_widgets('summary_stats', setting_page); 
})();