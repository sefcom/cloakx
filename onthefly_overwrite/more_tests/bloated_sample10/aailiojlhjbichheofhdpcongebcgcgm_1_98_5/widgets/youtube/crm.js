'use strict';
/*global settings, util, jsonToDOM, widgets, data, fermata, config*/

/*
    @@name Commenter-Relationship Manager
*/

(function () {

    var widget = {

        name: 'Commenter-Relationship Manager',

        event_name: 'comment_management_count',

        initialize: function () {
            this.notes_div = jsonToDOM(
                ['div', {
                        class: 'pull-right crm',
                        style: settings.crm ? '' : 'display:none',
                    },
                    ['i', {class: 'fa fa-comment pull-right box-button'}],
                    ['div', {class: 'yt-uix-button-panel'},
                        ['i', {class: 'fa fa-times pull-right box-close'}],
                        ['h4', {class: 'freedom_crm_header'},
                            util.locale('crm_box_title')
                        ],
                        ['div', {
                            class: 'commenter-notes-list'
                        }],
                        ['input', {
                            type: 'hidden',
                            class: 'commenter-notes-hidden'
                        }],
                        ['input', {
                            type: 'text',
                            class: 'commenter-notes',
                            placeholder: util.locale('crm_placeholder')
                        }],
                        ['input', {
                            value: util.locale('save'),
                            type: 'button',
                            class: 'pull-right save'
                        }
                        ],
                        ['i', {
                            class: 'fa fa-ban pull-right block status',
                            title: util.locale('wow_block')
                        }],
                        ['i', {
                            class: 'fa fa-heart pull-right favorite status',
                            title: util.locale('lfg_favorite')
                        }]
                    ]
                ]
            );

            this.link_to_site = jsonToDOM(
                ['a', {
                        class: 'pull-right link-to-site',
                        target: '_blank',
                        href: 'https://www.heartbeat.tm/crm',
                        style: settings.crm ? '' : 'display:none'
                    },
                    util.locale('crm_toggle')
                ]
            );
        },

        start: function () {
            var e;

            if (data.page === 'watch') {
                return this.watch_comments();
            }

            if (data.page === 'all_comments') {
                e = util.$('#watch-response-header-content').children[1].children[0];
                e = e.getAttribute('data-ytid');

                if (e === data.own_channel_id) {
                    data.channel_id = data.own_channel_id;
                    this.watch_comments();
                }
            }
        },

        watch_comments: function () {
            var self = this,
                interval = setInterval(function () {
                    var e = util.$('.comments');

                    if (e.length) {
                        clearInterval(interval);
                        setTimeout(self.get_commenters, 1500);
                        self.listen_events();
                    }
                }, 100);
        },

        get_commenters: function () {
            var e = util.$('.comment-header');

            this.async = e.length;

            _(e)
                .forEach(this.render_div)
                .commit();

            e = util.$('#watch-discussion');

            e.insertBefore(this.link_to_site, e.children[2]);
        },

        process_element: function (k) {
            var self = this,
                k = util.bind_elem_functions(k),
                tmp = k.children[0].href.split('/'),
                channel = 'yt_commenters',
                params = {channel_id: util.$('.yt-user-photo')[1].getAttribute('href').split('/')[2]};

            if (tmp[3] === 'user') {
                channel = 'channel';
                params.username = tmp[4];
            }
            else {
                params.commenter = tmp[4];
            }

            params._t = Date.now();

            k.add_class('loading');
            util
                .api('crm')(channel)(params)
                .get(function (err, result) {
                    k.remove_class('loading');
                    if (err || !result) return;
                    self.show_popup(k, result);
                });
        },

        render_div: function (comment_elem) {
            var node = this.notes_div.cloneNode(true),
                e = node.children[1];

            comment_elem.appendChild(node);
            this.bind_listeners(comment_elem);
        },

        show_popup: function (comment_elem, result) {
            var node = util.$('.crm', comment_elem)[0],
                e = node.children[1];

            node.children[0].id = result.author_id + '_icon';
            e.id = result.author_id + '_box';
            e.children[0].id = result.author_id + '_close';
            e.children[2].id = result.author_id + '_notes_list';
            e.children[3].id = result.author_id + '_notes';
            e.children[4].id = result.author_id + '_add_note';
            e.children[5].id = result.author_id + '_save';
            e.children[6].id = result.author_id + '_block';
            e.children[7].id = result.author_id + '_favorite';

            if (result.status === 'Favorite') {
                e.children[6].classList.add('active');
            }
            else if (result.status === 'Blocked') {
                e.children[5].classList.add('active');
            }

            e.children[3].value = result.notes;

            if (util.$('.tb-my-videos').length) {
                node.children[0].style.right = '43px';
                node.children[0].style.top = '4px';
            }

            // render notes
            util.$('#' + result.author_id + '_notes_list').innerHTML = '';

            var notes = result.notes ? result.notes.split(',') : [];

            _(notes)
                .forEach(function (note) {
                    widget.add_note(result.author_id, note);
                })
                .commit();


            e.style.display = 'block';
        },

        add_note: function (id, note) {
            var noteEle = jsonToDOM(
                ['div', {
                        class: 'freedom_crm_note'
                    },
                    ['span', note],
                    ['i', {
                        class: 'fa fa-times',
                        onclick: widget.remove_note
                    }]
                ]
            );

            util.$('#' + id + '_notes_list').appendChild(noteEle);
        },

        remove_note: function (e) {
            e.target.parentElement.remove();
        },

        bind_listeners: function (comment_elem) {
            var self = this;

            function bind_box_button () {
                self.process_element(comment_elem);
            }

            function bind_close_button (k) {
                util.$('.yt-uix-button-panel', comment_elem)[0].style.display = 'none';
            }

            function bind_commenter_notes (k) {
                if (~[13, 9, 188].indexOf(k.which)) {
                    var id = self.get_id(k.target.id, '_add_note'),
                        note = k.target.value;

                    if (note) {
                        k.target.value = '';
                        widget.add_note(id, note);
                    }
                }
            }

            function bind_status (k) {
                var type = k.target.classList.contains('favorite') ? 'favorite' : 'block',
                    active = k.target.classList.contains('active'),
                    id = self.get_id(k.target.id, '_' + type),

                    status = active
                        ? 'No Status'
                        : type === 'favorite'
                            ? 'Favorite'
                            : 'Blocked',

                    icon = type === 'favorite'
                        ? 'fa fa-heart pull-right favorite'
                        : 'fa fa-ban pull-right block';

                util.$('#' + id + '_favorite').className = 'fa fa-heart pull-right favorite status';
                util.$('#' + id + '_block').className = 'fa fa-ban pull-right block status';

                k.target.className = !active
                    ? icon + ' status active'
                    : icon + ' status';

                self.update_commenter({
                    channel_id: data.own_channel_id,
                    author_id: id,
                    status: status
                });
            }

            function bind_save (k) {
                var id = self.get_id(k.target.id, '_save'),
                    note_val = util.$('#' + id + '_add_note').value,
                    notes = [];

                if (note_val) {
                    widget.add_note(id, note_val);
                };

                var notes_list = util.$('.freedom_crm_note', k.target.parentElement);

                if (notes_list.length) {
                    _(notes_list)
                        .forEach(function (noteEle) {
                            notes.push(util.$('span', noteEle)[0].innerText);
                        })
                        .commit();
                }

                self.update_commenter({
                    channel_id: data.own_channel_id,
                    author_id: id,
                    notes: notes.join()
                });

                widget.analytics_log(1, 0);
                util.$('#' + id + '_box').style.display = 'none';
            }

            util.$('.box-button', comment_elem)[0].addEventListener('click', bind_box_button);
            util.$('.box-close', comment_elem)[0].addEventListener('click', bind_close_button);
            util.$('.commenter-notes', comment_elem)[0].addEventListener('keydown', bind_commenter_notes);
            util.$('.status', comment_elem)[0].addEventListener('click', bind_status);
            util.$('.save', comment_elem)[0].addEventListener('click', bind_save);
        },

        listen_events: function () {
            var self = this;

            document.addEventListener('DOMNodeInserted', function (event) {
                var e = event.srcElement,
                    event_class = event.srcElement.className;

                switch (event_class) {
                    case 'comment-entry':
                        self.render_div(e.children[0].children[1].children[0]);
                        break;

                    case 'comment-item yt-commentbox-top reply':
                        self.render_div(e.children[1].children[0]);
                        break;
                }
            }, false);
        },

        update_commenter: function (data) {
            util.api('crm')('commenter')
                .put(data, _.noop);
        },

        get_id: function (e, i) {
            return e.split(i)[0];
        },

        analytics_log: function (tag_plus, cmt_mng_plus) {
            var local_data = util.json_parse(localStorage.getItem('track_' + widget.event_name)),
                number_tag_added = local_data ? (local_data.tag_count || 0) : 0,
                number_cmt_mng_used = local_data ? (local_data.cmt_management_count || 0) : 0,
                analytics_data = {
                    cmt_management_count: number_cmt_mng_used + cmt_mng_plus,
                    tag_count: number_tag_added + tag_plus
                };

            util.log_count_per_day(widget.event_name, analytics_data);
        },

        settings_changed: function (change) {
            if (change.crm) {
                if (settings.crm) {
                    widget.analytics_log(0, 1);
                }

                _(util.$('.crm'))
                    .forEach(function change_display (k) {
                        k.style.display = settings.crm ? '' : 'none';
                    })
                    .commit();

                util.$('.link-to-site')[0].style.display = settings.crm ? '' : 'none';
            }
        }
    };

    widgets.push(widget);

})();

