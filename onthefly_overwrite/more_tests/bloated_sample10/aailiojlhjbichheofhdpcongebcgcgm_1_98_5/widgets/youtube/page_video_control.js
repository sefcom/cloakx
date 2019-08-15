(function () {
    'use strict';

    var page_script = function () {
            var ns = window._heartbeat = window._heartbeat || {},
                player = null;

            if (yt.player && yt.player.getPlayerByElement) {
                player = yt.player.getPlayerByElement('player-api');
            }

            ns.prevent_next = false;
            ns.autorepeat = false;
            ns.observing_messages = ns.observing_messages || false;

            // copied from comments_playback_control widget
            ns.is_playlist = function () {
                return /[\?&]list=/.test(location.search);
            };

            // copied from comments_playback_control widget
            ns.scrolled_past_comments = function () {
                var comments_el = document.getElementById('#watch-discussion');

                if (!comments_el || !this.is_playlist()) {
                    return false;
                }

                return document.body.scrollTop > +comments_el.getBoundingClientRect().top;
            };

            if (!player) {
                return;
            }

            player.addEventListener('onReady', function () {
                var search_function = function () {
                    var search = 'ytPlayeronStateChangeplayer_uid',
                        found,
                        function_name;

                    for (function_name in window) {
                        if (~function_name.indexOf(search)) {
                            found = true;
                            break;
                        }
                    }

                    // search variable not ready on first time, needs setTimeout
                    if (!found) {
                        return setTimeout(search_function, 1);
                    }

                    ns.ytPlayeronStateChangeplayer_backup = window[function_name];

                    window[function_name] = function (state) {
                        // 0 means video playback reached the end
                        if (state === 0) {
                            if (ns.autorepeat) {
                                player.seekTo(0);
                                player.playVideo();
                            }
                            else if (!ns.prevent_next) {
                                ns.ytPlayeronStateChangeplayer_backup.apply(window, arguments);
                            }
                        }
                    };
                };

                search_function();
            });

            ns.set_prevent_next = function (prevent) {
                ns.prevent_next = prevent;

                if (!ns.scrolled_past_comments()) {
                    ns.ytPlayeronStateChangeplayer_backup(player.getPlayerState());
                }
            };

            ns.set_auto_repeat = function (autorepeat) {
                ns.autorepeat = autorepeat;
            };

            if (!ns.observing_messages) {
                window.addEventListener('message', function (e) {
                    var type = e.data.type,
                        value = e.data.value;

                    if (e.source !== window) {
                        return;
                    }

                    switch (type) {
                        case 'hb-autorepeat' :
                            ns.set_auto_repeat(!!value);
                            break;
                        case 'hb-prevent-next' :
                            ns.set_prevent_next(!!value);
                            break;
                    }
                });

                ns.observing_messages = true;
            }

        },

        widget = {

            name: 'Page video control',
            origin_player : '#player-api',
            dataset_attr: 'hbPageVideoControl',
            show: false,

            start: function () {
                var video_el;

                if (!this.loaded) {

                    if (heartbeat_chrome) {
                        util.load_script(page_script);
                    }
                    else {
                        page_script();
                    }

                    video_el = util.$(this.origin_player);

                    if (video_el) {
                        video_el.dataset[this.dataset_attr] = true;
                    }

                    this.loaded = true;
                }
            }
        };

    widgets.push(widget);

})();
