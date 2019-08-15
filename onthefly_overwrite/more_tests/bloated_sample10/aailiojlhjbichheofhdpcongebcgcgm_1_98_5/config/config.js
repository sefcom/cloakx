var heartbeat_chrome = typeof(chrome) !== 'undefined',
    settings = null,
    widgets = [],
    config = {},
    data = {},
    session = {};



(function () {
    'use strict';

    var manifest = chrome.runtime.getManifest(),

        default_to_true = function (obj, key) {
            if (typeof(obj[key]) === 'undefined' || obj[key] === '') {
                obj[key] = true;
            }
        },

        keys = ['spm', '!spd', '!sph', 'vpm', '!vpd', '!vph', 'tags', 'videos', 'lights',
            'social_stats', 'monetization', 'favorite_comments',
            'light_switch', 'estimated_earnings','twitch_dark_mode', '!hide_not_available_videos',
            'realtime_analytics', 'new_switch', '!show_video_manager', '!show_analytics',
            '!show_comments', '!open_tags', '!spam_comments', 'heartbeat_position',
            'twitch_earnings', 'pick_a_winner', '!twitch_lights',
            'subscription_status', 'sort_playlist', '!feed_tab', 'rating_bar',
            'heartbeat_tags', 'tag_search_result', '!video_notes', 'broadcaster_stats',
            '!flash_player', '!autorepeat', 'comments_playback_control',
            '!channel_identifier', 'video_statistics', 'new_player',
            'crm', 'twitch_social_feed', 'hitbox_earnings', '!reaction_count',
            'freedom_dashboard', '!stats_sidebar', 'stats_basic', 'stats_wrap', '!stats_collection',
            '!scroll_to_top', '!annotation_tool', 'save_moment', '!channel_latest_stats', '!subscribed_to_me', 'heartbeat_labs',
            'dailymotion_earnings', '!dailymotion_light_switch', 'dailymotion_light', 'deleted_video_remover',
            'hb_youtube_social_tab',  'branded_video', 'hb_streamer_notify', 'comment_count',
            'channel_activity', '!disable_autoplay_new', 'peek_video_link',
            '!hide_youtube_widgets', '!hide_yt_video_information', '!hide_yt_video_description', '!hide_yt_video_comments',
            '!hide_yt_dislike_button', '!hide_yt_up_next_playlist', '!hide_yt_footer',
            'enable_playback_speed', 'default_playback_speed', '!auto_pause', 'auto_resume', '!hide_deleted_and_privated_videos',
            '!yt_legacy_menu', 'heartbeat_discovery',
            '!hide_watched_video', 'toggle_more_space', 'show_watch_later', '!auto_hd', 'truncate_long_title', 'icon_mode',
            '!toggle_yt_shortcut', 'shorter_title', '!disable_annotations', 'dailymotion_view_comment_count', 'dailymotion_follower_count',
            'fb_block_seen_chat', '!auto_expand_description', 'show_creator_bar_status',
            'remaining_characters', 'website'
        ];


    config.key_default = keys;

    config.twitch_client_id = 'e91j4e8skt2zjz7mwc6s99fv8tzt0h6';
    config.server_ip_add = 'https://www.you1tube.com';
    // config.server_ip_add = 'https://localhost';
    config.website_ip_add = 'https://www.heartbeat.tm';
    // config.website_ip_add = 'https://heartbeat.dev:7676';
    config.server2_ip_add = 'https://www.you1tube.com';
    // config.server2_ip_add = 'https://localhost';
    // config.assets_url = 'https://localhost/';
    config.assets_url = 'https://s3.amazonaws.com/heartbeat.asset/';
    config.youtube_browser_key = 'AIzaSyAJL_42pwk5-Q2z6MVZVMQ8wXGrlna6dVo';
    config.youtube_browser_key2 = 'AIzaSyAqBXkzpu27Ihe0XCwJz04jkzs4JFFdLzc';
    config.version_name = '';
    config.version = manifest.version;
    config.yt_scroll_limit = 1100;

    config.GA_tracking_code = 'UA-46773919-25';

    widgets.all = function () {
        var len = this.length,
            fn = arguments[0];

        while (len--) {
            var widget = widgets[len];

            if (widget.beta && !session.has_role('lab')) {
                continue;
            }

            if (widget[fn]) {
                widget[fn].apply(widget, arguments[1]);
            }
        }
    };

    function get_session () {
        var session_keys = ['access_token', 'user', 'issued_at'];

        session.load = function () {
            chrome.storage.sync.get(null, function (_data) {

                session_keys.forEach(function (key) {
                    session[key] = _data[key];
                });

                if (!session.issued_at || (typeof moment !== 'undefined' && moment().diff(session.issued_at, 'hours') > 96)) {
                    session.user = null;
                }

                if (session.user) {
                    session.is_ready = true;
                    return;
                }

                // try to obtain new one when it nearly expired
                if (session.access_token) setTimeout(session.refresh, 0);
            });
        };

        session.save = function (callback) {
            var obj = {};

            session_keys.forEach(function (key) {
                obj[key] = session[key];
            });

            chrome.storage.sync.set(JSON.parse(JSON.stringify(obj)), callback);
        };

        session.refresh = function (callback) {
            if (!session.access_token) return;

            util.api('auth')('session')
                .get({'ACCESS-TOKEN': session.access_token}, null, function (err, result) {
                    session.is_ready = true;

                    if (err) {
                        return session.destroy(callback);
                    }

                    session.issued_at = new Date();
                    session.access_token = result.token;
                    session.user = result;
                    session.save(callback);
                });
        };

        session.destroy = function (callback) {
            session.access_token = '';
            session.user = null;
            session.issued_at = null;
            session.save(callback);
        };

        session.get_channel_id = function (email) {
            var accs = session.user && session.user.accounts,
                filter = {provider: 'google'},
                acc;

            email = email || data.email;
            if (email) filter.email = email;

            acc = _(accs).filter(filter).first();
            return acc && acc.channel_id;
        };

        session.has_role = function (role) {
            return session.user && ~session.user.roles.indexOf(role);
        };

        session.on_ready = function (callback) {
            var timer;

            if (session.is_ready) return callback && callback();

            timer = setInterval(function () {
                if (session.is_ready) {
                    clearInterval(timer);
                    return callback && callback();
                }
            }, 500);

            // can't wait forever
            setTimeout(function () { clearInterval(timer); }, 60000);
        }

        session.load();
    }


    function set_settings (_settings) {
        if (!_settings) {
            _settings = {};
        }

        if (_settings.list) {
            _settings = _settings.list;
        }

        _settings.save = function (callback) {
            var i;

            if (heartbeat_chrome) {
                chrome.storage.sync.set(JSON.parse(JSON.stringify(this)), function () {
                    if (!chrome.runtime.lastError) {
                        // console.log('save successful');
                    }
                    else {
                        console.log(chrome.runtime.lastError);
                    }
                    callback && callback();
                });
            }
            else {
                for (i in this) {
                    if (typeof(this[i]) !== 'function') {
                        this.set(i, this[i]);
                    }
                }
                callback && callback();
            }
        };

        _settings.set = function (key, value) {
            this[key] = value;
            if (heartbeat_chrome) {
                this.save();
            }
            else {
                CrossriderAPI.do('heartbeat_set_db_value', {key: key, value: value});
            }
        };

        if (heartbeat_chrome) {
            _settings.refresh = function (cb) {
                chrome.storage.sync.get(null, function (_settings) {
                    settings = util.extend(settings, _settings);
                    cb && cb();
                });
            };
        }

        keys.forEach(function (key) {
            if (key[0] === '!') {
                key = key.slice(1);
                if (typeof(_settings[key]) === 'undefined') {
                    _settings[key] = false;
                }
            }
            else if (key === 'heartbeat_position') {
                if (typeof(_settings[key]) === 'undefined') {
                    _settings[key] = 'sb-button-notify';
                }
            }
            else if (key === 'default_playback_speed') {
                if (typeof(_settings[key]) === 'undefined') {
                    _settings[key] = 1;
                }
            }
            else {
                default_to_true(_settings, key);
            }
        });

        _settings.save();

        settings = _settings;
    }


    if (heartbeat_chrome) {
        chrome.storage.sync.get(null, set_settings);
        get_session();
    }
    else {
        CrossriderAPI.do = function (action, payload, callback) {
            var callbacks = {},
                time = (~~+new Date()).toString();

            if (!payload) {
                payload = {};
            }

            payload.stamp = time;

            if (callback) {
                callbacks[time] = callback;
            }

            CrossriderAPI.bindExtensionEvent(document.body, 'heartbeat_receive', function (e, _data) {
                var stamp = _data.stamp;
                delete _data.stamp;
                if (callbacks[stamp]) {
                    callbacks[stamp](_data);
                    delete callbacks[stamp];
                }
            });


            CrossriderAPI.fireExtensionEvent(document.body, action, payload);
        };


        CrossriderAPI.do('heartbeat_get_platform', null, function (platform) {
            config.platform = platform.platform;
        });

        CrossriderAPI.do(
            'heartbeat_get_db_list',
            {
                keys: keys.map(function (a) {
                    return a[0] === '!' ? a.slice(1) : a;
                })
            },
            set_settings
        );
    }

})();
