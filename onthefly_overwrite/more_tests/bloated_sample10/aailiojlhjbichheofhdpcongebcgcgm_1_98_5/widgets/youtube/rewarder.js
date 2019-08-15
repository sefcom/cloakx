(function() {
    
    'use strict';

    var widget = {

        name: 'Rewarder',
        comments: {},
        watched_videos: {},
        subscribed: {},

        initialize: function() {
            var that = this;
            
            clearInterval(this.register_event_interval);
            this.register_event_interval = setInterval(function () {
                that.register_event_listeners();
            }, 3000);
        },

        register_event_listeners: function () {
            var is_watching = ~location.pathname.indexOf('/watch'),
                subscribable = ~location.pathname.indexOf('/user') 
                    || ~location.pathname.indexOf('/channel') || is_watching,

                watching_video_id = util.parse_qs().v,
                is_video_changed = watching_video_id !== this.watching_video_id;

            if (subscribable && (!this.subscribe_button || is_video_changed)) {
                this.listen_for_subscribe_channel();
            }

            if (subscribable && (!this.unsubscribe_button || is_video_changed)) {
                this.listen_for_unsubscribe_channel();
            }

            if (is_watching) {
                this.listen_for_comment();
            }

            if (is_watching && is_video_changed) {
                this.watching_video_id = watching_video_id;
                this.listen_for_video_watch();
            }
        },

        on_channel_subscribe: function () {
            var that = this;

            util.$wait('.yt-uix-button-subscribed-branded', function (err) {
                if (err || that.subscribed[data.channel_id]) {
                    return;
                }

                if (!data.email) {
                    return;
                }

                that.subscribed[data.channel_id] = true;

                util.api('reward')('reward_points')
                    .post({
                        action_name: 'subscribe_a_channel',
                        username: data.email,
                        action_data: {
                            channel_id: data.channel_id
                        }
                    }, function () {});
            });
        },

        listen_for_subscribe_channel: function () {
            this.subscribe_button = util.$('.yt-uix-button-subscribe-branded')[0];

            if (this.subscribe_button) {
                this.subscribed[data.channel_id] = false;
                this.subscribe_button.removeEventListener('click', this.on_channel_subscribe);
                this.subscribe_button.addEventListener('click', this.on_channel_subscribe);
            }
        },

        on_channel_unsubscribe: function () {
            var that = this;

            util.$wait('.yt-uix-button-subscribe-branded', function (err) {
                if (err || !that.subscribed[data.channel_id]) {
                    return;
                }

                if (!data.email) {
                    return;
                }

                that.subscribed[data.channel_id] = false;

                util.api('reward')('reward_points')
                    .post({
                        action_name: 'unsubscribe_a_channel',
                        username: data.email,
                        action_data: {
                            channel_id: data.channel_id
                        }
                    }, function () {});
            });
        },

        listen_for_unsubscribe_channel: function () {
            this.unsubscribe_button = util.$('.yt-uix-button-subscribed-branded')[0];

            if (this.unsubscribe_button) {
                this.subscribed[data.channel_id] = true;
                this.unsubscribe_button.removeEventListener('click', this.on_channel_unsubscribe);
                this.unsubscribe_button.addEventListener('click', this.on_channel_unsubscribe);
            }
        },

        listen_for_comment: function () {
            var that = this,
                elem = util.$('#yt-comments-list .comment-item')[0],
                comment_id, video_id, text;

            if (!elem || !elem.getAttribute('data-own')) {
                return;
            }

            comment_id = elem.getAttribute('data-cid');
            video_id = elem.getAttribute('data-vid');
            text = util.$('.comment-text-content', elem)[0].innerText;

            if (that.comments[comment_id] || text.length < 50) {
                return;
            }

            that.comments[comment_id] = true;

            util.api('reward')('reward_points')
                .post({
                    action_name: 'add_a_good_comment',
                    username: data.email,
                    action_data: {
                        comment_id: comment_id,
                        video_id: video_id,
                        comment_text: text
                    }
                }, function () {});
        },

        listen_for_video_watch: function () {
            var player = util.$('#player-api video')[0],
                that = this;

            function on_player_ended() {
                var start = player.played.start(0),
                    end = player.played.end(0);

                if (!data.email) {
                    return;
                }

                if (!that.watched_videos[that.watching_video_id] 
                    && (end - start) / player.duration > 0.95) {
                    that.watched_videos[that.watching_video_id] = true;

                    util.api('reward')('reward_points')
                        .post({
                            action_name: 'fully_watch_a_video',
                            username: data.email,
                            action_data: {
                                video_id: that.watching_video_id
                            }
                        }, function () {});
                }
            }

            if (!player) {
                return;
            }

            player.removeEventListener('ended', on_player_ended);
            player.addEventListener('ended', on_player_ended);
        }
    };

    widgets.push(widget);

})();
