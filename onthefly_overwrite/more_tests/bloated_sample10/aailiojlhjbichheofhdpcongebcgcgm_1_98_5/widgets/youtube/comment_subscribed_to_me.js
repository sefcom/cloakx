(function () {
    'use strict';

    var widget = {

        name: 'Comment subscribed to me',
        user_name: '',
        my_channel_id: '',

        start: function () {
            var that = this,
                timer;

            widget.show = data.page === 'watch' && settings.subscribed_to_me;

            if (!widget.show) {
                return;
            }

            this.load_cache();
            this.user_name = data.user_name;
            this.verified_map = {};
            this.username_map = {};

            timer = window.setInterval(function () {
                if (!util.$('#yt-comments-list')) {
                    return;
                }

                clearInterval(timer);

                that.get_own_channel_id();
                that.parse_comments();
                that.listen_load_more_comments();
                that.add_button_sort();
                that.listen_load_more_reply();
            }, 500);
        },

        parse_comments: function () {
            var comments = util.$('.comment-item .user-name:not(.freedom_parsed)');

            _(comments)
                .forEach(this.parse_comment_dom)
                .commit();
        },

        add_subscribed_icon: function (comment) {
            var icon = jsonToDOM(['img', {
                        src: config.assets_url + 'subscribed_icon.png',
                        class: 'hb_subscribed_to_me'
                    }
                ]);

            if (comment && !util.$('.hb_subscribed_to_me', comment).length) {
                comment.appendChild(icon);
                this.check_parent(comment);  
            }
        },
   
        parse_comment_dom: function (comment) {
            var array = comment.getAttribute('href').split('/'),
                identity_type = array[1],
                identity = array[2];

            comment.add_class('freedom_parsed');

            if (!identity || !identity_type || identity === this.my_channel_id) {
                return;
            }

            if (identity_type === 'channel') {
                return this.verify_subscription(identity, comment);
            }
            
            if (identity_type === 'user') {
                this.get_channel_id(identity, comment);
            }
        },

        get_channel_id: function (username, comment) {
            var that = this;

            // already loaded channel for this username
            if (this.username_map[username]) {
                return that.verify_subscription(this.username_map[username], comment);
            }
            
            util.api('channel')({username: username})
                .get(function (err, result) {
                    if (err || !result || !result.items || !result.items.length) return;
                    that.verify_subscription(result.items[0].id, comment);
                    that.username_map[username] = result.items[0].id;
                });
        },

        get_own_channel_id: function () {
            var own_info = util.$('#yt-comments-sb-standin .yt-uix-sessionlink .video-thumb')[0]; 

            if (!own_info) {
                return;
            }

            this.my_channel_id = own_info.getAttribute('data-ytid');
        },

        get_user_cache: function (key) {
            var cache_item = this.cached_items[key];

            if (!cache_item) return null;

            var seconds = cache_item.expired_in || (72 * 3600);
            if (moment().diff(cache_item.date, 'seconds') > seconds) {
                delete this.cached_items[key];
                return null;
            }

            return cache_item;
        },

        set_user_cache: function (key, data, secs) {
            this.cached_items[key] = {
                date: new Date(),
                expired_in: secs || (72 * 3600),
                data: data
            };
        },

        load_cache: function () {
            var cached_items = util.json_parse(localStorage.getItem('comment_subscribed_to_me')) || {};

            _.forOwn(cached_items, function (val, key) {
                if (!val) return;

                var seconds = val.expired_in || (72 * 3600);

                if (moment().diff(val.date, 'seconds') > seconds) {
                    delete cached_items[key];
                }
            });

            this.cached_items = cached_items;
        },

        save_cache: function () {
            localStorage.setItem('comment_subscribed_to_me', JSON.stringify(this.cached_items));
        },

        verify_subscription: function (channel_id, comment) {
            var that = this,
                cache_key = this.my_channel_id + '_' + channel_id,
                cache_item = this.get_user_cache(cache_key);

            if (this.verified_map[channel_id] !== undefined) { //verifyed
                if (this.verified_map[channel_id]) this.add_subscribed_icon(comment);
                return;
            }

            if (cache_item) {
                this.verified_map[channel_id] = cache_item.data;
                if (cache_item.data) this.add_subscribed_icon(comment);
                return;
            }

            fermata
                .json('https://www.googleapis.com/youtube/v3/subscriptions')
                ({
                    part: 'id',
                    channelId: channel_id,
                    forChannelId: this.my_channel_id,
                    maxResults: 1,
                    key: config.youtube_browser_key
                })
                .get(function (err, result) {
                    var ok = !err && result && result.items && result.items.length;

                    that.set_user_cache(cache_key, ok);
                    that.verified_map[channel_id] = ok;
                    that.save_cache();
                    if (ok) that.add_subscribed_icon(comment);
                });
        },

        listen_load_more_comments: function () {
            var comment_form = util.$('.paginator')[0];

            if (comment_form) {
                comment_form.removeEventListener('click', this.on_load_more_comment);
                comment_form.addEventListener('click', this.on_load_more_comment);
            }

            this.listen_load_more_reply();
        },

        on_load_more_comment: function () {
            var that = this,
                interval,
                loading_icon = util.$('.paginator');

            if (loading_icon.length) {
                loading_icon = loading_icon[0];

                interval = setInterval(function () {
                    if (!loading_icon.has_class('activated')) {
                        clearInterval(interval);

                        that.parse_comments();
                    }
                }, 500);
            }
        },

        sort_by_subscribed: function () {
            var list_comment = util.$('.has_subscribed'),
                list = util.$('#yt-comments-list'),
                length = list_comment.length,
                j = 0,
                temp;

            for (j = length - 1; j >= 0; j--) {
                temp = list_comment[j];
                list.removeChild(list_comment[j]);
                list.insertBefore(temp, list.firstElementChild);
            }
        },

        add_button_sort: function () {
            var menu = util.$('.comments-order-menu')[0],
                button = jsonToDOM(['button', {
                    class: 'hb_custom_sort_btn',
                    onclick: this.sort_by_subscribed
                }, util.locale('sort_by_subscribed')]);

            if (!menu) {
                return;
            }

            menu.appendChild(button);
        },

        check_parent: function (comment) {
            var super_parent = comment.parentNode.parentNode.parentNode;

            if (super_parent.getAttribute('class').match('reply')) {
                super_parent.parentNode.parentNode.setAttribute('class', 'comment-entry has_subscribed');
                return;
            }
            
            super_parent.parentNode.setAttribute('class', 'comment-entry has_subscribed');
        },

        listen_load_more_reply: function () {
            var load_more_btn = util.$('.load-comments'),
                that = this;   

            _(load_more_btn)
                .forEach(function (more) {
                    more.removeEventListener('click', that.on_display_more_replies);
                    more.addEventListener('click', that.on_display_more_replies);
                })
                .commit();
        },

        on_display_more_replies: function (evt) {
            var more = util.bind_elem_functions(evt.srcElement).parentNode,
                data_cid = more.getAttribute('data-cid'),
                that = this,
                interval;

            if (data_cid) {
                interval = setInterval(function () {
                    if (more.has_class('hid')) {
                        clearInterval(interval);
                        that.parse_comments();
                    }
                }, 500);
            }
        }
    };

    widgets.push(widget);
})();
