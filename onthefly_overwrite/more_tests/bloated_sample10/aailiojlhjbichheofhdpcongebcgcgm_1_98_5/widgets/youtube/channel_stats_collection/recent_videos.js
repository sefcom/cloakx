(function () {
    'use strict';

    var setting_page = {

        is_show: false,

        menu_id: '#hb_recent_video_menu',

        start: function () {
         
            this.menu_item = jsonToDOM(['li', {
                    class: (localStorage.getItem('current_menu') === 'recent_video_stats') ? 'menu_stats_item active' : 'menu_stats_item',
                    'frame-name': 'recent_video_stats',
                    onclick: this.menu_click,
                    id: this.menu_id.slice(1)
                },
                util.locale('recent_videos')
            ]);

            this.content_data = jsonToDOM(['div', {
                    class: 'stats_frame', 
                    id: 'recent_video_stats',
                    style: (localStorage.getItem('current_menu') === 'recent_video_stats') ? 'display:block' : 'display:none',
                },
                ['ul', {id: 'heartbeat_recent_video_channel'}]
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

            this.is_show = (localStorage.getItem('current_menu') === 'recent_video_stats');

            if (settings.stats_sidebar && settings.stats_wrap && this.is_show) {
                that.show_loading();

                util.api('recent_video_by_channel')({channel_id: data.channel_id})
                .get(function (err, result) {    
                    that.remove_loading();
                    
                    if (err || !result.length) {
                        that.stats_not_index_yet();
                        return;
                    }

                    that.insert_data(result);
                });
            }
        },
        
        insert_data: function (data) {
            var ul = util.$('#heartbeat_recent_video_channel'),
                that = this;

            _(data)
                .forEach(function (data_row) {
                    if (data_row.id.kind === 'youtube#video') {
                        ul.appendChild(that.recent_video_box(data_row));
                    }
                })
                .commit(); 
        },

        recent_video_box: function (data_row) {
            return jsonToDOM(['a', {href: 'https://www.youtube.com/watch?v=' + data_row.id.videoId + '&hb=channel_stats'},
                ['li', {class: 'heartbeat_recent_video_box'},
                    ['img', {src: data_row.snippet.thumbnails.default.url}],
                    ['p', 
                        ['h4', data_row.snippet.title],
                        ['h6', data_row.snippet.publishedAt.split('T')[0]],
                    ]
                ]    
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

   stats_sidebar.add_child_widgets('recent_video_stats', setting_page); 
})();