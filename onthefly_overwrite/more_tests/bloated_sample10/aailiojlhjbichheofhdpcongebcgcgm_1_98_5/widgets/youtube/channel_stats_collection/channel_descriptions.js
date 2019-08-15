(function () {
    'use strict';

    var setting_page = {

        is_show: false,

        menu_id: '#hb_description_menu',

        start: function () {
         
            this.menu_item = jsonToDOM(['li', {
                    class: (localStorage.getItem('current_menu') === 'channel_description') ? 'menu_stats_item active' : 'menu_stats_item',
                    'frame-name': 'channel_description',
                    onclick: this.menu_click,
                    id: this.menu_id.slice(1)
                },
                'Description'
            ]);

            this.content_data = jsonToDOM(['div', {
                    class: 'stats_frame', 
                    id: 'channel_description',
                    style: (localStorage.getItem('current_menu') === 'channel_description') ? 'display:block' : 'display:none',
                },
                ['pre', {id: 'heartbeat_channel_descriptions'}]
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

            this.is_show = (localStorage.getItem('current_menu') === 'channel_description');

            if (settings.stats_sidebar && settings.stats_wrap && this.is_show) {
                that.show_loading();

                util.api('featured_channel')({channel_id: data.channel_id})
                    .get(function (err, result) {    
                        that.remove_loading();

                        if (err) {
                            that.stats_not_index_yet();
                            return;
                        }
                        
                        that.insert_data(result);
                    });
            }
        },
        
        insert_data: function (data) {
            var box = util.$('#heartbeat_channel_descriptions'),
                description = data[0].brandingSettings.channel.description || util.locale('less_valuable');

            if (box) {
                box.appendChild(this.description_box(description));
            }  
        },

        description_box: function (data_row) {
            return jsonToDOM(['p',
                data_row
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

   stats_sidebar.add_child_widgets('channel_description', setting_page); 
})();