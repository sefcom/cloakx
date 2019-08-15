(function () {
    'use strict';

    var widget = {

        name: 'Official series playlist',

        initialize: function () {
            var that = this;

            this.playlist_id = util.parse_qs().list;
            
            this.widget_dom = jsonToDOM(['label', {
                    id: 'official_series_playlist',
                    onclick: that.on_set_official_series_playlist
                },
                ['i', {
                    class: 'fa fa-square-o', 
                    id: 'official_series_playlist_checkbox'
                }],
                ['span', util.locale('set_as_official_series_playlist')],
                ['i', {
                    class: 'fa fa-question-circle',
                    tooltip: util.locale('set_as_official_series_playlist_help_text')
                }]
            ]);

            _(util.$('i', this.widget_dom))
                .forEach(function (icon) {
                    icon.addEventListener('mouseenter', that.show_tooltip);
                    icon.addEventListener('mouseleave', that.hide_tooltip);
                })
                .commit();
        },

        start: function () {
            if (!this.integrity()) {
                this.load_playlist_settings(this.render);
            }
        },

        render: function () {
            var container = util.$('.playlist-actions')[0],
                checkbox = util.$('#official_series_playlist_checkbox', this.widget_dom),
                the_widget = util.bind_elem_functions(this.widget_dom);

            if (!container) {
                return;
            }

            if (!this.is_editable) {
                the_widget.add_class('disabled');
                checkbox.setAttribute('tooltip', util.locale('series_playlist_not_available'));
            }
            else {
                this.toggle_checkbox(checkbox, this.setting_data.is_series);
            }

            container.appendChild(the_widget);
        },

        integrity: function () {
            var session_token_input = util.$('input[name=session_token]');

            this.session_token = session_token_input.length ? session_token_input[0].value : '';

            return !util.$('#playlist-settings-editor')
                || !this.playlist_id
                || !this.session_token
                || !util.$('.playlist-actions').length
                || util.$('#official_series_playlist');
        },

        on_set_official_series_playlist: function (chk) {
            var checkbox = util.$('#official_series_playlist_checkbox', this.widget_dom),
                is_checked = !checkbox.has_class('fa-check-square-o'),
                that = this;

            if (!this.is_editable) {
                return;
            }

            if (is_checked) {
                that.setting_data.is_series = 1;    
            }
            else {
                delete this.setting_data['is_series'];
            }

            this.save_playlist_settings(function () {
                that.show_notification(util.locale('save_success'));
                that.toggle_checkbox(checkbox, is_checked);
            });
        },

        load_playlist_settings: function (callback) {
            var that = this;

            util.youtube_api('playlist_ajax')
                ({
                    action_get_settings_editor: 1,
                    full_list_id: this.playlist_id
                })
                .get(function (err, result) {
                    if (err) {
                        return;
                    }
                    
                    that.build_playlist_settings_data(result.editor_content);
                    callback && callback();
                });
        },

        save_playlist_settings: function (on_success) {
            util.youtube_api('playlist_edit_service_ajax').post(
                {'Content-Type': 'application/x-www-form-urlencoded'},
                this.setting_data, 
                function (err, result) {
                    if (err) {
                        return;
                    }
                    
                    on_success && on_success();
                }
            );
        },

        build_playlist_settings_data: function (form_data) {
            var json, dom, 
                chk_is_series, select_privacy, select_sort_order, chk_allow_embed,
                data = {action_update_settings: 1};

            json = _(JsonML.fromHTMLText(form_data.trim()))
                .filter(function (elem) {
                    return _(elem).isArray();
                })
                .value();
            
            dom = jsonToDOM(['div', json]);
            chk_is_series = util.$('input[name=is_series]', dom)[0];
            select_privacy = util.$('select[name=privacy] option[selected]', dom)[0];
            select_sort_order = util.$('select[name=sort_order] option[selected]', dom)[0];
            chk_allow_embed = util.$('input[name=allow_embed]', dom)[0];

            if (!chk_is_series || !select_privacy || !select_sort_order || !chk_allow_embed) {
                return;
            }

            this.is_editable = !chk_is_series.disabled;

            data.privacy = parseInt(select_privacy.value);
            data.sort_order = parseInt(select_sort_order.value);
            data.is_series = chk_is_series.checked ? 1 : 0
            data.allow_embed = chk_allow_embed.checked ? 1 : 0;
            data.playlist_id = this.playlist_id;
            data.session_token = this.session_token;

            this.setting_data = data;
        },

        show_notification: function (text, timeout) {
            var wrapper = util.$('#appbar-main-guide-notification-container'),
                body = util.$('body')[0],
                dom = ['div', {
                            id: 'heartbeat_website_notification',
                            class: 'appbar-guide-notification',
                            role: 'alert'
                        },
                        ['span', {class: 'appbar-guide-notification-content-wrapper yt-valign'},
                            ['span', {class: 'appbar-guide-notification-icon yt-sprite'}],
                            ['span', {class: 'appbar-guide-notification-text-content'}, text]
                        ]
                    ];

            body.add_class('show-guide-button-notification');

            if (wrapper) {
                wrapper.replace(jsonToDOM(dom));
            }

            if (this.notification_timeout) {
                clearTimeout(this.notification_timeout);
            }

            this.notification_timeout = setTimeout(function () {
                    body.remove_class('show-guide-button-notification');
                }, timeout || 3000);
        },

        toggle_checkbox: function (checkbox, checked) {
            checked = checked !== undefined 
                ? !!checked 
                : checkbox.has_class('fa-check-square-o');

            if (checked) {
                checkbox.add_class('fa-check-square-o');
                checkbox.remove_class('fa-square-o');
                return;
            }

            checkbox.remove_class('fa-check-square-o');
            checkbox.add_class('fa-square-o');
        },

        show_tooltip: function (evt) {
            var box = util.$('#freedom_tooltip_box'),
                container = util.$('.pl-header-content')[0],
                elem = evt.currentTarget,
                title = elem.getAttribute('tooltip');

            if (!title || !container) {
                return;
            }

            if (!box) {
                box = jsonToDOM(['div', {id: 'freedom_tooltip_box'}, 
                    ['span', title]
                ]);
                container.appendChild(box);
            }
            else {
                box.replace(jsonToDOM(['span', title]));
            }

            box.style.display = 'block';
            box.style.left = elem.offsetLeft - box.offsetWidth / 2 + elem.offsetWidth / 2 + 'px';
            box.style.top = container.offsetHeight - box.offsetHeight - elem.offsetTop - elem.offsetHeight - 10 + 'px';
        },

        hide_tooltip: function () {
            var box = util.$('#freedom_tooltip_box');

            if (box) {
                box.style.display = 'none';
            }
        }
    };

    widgets.push(widget);

})();