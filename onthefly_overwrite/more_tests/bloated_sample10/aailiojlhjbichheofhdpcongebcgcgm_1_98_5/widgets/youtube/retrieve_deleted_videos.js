(function () {
    'use strict';

    var widget = {

        name: 'Retrieve deleted videos',
        playlist_items: null,
        playlist_id: '',
        saved: false,
        number_of_rows: 0,

        initialize: function () {
            var json;

            if (!this.is_viewing_playlist()) {
                return;
            }

            this.playlist_id = util.parse_qs().list;

            if (!this.playlist_items) {
                json = localStorage.getItem('freedom_' + this.playlist_id);

                if (json) {
                    this.playlist_items = JSON.parse(json);
                }
            }

            if (!this.saved && util.$('#pl-video-table')) {
                this.save_playlist();
            }

            this.render();
        },

        remove: function () {
            _(util.$('.freedom_removed_video_title'))
                .forEach(function (del_item) {
                    del_item.remove();
                })
                .commit();
        },

        render: function () {
            var that = this,
                rows = util.$('#pl-video-table .pl-video');

            if (!this.find_playlist_item || !util.$('#pl-video-table')) {
                return;
            }

            this.remove();

            _(rows)
                .forEach(function (row) {
                    var title_link,
                        inner_text,
                        saved = that.find_playlist_item(row.getAttribute('data-video-id'));

                    if (!that.is_private_or_deleted(row)) {
                        return;
                    }

                    title_link = util.$('.pl-video-title-link', row);
                    if (!title_link.length || !saved) {
                        return;
                    }

                    title_link = title_link[0];
                    inner_text = title_link.innerText;

                    title_link.replace(jsonToDOM(['span', {
                        class: 'freedom_removed_video_title'
                    }, saved.video_title]));
                    title_link.appendChild(document.createTextNode(inner_text));
                })
                .commit();
        },

        save_playlist: function () {
            var that = this,
                playlist_items = [],
                rows = util.$('#pl-video-table .pl-video');

            _(rows)
                .forEach(function (row) {
                    var saved;

                    if (that.is_private_or_deleted(row)) {
                        saved = that.find_playlist_item(row.getAttribute('data-video-id'));

                        if (saved) {
                            playlist_items.push(saved);
                        }

                        return;
                    }

                    playlist_items.push({
                        video_id: row.getAttribute('data-video-id'),
                        video_title: row.getAttribute('data-title')
                    });
                })
                .commit();

            this.number_of_rows = rows.length;

            localStorage.setItem('freedom_' + this.playlist_id, JSON.stringify(playlist_items));
            this.playlist_items = playlist_items;
            this.saved = true;
        },

        is_private_or_deleted: function (pl_item) {
            var video_times = util.$('.pl-video-time .timestamp', pl_item);

            return video_times.length === 0;
        },

        integrity: function () {
            var rows = util.$('#pl-video-table .pl-video');

            // if the playlist has more than 100 items, youtube will apply lazy loading,
            // we need to detect when to trigger refresh

            return this.saved && this.number_of_rows === rows.length;
        },

        is_viewing_playlist: function () {
            return location.pathname === '/playlist';
        },

        find_playlist_item: function (video_id) {
            if (!this.playlist_items) {
                return null;
            }

            return _(this.playlist_items).find(function (item) {
                return item.video_id === video_id;
            });
        }
    };

    widgets.push(widget);

})();
