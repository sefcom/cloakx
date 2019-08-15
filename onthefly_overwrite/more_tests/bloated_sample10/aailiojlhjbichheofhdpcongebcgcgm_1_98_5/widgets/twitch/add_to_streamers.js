(function () {

    'use strict';

    var widget = {

        name: 'Heartbeat streamer',
        interval: 5 * 60 * 1000, // 5 minutes

        initialize: function () {            
            this.current_path = window.location.pathname;
            this.streamer = null;
            this.subscription = null;
            this.notify_button = jsonToDOM(['div', {id: 'btn_notify_me_wrap'},
                ['button', {
                        id: 'btn_notify_me',
                        class: 'button primary',
                        title: util.locale('notify_me_tooltip')
                    },
                    ['span', {class: 'heartbeat_icon'}],
                    ['span', {class: 'button_text stay'}, util.locale('streamer_notify_me')],
                    ['span', {class: 'button_text hover'}, util.locale('streamer_notify_me')]
                ]
            ]);
        },

        start: function () {
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
            var username = this.current_path.slice(1);

            if (!username || ~username.indexOf('/')) {
                return;
            }

            fermata.json('https://api.twitch.tv/kraken/streams')
                ({channel: username})
                .get(this.update_live_status);
        },

        get_streamer_info: function () {
            var username = _(this.current_path.split('/')).filter().first();

            if (!settings.hb_streamer_notify) {
                this.notify_button.remove();
                return;
            }

            if (this.streamer) {
                this.get_subscription_info();
                return;
            }

            util.api('streamer')
                ({
                    platform: 'twitch',
                    username: username
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
                before_element = util.$('.stats-and-actions')[0];

            if (!before_element || !before_element.parentElement || !before_element.nextSibling) {
                return;
            }

            if (!btn) {
                before_element.parentElement.insertBefore(this.notify_button, before_element.nextSibling);
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
            var username = _(this.current_path.split('/')).filter().first();

            if (!username) {
                return;
            }

            util.api('streamer')
                .post({
                    platform: 'twitch',
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
                        location: 'platform'
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
                    {streamer_id: this.streamer._id}, function (err, result) {
                        btn.removeAttribute('disabled');
                        if (!err && result.success) {
                            widget.notify_button.remove_class('subscribed');
                            util.$('.button_text.stay', btn)[0].innerText = util.locale('streamer_notify_me');
                            util.$('.button_text.hover', btn)[0].innerText = util.locale('streamer_notify_me');
                            btn.onclick = widget.on_subscribe;
                        }
                    });
        },

        update_live_status: function (err, result) {
            var username = _(this.current_path.split('/')).filter().first(),
                data;

            if (err || !result || !result.streams || !result.streams.length) {
                return;
            }

            result = result.streams[0];

            data = {
                platform: 'twitch',
                url: window.location.toString(),
                username: username,
                status: result.channel.status,
                created_at: result.created_at,
                playing_game: result.game,
                current_viewers: result.viewers,
                display_name: result.channel.display_name,
                profile_image: result.channel.logo,
                stream_preview: result.preview.medium,
                lang: result.channel.language
            };

            util.api('streamer')
                .post(data, _.noop);
        },

        integrity: function () {
            // move to top right of games stats container
            if (this.notify_button.parentElement && 
                this.notify_button.previousSibling &&
                this.notify_button.previousSibling !== util.$('.stats-and-actions')[0]) {
                this.notify_button.remove();
                this.render_notify_button();
            }

            return this.current_path === window.location.pathname;
        },

        settings_changed: function (change) {
            if (change.hb_streamer_notify) {
                this.start();
            }
        }
    };

    widgets.push(widget);
})();
