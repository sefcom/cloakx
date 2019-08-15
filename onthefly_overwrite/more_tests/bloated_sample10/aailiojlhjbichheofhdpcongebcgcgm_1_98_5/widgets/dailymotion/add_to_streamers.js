(function () {

    'use strict';

    var widget = {

        name: 'Heartbeat streamer',
        interval: 5 * 60 * 1000, // 5 minutes
        current_url: '',

        initialize: function () {  
            this.streamer = null;
            this.subscription = null;
            this.current_url = window.location.href;

            this.notify_button = jsonToDOM(['div', {id: 'btn_notify_me_wrap'},
                ['button', {
                        id: 'btn_notify_me',
                        class: 'btn',
                        title: util.locale('notify_me_tooltip')
                    },
                    ['span', {class: 'heartbeat_icon'}],
                    ['span', {class: 'button_text stay'}, util.locale('streamer_notify_me')],
                    ['span', {class: 'button_text hover'}, util.locale('streamer_notify_me')]
                ]
            ]);
        },

        start: function () {
            if (!~this.current_url.indexOf('/live/')) {
                return;
            }

            if (!this.check_live_status_interval) {
                this.check_live_status();
            }
            
            clearInterval(this.check_live_status_interval);
            this.check_live_status_interval = setInterval(function () {
                widget.check_live_status();
            }, this.interval);

            this.get_streamer_info();
        },

        check_live_status: function () {
            var video_id = _.last(this.current_url.split('/'));

            fermata.json('https://api.dailymotion.com/video/' + video_id)
                ({
                    fields: 'updated_time,game.title,id,language,onair,owner.avatar_120_url,start_time,'
                        + 'owner.description,owner.username,thumbnail_480_url,title,url,views_last_hour'
                })
                .get(this.update_live_status);
        },

        get_streamer_info: function () {
            var a = util.$('.channel-avatar-media__content a')[0];

            if (!a || !settings.hb_streamer_notify) {
                this.notify_button.remove();
                return;
            }

            if (this.streamer) {
                this.get_subscription_info();
                return;
            }

            util.api('streamer')
                ({
                    platform: 'dailymotion',
                    username: a.innerText
                })
                .get(function (err, result) {
                    widget.streamer = !err && result;
                    if (!widget.streamer) {
                        widget.render_notify_button();
                        return;
                    }

                    widget.get_subscription_info();
                });
        },

        get_subscription_info: function () {
            if (this.subscription || !session.user) {
                this.render_notify_button();
                return;
            }

            util.api('streamer')('subscription')
                ({streamer_id: this.streamer._id})
                .get({'ACCESS-TOKEN': session.access_token}, null, function (err, result) {
                    widget.subscription = !err && result;
                    widget.render_notify_button();
                });
        },

        render_notify_button: function () {
            var btn = util.$('#btn_notify_me_wrap'),
                container = util.$('.channel-avatar-media__content')[0];

            if (!container) {
                return;
            }

            if (!btn) {
                container.appendChild(this.notify_button);
                btn = util.bind_elem_functions(this.notify_button);
            }

            if (this.subscription) {
                btn.add_class('subscribed');
            }
            else {
                btn.remove_class('subscribed');
            }

            util.$('.button_text.stay', btn)[0].innerText = this.subscription 
                ? util.locale('streamer_notification_subscribed') 
                : util.locale('streamer_notify_me');
            util.$('.button_text.hover', btn)[0].innerText = this.subscription 
                ? util.locale('streamer_unsubscribe_notification') 
                : util.locale('streamer_notify_me');
            util.$('#btn_notify_me', btn).onclick = !this.subscription ? this.on_subscribe : this.on_unsubscribe;
        },

        ask_login: function (callback) {
            var login_link = util.get_login_link(),
                popup;

            popup = window.open(login_link, '_blank',
                'resizable=yes, scrollbars=yes, titlebar=yes, width=800, height=600, top=10, left=10');

            util.wait_for(function () { 
                session.load();
                return !!session.user; 
            }, callback, 2000, 120 * 1000);
        },

        on_subscribe: function () {
            if (!session.user) {
                this.ask_login();
                return;
            }

            if (this.streamer) {
                this.subscribe();
                return;
            }
            
            this.create_streamer(this.subscribe);
        },

        create_streamer: function (callback) {
            var a = util.$('.channel-avatar-media__content a')[0],
                username = a ? a.innerText : '';

            if (!username) {
                return;
            }

            util.api('streamer')
                .post({
                    platform: 'dailymotion',
                    url: window.location.toString(),
                    username: username
                }, function (err, result) {
                    if (err || !result  || !result.value) {
                        return;
                    }

                    widget.streamer = result.value;
                    callback && callback();
                });
        },

        subscribe: function () {
            var btn = util.$('#btn_notify_me', this.notify_button);
            
            btn.setAttribute('disabled', 'disabled');
            util.api('streamer')('subscribe')
                .post(
                    {'ACCESS-TOKEN': session.access_token},
                    {
                        streamer_id: this.streamer._id,
                        location: 'platform',
                        token_id: settings.public_token_id
                    }, function (err, result) {
                        btn.removeAttribute('disabled');
                        if (!err && result.success) {
                            widget.notify_button.add_class('subscribed');
                            util.$('.button_text.stay', btn)[0].innerText = util.locale('streamer_notification_subscribed');
                            util.$('.button_text.hover', btn)[0].innerText = util.locale('streamer_unsubscribe_notification');
                            btn.onclick = widget.on_unsubscribe;
                        }
                    }
                );
        },

        on_unsubscribe: function () {
            if (!session.user) {
                this.ask_login();
                return;
            }

            this.unsubscribe();
        },

        unsubscribe: function () {
            var btn = util.$('#btn_notify_me', this.notify_button);

            btn.setAttribute('disabled', 'disabled');
            util.api('streamer')('unsubscribe')
                .post(
                    {'ACCESS-TOKEN': session.access_token},
                    {
                        streamer_id: this.streamer._id,
                        token_id: settings.public_token_id
                    }, function (err, result) {
                        btn.removeAttribute('disabled');
                        if (!err && result.success) {
                            widget.notify_button.remove_class('subscribed');
                            util.$('.button_text.stay', btn)[0].innerText = util.locale('streamer_notify_me');
                            util.$('.button_text.hover', btn)[0].innerText = util.locale('streamer_notify_me');
                            btn.onclick = widget.on_subscribe;
                        }
                    }
                );
        },

        parse_current_views: function () {
            var a = util.$('.count-viewers__audience')[0];

            if (!a) {
                return 0;
            }

            return +a.innerText;
        },

        parse_display_name: function () {
            var a = util.$('.video__infos__title')[0];

            if (!a) {
                return '';
            }

            return a.innerText;
        },

        update_live_status: function (err, result) {
            var data;

            if (err || !result || !result.onair) {
                return;
            }

            data = {
                platform: 'dailymotion',
                url: result.url,
                username: result['owner.username'],
                status: result.title,
                created_at: result.start_time ? new Date(result.start_time).toISOString() : null,
                playing_game: result['game.title'],
                current_viewers: this.parse_current_views(),
                display_name: this.parse_display_name(),
                profile_image: result['owner.avatar_120_url'],
                stream_preview: result.thumbnail_480_url,
                lang: result.language
            };

            util.api('streamer')
                .post(data, _.noop);
        },

        integrity: function () {
            return this.current_url === window.location.href;
        },

        settings_changed: function (change) {
            if (change.hb_streamer_notify) {
                this.start();
            }
        }
    };

    widgets.push(widget);
})();
