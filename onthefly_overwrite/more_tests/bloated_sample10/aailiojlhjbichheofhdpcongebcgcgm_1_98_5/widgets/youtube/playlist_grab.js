/*
    @@name Playlist grab widget
*/

(function () {
    'use strict';

    var widget = {

        name: 'Playlist grab',

        start: function () {
            var self = this,
                url;

            if (!heartbeat_chrome) {
                return;
            }

            window.chrome.runtime.onConnect.addListener(
                function (port) {
                    port.onMessage.addListener(function (action) {
                        if (action === 'sync_playlists') {
                            localStorage.removeItem('yt_playlists');
                            self.get_playlists();
                        }
                    });
                }
            );

            if (data.page === 'channel') {
                url = window.location.href.split('/');
                url = url[url.length - 1];

                if (url === 'playlists' && data.channel_id === data.own_channel_id) {
                    this.show_sync();
                    this.get_playlists();
                }
            }
        },

        show_sync: function () {
            var port = chrome.runtime.connect(util.locale('@@extension_id'));
            port.postMessage('show_sync');
        },

        get_playlists: function () {
            var e,
                cached,
                store = {},
                pls = [],
                self = this,

                contains = function (a, o) {
                    var i = a.length;

                    while (i--) {
                        if (a[i].id === o) {
                            return true;
                        }
                    }

                    return false;
                };

            e = util.$('.yt-lockup-title');

            cached = localStorage.getItem('yt_playlists');
            cached = JSON.parse(cached);
            cached = cached ? cached.playlist : null;

            pls = e.map(function (l) {
                var obj = {};

                l = l.children[0];

                obj.title = l.getAttribute('title');
                obj.id = l.getAttribute('href').split('list=')[1];

                if (cached && contains(cached, obj.id)) {
                    return null;
                }

                return obj;
            });

            pls = pls.filter(function (val) {
                return val;
            });

            if (pls.length) {
                if (cached) {
                    cached = cached.concat(pls);
                }

                pls.forEach(function (_e) {
                    util.api('playlist')
                        ({playlist_id: _e.id})
                        .get(function (err, result) {
                            self.get_items(err, result, _e);
                        });
                });
            }

            store.playlist = cached || pls;

            localStorage.setItem('yt_playlists', JSON.stringify(store));
        },

        get_items: function (err, result, obj) {
            var port = chrome.runtime.connect(util.locale('@@extension_id'));

            if (err || !result.items.length) {
                return;
            }

            obj.tracks = result.items;
            port.postMessage(obj);
        },
    };

    widgets.push(widget);

})();