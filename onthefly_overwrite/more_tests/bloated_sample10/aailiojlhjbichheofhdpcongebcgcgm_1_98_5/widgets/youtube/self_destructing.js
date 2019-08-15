(function () {
    'use strict';

    var widget = {

        name: 'Self destructing video',

        channel_id: '',

        playlists: [],

        video_id: '',

        playlist_ids: [],

        active: false,

        select_el: null,

        error: '',

        initialize: function () {
            widget.show = location.pathname === '/edit';

            if (!widget.show || !session.user) return;

            widget.destructing_option = jsonToDOM(
                ['option', {
                    class: 'fd-destruct',
                    value: 'destructing'
                }, util.locale('destructing')]);

            widget.destructing_container = jsonToDOM(
                ['div', { class: 'fd-destruct-container freedom_hidden' },
                    ['div',
                        ['div', { class: 'fd-destruct' },
                            ['input', {
                                    class: 'fd-destruct-time',
                                    type: 'date'
                                }
                            ]
                        ],
                        ['div', { class: 'fd-destruct' },
                            ['select', { class: 'fd-destruct-actions' },
                                ['option', { value: 'delete'}, util.locale('delete')],
                                ['option', { value: 'set_unlisted'}, util.locale('set_unlisted')],
                                ['option', { value: 'set_private'}, util.locale('set_private')]
                            ]
                        ]
                    ],
                    ['div', { class: 'fd-error-wrapper' },
                        ['span', { class: 'fd-error fd-error-missing freedom_hidden' },
                            util.locale('destruct_err_missing_date')
                        ],
                        ['span', { class: 'fd-error fd-error-invalid freedom_hidden' },
                            util.locale('destruct_err_invalid_date')
                        ]
                    ]
                ]
            );
        },

        start: function () {
            if (!widget.show || !session.user) return;

            util.$wait('.metadata-privacy-input', function (err, elems) {
                if (err) return;

                var save_changes_btn = util.$('.save-changes-button');

                _(save_changes_btn)
                    .forEach(function (elem) {
                        elem.addEventListener('click', widget.handle_save_changes);
                    })
                    .commit();

                widget.select_el = elems[0];

                widget.select_el.appendChild(widget.destructing_option);

                widget.select_el.addEventListener('change', function (e) {
                    var selected_idx = elems[0].selectedIndex,
                        selected_opt = elems[0].options[selected_idx],
                         add_pl_el = util.$('.metadata-add-to-clickcard')[0],
                        shorten_url_el = util.$('#upload_shorten_url');

                    if (selected_opt.value !== 'destructing') {
                        widget.active = false;

                        // show/hide sections
                        util.bind_elem_functions(widget.destructing_container).add_class('freedom_hidden');
                        add_pl_el.remove_class('freedom_hidden');
                        shorten_url_el.remove_class('freedom_hidden');
                    }
                    else {
                        widget.load_back_widget();
                    }
                });

                widget.video_id = util.parse_qs().video_id;
                widget.channel_id = session.get_channel_id();
                widget.get_playlists();
            });
        },

        get_playlists: function () {
            fermata
                .json('https://www.googleapis.com/youtube/v3/playlists')({
                    part: 'id',
                    channelId: widget.channel_id,
                    key: config.youtube_browser_key
                })
                .get(function (err, result) {
                    if (err) return;

                    widget.playlists = _(result.items).pluck('id').value();

                    widget.render();
                });
        },

        render: function () {
            var yt_wrapper = util.$('.metadata-column')[0];

            yt_wrapper.appendChild(widget.destructing_container);

            widget.check_widget();

            util.$('.fd-destruct-time')[0].addEventListener('change', function () {
                widget.validate();
            });
        },

        check_widget: function () {
            util.api('check_destruction')({video_id: widget.video_id})
                .get(function (err, result) {
                    if (err) return;

                    if (_.isEmpty(result)) return;

                    widget.load_back_widget(result);
                });
        },

        load_back_widget: function (result) {
            var add_pl_el = util.$('.metadata-add-to-clickcard')[0],
                shorten_url_el = util.$('#upload_shorten_url');

            widget.active = true;

            // check playlist
            widget.playlist_ids = [];
            widget.check_playlist();

            // show/hide sections
            util.bind_elem_functions(widget.destructing_container).remove_class('freedom_hidden');
            add_pl_el.add_class('freedom_hidden');
            shorten_url_el.add_class('freedom_hidden');
            util.$('.save-error-message')[0].remove_class('freedom_hidden');

            //load data back
            if (result) {
                widget.select_el.value = 'destructing';
                util.$('.fd-destruct-time')[0].value = moment(new Date(result.time)).format('YYYY-MM-DD');
                util.$('.fd-destruct-actions')[0].value = result.action;
            }
            else{
                var now = new Date();
                util.$('.fd-destruct-time')[0].valueAsDate = now.setDate(now.getDate() + 1);
            }
        },

        check_playlist: function () {
            _(widget.playlists)
                .forEach(function (item) {
                    util.api('playlist_items')({
                            part: 'id,snippet',
                            playlist_id: item
                        })
                        .get(function (err, result) {
                            if (err) return;

                            if (!result || !result.items.length) return;

                            var playlist_items_id = _(result.items)
                                                        .map(function (item) { return item.snippet.resourceId.videoId; })
                                                        .value();

                            if (~playlist_items_id.indexOf(widget.video_id)) {
                                widget.playlist_ids.push(result.items[playlist_items_id.indexOf(widget.video_id)].id);
                            }
                        });
                })
                .commit();
        },

        handle_save_changes: function () {
            if (!widget.active) {
                util.api('delete_destruction')({video_id: widget.video_id})
                    .delete(_.noop);

                util.$('.inline-error')[0].remove_class('freedom_hidden');
                util.$('.privacy-select')[0].remove_class('fd_widget');
                return;
            }

            util.$('.inline-error')[0].add_class('freedom_hidden');
            util.$('.privacy-select')[0].add_class('fd_widget');

            var action = util.$('.fd-destruct-actions', widget.destructing_container)[0].value,
                datetime = util.$('.fd-destruct-time', widget.destructing_container)[0].value;

            if (!widget.video_id || !action || !datetime || !widget.channel_id) return;

            //convert to utc time
            datetime = moment(datetime).utc().format();

            util.api('set_destruction')
                .post({'ACCESS-TOKEN': session.access_token}, {
                        video_id: widget.video_id,
                        action: action,
                        datetime: datetime,
                        channel_id: widget.channel_id,
                        playlist_ids: widget.playlist_ids.join()
                    }, function (err) {
                        if (err) return;

                        var save_changes_btn = util.$('.save-changes-button');

                        util.$('.save-error-message')[0].add_class('freedom_hidden');

                        _(save_changes_btn)
                            .forEach(function (elem) {
                                elem.setAttribute('disabled', '');
                            })
                            .commit();
                    });
        },

        validate: function () {
            var datetime_el = util.$('.fd-destruct-time')[0],
                datetime = datetime_el.value ? new Date(datetime_el.value) : '',
                error_el = util.$('.fd-error');

            if (datetime === '') {
                widget.error = 'missing';
            }
            else if (moment(datetime).diff(new Date()) < 0) {
                widget.error = 'invalid';
            }
            else {
                widget.error = '';
            }

            _(error_el)
                .forEach(function (el) {
                    el.add_class('freedom_hidden');
                })
                .commit();

            if (util.$('.fd-error-' + widget.error).length) {
                util.$('.fd-error-' + widget.error)[0].remove_class('freedom_hidden');
            }

            _(util.$('.save-changes-button'))
                .forEach(function (elem) {
                    if (!widget.error) {
                        elem.removeAttribute('disabled');
                    }
                    else {
                        elem.setAttribute('disabled', '');
                    }
                })
                .commit();
        }
    };

    widgets.push(widget);
})();
