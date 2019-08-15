(function () {
    'use strict';

    var widget = {

        name: 'Heartbeat YouTube Playlist Visibility Sorter for Channel Page',
        container: '#hb_yt_playlist_visibility_sorter_for_cp',

        initialize: function () {
            var list,
                view,
                sorter;

            if (~window.location.pathname.indexOf('channel')) {
                util.$wait('.yt-uix-button-menu-default', function (err, result) {
                    if (err || data.channel_id !== data.own_channel_id) {
                        return;
                    }

                    if (result[1]) {
                        list = result[1];
                        view = result[0].parentNode.children[0].innerText;
                        sorter = (view === 'List') ? widget.sort_visibility_list : widget.sort_visibility_grid;

                        widget.menu_item_public = jsonToDOM(
                            ['li', {role: 'menuitem'},
                                ['span', {
                                    onclick: sorter,
                                    class: 'yt-uix-button-menu-item spf-link'
                                }, util.locale('public')]
                            ]
                        );

                        widget.menu_item_unlisted = jsonToDOM(
                            ['li', {role: 'menuitem'},
                                ['span', {
                                    onclick: sorter,
                                    class: 'yt-uix-button-menu-item spf-link'
                                }, util.locale('unlisted')]
                            ]
                        );

                        widget.menu_item_private = jsonToDOM(
                            ['li', {role: 'menuitem'},
                                ['span', {
                                    onclick: sorter,
                                    class: 'yt-uix-button-menu-item spf-link'
                                }, util.locale('private')]
                            ]
                        );

                        list.appendChild(widget.menu_item_public);
                        list.appendChild(widget.menu_item_unlisted);
                        list.appendChild(widget.menu_item_private);
                    }
                });
            }
        },

        sort_visibility_list: function (e) {
            var list = util.$('#browse-items-primary'),
                dropdown = util.$('.subnav-sort-menu')[0],
                first = [],
                last = [];

            this.dropdown_text = jsonToDOM(['span', {class: 'yt-uix-button-content'}, e.target.innerText]);
            dropdown.removeChild(dropdown.childNodes[0]);
            dropdown.insertBefore(this.dropdown_text, dropdown.childNodes[0]);

            _(list.children)
                .forEach(function (a, key) {
                    var privacy;

                    if (!key || key === 1) {
                        first.push(a);
                    }
                    else {
                        if (~a.innerHTML.indexOf('Unlisted')) {
                            privacy = 'Unlisted';
                        }
                        else if (~a.innerHTML.indexOf('Private')) {
                            privacy = 'Private';
                        }
                        else {
                            privacy = 'Public'
                        }

                        privacy === e.target.innerText ? first.push(a) : last.push(a);
                    }
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
        },

        sort_visibility_grid: function (e) {
            var list = util.$('#browse-items-primary').children[2].children[0],
                dropdown = util.$('.subnav-sort-menu')[0],
                first = [],
                last = [];

            this.dropdown_text = jsonToDOM(['span', {class: 'yt-uix-button-content'}, e.target.innerText]);
            dropdown.removeChild(dropdown.childNodes[0]);
            dropdown.insertBefore(this.dropdown_text, dropdown.childNodes[0]);

            _(list.children)
                .forEach(function (a, key) {
                    var privacy;

                    if (~a.innerHTML.indexOf('Unlisted')) {
                        privacy = 'Unlisted';
                    }
                    else if (~a.innerHTML.indexOf('Private')) {
                        privacy = 'Private';
                    }
                    else {
                        privacy = 'Public'
                    }

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

