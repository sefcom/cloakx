(function () {
    'use strict';

    var lang = document.cookie
        .replace('PREF=', '')
        .split(';')
        .concat('hl=en')
        .map(function (a) {
            var c = a.split('&')
                .filter(function (b) {
                    return b.split('=')[0] === 'hl';
                })
                .map(function (b) {
                    return b.split('=')[1];
                });
            return c[0] || c;
        })
        .filter(function (a) {
            return a.length;
        })[0],

        start = function () {
            document.addEventListener('heartbeat_log', function () {
                console.log(window[document.body.getAttribute('heartbeat_attrib')]);
            });

            var temp = setInterval(function () {
                if (settings) {
                    clearInterval(temp);
                    listen_on_settings_change();
                }
            }, 10);
        },

        listen_on_settings_change = function () {

            var url;

            chrome.storage.onChanged.addListener(function (changes) {
                settings.refresh(function () {
                    widgets.all('settings_changed', [changes]);
                });
            });

            widgets.forEach(function (widgt) {
                var key;

                for (key in widgt) {
                    if (typeof(widgt[key]) === 'function') {
                        widgt[key] = widgt[key].bind(widgt);
                    }
                }
            });


            if (location.hostname === 'www.youtube.com' || !heartbeat_chrome) {
                switch (lang) {
                    case 'ja':
                    case 'ar':
                    case 'en-GB':
                    case 'zh-TW':
                    case 'zh-CN':
                        break;
                    case 'zh-HK':
                        lang = 'zh_CN';
                        break;
                    case 'iw':
                        lang = 'he';
                        break;
                    case 'pt':
                        lang = 'pt_PT';
                        break;
                    default:
                        lang = 'en';
                }

                url = chrome.extension.getURL('_locales/' + lang.replace('-', '_') + '/messages.json');

                fermata
                    .json(url)
                    .get(function (err, result) {
                        util.locale = function (key) {
                            if (!result[key]) {
                                return '';
                            }
                            return result[key].message;
                        };
                        initialize_widgets();
                    });
            }
            else {
                initialize_widgets();
            }
        },

        initialize_widgets = function () {
            var temp;

            config.state = 'initialize';

            if (!widgets.length) {
                return;
            }

            widgets.all('initialize');

            if (heartbeat_chrome) {
                temp = setInterval(function () {
                    if (document.readyState === 'interactive' || document.readyState === 'complete') {
                        clearInterval(temp);
                        insert_logger();
                        restart();
                        listen_ajax();
                        health_check();
                    }
                }, 100);
            }
            else {
                restart();
                listen_ajax();
                health_check();
            }

        },

        insert_logger = function () {
            function d_log (s) {
                var ev = document.createEvent('events');
                ev.initEvent('heartbeat_log', true, false);
                document.body.setAttribute('heartbeat_attrib', s);
                document.dispatchEvent(ev);
            }

            util.load_script(d_log, false);
        },

        restart = function () {
            config.state = 'start';
            get_page_data();
            widgets.all('start');
        },

        get_page_data = function () {
            var profile_div,
                vars = {},
                page;

            if (location.hostname !== 'www.youtube.com') {
                return;
            }

            page = util.retrieve_window_variables({page: 'yt.config_.PAGE_NAME'}).page;

            if (page === 'watch') {
                vars = util.retrieve_window_variables({
                    video_id: 'yt.config_.VIDEO_ID',
                    user_country: 'yt.config_.INNERTUBE_CONTEXT_GL',
                    monetizer: 'ytplayer.config.args.ptk',
                    channel_id: 'ytplayer.config.args.ucid',
                    author: 'ytplayer.config.args.author',
                    user_age: 'ytplayer.config.args.user_age',
                    keywords: 'ytplayer.config.args.keywords',
                    views: 'ytplayer.config.args.view_count',
                    user_gender: 'ytplayer.config.args.user_gender',
                    user_name: 'ytplayer.config.args.user_display_name',
                    user_img: 'ytplayer.config.args.user_display_image',
                    own_channel_id: 'ytcfg.data_.GUIDED_HELP_PARAMS.creator_channel_id'
                });

                vars.keywords = vars.keywords ? vars.keywords.split(',') : [];
                vars.monetizer = decodeURIComponent(vars.monetizer)
                    .replace('+user', '');
                vars.username = util.$('.yt-user-photo')[0].href.split('/')[4];
            }

            if (page === 'channel') {
                vars = util.retrieve_window_variables({
                    channel_id: 'yt.config_.CHANNEL_ID',
                    user_country: 'yt.config_.INNERTUBE_CONTEXT_GL',

                });

                vars.username = util.$('.branded-page-header-title-link')[0].href.split('/')[4];

                var icon = util.$('.guide-my-channel-icon');

                vars.own_channel_id = icon && icon[0]
                    && icon[0].parentElement
                    && icon[0].parentElement.parentElement
                    && icon[0].parentElement.parentElement.getAttribute('data-external-id');
            }

            profile_div = util.$('.yt-masthead-picker-active-account');

            if (profile_div[0]) {
                vars.email = profile_div.length ? profile_div[0].childNodes[0].data.trim() : null;
            }

            if (!vars.own_channel_id) {
                delete vars.own_channel_id;
            }

            data = vars;
            data.page = page;
        },

        listen_ajax = function () {
            document.addEventListener('DOMNodeRemoved', function (event) {
                if (event.target.id === 'progress') {
                    widgets.all('initialize');
                    restart();
                }
            }, false);

            document.addEventListener('DOMNodeInserted', function (event) {
                var event_class = event.target.className;

                if (event_class && event_class.split) {
                    switch (event_class.split(' ')[0]) {
                        case 'following-lists':
                        case 'live-status':
                            widgets.all('initialize');
                            restart();
                            break;
                    }
                }
            }, false);
        },

        health_check = function () {
            setInterval(function () {
                widgets.forEach(function (widget) {
                    if (widget.beta && !session.has_role('lab')) return;

                    if (widget.show && widget.container && !util.$(widget.container) && widget.render) {
                        widget.render();
                    }

                    if (widget.integrity && !widget.integrity()) {
                        widget.initialize && widget.initialize();
                        widget.start && widget.start();
                    }
                });
            }, 3000);
        };

    start();

})();

