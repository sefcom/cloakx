(function () {
    'use strict';

    var setting_page = {
        is_show: (localStorage.getItem('current_menu') === 'daily_statistics'),

        daily_stats : {},

        menu_id: '#hb_daily_menu',

        start: function () {
         
            this.menu_item = jsonToDOM(['li', {
                    class: (localStorage.getItem('current_menu') === 'daily_statistics') ? 'menu_stats_item active' : 'menu_stats_item', 
                    'frame-name': 'daily_statistics',
                    onclick: this.menu_click,
                    id: this.menu_id.slice(1)
                },
                util.locale('summary')]);

            this.content_data = jsonToDOM(['div', {
                                    class: 'stats_frame' ,
                                    id: 'daily_statistics',
                                    style: (localStorage.getItem('current_menu') === 'daily_statistics') ? 'display:block' : 'display:none',
                                },
                                ['div', {class: 'freedom_chart_title'},
                                    util.locale('daily_video_views_statistics')
                                ],
                                ['canvas', {
                                        id: 'freedom_daily_views_chart',
                                        width: '375px',
                                        height: '190px'
                                    }
                                ],
                                ['div', {class: 'freedom_chart_title'},
                                    util.locale('daily_video_subscribers_statistics')
                                ],
                                ['canvas', {
                                        id: 'freedom_daily_subs_chart',
                                        width: '375px',
                                        height: '190px'
                                    }
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
            this.is_show = (localStorage.getItem('current_menu') === 'daily_statistics');

            if (settings.stats_sidebar && settings.stats_wrap && this.is_show) {
                that.show_loading();

                util.api('channel_daily_views')({channel_id: data.channel_id})
                    .get(function (err, result) {
                        that.remove_loading();

                        if (err || !result.length) {
                            that.stats_not_index_yet();
                            return;
                        }

                        that.daily_stats = result;
                        that.render_daily_stat_chart();
                    });
            }
        },

        render_daily_stat_chart: function () {
            var view_ctx = util.$('#freedom_daily_views_chart').getContext('2d'),
                view_data = this.get_chart_data_set('views'),
                subscribe_ctx = util.$('#freedom_daily_subs_chart').getContext('2d'),
                subscribe_data = this.get_chart_data_set('subscribers'),
                chart_option = {
                    datasetStrokeWidth: 1,
                    pointDot: false,
                    bezierCurve: false,
                    tooltipTemplate: '<%= value %>'
                };

            new Chart(view_ctx).Line({
                labels: view_data.labels,
                datasets: [{
                    label: util.locale('daily_video_views_statistics'),
                    fillColor: 'rgba(220,220,220,0.2)',
                    strokeColor: 'rgba(230,33,23,1)',
                    data: view_data.data
                }]
            }, chart_option);

            new Chart(subscribe_ctx).Line({
                labels: subscribe_data.labels,
                datasets: [{
                    label: util.locale('daily_video_views_statistics'),
                    fillColor: 'rgba(220,220,220,0.2)',
                    strokeColor: 'rgba(230,33,23,1)',
                    data: subscribe_data.data
                }]
            }, chart_option);
        },

        get_chart_data_set: function(name){
            var that = this,
                chart_data = [],
                labels = [];

            _.forEachRight(this.daily_stats, function (item, index) {
                var change = index > 0 ? that.daily_stats[index - 1][name] - item[name]: 0;

                // skip zero for better smoothen chart
                if (change) {
                    labels.push(item.insert_date);
                    chart_data.push(change);
                }
            });

            labels.forEach(function (label, index) {
                if (index % 5 !== 0) {
                    labels[index] = '';
                }
            });

            return {
                labels: labels,
                data: chart_data
            };
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

    stats_sidebar.add_child_widgets('daily_statistics', setting_page);  
})();