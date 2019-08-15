(function () {
    var email,
        verify_timer,
        verify_interval = 10 * 60 * 1000,
        verifier = {
            hitbox: {
                verify: function (subscription, callback) {
                    var that = this;

                    fermata.json('http://api.hitbox.tv/media/live/' + subscription.username)
                        .get(function (err, result) {
                            if (err || !result || !result.livestream || !result.livestream.length) {
                                subscription.live = 0;
                                return callback && callback(subscription);
                            }

                            that.on_verify(subscription, result, callback);
                        });
                },

                on_verify: function (subscription, result, callback) {
                    var lived = subscription.live;

                    result = _.find(result.livestream, {media_name: subscription.username});
                    if (!result || result.media_is_live === '0') {
                        subscription.live = 0;
                        return callback && callback(subscription);
                    }

                    subscription.live = 1;
                    subscription.status = result.media_status;
                    subscription.created_at = result.media_live_since.replace(' ', 'T').replace('Z', '') + 'Z';
                    subscription.playing_game = result.category_name;
                    subscription.current_viewers =  +result.media_views;
                    subscription.display_name = result.media_display_name;
                    subscription.profile_image = 'http://edge.sf.hitbox.tv' + result.channel.user_logo;
                    subscription.stream_preview = 'http://edge.sf.hitbox.tv' + result.media_thumbnail;
                    subscription.lang = result.media_countries ? result.media_countries.join().toLowerCase() : null;

                    util.api('streamer')
                        .post(subscription, _.noop);

                    callback && callback(subscription, subscription.live && !lived);
                }
            },

            twitch: {
                verify: function (subscription, callback) {
                    var that = this;

                    fermata.json('https://api.twitch.tv/kraken/streams')({channel: subscription.username})
                        .get(function (err, result) {
                            if (err || !result || !result.streams || !result.streams.length) {
                                subscription.live = 0;
                                return callback && callback(subscription);
                            }

                            that.on_verify(subscription, result.streams[0], callback);
                        });
                },

                on_verify: function (subscription, result, callback) {
                    var lived = subscription.live;

                    subscription.live = 1;
                    subscription.status = result.channel.status;
                    subscription.created_at = result.created_at;
                    subscription.playing_game = result.game;
                    subscription.current_viewers =  result.viewers;
                    subscription.display_name = result.channel.display_name;
                    subscription.profile_image = result.channel.logo;
                    subscription.stream_preview = result.preview.medium;
                    subscription.lang = result.channel.language;

                    util.api('streamer')
                        .post(subscription, _.noop);

                    callback && callback(subscription, subscription.live && !lived);
                }
            },

            youtube: {
                verify: function (subscription, callback) {
                    var that = this;

                    util.api('streamer')('subscription')({ 
                            email: email,
                            streamer_id: subscription._id
                        })
                        .get(function (err, result) {
                            if (err || !result || !result.live) {
                                subscription.live = 0;
                                return callback && callback(subscription);
                            }

                            that.on_verify(subscription, result, callback);
                        });
                },

                on_verify: function (subscription, result, callback) {
                    var lived = subscription.live;

                    subscription.live = 1;
                    _.forOwn(result, function (key, value) {
                        if (subscription[key]) {
                            subscription[key] = value;
                        }
                    });

                    callback && callback(subscription, subscription.live && !lived);
                }
            },

            dailymotion: {
                verify: function (subscription, callback) {
                    var that = this;

                    fermata.json('https://api.dailymotion.com/videos')
                    ({
                        fields: 'updated_time,game.title,id,language,onair,owner.avatar_120_url,start_time,'
                            + 'owner.description,owner.username,thumbnail_480_url,title,url,views_last_hour',
                        flags: 'live,live_onair',
                        owners: subscription.username
                    })
                    .get(function (err, result) {
                        if (err || !result || !result.list || !result.list.length) {
                            subscription.live = 0;
                            return callback && callback(subscription);
                        }

                        that.on_verify(subscription, result.list[0], callback);
                    });
                },

                on_verify: function (subscription, result, callback) {
                    var lived = subscription.live;

                    subscription.live = 1;
                    subscription.url = result.url;
                    subscription.status = result.title;
                    subscription.created_at = result.start_time ? new Date(result.start_time).toISOString() : null;
                    subscription.playing_game = result['game.title'];
                    subscription.current_viewers = +result['views_last_hour'];
                    subscription.display_name = result['owner.description'];
                    subscription.profile_image = result['owner.avatar_120_url'];
                    subscription.stream_preview = result.thumbnail_480_url;
                    subscription.lang = result.language;

                    util.api('streamer')
                        .post(subscription, _.noop);

                    callback && callback(subscription, subscription.live && !lived);
                }
            }
        };

    function start_listening () {
        if (!settings || !settings.hb_streamer_notify || !session.user) {
            return;
        }

        util.api('streamer')('subscriptions')({full: 1})
            .get({'ACCESS-TOKEN': session.access_token}, null, function (err, result) {
                if (err) {
                    return;
                }

                _.forEach(result, function (item) {
                    item.live = 0;
                });

                localStorage.setItem('heartbeat_streamer_subscriptions', JSON.stringify(result));
                verify_subscriptions();

                clearInterval(verify_timer);
                verify_timer = setInterval(verify_subscriptions, verify_interval);
            });
    }

    function notify_streamer_online (subscription) {
        chrome.tabs.query({active: true}, function(tabs) {
            _.forEach(tabs, function (tab) {
                chrome.tabs.sendMessage(tab.id, {
                    message: 'streamer_online', 
                    subscription: subscription
                }); 
            });
        });
    }

    function verify_subscriptions() {
        var temp = localStorage.getItem('heartbeat_streamer_subscriptions'),
            subscriptions = JSON.parse(temp),
            count = 0,

            on_verify = function (subscription, notify) {
                count += 1;

                if (notify) {
                    notify_streamer_online(subscription);
                }

                if (count === subscriptions.length) {
                    localStorage.setItem('heartbeat_streamer_subscriptions', JSON.stringify(subscriptions));
                }
            };

        _.forEach(subscriptions, function (subscription) {
            var platform = verifier[subscription.platform];

            if (platform) {
                platform.verify(subscription, on_verify);
            }
        });
    }

    // wait for settings fully loaded
    setTimeout(start_listening, 5 * 1000);

    window.chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if(request.message === 'heartbeat_setting_changed'){
            chrome.storage.sync.get(null, function (_settings) {
                settings = _settings;
                if (!settings || !settings.hb_streamer_notify) {
                    clearInterval(verify_timer);
                    verify_timer = null;
                }
                else {
                    start_listening();
                }
            });
        }

        return true;
    });
})();
