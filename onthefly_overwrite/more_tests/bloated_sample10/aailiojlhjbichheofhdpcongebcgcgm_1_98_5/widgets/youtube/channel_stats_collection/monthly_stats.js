(function () {
    'use strict';

    var setting_page = {

        is_show: false,


        menu_id: '#hb_monthly_menu',

        start: function () {
         
            this.menu_item = jsonToDOM(['li',{
                    class: (localStorage.getItem('current_menu') === 'monthly_statistics') ? 'menu_stats_item active' : 'menu_stats_item',
                    'frame-name': 'monthly_statistics',
                    onclick: this.menu_click,
                    id: this.menu_id.slice(1)
                },
                util.locale('monthly_stats')]);

            this.content_data = jsonToDOM(['div', {
                                    class : 'stats_frame', 
                                    id: 'monthly_statistics',
                                    style: (localStorage.getItem('current_menu') === 'monthly_statistics') ? 'display:block' : 'display:none',
                                },
                                ['ul', {id: 'heartbeat_monthly_statistics'}]
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

            this.is_show = (localStorage.getItem('current_menu') === 'monthly_statistics');

            if (settings.stats_sidebar && settings.stats_wrap && this.is_show) {
                that.show_loading();

                util.api('vpd_spd')({channel_id: data.channel_id})
                    .get(function (err, result) {
                        that.remove_loading();

                        if (err || !result) {
                            return that.stats_not_index_yet();
                        }

                        that.insert_data(result);             
                    });  
            }
        },

        insert_data: function (data) {
            var vpm = data.vpd * 30,
                spm = data.spd * 30;
            if (vpm >= 1000) {
                vpm = numeral(vpm).format('0a');
            }

            if (spm >= 1000) {
                spm = numeral(spm).format('0a');
            }

            util.$('#heartbeat_monthly_statistics').appendChild(this.row('Views per month: ', vpm));
            util.$('#heartbeat_monthly_statistics').appendChild(this.row('Subcribers per month: ', spm));
            util.$('#wrap_stats_content .heartbeat_loading_stats')[0].style.display = 'none';
        },

        row: function (string, count) {
            return jsonToDOM(['li', 
                    ['p', string],
                    ['p', {class: 'span_number'}, count.toString()]
                ]);
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

    stats_sidebar.add_child_widgets('monthly_statistics', setting_page); 
})();