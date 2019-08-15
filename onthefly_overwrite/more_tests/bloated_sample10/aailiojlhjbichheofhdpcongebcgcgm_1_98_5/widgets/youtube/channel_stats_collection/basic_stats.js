(function () {
    'use strict';

    var setting_page = {

        menu_id: '#hb_basic_stats_block',

        is_show: true,

        start: function () {

            this.menu_item = jsonToDOM(['div', {id: this.menu_id.slice(1)},
                        ['div', {class: 'box_basic_stats', id: 'country_channel'},
                            ['div', {class: 'name_of_box_stats'}, util.locale('country')],
                            ['div', {class: 'info_of_box_stats'}]
                        ],
                        ['div', {class: 'box_basic_stats', id: 'category_channel'},
                            ['div', {class: 'name_of_box_stats'}, util.locale('category')],
                            ['div', {class: 'info_of_box_stats'}, 'Entertainment']
                        ],
                        ['div', {class: 'box_basic_stats', id: 'date_create_channel', style: 'border: none'},
                            ['div', {class: 'name_of_box_stats'}, util.locale('channel_created')],
                            ['div', {class: 'info_of_box_stats'}]
                        ],
                        ['div', {class: 'box_basic_stats', id: 'subcribers_channel'},
                            ['div', {class: 'name_of_box_stats'}, util.locale('subscribers')],
                            ['div', {class: 'info_of_box_stats'}]
                        ],
                        ['div', {class: 'box_basic_stats', id: 'video_view_channel'},
                            ['div', {class: 'name_of_box_stats'}, util.locale('video_views')],
                            ['div', {class: 'info_of_box_stats'}]
                        ],
                        ['div', {class: 'box_basic_stats', id: 'video_count_channel', style: 'border: none'},
                            ['div', {class: 'name_of_box_stats'}, util.locale('video_count')],
                            ['div', {class: 'info_of_box_stats'}]
                        ],
                        ['div', {class: 'box_basic_stats_links', id: 'stats_link', style: 'border: none'},
                            ['a', {
                                    class: 'info_of_box_stats',
                                    target: '_blank',
                                    onclick: _.partial(util.log_count_per_day, 'statstm_profile', null)
                                }, util.locale('full_statstm_profile')
                            ]
                        ]
                    ]);
            this.add_content();
        },

        add_content: function () {
            var basic_stats = util.$('#heartbeat_channel_basic_stats');

            if (!basic_stats) {
                return;
            }

            if (!util.$(this.menu_id)) {
                basic_stats.appendChild(this.menu_item);
                this.get_basic_info();
            }
        },

        get_basic_info: function () {
            var that = this;

            if (settings.stats_basic && settings.stats_sidebar && data.channel_id) {
                this.show_loading();

                util.api('channel_tips')({id: data.channel_id})
                    .get(function (err, result) {
                        that.remove_loading();

                        if (err || !result) {
                            return;
                        }

                        that.insert_basic_info(result);
                    });
            }
        },

        insert_basic_info: function (result) {
            util.$('#country_channel .info_of_box_stats')[0].innerText = result.snippet.country || '';
            util.$('#date_create_channel .info_of_box_stats')[0].innerText = moment(result.snippet.publishedAt.split('T')[0]).format('MMM D, YYYY') || '';
            util.$('#subcribers_channel .info_of_box_stats')[0].innerText = parseInt(result.statistics.subscriberCount).toLocaleString() || '';
            util.$('#video_view_channel .info_of_box_stats')[0].innerText = parseInt(result.statistics.viewCount).toLocaleString() || '';
            util.$('#video_count_channel .info_of_box_stats')[0].innerText = parseInt(result.statistics.videoCount).toLocaleString() || '';
            util.$('#stats_link a')[0].setAttribute('href', 'http://www.stats.tm/stats.html?id=' + result.id);
        },

        remove_loading: function () {
            util.$('#heartbeat_channel_basic_stats .heartbeat_loading_stats')[0].style.display = 'none';
        },

        show_loading: function () {
            util.$('#heartbeat_channel_basic_stats .heartbeat_loading_stats')[0].style.display = 'block';
        }
    };

    stats_sidebar.add_child_widgets('basic_stats', setting_page);

})();
