(function () {
    'use strict';

    var widget = {

        name: 'Heartbeat YouTube Playlist Visibility Sorter for Creator Studio Page',
        container: '#hb_yt_playlist_visibility_sorter_for_csp',

        initialize: function () {
            var list;

            if (window.location.pathname === '/view_all_playlists') {
                util.$wait('.yt-uix-button-menu', function (err, result) {
                    if (err) {
                        return;
                    }

                    list = result[1];

                    widget.menu_item_public = jsonToDOM(
                        ['li', {role: 'menuitem'},
                            ['span', {
                                onclick: widget.sort_visibility,
                                class: 'watch-queue-menu-choice overflow-menu-choice yt-uix-button-menu-item'
                            }, util.locale('public')]
                        ]
                    );

                    widget.menu_item_unlisted = jsonToDOM(
                        ['li', {role: 'menuitem'},
                            ['span', {
                                onclick: widget.sort_visibility,
                                class: 'watch-queue-menu-choice overflow-menu-choice yt-uix-button-menu-item'
                            }, util.locale('unlisted')]
                        ]
                    );

                    widget.menu_item_private = jsonToDOM(
                        ['li', {role: 'menuitem'},
                            ['span', {
                                onclick: widget.sort_visibility,
                                class: 'watch-queue-menu-choice overflow-menu-choice yt-uix-button-menu-item'
                            }, util.locale('private')]
                        ]
                    );

                    list.appendChild(widget.menu_item_public);
                    list.appendChild(widget.menu_item_unlisted);
                    list.appendChild(widget.menu_item_private);
                });
            }
        },

        sort_visibility: function (e) {
            var list = util.$('#vm-playlist-video-list-ol'),
                dropdown = util.$('#vm-view-btn'),
                first = [],
                last = [];

            this.dropdown_text = jsonToDOM(['span', {class: 'yt-uix-button-content'}, e.target.innerText]);
            dropdown.removeChild(dropdown.childNodes[0]);
            dropdown.insertBefore(this.dropdown_text, dropdown.childNodes[0]);

            _(list.children)
                .forEach(function (a, key) {
                    var privacy = a.children[0].children[1].children[1].children[0].children[0].children[0].dataset.tooltipText;

                    privacy === e.target.innerText ? first.push(a) : last.push(a);
                })
                .commit();

            while (list.hasChildNodes()) {
                list.removeChild(list.lastChild);
            }

            _(first.concat(last))
                .forEach(function (a, key) {
                    list.appendChild(a);
                })
                .commit();
        }

    };

    widgets.push(widget);
})();

