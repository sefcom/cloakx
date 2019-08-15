
(function () {
    'use strict';

    var widget = {

        name: 'Customize Channel Background',
        default_color: '#f1f1f1',

        initialize: function () {
            var that = this;

            this.upload_form = jsonToDOM(['div', {id: 'freedom_bg_edit'},
                ['a', {
                        id: 'freedom_bg_color',
                        class: 'secondary-header-action'
                    },
                    ['span', {class: 'nav-text label'}, util.locale('background_color')],
                    ['input', {
                        id: 'bg_color',
                        type: 'color',
                        onchange: that.on_background_color_change
                    }]
                ],
                ['a', {
                        id: 'freedom_bg_upload',
                        class: 'secondary-header-action'
                    },
                    ['span', {class: 'nav-text label'}, util.locale('background_image')],
                    ['input', {
                        id: 'bg_file',
                        placeholder: util.locale('enter_image_url'),
                        onchange: that.on_image_change
                    }],
                    ['a', {
                            id: 'freedom_bg_save_btn',
                            class: 'yt-uix-button yt-uix-button-size-default yt-uix-button-default',
                            onclick: that.on_image_save
                        },
                        ['i', {class: 'fa fa-check'}],
                        ['span', util.locale('save')]
                    ]
                ],
                ['a', {
                        id: 'freedom_bg_repeat',
                        class: 'secondary-header-action',
                        onclick: that.on_background_repeat
                    },
                    ['i', {
                        class: 'fa fa-square-o',
                        id: 'freedom_bg_repeat_check'
                    }],
                    ['span', {class: 'nav-text label'}, util.locale('background_repeat')]
                ],
                ['a', {
                        id: 'freedom_bg_reset',
                        class: 'yt-uix-button yt-uix-button-size-default yt-uix-button-default',
                        onclick: that.on_reset_background
                    },
                    ['span', {class: 'nav-text'}, util.locale('reset')]
                ],
                ['a', {
                        id: 'freedom_bg_cancel',
                        class: 'yt-uix-button yt-uix-button-size-default yt-uix-button-default',
                        onclick: that.on_toggle_bg_edit
                    },
                    ['span', {class: 'nav-text'}, util.locale('cancel')]
                ],
                ['a', {
                        id: 'freedom_bg_toggle',
                        class: 'secondary-header-action action show',
                        onclick: this.on_toggle_bg_edit
                    },
                    ['i', {class: 'fa fa-pencil'}],
                    ['span', {class: 'nav-text'}, util.locale('edit_channel_background')]
                ]
            ]);
        },

        start: function () {
            if (!this.is_channel() || !data.channel_id) {
                this.remove();
                return;
            }

            this.load_background();

            if (this.is_own_channel() && !util.parse_qs().view_as) {
                this.render();
            }
        },

        render: function () {
            var uploader = util.$('#freedom_bg_upload'),
                container = util.$('.secondary-header-contents')[0];

            if (uploader || !container) {
                return;
            }

            container.appendChild(this.upload_form);
        },

        remove: function () {
            var container = util.$('#freedom_bg_edit'),
                page = util.$('#body-container');

            if (container) {
                container.remove();
            }

            if (page) {
                page.style.backgroundImage = '';
                page.style.backgroundColor = '';
            }
        },

        integrity: function () {
            return !this.is_channel() || !this.is_own_channel() || util.$('#freedom_bg_edit');
        },

        set_background: function () {
            var page = util.$('#body-container'),
                bg_color = this.bg_color !== this.default_color ? this.bg_color : '';

            if (!page) {
                return;
            }

            if (this.bg_image && !util.is_valid_url(this.bg_image)) {
                return;
            }

            page.style.backgroundImage = this.bg_image ? 'url(' + this.bg_image + ')' : '';
            page.style.backgroundColor = bg_color || '';
            page.style.backgroundRepeat = this.bg_repeat ? 'repeat' : 'no-repeat';
        },

        load_background: function () {
            var that = this;

            util.api('channel_style')({id: data.channel_id})
                .get(function (err, result) {
                    if (err) {
                        return;
                    }

                    that.bg_image = result.bg_image || '';
                    that.bg_color = result.bg_color || that.default_color;
                    that.bg_repeat = !!result.bg_repeat;

                    util.$('#bg_color', that.upload_form).value =
                        (that.bg_color[0] === '#' ? '' : '#') + that.bg_color;

                    util.$('#bg_file', that.upload_form).value = that.bg_image;
                    that.update_background_repeat();

                    that.set_background();
                });
        },

        save_background: function (callback) {
            if (this.bg_image && !util.is_valid_url(this.bg_image)) {
                util.$('#freedom_bg_upload', this.upload_form).remove_class('saved');
                return callback && callback('invalid url');
            }

            util.api('channel_style')
                .post({
                        id: data.own_channel_id,
                        bg_image: this.bg_image || '',
                        bg_color: this.bg_color || '',
                        bg_repeat: this.bg_repeat
                    }, function (err) {
                        if (err) {
                            return;
                        }

                        callback && callback();
                    }
                );
        },

        is_channel: function () {
            return ~location.pathname.indexOf('/user/') || ~location.pathname.indexOf('/channel/');
        },

        is_own_channel: function () {
            return data.channel_id === data.own_channel_id;
        },

        set_and_save_background: function (callback) {
            this.set_background();
            this.save_background(callback);
        },

        on_toggle_bg_edit: function () {
            _(util.$('#freedom_bg_edit > a'))
                .forEach(function (a) {
                    if (a.has_class('show')) {
                        a.remove_class('show');
                        return;
                    }

                    a.add_class('show');
                })
                .commit();
        },

        on_background_color_change: function () {
            var txt = util.$('#bg_color');

            this.bg_color = txt.value;
            this.set_and_save_background();
        },

        on_reset_background: function () {
            var txt = util.$('#bg_file');

            this.bg_image = '';
            this.bg_color = this.default_color;
            this.bg_repeat = true;

            util.$('#bg_file', this.upload_form).value = '';
            util.$('#bg_color', this.upload_form).value = this.default_color;
            util.$('#freedom_bg_upload', this.upload_form).remove_class('saved');

            this.update_background_repeat();
            this.set_and_save_background(this.on_toggle_bg_edit);
        },

        update_background_repeat: function () {
            var icon = util.$('#freedom_bg_repeat_check', this.upload_form);

            if (this.bg_repeat) {
                icon.add_class('fa-check-square-o');
                icon.remove_class('fa-square-o');
                return;
            }

            icon.remove_class('fa-check-square-o');
            icon.add_class('fa-square-o');
        },

        on_background_repeat: function () {
            this.bg_repeat = !this.bg_repeat;
            this.update_background_repeat();
            this.set_and_save_background();
        },

        on_image_change: function (evt) {
            util.$('#freedom_bg_upload', this.upload_form).remove_class('saved');
        },

        on_image_save: function (evt) {
            var txt = util.$('#bg_file', this.upload_form),
                freedom_bg_upload = util.$('#freedom_bg_upload', this.upload_form);

            this.bg_image = txt.value;
            this.set_and_save_background(function (err) {
                if (err) {
                    return;
                }

                freedom_bg_upload.add_class('saved');
            });
        }
    };

    widgets.push(widget);

})();
