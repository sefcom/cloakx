(function () {
    'use strict';

    var setting_page = {

        is_show: false,

        menu_id: '#hb_featured_menu',

        start: function () {
         
            this.menu_item = jsonToDOM(['li', {
                    class: (localStorage.getItem('current_menu') === 'featured_channel') ? 'menu_stats_item active' : 'menu_stats_item',
                    'frame-name': 'featured_channel',
                    onclick: this.menu_click,
                    id: this.menu_id.slice(1)
                },
                'Featured'
            ]);

            this.content_data = jsonToDOM(['div', {
                    class: 'stats_frame', 
                    id: 'featured_channel',
                    style: (localStorage.getItem('current_menu') === 'featured_channel') ? 'display:block' : 'display:none',
                },
                ['ul', {id: 'heartbeat_featured_channel'}]
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

            this.is_show = (localStorage.getItem('current_menu') === 'featured_channel');

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
            var list_feature_branch =  data[0].brandingSettings.channel.featuredChannelsUrls,
                that = this;

            _(list_feature_branch)
                .forEach(function (feature) {
                    that.get_featured_channel(feature);
                })
                .commit();
        },

        get_featured_channel: function (id) {
            var that = this;

            that.show_loading();

            util.api('channel_basic')({channel_id: id})
            .get(function (err, result) {
                that.remove_loading();

                if (err) {
                    return;
                }

                that.featured_channel_box(result[0]);
            });  
        },
        
        featured_channel_box: function (data_row) {
            var ul = util.$('#heartbeat_featured_channel');
                
            var a = jsonToDOM(['a', {href: 'https://www.youtube.com/channel/' + data_row.id, class: 'heartbeat_featured_channel_box'},
                ['li',
                    ['img', {src: data_row.snippet.thumbnails.default.url}],
                    ['p',
                        ['h3', data_row.snippet.title],
                        ['h6', data_row.snippet.publishedAt.split('T')[0]],
                    ]
                ],
                ['div', {class: 'clr'}]
            ]);

            ul.appendChild(a);
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

   stats_sidebar.add_child_widgets('featured_channel', setting_page); 
})();